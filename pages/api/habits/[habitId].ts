import moment from 'moment'
import { getSession } from 'next-auth/react'

import { Habit } from '@prisma/client'

import prisma from 'prisma/client'

import type { NextApiRequest, NextApiResponse } from 'next'
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
                // create a new habit for a user
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
