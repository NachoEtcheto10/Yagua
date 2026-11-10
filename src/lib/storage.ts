import 'server-only'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import sharp from 'sharp'

/**
 * Fotos subidas desde el admin → Neon Object Storage (bucket público "assets", ver neon.ts).
 * Credenciales y endpoint: variables STORAGE_* (o AWS_* en local), ver abajo.
 * TODO (producción): poner un CDN delante del endpoint del bucket.
 */
const BUCKET = 'assets'

/**
 * En Vercel los nombres AWS_* están reservados por la plataforma (AWS_REGION la pone Vercel según dónde corre la función),
 * así que en producción se usan STORAGE_*. En local siguen andando las AWS_* que escribe `neon env pull`.
 */
const cfg = {
  endpoint: process.env.STORAGE_ENDPOINT_URL || process.env.AWS_ENDPOINT_URL_S3,
  accessKeyId: process.env.STORAGE_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
  // Región del proyecto de Neon (fija, para no depender de la región de la función)
  region: process.env.STORAGE_REGION || 'us-east-1',
}

export const storageEnabled = !!(cfg.endpoint && cfg.accessKeyId && cfg.secretAccessKey)

let client: S3Client | null = null
function s3() {
  client ??= new S3Client({
    endpoint: cfg.endpoint,
    region: cfg.region,
    credentials: { accessKeyId: cfg.accessKeyId!, secretAccessKey: cfg.secretAccessKey! },
    forcePathStyle: true, // Neon requiere direcciones "path-style"
  })
  return client
}

export function publicUrl(key: string) {
  return `${cfg.endpoint!.replace(/\/$/, '')}/${BUCKET}/${key}`
}

const MAX_BYTES = 12 * 1024 * 1024

/** Convierte a WebP (máx. 1600 px) y la sube con una clave nueva. Devuelve la URL pública. */
export async function uploadImage(file: File, folder: string) {
  if (!storageEnabled) throw new Error('El almacenamiento de fotos no está configurado (faltan las variables STORAGE_* de Neon).')
  if (!file.type.startsWith('image/')) throw new Error(`"${file.name}" no es una imagen`)
  if (file.size > MAX_BYTES) throw new Error(`"${file.name}" pesa más de 12 MB`)
  const input = Buffer.from(await file.arrayBuffer())
  const body = await sharp(input).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer()
  const key = `${folder}/${crypto.randomUUID()}.webp`
  await s3().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: 'image/webp',
      // Cada versión usa una clave nueva, así que se puede cachear para siempre
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  )
  return publicUrl(key)
}
