// Guías de talles. TODO: confirmar medidas reales con el cliente.
export const SIZE_GUIDES: Record<string, { head: string[]; rows: string[][]; note: string }> = {
  indumentaria: {
    head: ['Talle', 'Pecho (cm)', 'Cintura (cm)', 'Cadera (cm)'],
    rows: [
      ['XS', '84-88', '68-72', '86-90'],
      ['S', '88-94', '72-78', '90-96'],
      ['M', '94-100', '78-84', '96-102'],
      ['L', '100-106', '84-90', '102-108'],
      ['XL', '106-112', '90-96', '108-114'],
      ['XXL', '112-120', '96-104', '114-122'],
    ],
    note: 'Medí sobre el cuerpo, sin ropa ajustada. Si estás entre dos talles, elegí el más grande.',
  },
  paletas: {
    head: ['Nivel', 'Forma recomendada', 'Peso'],
    rows: [
      ['Inicial', 'Redonda', '355-365 g'],
      ['Intermedio', 'Lágrima', '360-370 g'],
      ['Avanzado / ataque', 'Diamante', '365-375 g'],
    ],
    note: '¿Dudas con la paleta? Escribinos por WhatsApp y te asesoramos.',
  },
}
