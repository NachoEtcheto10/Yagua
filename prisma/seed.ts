// Datos de prueba para la demo de Yaguá.
// Uso: npx prisma db seed   (borra y vuelve a cargar catálogo, comunidad y campañas)
//
// TODO: los productos sin foto propia, embajadores, jugadores, sponsors y asociaciones
// son de EJEMPLO (fotos de stock de Unsplash y nombres inventados). Reemplazar con datos reales.
import { config } from 'dotenv'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, type Gender, type ProductTag } from '../src/generated/prisma/client'

config({ path: '.env.local' })
config()

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL }) })

// ───────────────────────────── Deportes y categorías

const SPORTS = [
  {
    slug: 'running', name: 'Running', tagline: 'Cada kilómetro cuenta',
    description: 'Remeras, shorts y musculosas livianas que respiran con vos.',
    heroImage: '/sports/running.webp', cardImage: '/sports/running-2.webp',
    categories: [['remeras', 'Remeras'], ['shorts', 'Shorts'], ['musculosas', 'Musculosas']],
  },
  {
    slug: 'hockey', name: 'Hockey', tagline: 'Garra en la cancha',
    description: 'Palos, pelotitas, bucales, canilleras e indumentaria para jugar en serio.',
    heroImage: '/sports/hockey.webp', cardImage: '/sports/hockey-2.webp',
    categories: [['palos', 'Palos'], ['pelotitas', 'Pelotitas'], ['bucales', 'Bucales'], ['canilleras', 'Canilleras'], ['indumentaria', 'Indumentaria']],
  },
  {
    slug: 'padel', name: 'Pádel', tagline: 'Moda + Pádel',
    description: 'Paletas, paleteros, pelotas e indumentaria para dominar el blindex.',
    heroImage: '/sports/padel.webp', cardImage: '/sports/padel-2.webp',
    categories: [['paletas', 'Paletas'], ['paleteros', 'Paleteros'], ['pelotas', 'Pelotas'], ['indumentaria', 'Indumentaria']],
  },
  {
    slug: 'tenis', name: 'Tenis', tagline: 'Juego, set y partido',
    description: 'Raquetas, pelotitas e indumentaria técnica.',
    heroImage: '/sports/tenis.webp', cardImage: '/sports/tenis-2.webp',
    categories: [['raquetas', 'Raquetas'], ['pelotitas', 'Pelotitas'], ['indumentaria', 'Indumentaria']],
  },
  {
    slug: 'trekking', name: 'Trekking', tagline: 'Más allá del camino',
    description: 'Camperas, chalecos y mochilas para la montaña y la ciudad.',
    heroImage: '/sports/trekking.webp', cardImage: '/sports/trekking-2.webp',
    categories: [['camperas', 'Camperas'], ['chalecos', 'Chalecos'], ['mochilas', 'Mochilas']],
  },
  {
    slug: 'golf', name: 'Golf', tagline: 'Precisión y estilo',
    description: 'Chombas, gorras, guantes y pelotas para cada hoyo.',
    heroImage: '/sports/golf.webp', cardImage: '/sports/golf-2.webp',
    categories: [['indumentaria', 'Indumentaria'], ['gorras', 'Gorras'], ['guantes', 'Guantes'], ['pelotas', 'Pelotas']],
  },
  {
    slug: 'king-fishing', name: 'King Fishing', tagline: 'Pesca y náutica',
    description: 'La línea de pesca y náutica de Yaguá: cañas, reeles, señuelos y todo para el río.',
    heroImage: '/sports/pesca.webp', cardImage: '/sports/pesca-2.webp', isSubBrand: true,
    categories: [['canas', 'Cañas'], ['reeles', 'Reeles'], ['senuelos', 'Señuelos'], ['nautica', 'Náutica']],
  },
  {
    slug: 'accesorios', name: 'Accesorios', tagline: 'Los detalles suman',
    description: 'Gorros, gorras, anteojos de sol, bolsos y botellas.',
    heroImage: '/sports/accesorios.webp', cardImage: '/sports/accesorios.webp',
    categories: [['gorros', 'Gorros'], ['gorras', 'Gorras'], ['anteojos', 'Anteojos de sol'], ['bolsos', 'Bolsos'], ['botellas', 'Botellas']],
  },
] as const

// ───────────────────────────── Productos

const ROPA = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const ROPA_MUJER = ['XS', 'S', 'M', 'L', 'XL']
const UNICO = ['Único']

type Color = { name: string; hex: string; images: string[] }
type Seed = {
  slug: string
  name: string
  sport: string
  category: string
  brand?: 'yagua' | 'king-fishing'
  gender?: Gender
  price: number
  salePrice?: number
  tags?: ProductTag[]
  sizes: string[]
  sizeGuide?: string
  colors: Color[]
  description: string
  specs: [string, string][]
  soldCount?: number
}

const p = (file: string) => `/products/${file}.webp`

const PRODUCTS: Seed[] = [
  // ── Indumentaria con fotos reales
  {
    slug: 'camiseta-dry-fit', name: 'Camiseta Dry Fit', sport: 'running', category: 'remeras', price: 24990,
    tags: ['NUEVO', 'DESTACADO'], sizes: ROPA, sizeGuide: 'indumentaria', soldCount: 128,
    description: 'Camiseta técnica de secado rápido. Tela liviana que evacúa la transpiración y deja respirar la piel en cada entrenamiento.',
    specs: [['Material', '100% poliéster microperforado'], ['Calce', 'Regular'], ['Tecnología', 'Dry Fit, secado rápido'], ['Origen', 'Industria argentina']],
    colors: [
      { name: 'Azul', hex: '#1E6FE0', images: [p('camiseta-dry-azul')] },
      { name: 'Celeste', hex: '#9CCBF0', images: [p('camiseta-dry-celeste'), p('camiseta-dry-celeste-modelo')] },
      { name: 'Lima', hex: '#A8F03A', images: [p('camiseta-dry-lima')] },
      { name: 'Negro', hex: '#1B181C', images: [p('camiseta-dry-negra')] },
      { name: 'Rojo', hex: '#E5342F', images: [p('camiseta-dry-roja')] },
    ],
  },
  {
    slug: 'remera-cuello-v-mujer', name: 'Remera Cuello V Mujer', sport: 'padel', category: 'indumentaria', gender: 'MUJER',
    price: 22990, salePrice: 19490, tags: ['OFERTA'], sizes: ROPA_MUJER, sizeGuide: 'indumentaria', soldCount: 96,
    description: 'Remera entallada con escote en V, ideal para pádel y running. Tela elástica que acompaña cada movimiento.',
    specs: [['Material', '90% poliéster, 10% elastano'], ['Calce', 'Entallado'], ['Cuello', 'En V'], ['Origen', 'Industria argentina']],
    colors: [
      { name: 'Rosa', hex: '#F0549A', images: [p('remera-v-rosa'), p('remera-v-rosa-modelo'), p('remera-v-rosa-costado'), p('remera-v-rosa-espalda')] },
      { name: 'Verde', hex: '#9BE34A', images: [p('remera-v-verde'), p('remera-v-verde-modelo'), p('remera-v-verde-costado'), p('remera-v-verde-espalda')] },
      { name: 'Blanco', hex: '#F7F7F5', images: [p('remera-v-blanca')] },
      { name: 'Azul', hex: '#4F7BE0', images: [p('remera-v-celeste')] },
      { name: 'Negro', hex: '#1B181C', images: [p('remera-v-negra')] },
      { name: 'Rojo', hex: '#C9484A', images: [p('remera-v-roja')] },
      { name: 'Violeta', hex: '#6A5FB5', images: [p('remera-v-violeta')] },
    ],
  },
  {
    slug: 'musculosa-dry-mujer', name: 'Musculosa Dry Espalda Olímpica', sport: 'running', category: 'musculosas', gender: 'MUJER',
    price: 18990, tags: ['NUEVO'], sizes: ROPA_MUJER, sizeGuide: 'indumentaria', soldCount: 54,
    description: 'Musculosa con espalda olímpica para máxima libertad de movimiento. Liviana y de secado rápido.',
    specs: [['Material', '100% poliéster'], ['Espalda', 'Olímpica'], ['Calce', 'Holgado']],
    colors: [
      { name: 'Blanco', hex: '#F7F7F5', images: [p('musculosa-blanca'), p('musculosa-blanca-espalda')] },
      { name: 'Rojo', hex: '#E5342F', images: [p('musculosa-roja'), p('musculosa-roja-espalda')] },
      { name: 'Lima', hex: '#D4F53B', images: [p('musculosa-verde'), p('musculosa-verde-espalda')] },
    ],
  },
  {
    slug: 'short-deportivo', name: 'Short Deportivo', sport: 'running', category: 'shorts', gender: 'HOMBRE',
    price: 21990, tags: ['DESTACADO'], sizes: ROPA, sizeGuide: 'indumentaria', soldCount: 141,
    description: 'Short liviano con cintura elástica, cordón de ajuste y bolsillos laterales. Para correr, entrenar o la cancha.',
    specs: [['Material', '100% poliéster'], ['Cintura', 'Elástica con cordón'], ['Bolsillos', '2 laterales'], ['Largo', 'Sobre la rodilla']],
    colors: [
      { name: 'Celeste', hex: '#A9D4F2', images: [p('short-celeste'), p('short-celeste-modelo'), p('short-celeste-frente-espalda'), p('short-celeste-modelo-2'), p('short-celeste-reves')] },
      { name: 'Naranja', hex: '#FF7A1A', images: [p('short-naranja')] },
      { name: 'Negro', hex: '#1B181C', images: [p('short-negro')] },
      { name: 'Rosa', hex: '#F7A1C4', images: [p('short-rosa')] },
    ],
  },
  {
    slug: 'short-padel-blanco', name: 'Short Pádel Tour', sport: 'padel', category: 'indumentaria', gender: 'HOMBRE',
    price: 23990, sizes: ROPA, sizeGuide: 'indumentaria', soldCount: 38,
    description: 'Short blanco de corte clásico para pádel y tenis. Tela con caída y bolsillo para la pelota.',
    specs: [['Material', '100% poliéster'], ['Bolsillo', 'Para pelota'], ['Largo', 'Medio muslo']],
    colors: [{ name: 'Blanco', hex: '#F7F7F5', images: [p('short-blanco'), p('short-blanco-espalda')] }],
  },
  {
    slug: 'pollera-padel', name: 'Pollera Pádel con Calza', sport: 'padel', category: 'indumentaria', gender: 'MUJER',
    price: 27990, tags: ['NUEVO'], sizes: ROPA_MUJER, sizeGuide: 'indumentaria', soldCount: 47,
    description: 'Pollera con calza interna integrada, cintura ancha y vuelo para jugar cómoda y con onda.',
    specs: [['Material', 'Poliéster con elastano'], ['Interior', 'Calza integrada'], ['Cintura', 'Ancha, sin costuras']],
    colors: [
      { name: 'Blanco', hex: '#F7F7F5', images: [p('pollera-blanca'), p('pollera-blanca-espalda'), p('pollera-blanca-tela')] },
      { name: 'Gris melange', hex: '#9A9A9A', images: [p('pollera-gris'), p('pollera-gris-costado'), p('pollera-gris-tela')] },
    ],
  },
  {
    slug: 'chomba-tecnica', name: 'Chomba Técnica', sport: 'golf', category: 'indumentaria', gender: 'HOMBRE',
    price: 32990, sizes: ROPA, sizeGuide: 'indumentaria', soldCount: 33,
    description: 'Chomba de tela técnica con cuello y botonera. Fresca para el green, prolija para después.',
    specs: [['Material', 'Piqué técnico de poliéster'], ['Cuello', 'Polo con 3 botones'], ['Protección', 'UV 30+']],
    colors: [
      { name: 'Blanco', hex: '#F7F7F5', images: [p('chomba-blanca')] },
      { name: 'Gris', hex: '#A3A19C', images: [p('chomba-gris')] },
    ],
  },
  {
    slug: 'campera-puffer-capucha', name: 'Campera Puffer con Capucha', sport: 'trekking', category: 'camperas',
    price: 89990, tags: ['DESTACADO'], sizes: ROPA, sizeGuide: 'indumentaria', soldCount: 72,
    description: 'Campera inflada con capucha fija, cierre frontal y bolsillos con cierre. Abriga sin pesar.',
    specs: [['Exterior', 'Nylon repelente al agua'], ['Relleno', 'Guata siliconada'], ['Capucha', 'Fija'], ['Bolsillos', '2 con cierre']],
    colors: [
      { name: 'Negro', hex: '#1B181C', images: [p('campera-puffer-negra')] },
      { name: 'Negro y gris', hex: '#4A4A4D', images: [p('campera-puffer-negra-gris')] },
      { name: 'Negro y azul', hex: '#1F4FD8', images: [p('campera-puffer-negra-azul')] },
    ],
  },
  {
    slug: 'campera-puffer-liviana', name: 'Campera Puffer Liviana', sport: 'trekking', category: 'camperas',
    price: 74990, salePrice: 64990, tags: ['OFERTA'], sizes: ROPA, sizeGuide: 'indumentaria', soldCount: 58,
    description: 'Campera inflada sin capucha, liviana y compacta. Perfecta como capa intermedia o para el día a día.',
    specs: [['Exterior', 'Nylon ultraliviano'], ['Relleno', 'Guata siliconada'], ['Cuello', 'Alto']],
    colors: [
      { name: 'Negro', hex: '#1B181C', images: [p('campera-liviana-negra')] },
      { name: 'Negro y gris', hex: '#4A4A4D', images: [p('campera-liviana-negra-gris')] },
    ],
  },
  {
    slug: 'chaleco-puffer-capucha', name: 'Chaleco Puffer con Capucha', sport: 'trekking', category: 'chalecos',
    price: 59990, sizes: ROPA, sizeGuide: 'indumentaria', soldCount: 29,
    description: 'Chaleco inflado con capucha. Abriga el torso y deja libres los brazos.',
    specs: [['Exterior', 'Nylon repelente al agua'], ['Relleno', 'Guata siliconada'], ['Capucha', 'Fija']],
    colors: [
      { name: 'Gris', hex: '#8E8E91', images: [p('chaleco-capucha-gris')] },
      { name: 'Negro', hex: '#1B181C', images: [p('chaleco-capucha-negro')] },
    ],
  },
  {
    slug: 'chaleco-puffer', name: 'Chaleco Puffer', sport: 'trekking', category: 'chalecos',
    price: 52990, tags: ['ULTIMAS_UNIDADES'], sizes: ROPA, sizeGuide: 'indumentaria', soldCount: 22,
    description: 'Chaleco inflado de cuello alto, liviano y fácil de guardar.',
    specs: [['Exterior', 'Nylon ultraliviano'], ['Relleno', 'Guata siliconada'], ['Cuello', 'Alto']],
    colors: [
      { name: 'Gris', hex: '#8E8E91', images: [p('chaleco-gris')] },
      { name: 'Negro', hex: '#1B181C', images: [p('chaleco-negro')] },
    ],
  },

  // ── Hockey (TODO: fotos de ejemplo)
  {
    slug: 'palo-hockey-carbono-70', name: 'Palo de Hockey Carbono 70', sport: 'hockey', category: 'palos',
    price: 129990, tags: ['NUEVO'], sizes: ['36.5"', '37.5"'], soldCount: 31,
    description: 'Palo con 70% de carbono para potencia en el drive y control en el arrastre. Curva low bow.',
    specs: [['Composición', '70% carbono, 25% fibra de vidrio, 5% aramida'], ['Curva', 'Low bow 24 mm'], ['Peso', 'Medium']],
    colors: [{ name: 'Negro y lima', hex: '#BCD637', images: [p('palo-hockey')] }],
  },
  {
    slug: 'palo-hockey-iniciacion', name: 'Palo de Hockey Iniciación', sport: 'hockey', category: 'palos', gender: 'NINOS',
    price: 69990, sizes: ['34"', '35"', '36.5"'], soldCount: 18,
    description: 'Palo de 30% carbono, ideal para quienes empiezan o juegan en categorías menores.',
    specs: [['Composición', '30% carbono, 70% fibra de vidrio'], ['Curva', 'Mid bow 22 mm']],
    colors: [{ name: 'Rosa', hex: '#EE3164', images: [p('palo-hockey')] }],
  },
  {
    slug: 'pelotitas-hockey-x3', name: 'Pelotitas de Hockey x3', sport: 'hockey', category: 'pelotitas',
    price: 8990, sizes: UNICO, soldCount: 64,
    description: 'Pack de 3 pelotitas lisas reglamentarias para césped sintético.',
    specs: [['Contenido', '3 unidades'], ['Superficie', 'Lisa'], ['Uso', 'Césped sintético']],
    colors: [{ name: 'Blanco', hex: '#F7F7F5', images: [p('pelotita-hockey')] }],
  },
  {
    slug: 'protector-bucal', name: 'Protector Bucal Termomoldeable', sport: 'hockey', category: 'bucales',
    price: 12990, sizes: ['Junior', 'Adulto'], soldCount: 77,
    description: 'Bucal termomoldeable con estuche. Se adapta a tu dentadura en minutos con agua caliente.',
    specs: [['Material', 'EVA termomoldeable'], ['Incluye', 'Estuche ventilado']],
    colors: [
      { name: 'Negro', hex: '#1B181C', images: [p('bucal')] },
      { name: 'Lima', hex: '#BCD637', images: [p('bucal')] },
      { name: 'Rosa', hex: '#EE3164', images: [p('bucal')] },
    ],
  },
  {
    slug: 'canilleras-hockey', name: 'Canilleras de Hockey', sport: 'hockey', category: 'canilleras',
    price: 15990, sizes: ['S', 'M', 'L'], soldCount: 41,
    description: 'Canilleras anatómicas con protección de tobillo y espuma de alta densidad.',
    specs: [['Exterior', 'Polipropileno'], ['Interior', 'Espuma EVA'], ['Ajuste', 'Abrojo']],
    colors: [{ name: 'Negro', hex: '#1B181C', images: [p('canilleras')] }],
  },

  // ── Pádel
  {
    slug: 'paleta-yagua-carbon-pro', name: 'Paleta Yaguá Carbon Pro', sport: 'padel', category: 'paletas',
    price: 189990, tags: ['NUEVO', 'DESTACADO'], sizes: UNICO, sizeGuide: 'paletas', soldCount: 26,
    description: 'Paleta de carbono 12K con forma diamante para jugadores de ataque. Máxima potencia en el remate.',
    specs: [['Forma', 'Diamante'], ['Caras', 'Carbono 12K'], ['Núcleo', 'EVA Soft'], ['Peso', '360-375 g'], ['Balance', 'Alto']],
    colors: [{ name: 'Negro y lima', hex: '#BCD637', images: [p('paleta-carbon'), p('paleta-carbon-2')] }],
  },
  {
    slug: 'paleta-control', name: 'Paleta Control Redonda', sport: 'padel', category: 'paletas',
    price: 139990, salePrice: 119990, tags: ['OFERTA'], sizes: UNICO, sizeGuide: 'paletas', soldCount: 35,
    description: 'Paleta redonda de fibra de vidrio, punto dulce amplio y mucho control. Ideal para nivel inicial e intermedio.',
    specs: [['Forma', 'Redonda'], ['Caras', 'Fibra de vidrio'], ['Núcleo', 'EVA Soft'], ['Peso', '355-365 g'], ['Balance', 'Bajo']],
    colors: [{ name: 'Negro', hex: '#1B181C', images: [p('paleta-control')] }],
  },
  {
    slug: 'paletero-yagua', name: 'Paletero Yaguá', sport: 'padel', category: 'paleteros',
    price: 69990, sizes: UNICO, soldCount: 19,
    description: 'Paletero con compartimento térmico para 2 paletas, bolsillo para calzado y correas de mochila.',
    specs: [['Capacidad', '2 paletas'], ['Compartimentos', 'Térmico, calzado y accesorios']],
    colors: [{ name: 'Marrón', hex: '#8B5E34', images: [p('bolso')] }],
  },
  {
    slug: 'pelotas-padel-x3', name: 'Pelotas de Pádel x3', sport: 'padel', category: 'pelotas',
    price: 11990, sizes: UNICO, soldCount: 152,
    description: 'Tubo presurizado de 3 pelotas de pádel con rebote parejo y gran durabilidad.',
    specs: [['Contenido', '3 pelotas'], ['Envase', 'Presurizado']],
    colors: [{ name: 'Amarillo', hex: '#E4F23C', images: [p('pelotas-padel')] }],
  },

  // ── Tenis
  {
    slug: 'raqueta-tenis-tour', name: 'Raqueta de Tenis Tour 300', sport: 'tenis', category: 'raquetas',
    price: 159990, tags: ['DESTACADO'], sizes: ['L2', 'L3'], soldCount: 17,
    description: 'Raqueta de 300 g y cabeza de 100 pulgadas cuadradas: el equilibrio justo entre potencia y control.',
    specs: [['Peso', '300 g'], ['Cabeza', '100 in²'], ['Patrón', '16x19'], ['Material', 'Grafito']],
    colors: [{ name: 'Blanco y azul', hex: '#2D6CDF', images: [p('raqueta-tenis'), p('raqueta-tenis-2')] }],
  },
  {
    slug: 'raqueta-tenis-junior', name: 'Raqueta de Tenis Junior', sport: 'tenis', category: 'raquetas', gender: 'NINOS',
    price: 69990, sizes: ['23"', '25"'], soldCount: 12,
    description: 'Raqueta liviana para chicos que están aprendiendo, con grip de tamaño reducido.',
    specs: [['Material', 'Aluminio'], ['Peso', '220-240 g']],
    colors: [{ name: 'Negro', hex: '#1B181C', images: [p('raqueta-tenis-3')] }],
  },
  {
    slug: 'pelotitas-tenis-tubo', name: 'Pelotitas de Tenis Tubo x3', sport: 'tenis', category: 'pelotitas',
    price: 10990, sizes: UNICO, soldCount: 88,
    description: 'Tubo de 3 pelotitas para todo tipo de superficie.',
    specs: [['Contenido', '3 pelotitas'], ['Superficie', 'Todo terreno']],
    colors: [{ name: 'Amarillo', hex: '#E4F23C', images: [p('pelotas-tenis')] }],
  },

  // ── Trekking
  {
    slug: 'mochila-trekking-30', name: 'Mochila Trekking 30 L', sport: 'trekking', category: 'mochilas',
    price: 79990, sizes: UNICO, soldCount: 24,
    description: 'Mochila de 30 litros con espalda ventilada, cinturón lumbar y funda impermeable.',
    specs: [['Capacidad', '30 L'], ['Espalda', 'Ventilada'], ['Incluye', 'Funda impermeable']],
    colors: [{ name: 'Verde', hex: '#2F5D3A', images: [p('mochila-trekking')] }],
  },
  {
    slug: 'mochila-trekking-45', name: 'Mochila Trekking 45 L', sport: 'trekking', category: 'mochilas',
    price: 99990, tags: ['NUEVO'], sizes: UNICO, soldCount: 9,
    description: 'Mochila de 45 litros para travesías de varios días, con acceso frontal y portabastones.',
    specs: [['Capacidad', '45 L'], ['Acceso', 'Superior y frontal'], ['Extras', 'Portabastones e hidratación']],
    colors: [{ name: 'Gris', hex: '#8E8E91', images: [p('mochila-trekking-2')] }],
  },

  // ── Golf
  {
    slug: 'guante-golf-cabretta', name: 'Guante de Golf Cabretta', sport: 'golf', category: 'guantes',
    price: 24990, sizes: ['S', 'M', 'ML', 'L', 'XL'], soldCount: 39,
    description: 'Guante de cuero cabretta para la mano izquierda. Tacto suave y agarre firme.',
    specs: [['Material', 'Cuero cabretta'], ['Mano', 'Izquierda (jugador diestro)']],
    colors: [{ name: 'Blanco', hex: '#F7F7F5', images: [p('guante-golf'), p('guante-golf-2')] }],
  },
  {
    slug: 'gorra-golf', name: 'Gorra de Golf', sport: 'golf', category: 'gorras',
    price: 21990, sizes: UNICO, soldCount: 45,
    description: 'Gorra de seis paneles con visera curva y ajuste trasero.',
    specs: [['Material', 'Algodón'], ['Ajuste', 'Regulable']],
    colors: [{ name: 'Blanco', hex: '#F7F7F5', images: [p('gorra-blanca')] }],
  },
  {
    slug: 'pelotas-golf-x12', name: 'Pelotas de Golf x12', sport: 'golf', category: 'pelotas',
    price: 29990, sizes: UNICO, soldCount: 27,
    description: 'Caja de 12 pelotas de dos capas para distancia y buen tacto en el green.',
    specs: [['Contenido', '12 pelotas'], ['Construcción', '2 capas']],
    colors: [{ name: 'Blanco', hex: '#F7F7F5', images: [p('pelotas-golf')] }],
  },

  // ── King Fishing
  {
    slug: 'cana-spinning-king', name: 'Caña Spinning King Fishing', sport: 'king-fishing', category: 'canas', brand: 'king-fishing',
    price: 64990, tags: ['DESTACADO'], sizes: ['1,80 m', '2,10 m'], soldCount: 34,
    description: 'Caña de spinning de carbono en dos tramos, acción rápida. Ideal para dorado y tararira.',
    specs: [['Material', 'Carbono'], ['Tramos', '2'], ['Acción', 'Rápida'], ['Lance', '10-30 g']],
    colors: [{ name: 'Negro', hex: '#1B181C', images: [p('cana-pesca'), p('cana-pesca-2')] }],
  },
  {
    slug: 'reel-frontal-4000', name: 'Reel Frontal 4000', sport: 'king-fishing', category: 'reeles', brand: 'king-fishing',
    price: 89990, tags: ['NUEVO'], sizes: UNICO, soldCount: 21,
    description: 'Reel frontal de 5+1 rulemanes con freno delantero y carretel de aluminio.',
    specs: [['Rulemanes', '5+1'], ['Relación', '5.2:1'], ['Carretel', 'Aluminio']],
    colors: [{ name: 'Negro', hex: '#1B181C', images: [p('reel-frontal'), p('reel-frontal-2')] }],
  },
  {
    slug: 'reel-azul-2500', name: 'Reel Frontal 2500 Azul', sport: 'king-fishing', category: 'reeles', brand: 'king-fishing',
    price: 59990, salePrice: 52990, tags: ['OFERTA'], sizes: UNICO, soldCount: 30,
    description: 'Reel liviano para pesca variada y spinning liviano.',
    specs: [['Rulemanes', '3+1'], ['Relación', '5.0:1']],
    colors: [{ name: 'Azul', hex: '#1F4FD8', images: [p('reel-azul')] }],
  },
  {
    slug: 'kit-senuelos', name: 'Kit de Señuelos x5', sport: 'king-fishing', category: 'senuelos', brand: 'king-fishing',
    price: 18990, sizes: UNICO, soldCount: 61,
    description: 'Cinco señuelos articulados y de paleta en colores probados para nuestros ríos.',
    specs: [['Contenido', '5 señuelos'], ['Profundidad', '0,5 a 2 m']],
    colors: [{ name: 'Surtido', hex: '#E4F23C', images: [p('senuelo'), p('senuelo-2')] }],
  },
  {
    slug: 'gorra-trucker-king', name: 'Gorra Trucker King Fishing', sport: 'king-fishing', category: 'nautica', brand: 'king-fishing',
    price: 19990, sizes: UNICO, soldCount: 40,
    description: 'Gorra trucker con malla trasera para días largos en el río.',
    specs: [['Frente', 'Espuma'], ['Atrás', 'Malla'], ['Ajuste', 'Snapback']],
    colors: [{ name: 'Negro y blanco', hex: '#1B181C', images: [p('gorra-trucker')] }],
  },

  // ── Accesorios
  {
    slug: 'gorro-tejido', name: 'Gorro Tejido', sport: 'accesorios', category: 'gorros',
    price: 14990, sizes: UNICO, soldCount: 52,
    description: 'Gorro de punto con doblez, abrigado y suave.',
    specs: [['Material', 'Acrílico'], ['Talle', 'Único']],
    colors: [
      { name: 'Negro', hex: '#1B181C', images: [p('gorro-negro')] },
      { name: 'Mostaza', hex: '#D9A440', images: [p('gorro-mostaza')] },
    ],
  },
  {
    slug: 'gorra-yagua', name: 'Gorra Yaguá Lavada', sport: 'accesorios', category: 'gorras',
    price: 17990, sizes: UNICO, soldCount: 67,
    description: 'Gorra de algodón lavado con visera curva y hebilla metálica.',
    specs: [['Material', 'Algodón lavado'], ['Ajuste', 'Hebilla metálica']],
    colors: [{ name: 'Gris', hex: '#6D6D70', images: [p('gorra-gris')] }],
  },
  {
    slug: 'anteojos-urbanos', name: 'Anteojos de Sol Urbanos', sport: 'accesorios', category: 'anteojos',
    price: 39990, sizes: UNICO, soldCount: 23,
    description: 'Anteojos con lente polarizada UV400 y armazón liviano.',
    specs: [['Lente', 'Polarizada UV400'], ['Incluye', 'Estuche y paño']],
    colors: [{ name: 'Negro', hex: '#1B181C', images: [p('anteojos-urbanos')] }],
  },
  {
    slug: 'anteojos-deportivos', name: 'Anteojos Deportivos Polarizados', sport: 'accesorios', category: 'anteojos',
    price: 49990, tags: ['NUEVO'], sizes: UNICO, soldCount: 15,
    description: 'Anteojos envolventes para running, ciclismo y pesca. No se mueven ni se empañan.',
    specs: [['Lente', 'Polarizada UV400'], ['Patillas', 'Goma antideslizante']],
    colors: [{ name: 'Negro', hex: '#1B181C', images: [p('anteojos-sport')] }],
  },
  {
    slug: 'botella-termica', name: 'Botella Térmica 750 ml', sport: 'accesorios', category: 'botellas',
    price: 22990, sizes: UNICO, soldCount: 81,
    description: 'Botella de acero inoxidable de doble pared: frío 24 h, calor 12 h.',
    specs: [['Capacidad', '750 ml'], ['Material', 'Acero inoxidable'], ['Térmica', 'Doble pared']],
    colors: [{ name: 'Negro', hex: '#1B181C', images: [p('botella-negra')] }],
  },
  {
    slug: 'botella-aluminio', name: 'Botella de Aluminio 600 ml', sport: 'accesorios', category: 'botellas',
    price: 12990, sizes: UNICO, soldCount: 59,
    description: 'Botella liviana de aluminio con tapa a rosca y mosquetón.',
    specs: [['Capacidad', '600 ml'], ['Material', 'Aluminio']],
    colors: [{ name: 'Plata', hex: '#C9CACC', images: [p('botella-aluminio')] }],
  },
  {
    slug: 'bolso-deportivo', name: 'Bolso Deportivo 40 L', sport: 'accesorios', category: 'bolsos',
    price: 54990, sizes: UNICO, soldCount: 28,
    description: 'Bolso de lona con base reforzada, bolsillo para calzado y correa regulable.',
    specs: [['Capacidad', '40 L'], ['Material', 'Lona encerada'], ['Extras', 'Bolsillo para calzado']],
    colors: [{ name: 'Marrón', hex: '#8B5E34', images: [p('bolso')] }],
  },
]

// ───────────────────────────── Comunidad (TODO: datos de ejemplo)

const AMBASSADORS = [
  { slug: 'sofia-benitez', name: 'Sofía Benítez', sport: 'Pádel', photo: '/community/embajadora-1.webp', instagram: 'https://instagram.com/',
    bio: 'Jugadora de primera categoría del circuito entrerriano. Entrena todos los días con Yaguá.', favorites: ['pollera-padel', 'remera-cuello-v-mujer', 'paleta-yagua-carbon-pro'] },
  { slug: 'lucia-ferreyra', name: 'Lucía Ferreyra', sport: 'Running', photo: '/community/embajadora-2.webp', instagram: 'https://instagram.com/',
    bio: 'Maratonista y entrenadora de grupos de running en la costanera.', favorites: ['musculosa-dry-mujer', 'botella-termica', 'anteojos-deportivos'] },
  { slug: 'tomas-acosta', name: 'Tomás Acosta', sport: 'Trail y trekking', photo: '/community/embajador-1.webp', instagram: 'https://instagram.com/',
    bio: 'Corredor de trail y guía de montaña. Probó cada campera en la cordillera.', favorites: ['campera-puffer-capucha', 'mochila-trekking-30', 'camiseta-dry-fit'] },
  { slug: 'martin-rios', name: 'Martín Ríos', sport: 'Golf', photo: '/community/embajador-2.webp', instagram: 'https://instagram.com/',
    bio: 'Handicap 4 y profe de golf. Elegancia y técnica dentro y fuera del green.', favorites: ['chomba-tecnica', 'guante-golf-cabretta', 'gorra-golf'] },
]

const PLAYERS = [
  { name: 'Camila Ortiz', club: 'Club Atlético Ribera', sport: 'Hockey', photo: '/community/jugador-1.webp' },
  { name: 'Valentina Gómez', club: 'Pádel Club del Litoral', sport: 'Pádel', photo: '/community/jugador-2.webp' },
  { name: 'Joaquín Pereyra', club: 'Pádel Club del Litoral', sport: 'Pádel', photo: '/community/jugador-3.webp' },
  { name: 'Agustina Ruiz', club: 'Tenis Club Costanera', sport: 'Tenis', photo: '/community/jugador-4.webp' },
  { name: 'Florencia Díaz', club: 'Club Atlético Ribera', sport: 'Hockey', photo: '/community/jugador-5.webp' },
  { name: 'Lautaro Medina', club: 'Hockey Club Río Uruguay', sport: 'Hockey', photo: '/community/jugador-6.webp' },
]

const SPONSORS = [
  { name: 'Club Atlético Ribera', kind: 'Club' },
  { name: 'Pádel Club del Litoral', kind: 'Club' },
  { name: 'Maratón Ciudad del Río', kind: 'Evento' },
  { name: 'Copa Yaguá de Pádel', kind: 'Evento' },
  { name: 'Hockey Club Río Uruguay', kind: 'Club' },
  { name: 'Tenis Club Costanera', kind: 'Club' },
]

const ASSOCIATIONS = [
  { name: 'Asociación Entrerriana de Pádel', description: 'Organiza el circuito provincial de pádel.' },
  { name: 'Federación del Litoral de Hockey', description: 'Torneos de hockey sobre césped de la región.' },
  { name: 'Running Team Concepción', description: 'Grupo de corredores de la ciudad.' },
  { name: 'Pescadores del Río Uruguay', description: 'Club de pesca deportiva con devolución.' },
]

// ───────────────────────────── Carga

const COLOR_CODE = (c: string) =>
  c.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase()
const SIZE_CODE = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'U'

async function main() {
  console.log('Borrando datos de catálogo, comunidad y campañas…')
  await db.$transaction([
    db.orderItem.deleteMany(),
    db.payment.deleteMany(),
    db.order.deleteMany(),
    db.favorite.deleteMany(),
    db.productImage.deleteMany(),
    db.productVariant.deleteMany(),
    db.ambassador.deleteMany(),
    db.product.deleteMany(),
    db.category.deleteMany(),
    db.sport.deleteMany(),
    db.brand.deleteMany(),
    db.player.deleteMany(),
    db.sponsor.deleteMany(),
    db.association.deleteMany(),
    db.campaign.deleteMany(),
    db.coupon.deleteMany(),
  ])

  const brands = {
    yagua: await db.brand.create({ data: { slug: 'yagua', name: 'Yaguá', logo: '/brand/yagua-logo.svg' } }),
    'king-fishing': await db.brand.create({ data: { slug: 'king-fishing', name: 'King Fishing' } }),
  }

  const sportIds: Record<string, string> = {}
  const categoryIds: Record<string, string> = {}
  for (const [i, s] of SPORTS.entries()) {
    const sport = await db.sport.create({
      data: {
        slug: s.slug, name: s.name, tagline: s.tagline, description: s.description,
        heroImage: s.heroImage, cardImage: s.cardImage, isSubBrand: 'isSubBrand' in s ? s.isSubBrand : false, sortOrder: i,
        categories: { create: s.categories.map(([slug, name], j) => ({ slug, name, sortOrder: j })) },
      },
      include: { categories: true },
    })
    sportIds[s.slug] = sport.id
    for (const c of sport.categories) categoryIds[`${s.slug}/${c.slug}`] = c.id
  }

  let skuSeq = 100
  const now = Date.now()
  for (const [i, item] of PRODUCTS.entries()) {
    const code = `YG${skuSeq++}`
    const categoryId = categoryIds[`${item.sport}/${item.category}`]
    if (!categoryId) throw new Error(`Categoría inexistente: ${item.sport}/${item.category}`)
    let imageOrder = 0
    await db.product.create({
      data: {
        slug: item.slug,
        name: item.name,
        description: item.description,
        specs: item.specs.map(([label, value]) => ({ label, value })),
        price: item.price,
        salePrice: item.salePrice ?? null,
        gender: item.gender ?? 'UNISEX',
        tags: item.tags ?? [],
        sizeGuide: item.sizeGuide ?? null,
        soldCount: item.soldCount ?? 0,
        // los primeros de la lista aparecen como más nuevos
        createdAt: new Date(now - i * 36e5 * 7),
        sportId: sportIds[item.sport],
        categoryId,
        brandId: brands[item.brand ?? 'yagua'].id,
        images: {
          create: item.colors.flatMap((c) =>
            c.images.map((url) => ({ url, alt: `${item.name} ${c.name}`, color: c.name, sortOrder: imageOrder++ })),
          ),
        },
        variants: {
          create: item.colors.flatMap((c, ci) =>
            item.sizes.map((size, si) => ({
              sku: `${code}-${COLOR_CODE(c.name)}${ci}-${SIZE_CODE(size)}`,
              size,
              color: c.name,
              colorHex: c.hex,
              // stock variado; algunos agotados para mostrar el estado
              stock: item.tags?.includes('ULTIMAS_UNIDADES') ? (si % 3) + 1 : (ci * 7 + si * 5 + i) % 13 === 0 ? 0 : 3 + ((ci + si + i) % 15),
            })),
          ),
        },
      },
    })
  }
  console.log(`${PRODUCTS.length} productos cargados`)

  for (const [i, a] of AMBASSADORS.entries()) {
    await db.ambassador.create({
      data: {
        slug: a.slug, name: a.name, sport: a.sport, bio: a.bio, photo: a.photo, instagram: a.instagram, sortOrder: i,
        favorites: { connect: a.favorites.map((slug) => ({ slug })) },
      },
    })
  }
  await db.player.createMany({ data: PLAYERS.map((pl, i) => ({ ...pl, sortOrder: i })) })
  await db.sponsor.createMany({ data: SPONSORS.map((s, i) => ({ ...s, sortOrder: i })) })
  await db.association.createMany({ data: ASSOCIATIONS.map((a, i) => ({ ...a, sortOrder: i })) })

  const day = 864e5
  await db.campaign.createMany({
    data: [
      {
        slug: 'moda-padel', title: 'Moda + Pádel', subtitle: 'Tu próximo outfit deportivo favorito te espera acá.',
        ctaLabel: 'Ver colección pádel', ctaHref: '/padel', image: '/campaigns/moda-padel.webp',
        startsAt: new Date(now - day), endsAt: new Date(now + 60 * day),
      },
      {
        slug: 'black-friday', title: 'Black Friday', subtitle: 'Hasta 30% OFF en toda la tienda.',
        ctaLabel: 'Ver ofertas', ctaHref: '/ofertas', image: '/sports/running-2.webp',
        discountType: 'PERCENT', discountValue: 30,
        startsAt: new Date('2026-11-27T00:00:00-03:00'), endsAt: new Date('2026-11-30T23:59:59-03:00'),
      },
    ],
  })
  await db.coupon.create({ data: { code: 'BIENVENIDA10', type: 'PERCENT', value: 10, minPurchase: 30000 } })

  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (email && password) {
    await db.user.upsert({
      where: { email },
      update: { role: 'ADMIN' },
      create: { email, name: 'Admin Sodalis', role: 'ADMIN', passwordHash: await bcrypt.hash(password, 10) },
    })
    console.log(`Usuario admin: ${email} (contraseña en SEED_ADMIN_PASSWORD de .env.local)`)
  }
  console.log('Seed listo')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
