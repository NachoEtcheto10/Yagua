// Baja las fotos del catálogo de Tiendanube y las optimiza (WebP, máx. 1000 px) en public/products/tn/.
// Uso: node scripts/tiendanube/images.mjs   (salta las que ya existen)
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '../..')
const products = JSON.parse(readFileSync(path.join(root, 'prisma/data/tiendanube.json'), 'utf8'))
const jobs = products.flatMap((p) => p.images.map((i) => ({ src: i.src, dest: path.join(root, 'public', i.file) })))
mkdirSync(path.join(root, 'public/products/tn'), { recursive: true })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let done = 0
let failed = 0

async function fetchRetry(url) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (res.ok) return Buffer.from(await res.arrayBuffer())
    if (res.status !== 429 && res.status < 500) throw new Error(`HTTP ${res.status}`)
    await sleep(3000 * (attempt + 1))
  }
  throw new Error('demasiados reintentos')
}

async function worker(queue) {
  for (let job = queue.shift(); job; job = queue.shift()) {
    if (existsSync(job.dest)) {
      done++
      continue
    }
    try {
      const buf = await fetchRetry(job.src)
      await sharp(buf).rotate().resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(job.dest)
      done++
    } catch (e) {
      failed++
      console.error('✗', job.src, e.message)
    }
  }
}

const queue = [...jobs]
await Promise.all(Array.from({ length: 4 }, () => worker(queue)))
console.log(`${done} fotos listas, ${failed} con error (de ${jobs.length})`)
