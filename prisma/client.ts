import { PrismaClient } from '@prisma/client'

// add prisma to the NodeJS global types to
// prevent multiple instances of prisma client
// get created by hot-reloading in development
declare global {
    var prisma: PrismaClient
}

const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV === 'development') {
    global.prisma = prisma
}

export default prisma
