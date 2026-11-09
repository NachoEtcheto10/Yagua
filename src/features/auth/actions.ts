'use server'
import bcrypt from 'bcryptjs'
import { AuthError } from 'next-auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { signIn, signOut } from '@/lib/auth'

export type AuthState = { error?: string; fieldErrors?: Record<string, string> } | undefined

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Ingresá tu nombre'),
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

function safeRedirect(to: FormDataEntryValue | null) {
  const s = typeof to === 'string' ? to : ''
  return s.startsWith('/') && !s.startsWith('//') ? s : '/cuenta'
}

export async function loginAction(_: AuthState, form: FormData): Promise<AuthState> {
  try {
    await signIn('credentials', {
      email: String(form.get('email') ?? '').trim().toLowerCase(),
      password: String(form.get('password') ?? ''),
      redirectTo: safeRedirect(form.get('redirectTo')),
    })
  } catch (e) {
    if (e instanceof AuthError) return { error: 'E-mail o contraseña incorrectos' }
    throw e // redirect de Next
  }
}

export async function registerAction(_: AuthState, form: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(form))
  if (!parsed.success) {
    return { fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) }
  }
  const { name, email, password } = parsed.data
  const exists = await db.user.findUnique({ where: { email } })
  if (exists) return { fieldErrors: { email: 'Ya hay una cuenta con ese e-mail. Ingresá o recuperá tu contraseña.' } }
  await db.user.create({ data: { name, email, passwordHash: await bcrypt.hash(password, 10) } })
  try {
    await signIn('credentials', { email, password, redirectTo: safeRedirect(form.get('redirectTo')) })
  } catch (e) {
    if (e instanceof AuthError) return { error: 'La cuenta se creó, pero no pudimos iniciar sesión. Probá ingresar.' }
    throw e
  }
}

export async function googleLoginAction(form: FormData) {
  await signIn('google', { redirectTo: safeRedirect(form.get('redirectTo')) })
}

export async function logoutAction() {
  await signOut({ redirectTo: '/' })
}
