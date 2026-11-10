"""
Convierte el catálogo bajado de Tiendanube (raw.json, ver scrape.py) al formato del seed de Yaguá.

    python scripts/tiendanube/scrape.py scripts/tiendanube/urls.txt scripts/tiendanube/raw.json
    python scripts/tiendanube/map.py
    node scripts/tiendanube/images.mjs      # baja y optimiza las fotos a public/products/tn/

Salida: prisma/data/tiendanube.json (lo lee prisma/seed.ts).
Las reglas de abajo ubican cada producto en un deporte/categoría de la tienda nueva.
"""
import json, re, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / 'scripts/tiendanube/raw.json'
OUT = ROOT / 'prisma/data/tiendanube.json'
MAX_IMAGES = 6


def norm(s):
    return unicodedata.normalize('NFD', s or '').encode('ascii', 'ignore').decode().lower()


# (palabras en el nombre/rubro, deporte, categoría) — gana la primera que coincide
RULES = [
    (['paleta'], 'padel', 'paletas'),
    (['bocha'], 'hockey', 'bochas'),
    (['bucal'], 'hockey', 'bucales'),
    (['canillera'], 'hockey', 'canilleras'),
    (['funda', 'cubre grip'], 'hockey', 'fundas'),
    (['bolso estanco'], 'king-fishing', 'accesorios'),
    (['panuelo multiuso'], 'king-fishing', 'accesorios'),
    (['gorra trucker'], 'king-fishing', 'accesorios'),
    (['maya', 'playero', 'lona de playa'], 'accesorios', 'playa'),
    (['nino', 'nina'], 'ninos', None),  # categoría según tipo de prenda
    (['gorra'], 'accesorios', 'gorras'),
    (['medias'], 'accesorios', 'medias'),
    (['bolso'], 'accesorios', 'bolsos'),
    (['gorros micropolar', 'cuello termico'], 'trekking', 'accesorios'),
    (['campera', 'chaleco', 'anorak'], 'trekking', 'camperas'),
    (['overpant', 'pantalon'], 'trekking', 'pantalones'),
    (['buzo', 'remera termica'], 'trekking', 'buzos'),
    (['chomba'], 'golf', 'indumentaria'),
    (['crop top', 'top '], 'running', 'tops'),
    (['short', 'pollera'], 'running', 'shorts'),
    (['calza'], 'running', 'calzas'),
    (['remera', 'musculosa', 'sudadera', 'conjunto'], 'running', 'remeras'),
]

KIDS = [(['vestido'], 'vestidos'), (['calza', 'leggins'], 'calzas'), (['short', 'pantalon corto'], 'shorts'), (['buzo'], 'buzos'), ([''], 'remeras')]

COLORS = {
    'negro': '#1b181c', 'negra': '#1b181c', 'blanco': '#f7f7f5', 'blanca': '#f7f7f5', 'gris': '#8a8a8f', 'melange': '#a7a7aa', 'malange': '#a7a7aa',
    'jaspeado': '#a7a7aa', 'azul': '#1f4fbf', 'marino': '#1d2b4f', 'celeste': '#8ec5ee', 'rojo': '#d93a35', 'roja': '#d93a35', 'rosa': '#f08bb4',
    'fucsia': '#e0287d', 'magenta': '#c2185b', 'verde': '#3fa34d', 'lima': '#bcd637', 'fluor': '#c6f000', 'amarillo': '#f2cf3a', 'amarilla': '#f2cf3a',
    'naranja': '#f47b20', 'violeta': '#7a5cc4', 'lila': '#b9a0e0', 'bordo': '#7a1f2b', 'marron': '#7b5233', 'beige': '#d9c7a7', 'caqui': '#a59a6c',
    'aqua': '#4cc9c0', 'turquesa': '#25b5b0', 'coral': '#ff7f6b', 'oliva': '#6b7b3a', 'arena': '#d8c8a8', 'camel': '#b9875a', 'petroleo': '#1f5866',
    'militar': '#4b5320', 'mostaza': '#d9a440', 'chocolate': '#5a3a22', 'plata': '#c9cacc', 'dorado': '#d4af37', 'crudo': '#efe7d6', 'salmon': '#f4a28c',
}


def hex_for(color):
    n = norm(color)
    if 'fluor' in n:
        if 'rosa' in n:
            return '#ff4fa3'
        if 'naranja' in n:
            return '#ff7a1a'
        return '#c6f000'
    for word in re.findall(r'[a-z]+', n):
        if word in COLORS:
            return COLORS[word]
    return '#8a8a8f'


def place(p):
    text = norm(p['name'] + ' ' + ' '.join(p.get('crumbs', [])))
    name = norm(p['name'])
    if 'kiiing' in norm(str(p.get('brand'))) or 'kiiing' in text:
        if 'gorra' in name or 'bolso' in name:
            return 'king-fishing', 'accesorios'
        return 'king-fishing', 'indumentaria'
    for words, sport, cat in RULES:
        if any(w in (text if sport == 'ninos' else name + ' ') for w in words):
            if sport == 'ninos':
                if not ('nino' in text or 'nina' in text):
                    continue
                for kw, c in KIDS:
                    if any(k in name for k in kw):
                        return 'ninos', c
            return sport, cat
    raise ValueError(f'Sin regla para: {p["name"]}')


def gender(p, sport):
    if sport == 'ninos':
        return 'NINOS'
    name = norm(p['name'])
    crumbs = norm(' '.join(p.get('crumbs', [])))
    if 'dama' in name or 'mujer' in name:
        return 'MUJER'
    if 'hombre' in name:
        return 'HOMBRE'
    if (sport in ('hockey', 'padel', 'accesorios') or p.get('_category') in ('accesorios',)) and 'calza' not in name:
        return 'UNISEX'
    if any(k in name for k in ['crop top', 'top ', 'calza', 'pollera', 'sudadera']):
        return 'MUJER'
    if crumbs.startswith('mujer') or 'indumentaria de dama' in crumbs:
        return 'MUJER'
    if crumbs.startswith('hombre') or 'indumentaria de hombre' in crumbs:
        return 'HOMBRE'
    return 'UNISEX'


def clean_name(n):
    n = re.sub(r'\s*-?\s*\(copia\)\s*$', '', n).strip()
    n = re.sub(r'\s+', ' ', n)
    if n.isupper():
        n = n.title()
    return n


def split_description(text):
    """Separa las líneas 'Material: algodón' como especificaciones"""
    specs, body = [], []
    for line in text.split('\n'):
        m = re.match(r'^[•\-–*]?\s*([A-ZÁÉÍÓÚÑa-záéíóúñ][\wÁÉÍÓÚÑáéíóúñ /]{1,28}):\s*(.{2,140})$', line.strip())
        if m and len(specs) < 8 and not m.group(1).lower().startswith(('ideal', 'nota', 'importante')):
            specs.append({'label': m.group(1).strip().capitalize(), 'value': m.group(2).strip().rstrip('.')})
        else:
            body.append(line.lstrip('•-– ').strip() if line.startswith(('•', '-')) else line)
    desc = '\n'.join(l for l in body if l).strip()
    return desc, specs


def color_from_name(name):
    tail = name.split(' - ')[-1] if ' - ' in name else ''
    if tail and hex_for(tail) != '#8a8a8f':
        return tail.strip().capitalize()
    for word in reversed(re.findall(r'[\wáéíóúñÁÉÍÓÚÑ]+', name)):
        if norm(word) in COLORS:
            return word.capitalize()
    return 'Único'


def main():
    raw = json.loads(RAW.read_text(encoding='utf-8'))
    out = []
    for p in raw:
        sport, category = place(p)
        p['_category'] = category
        opts = [norm(o) for o in p['options']]
        idx = {o: i for i, o in enumerate(opts)}
        img_by_id = {i['id']: i for i in p['images']}
        image_color = {}
        variants = []
        for v in p['variants']:
            vals = [v.get(f'option{i}') for i in range(3)]
            size = vals[idx['talle']] if 'talle' in idx else 'Único'
            color_parts = [vals[idx[k]] for k in ('combos', 'color', 'estampa') if k in idx and vals[idx[k]]]
            color = ' '.join(color_parts) if color_parts else color_from_name(p['name'])
            color = color.strip().capitalize() if color.islower() or color.isupper() else color.strip()
            stock = v.get('stock')
            variants.append({'size': str(size).strip(), 'color': color, 'colorHex': hex_for(color), 'stock': 8 if stock is None else max(0, int(stock))})
            if v.get('image') and str(v['image']) in img_by_id:
                image_color.setdefault(str(v['image']), color)
        # sin duplicados de talle/color
        seen, uniq = set(), []
        for v in variants:
            k = (v['color'].lower(), v['size'].lower())
            if k not in seen:
                seen.add(k)
                uniq.append(v)
        colors = {v['color'] for v in uniq}
        v0 = p['variants'][0]
        current = round(float(v0['price_number']))
        compare = v0.get('compare_at_price_number')
        price, sale = (round(float(compare)), current) if compare and float(compare) > current else (current, None)
        desc, specs = split_description(p['description'])
        images = []
        for i, img in enumerate(p['images'][:MAX_IMAGES]):
            c = image_color.get(img['id'])
            images.append({'src': img['url'], 'file': f"/products/tn/{p['slug']}-{i + 1}.webp", 'color': c if c in colors and len(colors) > 1 else None})
        is_clothing = sport not in ('hockey', 'padel') and category not in ('gorras', 'medias', 'bolsos', 'playa', 'accesorios')
        out.append({
            'slug': p['slug'],
            'name': clean_name(p['name']),
            'sport': sport,
            'category': category,
            'brand': 'kiiing-adventure' if sport == 'king-fishing' and 'kiiing' in norm(str(p.get('brand')) + ' '.join(p.get('crumbs', []))) else
                     'yamaha' if norm(str(p.get('brand'))) == 'yamaha' else
                     'kilca' if 'kilca' in norm(p['name']) else
                     'tk' if re.search(r'\btk\b', norm(p['name'])) else
                     'yagua',
            'gender': gender(p, sport),
            'price': price,
            'salePrice': sale,
            'description': desc or p['name'],
            'specs': specs,
            'sizeGuide': 'paletas' if category == 'paletas' else 'indumentaria' if is_clothing else None,
            'variants': uniq,
            'images': images,
            'source': p['url'],
        })
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')
    from collections import Counter
    print(len(out), 'productos')
    for k, n in sorted(Counter(f"{p['sport']}/{p['category']}" for p in out).items()):
        print(f'  {n:3} {k}')
    print('marcas', Counter(p['brand'] for p in out))
    print('géneros', Counter(p['gender'] for p in out))
    print('fotos', sum(len(p['images']) for p in out), '· en oferta', sum(1 for p in out if p['salePrice']))


main()
