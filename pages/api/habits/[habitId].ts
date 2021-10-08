import { Habit } from '@prisma/client'
import moment from 'moment'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import prisma from 'prisma/client'

/**
 * @swagger
 * /api/habits/{habitId}:
 *   get:
 *     description: Retrieves the habit with the given habitId
 *     parameters:
 *       - in: path
 *         name: habitId
 *         required: true
 *         description: Numeric ID of the habit to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: JSON representation of the habit with the given habitId
 *       403:
 *         description: Error when called for a habitId that doesn't belong to the calling user
 *       404:
 *         description: Error when called for a habitId that doesn't exist
 *   post:
 *     description: Continues the habit streak for a given habit
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
 *       400:
 *         description: Error when called for a habitId that's already been continued
 *       403:
 *         description: Error when called for a habitId that doesn't belong to the calling user
 *       404:
 *         description: Error when called for a habitId that doesn't exist
 *   delete:
 *     description: Deletes the habit with the given habitId
 *     parameters:
 *       - in: path
 *         name: habitId
 *         required: true
 *         description: Numeric ID of the habit to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: JSON representation of the deleted habit
 *       403:
 *         description: Error when called for a habitId that doesn't belong to the calling user
 *       404:
 *         description: Error when called for a habitId that doesn't exist
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<Habit>) {
    const session = await getSession({ req })

    const habitId = parseInt(req.query.habitId as string, 10)

    if (session && session.user && session.user.id) {
        switch (req.method) {
            case 'GET': {
                // get habits for a user
                let habit = await getHabit(habitId)

                // validate habit with given id exists
                if (habit == null) {
                    res.status(404).end(`Habit with id ${habitId} not found`)
                    return
                }

                // now that we know we got back a habit
                // remove the possiblity of it being null
                habit = habit as Habit

                // ensure habit belongs to requesting user
                if (habit.userId !== session.user.id) {
                    res.status(403).end()
                    return
                }

                // return habit
                res.status(200).json(habit)
                return
            }
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
                // remove the possiblity of it being null
                currentHabit = currentHabit as Habit

                // ensure habit belongs to requesting user
                if (currentHabit.userId != session.user.id) {
                    res.status(403).end()
                    return
                }

                // ensure streak hasn't been claimed within
                // 24 hours
                if (!dateOlderThen16HoursOrNull(currentHabit.streakContinuedAt)) {
                    res.status(400).end(`Habit has been continued within the last 16 hours.`)
                    return
                }

                // continue user's streak for the requested habit
                // and return the (now updated) habit
                const updatedHabit = await continueHabitStreak(habitId)
                res.status(200).json(updatedHabit)
                return
            }
            case 'DELETE': {
                // get habits for a user
                let habit = await getHabit(habitId)

                // validate habit with given id exists
                if (habit == null) {
                    res.status(404).end(`Habit with id ${habitId} not found`)
                    return
                }

                // now that we know we got back a habit
                // remove the possiblity of it being null
                habit = habit as Habit

                // ensure habit belongs to requesting user
                if (habit.userId !== session.user.id) {
                    res.status(403).end()
                    return
                }

                // delete habit
                const deletedHabit = await deleteHabit(habitId)
                res.status(200).json(deletedHabit)
                return
            }
            default:
                res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
                res.status(405).end(`Method ${req.method} Not Allowed`)
                return
        }
    } else {
        res.status(401).end()
        return
    }
}

function dateOlderThen16HoursOrNull(date: Date | null): boolean {
    if (date == null) {
        return true
    }

    if (moment().diff(moment(date), 'hours') >= 16) {
        return true
    }

    return false
}

export async function deleteHabit(habitId: number): Promise<Habit> {
    return await prisma.habit.delete({
        where: {
            habitId: habitId,
        },
    })
}

export async function getHabit(habitId: number): Promise<Habit | null> {
    return await prisma.habit.findFirst({
        where: {
            habitId: habitId,
        },
    })
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
