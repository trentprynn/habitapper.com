import moment from 'moment'

import prisma from 'prisma/client'

import type { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const APP_KEY = process.env.APP_KEY

    try {
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
    } catch (err) {
        res.status(500).end()
    }
}

export async function processExpiredHabits(): Promise<void> {
    // we need to go through all habits
    // that have a streakContinuedAt date older
    // than 48 hours ago and set their streak
    // count back to zero

    // we use 48 hours here because if I continued
    // my habit streak at 10AM my habit streak would be
    // `satisfied` until 10AM the following day when I could
    // would continue my habit streak again.

    // 24 hours after that point though my habit would have
    // not been continued for a full day and my streak should go
    // back to zero.
    const twoDaysAgo = moment().subtract(48, 'hours').toDate()
    var result = await prisma.habit.updateMany({
        where: {
            streakContinuedAt: {
                lt: twoDaysAgo,
            },
        },
        data: {
            streak: 0,
        },
    })

    console.log(result)
}
