import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '../../../prisma/client'

// augment session returned to include
// the user id
declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            email: string
            name: string
            image: string
        }
    }
}

export default NextAuth({
    providers: [
        Providers.Email({
            server: {
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
        }),
    ],
    adapter: PrismaAdapter(prisma),
    callbacks: {
        session: async (session, user) => {
            session.user.id = user.id as string
            return Promise.resolve(session)
        },
    },
})
