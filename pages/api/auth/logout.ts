import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.redirect(
        `${process.env.AUTH0_ISSUER}/v2/logout?client_id=${process.env.AUTH0_CLIENT_ID}&returnTo=${process.env.NEXT_PUBLIC_URL}`
    )
}
