import { UserSettings } from '.prisma/client'
import moment from 'moment-timezone'
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from 'prisma/client'

/**
 * @swagger
 * /api/tasks/processExpiredHabits:
 *   post:
 *     description: Kicks off the process to reset habit streaks that were not continued
 *     tags:
 *       - cron
 *     parameters:
 *       - in: header
 *         name: authorization
 *         required: true
 *         description: Bearer token secret to verify caller has access to kick off this process.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Habit streaks were successfully reset (empty body)
 *       401:
 *         description: No authorization header given in request
 *       403:
 *         description: Incorrect authorization header given in request
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const APP_KEY = process.env.APP_KEY

    switch (req.method) {
        case 'POST':
            if (req.headers.authorization) {
                const CALLER_PROVIDED_APP_KEY = req.headers.authorization.split(' ')[1]

                if (APP_KEY === CALLER_PROVIDED_APP_KEY) {
                    // caller provided valid auth
                    await processExpiredHabits()
                    res.status(200).end()
                } else {
                    // caller provided invalid auth
                    res.status(403).end()
                }
            } else {
                // caller did not provide auth
                res.status(401).end()
            }
            return
        default:
            res.setHeader('Allow', ['POST'])
            res.status(405).end(`Method ${req.method} Not Allowed`)
            return
    }
}

export async function processExpiredHabits(): Promise<void> {
    // NOTE: the following method of resetting user habit streaks
    //       seems horribly inefficient but it's simple, if there
    //       is ever scale it can almostsurely be rewritten in a
    //       more effective way

    // grab all users that have a timezone set
    var validUsers = await prisma.user.findMany({
        where: {
            NOT: {
                UserSettings: null,
            },
        },
    })

    validUsers.forEach(async (user) => {
        // grab the user settings for the user we're looking at,
        // we know this exists from our first query so remove the
        // possibility of it being null
        var userSettings = (await prisma.userSettings.findFirst({
            where: {
                userId: user.id,
            },
        })) as UserSettings

        // grab the habits for the user we're currently looking at
        // that have been claimed within at least the last 48 hours,
        // this means we won't have to loop through habits that
        // are obviously expired or have never been claimed
        var userHabits = await prisma.habit.findMany({
            where: {
                userId: user.id,
            },
        })

        // below is the desired path for habit streak resets
        // 10/1
        //    - user claims habit -> streak = 1
        // 10/2
        //    - user does not claim habit -> streak = 1
        // 10/3@midnight in their timezone
        //    - user's habit streak should be reset to zero -> streak = 0

        // get the yesterday's date in the user's configured timezone
        var yesterdayInUsersTimeZone = moment().subtract(1, 'days').tz(userSettings.timeZone)

        // go through each of the user's habits and if the habit's
        // streakContinuedAt value is before yesterday in the user's timezone,
        // set its streak back to zero
        userHabits.forEach(async (habit) => {
            // skip habits that have never been claimed
            if (habit.streakContinuedAt == null) {
                return
            }

            // convert the habit's streakContinuedAt to the user's timezone
            var habitLastContinuedDateInUserTimeZone = moment(habit.streakContinuedAt).tz(userSettings.timeZone)

            // if the habit was last continued on a date earlier than
            // the user's configured timezone, reset its streak to zero
            if (habitLastContinuedDateInUserTimeZone.isBefore(yesterdayInUsersTimeZone, 'date')) {
                await prisma.habit.update({
                    where: {
                        habitId: habit.habitId,
                    },
                    data: {
                        streak: 0,
                    },
                })

                console.log(`Resetting ${user.email} -> ${habit.name}`)
            }
        })
    })
}
