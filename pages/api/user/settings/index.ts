import { UserSettings } from '@prisma/client'
import safeJsonStringify from 'fast-safe-stringify'
import moment from 'moment-timezone'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import prisma from 'prisma/client'

type UserSettingsModel = {
    timeZone: string
}

/**
 * @swagger
 * /api/user/settings:
 *   get:
 *     description: Returns the current user's settings
 *     responses:
 *       200:
 *         description: JSON representation of the current user's settings
 *       404:
 *         description: Error when called for a user who has not had their settings saved yet
 *   post:
 *     description: Creates or updates the current user's settings
 *     responses:
 *       200:
 *         description: JSON representation of the new or updated user's settings
 *       400:
 *         description: Error when called with null or invalid user settings
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<UserSettings>) {
    const session = await getSession({ req })

    if (session && session.user && session.user.id) {
        switch (req.method) {
            case 'GET':
                // get habits for a user
                const settings = await getSettingsForUser(session.user.id)

                // validate settings exist for calling user
                if (settings == null) {
                    res.status(404).end(`User settings for user with id ${session.user.id} not found`)
                    return
                }

                // grab and return settings to user
                res.status(200).json(settings)
                return
            case 'POST':
                // create / update settings for calling user

                // parse the settings the user sent in the request body
                const newUserSettings = JSON.parse(safeJsonStringify(req.body)) as UserSettingsModel | null

                // validate user gave a settings object to create
                if (newUserSettings == null) {
                    res.status(400).end(`User settings cannot be null`)
                    return
                }

                if (newUserSettings.timeZone == null) {
                    res.status(400).end(`Time zone given in settings model cannot be null`)
                    return
                }

                // validate the time zone the user gave is valid
                if (!moment.tz.names().includes(newUserSettings.timeZone)) {
                    res.status(400).end(`Invalid time zone ${newUserSettings.timeZone} given in request`)
                    return
                }

                // create and return the settings for the user
                const newSettings = await createOrUpdateSettingsForUser(session.user.id, newUserSettings)
                res.status(200).json(newSettings)
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

export async function getSettingsForUser(userId: string): Promise<UserSettings | null> {
    return await prisma.userSettings.findFirst({
        where: {
            userId: userId,
        },
    })
}

export async function createOrUpdateSettingsForUser(
    userId: string,
    newUserSettings: UserSettingsModel
): Promise<UserSettings> {
    return await prisma.userSettings.upsert({
        where: {
            userId: userId,
        },
        update: {
            timeZone: newUserSettings.timeZone,
        },
        create: {
            userId: userId,
            timeZone: newUserSettings.timeZone,
        },
    })
}
