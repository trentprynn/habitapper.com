import { PrismaAdapter } from '@next-auth/prisma-adapter'
import NextAuth, { NextAuthOptions } from 'next-auth'
import Auth0Provider from 'next-auth/providers/auth0'
import { prisma } from 'prisma/client'

// augment nest-auth session that's used throughout
// the application to include an 'id' field
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

export const authOptions: NextAuthOptions = {
    providers: [
        Auth0Provider({
            clientId: process.env.AUTH0_CLIENT_ID || '',
            clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
            issuer: process.env.AUTH0_ISSUER,
        }),
    ],
    adapter: PrismaAdapter(prisma),
    callbacks: {
        session: async ({ session, token, user }) => {
            session.user.id = user.id as string
            return Promise.resolve(session)
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
