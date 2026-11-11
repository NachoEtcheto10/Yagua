/**
 * Mensaje para mostrar a la persona: solo los errores que escribimos nosotros (en castellano).
 * Los técnicos (base de datos, red, validación interna, almacenamiento) se reemplazan por `fallback`
 * y se registran en el servidor.
 */
export function friendlyError(e: unknown, fallback: string) {
  if (!(e instanceof Error)) return fallback
  const technical =
    e.name.startsWith('PrismaClient') ||
    e.name === 'ZodError' ||
    /prisma|invocation|constraint|ECONN|ETIMEDOUT|fetch failed|socket|S3|AccessDenied|NoSuchBucket|credential/i.test(e.message)
  if (technical) {
    console.error(e)
    return fallback
  }
  return e.message
}
