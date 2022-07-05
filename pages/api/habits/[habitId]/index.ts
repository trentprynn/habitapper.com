import { Habit } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth/next'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { prisma } from 'prisma/client'

/**
 * @swagger
 * /api/habits/{habitId}:
 *   get:
 *     description: Retrieves the habit with the given habitId
 *     tags:
 *       - habits
 *     parameters:
 *       - in: path
 *         name: habitId
 *         required: true
 *         description: Numeric ID of the habit to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: JSON representation of the habit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Habit'
 *       401:
 *         description: No authorization details sent in request
 *       403:
 *         description: Habit does not belong to calling user
 *       404:
 *         description: Habit not found
 *   delete:
 *     description: Deletes the habit with the given habitId
 *     tags:
 *       - habits
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Habit'
 *       401:
 *         description: No authorization details sent in request
 *       403:
 *         description: Habit does not belong to calling user
 *       404:
 *         description: Habit not found
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<Habit>) {
    const session = await unstable_getServerSession(req, res, authOptions)

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
                // remove the possibility of it being null
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
            case 'DELETE': {
                // get habits for a user
                let habit = await getHabit(habitId)

                // validate habit with given id exists
                if (habit == null) {
                    res.status(404).end(`Habit with id ${habitId} not found`)
                    return
                }

                // now that we know we got back a habit
                // remove the possibility of it being null
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
                res.setHeader('Allow', ['GET', 'DELETE'])
                res.status(405).end(`Method ${req.method} Not Allowed`)
                return
        }
    } else {
        res.status(401).end()
        return
    }
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
