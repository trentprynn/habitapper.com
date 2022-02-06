import { Habit } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { prisma } from 'prisma/client'

/**
 * @swagger
 * /api/habits:
 *   get:
 *     description: Retrieves the the calling user's habits
 *     tags:
 *       - habits
 *     responses:
 *       200:
 *         description: JSON representation of the calling user's habits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Habit'
 *       401:
 *         description: No authorization details sent in request
 *   post:
 *     description: Creates a habit for the calling user
 *     tags:
 *       - habits
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the habit to create
 *                 example: Exercise
 *     responses:
 *       200:
 *         description: JSON representation of the created habit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Habit'
 *       401:
 *         description: No authorization details sent in request
 *
 * components:
 *   schemas:
 *     Habit:
 *       properties:
 *         habitId:
 *           type: integer
 *           description: the habit's id
 *           example: 17
 *         userId:
 *           type: string
 *           description: the habit owner's user id
 *           example: abc123
 *         name:
 *           type: string
 *           description: the habit's name
 *           example: Exercise
 *         streak:
 *           type: integer
 *           description: the habit's current streak
 *           example: 0
 *         streakContinuedAt:
 *           type: string
 *           nullable: true
 *           description: the date time in UTC the habit's streak was last continued
 *           example: null
 *         createdAt:
 *           type: string
 *           description: the date time in UTC the habit was created
 *           example: 2021-10-27T00:13:47.985Z
 *         updatedAt:
 *           type: string
 *           description: the date time in UTC the habit was updated
 *           example: 2021-11-27T20:32:42.402Z
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<Habit[] | Habit>) {
    const session = await getServerSession({ req, res }, authOptions)

    if (session && session.user && session.user.id) {
        switch (req.method) {
            case 'GET':
                // get habits for a user
                const habits = await getHabitsForUser(session.user.id)
                res.status(200).json(habits)
                return
            case 'POST':
                // create a new habit for a user
                const newHabit = await createHabitForUser(session.user.id, req.body.name)
                res.status(200).json(newHabit)
                return
            default:
                res.setHeader('Allow', ['GET', 'POST'])
                res.status(405).end(`Method ${req.method} Not Allowed`)
                return
        }
    } else {
        res.status(401).end()
        return
    }
}

export async function getHabitsForUser(userId: string): Promise<Habit[]> {
    return await prisma.habit.findMany({
        where: {
            userId: userId,
        },
        orderBy: {
            habitId: 'asc',
        },
    })
}

export async function createHabitForUser(userId: string, habitName: string): Promise<Habit> {
    const createdHabit = await prisma.habit.create({
        data: {
            userId: userId,
            name: habitName,
        },
    })

    await prisma.habitActivityLog.create({
        data: {
            habitId: createdHabit.habitId,
            activity: 'created',
        },
    })

    return createdHabit
}
