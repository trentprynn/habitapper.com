import { UserSettings } from '@prisma/client'
import safeJsonStringify from 'fast-safe-stringify'
import moment from 'moment-timezone'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { prisma } from 'prisma/client'

type UserSettingsModel = {
    timeZone: string
}

/**
 * @swagger
 * /api/user/settings:
 *   get:
 *     description: Returns the calling user's settings
 *     tags:
 *       - settings
 *     responses:
 *       200:
 *         description: JSON representation of the calling user's settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSettings'
 *       401:
 *         description: No authorization details sent in request
 *       404:
 *         description: Calling user does not have settings saved yet
 *   post:
 *     description: Creates or updates the calling user's settings
 *     tags:
 *       - settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timeZone:
 *                 type: string
 *                 description: The name of the user's time zone, this value must be found within the list of time zones
 *                              provided by the moment-timezone library
 *                 example: America/Phoenix
 *     responses:
 *       200:
 *         description: The created or updated user settings.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSettings'
 *       400:
 *         description: Invalid user settings given in request
 *       401:
 *         description: No authorization details sent in request
 *
 * components:
 *   schemas:
 *     UserSettings:
 *       properties:
 *         userId:
 *           type: string
 *           description: the user's id
 *           example: abc123
 *         timeZone:
 *           type: string
 *           description: the user's time zone
 *           example: America/Phoenix
 *         createdAt:
 *           type: string
 *           description: the date time in UTC these settings were first created
 *           example: 2021-10-27T00:13:47.985Z
 *         updatedAt:
 *           type: string
 *           description: the date time in UTC these settings were last updated
 *           example: 2021-11-27T20:32:42.402Z
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<UserSettings>) {
    const session = await getServerSession({ req, res }, authOptions)

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
                    res.status(400).end(`Invalid time zone, ${newUserSettings.timeZone}, given in request`)
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
