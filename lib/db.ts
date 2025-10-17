import { PrismaClient } from "@prisma/client"

const databaseUrl = process.env.NEON_POSTGRES_PRISMA_URL || process.env.NEON_DATABASE_URL

console.log("[v0] Database URL exists:", !!databaseUrl)
console.log("[v0] Database URL prefix:", databaseUrl?.substring(0, 20))

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: ["error", "warn"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
