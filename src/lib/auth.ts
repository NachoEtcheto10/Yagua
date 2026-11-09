import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import NextAuth, { type DefaultSession } from 'next-auth'
import type { Adapter } from 'next-auth/adapters'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { z } from 'zod'
import { db } from './db'

declare module 'next-auth' {
  interface Session {
    user: { id: string; role: 'CUSTOMER' | 'ADMIN' } & DefaultSession['user']
  }
}

const credentialsSchema = z.object({ email: z.string().email(), password: z.string().min(1) })

// Google se activa solo si están las credenciales (AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET)
export const googleEnabled = !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db) as Adapter,
  // JWT: necesario para el login con email y contraseña
  session: { strategy: 'jwt' },
  pages: { signIn: '/ingresar' },
  trustHost: true,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw)
        if (!parsed.success) return null
        const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } })
        if (!user?.passwordHash) return null
        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash)
        return ok ? { id: user.id, email: user.email, name: user.name } : null
      },
    }),
    ...(googleEnabled ? [Google({ allowDangerousEmailAccountLinking: true })] : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id
        const dbUser = await db.user.findUnique({ where: { id: user.id }, select: { role: true } })
        token.role = dbUser?.role ?? 'CUSTOMER'
      }
      return token
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      session.user.role = token.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER'
      return session
    },
  },
})
