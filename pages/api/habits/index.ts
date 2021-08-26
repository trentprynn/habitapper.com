import { Habit } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'
import prisma from '../../../prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse<Habit[] | Habit>) {
    const session = await getSession({ req })

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
    return await prisma.habit.create({
        data: {
            userId: userId,
            name: habitName,
        },
    })
}
