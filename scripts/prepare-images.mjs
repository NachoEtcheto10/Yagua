// Prepara las imágenes de la demo en public/ (WebP optimizado).
//  - Fotos reales de Yaguá: desde ./Imagenes (carpeta local, no se sube al repo).
//  - Fotos de stock (Unsplash, licencia libre) para lo que todavía no tiene foto propia.
//    TODO: reemplazar las de stock por fotos reales del cliente.
// Uso: node scripts/prepare-images.mjs
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const SRC = path.join(ROOT, 'Imagenes')
const OUT = path.join(ROOT, 'public')

// Foto real -> nombre en public/products
const REAL = {
  'camiseta-dry-azul': 'Camiseta deportiva azul frente y espalda.jpeg',
  'camiseta-dry-celeste': 'Camiseta deportiva celeste.jpeg',
  'camiseta-dry-celeste-modelo': 'Camiseta deportiva celeste coin chico de lentes posando.jpeg',
  'camiseta-dry-lima': 'Camiseta deportiva lima frente y espalda.jpeg',
  'camiseta-dry-negra': 'Camiseta deportiva negra frente y espalda.jpeg',
  'camiseta-dry-roja': 'Camiseta deportiva roja.jpeg',
  'campera-puffer-negra-azul': 'campera necgra y azul.jpeg',
  'campera-puffer-negra': 'campera negra.jpeg',
  'campera-puffer-negra-gris': 'campera negra y gris.jpeg',
  'campera-liviana-negra': 'campera negra sin capucha.jpeg',
  'campera-liviana-negra-gris': 'campera negra y gris sin capucha.jpeg',
  'chaleco-capucha-gris': 'chaleco gris.jpeg',
  'chaleco-capucha-negro': 'chaleco negro.jpeg',
  'chaleco-gris': 'chaleco gris sin capucha.jpeg',
  'chaleco-negro': 'chaleco negro sin capucha.jpeg',
  'chomba-blanca': 'chomba blanca.jpeg',
  'chomba-gris': 'chomba gtis.jpeg',
  'musculosa-blanca': 'musculosas blanca.jpeg',
  'musculosa-blanca-espalda': 'musculosas blanca espalda.jpeg',
  'musculosa-roja': 'musculosas roja.jpeg',
  'musculosa-roja-espalda': 'musculosas roja espalda.jpeg',
  'musculosa-verde': 'musculosas verde.jpeg',
  'musculosa-verde-espalda': 'musculosas verde espalda.jpeg',
  'short-blanco': 'pantalon blanco.jpeg',
  'short-blanco-espalda': 'pantalon blanco espalda.jpeg',
  'short-celeste': 'pantalon deportivo celeste.jpeg',
  'short-celeste-frente-espalda': 'pantalon deportivo celeste frente y espalda.jpeg',
  'short-celeste-reves': 'revez de pantalon deportivo celeste.jpeg',
  'short-celeste-modelo': 'persona posando el pantalon deportivo celeste de frente.jpeg',
  'short-celeste-modelo-2': 'persona posando el pantalon deportivo celeste.jpeg',
  'short-naranja': 'pantalon deportivo naranja  frente y espalda.jpeg',
  'short-negro': 'pantalon deportivo negro frente y espalda.jpeg',
  'short-rosa': 'pantalon deportivo rosa frente y espalda.jpeg',
  'pollera-blanca': 'pollera blanca de frente.jpeg',
  'pollera-blanca-espalda': 'pollera blanca espalda.jpeg',
  'pollera-blanca-tela': 'pollera blanca tela.jpeg',
  'pollera-gris': 'pollera gris de frente.jpeg',
  'pollera-gris-costado': 'pollera gris de costado.jpeg',
  'pollera-gris-tela': 'tela de pollera gris.jpeg',
  'remera-v-blanca': 'remera mujer blanca.jpeg',
  'remera-v-celeste': 'remera mujer celeste.jpeg',
  'remera-v-negra': 'remera mujer negra.jpeg',
  'remera-v-roja': 'remera mujer roja.jpeg',
  'remera-v-rosa': 'remera mujer rosa.jpeg',
  'remera-v-rosa-costado': 'remera mujer rosa de costado.jpeg',
  'remera-v-rosa-espalda': 'remera mujer rosa de espalda.jpeg',
  'remera-v-rosa-modelo': 'remera mujer rosa con chica posando.jpeg',
  'remera-v-verde': 'remera mujer verde.jpeg',
  'remera-v-verde-costado': 'remera mujer verde de costado.jpeg',
  'remera-v-verde-espalda': 'remera mujer verde de espalda.jpeg',
  'remera-v-verde-modelo': 'remera mujer verde con chica posando.jpeg',
  'remera-v-violeta': 'remera mujer violeta.jpeg',
}

// Stock (Unsplash): nombre -> [id, ancho]
const STOCK = {
  // Portadas por deporte
  'sports/running': ['photo-1552674605-db6ffd4facb5', 1800],
  'sports/running-2': ['photo-1718248028293-934f04a578db', 1600],
  'sports/hockey': ['photo-1541983663620-7571a820610c', 1800],
  'sports/hockey-2': ['photo-1537751181166-be1708a8ec4f', 1600],
  'sports/padel': ['photo-1767128890583-b3f8dc30bdbc', 1600],
  'sports/padel-2': ['photo-1770230901556-4e1c0bacfb09', 1600],
  'sports/tenis': ['photo-1554068865-24cecd4e34b8', 1800],
  'sports/tenis-2': ['photo-1545151414-8a948e1ea54f', 1600],
  'sports/trekking': ['photo-1551632811-561732d1e306', 1800],
  'sports/trekking-2': ['photo-1586022045497-31fcf76fa6cc', 1600],
  'sports/golf': ['photo-1535131749006-b7f58c99034b', 1800],
  'sports/golf-2': ['photo-1593282153762-a41e3cceb06c', 1600],
  'sports/pesca': ['photo-1761197379839-b5759e0146a0', 1800],
  'sports/pesca-2': ['photo-1535036997436-f088d7774803', 1600],
  'sports/nautica': ['photo-1554913968-6ba85b94df1f', 1600],
  'sports/nautica-2': ['photo-1494175022155-9d4da9a6a8b6', 1800],
  'sports/accesorios': ['photo-1576871337632-b9aef4c17ab9', 1600],
  // Productos sin foto propia
  'products/paleta-carbon': ['photo-1787768647981-dab3d52f8f04', 1000],
  'products/paleta-carbon-2': ['photo-1612534847738-b3af9bc31f0c', 1000],
  'products/paleta-control': ['photo-1657704358775-ed705c7388d2', 1000],
  'products/pelotas-padel': ['photo-1759819599208-0b79a7f3f347', 1000],
  'products/pelotas-tenis': ['photo-1541744573515-478c959628a0', 1000],
  'products/raqueta-tenis': ['photo-1622163642998-1ea32b0bbc67', 1000],
  'products/raqueta-tenis-2': ['photo-1632755898125-36cd72575dde', 1000],
  'products/raqueta-tenis-3': ['photo-1542144582-1ba00456b5e3', 1000],
  'products/palo-hockey': ['photo-1680010090687-6a5e4fe855b8', 1000],
  'products/pelotita-hockey': ['photo-1642235733613-ccba5328fb3f', 1000],
  'products/bucal': ['photo-1564420159030-ad05d6fbc24e', 1000],
  'products/canilleras': ['photo-1789925941480-aebc24c038af', 1000],
  'products/guante-golf': ['photo-1789855738848-183f8b013d2f', 1000],
  'products/guante-golf-2': ['photo-1788940571304-644c756cc4c0', 1000],
  'products/pelotas-golf': ['photo-1562204320-31975a5e09ce', 1000],
  'products/gorra-blanca': ['photo-1691256676359-20e5c6d4bc92', 1000],
  'products/gorra-gris': ['photo-1521369909029-2afed882baee', 1000],
  'products/gorra-trucker': ['photo-1678721938524-1a3ee398de2a', 1000],
  'products/gorro-negro': ['photo-1618354691792-d1d42acfd860', 1000],
  'products/gorro-mostaza': ['photo-1630691650107-53dd500d2907', 1000],
  'products/anteojos-urbanos': ['photo-1584036553516-bf83210aa16c', 1000],
  'products/anteojos-sport': ['photo-1708799366365-a24608103bed', 1000],
  'products/botella-negra': ['photo-1683383277379-644816d886e2', 1000],
  'products/botella-aluminio': ['photo-1664714628878-9d2aa898b9e3', 1000],
  'products/bolso': ['photo-1448582649076-3981753123b5', 1000],
  'products/mochila-trekking': ['photo-1622260614927-208cfe3f5cfd', 1000],
  'products/mochila-trekking-2': ['photo-1509762774605-f07235a08f1f', 1000],
  'products/reel-frontal': ['photo-1684495598276-453d74f4d96f', 1000],
  'products/reel-frontal-2': ['photo-1588623421822-cfe216893703', 1000],
  'products/reel-azul': ['photo-1593442998882-7cb49031174b', 1000],
  'products/cana-pesca': ['photo-1650081484358-b338642813c0', 1000],
  'products/cana-pesca-2': ['photo-1566014727723-20aa739a7b11', 1000],
  'products/senuelo': ['photo-1762110751033-882a1ecc63ea', 1000],
  'products/senuelo-2': ['photo-1542405620-6c4bb3c5d46a', 1000],
  // Personalizados y comunidad
  'custom/equipos': ['photo-1655089131279-8029e8a21ac6', 1600],
  'custom/festejo': ['photo-1752681305099-89eab8580496', 1600],
  'community/embajadora-1': ['photo-1683848644087-c3cb69b77d4f', 800],
  'community/embajadora-2': ['photo-1581423880338-b9e4f9718df6', 800],
  'community/embajador-1': ['photo-1606335544053-c43609e6155d', 800],
  'community/embajador-2': ['photo-1615387000063-ad2d10a458e7', 800],
  'community/jugador-1': ['photo-1573459635481-85e9012c05c6', 900],
  'community/jugador-2': ['photo-1767128890954-20ce481be8f0', 900],
  'community/jugador-3': ['photo-1767128890439-1af9ca2ff1ac', 900],
  'community/jugador-4': ['photo-1646649852046-b758d2d573f3', 900],
  'community/jugador-5': ['photo-1774523195578-121a2d1da490', 900],
  'community/jugador-6': ['photo-1734158661120-a0605f0cee48', 900],
}

async function exists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function main() {
  await fs.mkdir(path.join(OUT, 'products'), { recursive: true })
  let n = 0
  if (await exists(SRC)) {
    for (const [name, file] of Object.entries(REAL)) {
      const out = path.join(OUT, 'products', `${name}.webp`)
      if (await exists(out)) continue
      await sharp(path.join(SRC, file))
        .rotate()
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(out)
      n++
    }
    const banner = path.join(OUT, 'campaigns', 'moda-padel.webp')
    if (!(await exists(banner))) {
      await fs.mkdir(path.dirname(banner), { recursive: true })
      await sharp(path.join(SRC, 'moda mas padel yagua eslogan.jpeg'))
        .resize(1000, null, { withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(banner)
      n++
    }
  } else {
    console.warn('No se encontró la carpeta Imagenes/: se omiten las fotos reales')
  }
  for (const [name, [id, width]] of Object.entries(STOCK)) {
    const out = path.join(OUT, `${name}.webp`)
    if (await exists(out)) continue
    await fs.mkdir(path.dirname(out), { recursive: true })
    const res = await fetch(`https://images.unsplash.com/${id}?w=${width}&q=85&fm=jpg`)
    if (!res.ok) throw new Error(`No se pudo bajar ${name} (${res.status})`)
    await sharp(Buffer.from(await res.arrayBuffer())).webp({ quality: 78 }).toFile(out)
    n++
  }
  console.log(`Listo: ${n} imágenes nuevas`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
