import { Habit, UserSettings } from '@prisma/client'
import { habitAbleToBeClaimed } from 'common/functions/time'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { getHabit } from 'pages/api/habits/[habitId]'
import { getSettingsForUser } from 'pages/api/user/settings'
import { prisma } from 'prisma/client'

/**
 * @swagger
 * /api/habits/{habitId}/claim:
 *   post:
 *     description: Continues the habit streak for a given habit
 *     tags:
 *       - habits
 *     parameters:
 *       - in: path
 *         name: habitId
 *         required: true
 *         description: Numeric ID of the habit whose streak to continue.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: JSON representation of the habit whose streak was continued
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Habit'
 *       400:
 *         description: Habit already claimed or calling user does not have a timezone saved
 *       401:
 *         description: No authorization details sent in request
 *       403:
 *         description: Habit does not belong to calling user
 *       404:
 *         description: Habit not found
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<Habit>) {
    const session = await getServerSession({ req, res }, authOptions)

    const habitId = parseInt(req.query.habitId as string, 10)

    if (session && session.user && session.user.id) {
        switch (req.method) {
            case 'POST': {
                // continue a user's streak for the given habit

                // grab the habit with the given id
                let currentHabit = await getHabit(habitId)

                // validate habit with given id exists
                if (currentHabit == null) {
                    res.status(404).end(`Habit with id ${habitId} not found`)
                    return
                }

                // now that we know we got back a habit
                // remove the possibility of it being null
                currentHabit = currentHabit as Habit

                // ensure habit belongs to requesting user
                if (currentHabit.userId != session.user.id) {
                    res.status(403).end()
                    return
                }

                // grab the calling user's settings (ensure they exist), this is
                // where the user's timezone is stored
                let userSettings = await getSettingsForUser(session.user.id)
                if (userSettings == null) {
                    res.status(400).end(
                        `You need to save your time zone in the settings page before continuing a habit's streak`
                    )
                    return
                }

                // now that we know we got back the calling user's settings
                // remove the possibility of it being null
                userSettings = userSettings as UserSettings

                // check current date in timezone vs habit's date and ensure the habit is older by date
                if (!habitAbleToBeClaimed(currentHabit, userSettings.timeZone)) {
                    res.status(400).end(`Habits can only be saved once per day`)
                }

                // continue user's streak for the requested habit
                // and return the (now updated) habit
                const updatedHabit = await continueHabitStreak(habitId)
                res.status(200).json(updatedHabit)
                return
            }
            default:
                res.setHeader('Allow', ['POST'])
                res.status(405).end(`Method ${req.method} Not Allowed`)
                return
        }
    } else {
        res.status(401).end()
        return
    }
}

export async function continueHabitStreak(habitId: number): Promise<Habit> {
    return await prisma.habit.update({
        where: {
            habitId: habitId,
        },
        data: {
            streak: {
                increment: 1,
            },
            streakContinuedAt: new Date(new Date().toUTCString()),
        },
    })
}
