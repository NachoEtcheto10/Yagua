import 'server-only'
import { PrismaPg } from '@prisma/adapter-pg'
import { attachDatabasePool } from '@vercel/functions'
import { Pool } from 'pg'
import { PrismaClient } from '@/generated/prisma/client'

/**
 * Cliente de base de datos (Neon Postgres, conexión con pooler).
 * En Vercel (Fluid compute) attachDatabasePool cierra las conexiones ociosas
 * antes de que la función se suspenda. Ver skill neon-postgres.
 */
function createClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 })
  attachDatabasePool(pool)
  return new PrismaClient({ adapter: new PrismaPg(pool) })
}

const globalForDb = globalThis as unknown as { db?: ReturnType<typeof createClient> }

export const db = globalForDb.db ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForDb.db = db
