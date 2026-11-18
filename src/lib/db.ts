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
/**
 * pg avisa que "sslmode=require" va a cambiar de significado en su próxima versión.
 * Hoy ya lo trata como verify-full (verifica el certificado), así que lo pedimos explícito:
 * mismo comportamiento y sin el aviso en la consola.
 */
export function strictSsl(url: string | undefined) {
  return url?.replace(/sslmode=(prefer|require|verify-ca)/, 'sslmode=verify-full')
}

function createClient() {
  const pool = new Pool({ connectionString: strictSsl(process.env.DATABASE_URL), max: 5 })
  attachDatabasePool(pool)
  return new PrismaClient({ adapter: new PrismaPg(pool) })
}

const globalForDb = globalThis as unknown as { db?: ReturnType<typeof createClient> }

export const db = globalForDb.db ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForDb.db = db
