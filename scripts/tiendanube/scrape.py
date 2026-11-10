"""Extrae productos de la tienda Tiendanube de Yaguá (datos del propio cliente, para la demo)."""
import html, json, re, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor

BASE = 'https://www.xn--yagusports-v4a.com.ar'
UA = {'User-Agent': 'Mozilla/5.0'}


def get(url):
    import time, urllib.error
    for attempt in range(8):
        try:
            raw = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
            break
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            time.sleep(10 * (attempt + 1))
    else:
        raise RuntimeError('429 persistente')
    time.sleep(1.5)
    try:
        return raw.decode('utf-8')
    except UnicodeDecodeError:
        return raw.decode('latin-1')


def text_of(fragment):
    fragment = re.sub(r'<li[^>]*>', '\n• ', fragment)
    fragment = re.sub(r'</p>|<br\s*/?>', '\n', fragment)
    t = html.unescape(re.sub(r'<[^>]+>', '', fragment))
    lines = [re.sub(r'[ \t\xa0]+', ' ', l).strip() for l in t.split('\n')]
    return '\n'.join(l for l in lines if l)


def parse(path):
    url = BASE + path + '/'
    s = get(url)
    out = {'url': url, 'slug': path.split('/')[-1]}
    ld = re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', s, re.S)
    page = None
    for block in ld:
        try:
            d = json.loads(block)
        except Exception:
            continue
        if d.get('@type') == 'WebPage':
            page = d
    if page:
        out['crumbs'] = [i['name'] for i in page.get('breadcrumb', {}).get('itemListElement', [])][1:-1]
        me = page.get('mainEntity', {})
        out['name'] = html.unescape(me.get('name', ''))
        b = me.get('brand')
        out['brand'] = b.get('name') if isinstance(b, dict) else b
    m = re.search(r'data-variants="(.*?)"', s, re.S)
    first = m.start() if m else 0
    out['variants'] = json.loads(html.unescape(m.group(1))) if m else []
    nxt = s.find('data-variants="', first + 20)
    form = s[first: nxt if nxt > 0 else first + 200000]
    out['options'] = [html.unescape(x).strip() for x in re.findall(r'for="variation_\d+">\s*([^<\n]+)', form)]
    # galería principal: slides con data-image y su link a la imagen grande
    imgs = []
    for sm in re.finditer(r'js-product-slide [^"]*" data-image="(\d+)"[^>]*>\s*<a href="([^"]+)"', s):
        if sm.group(1) not in [i['id'] for i in imgs]:
            imgs.append({'id': sm.group(1), 'url': 'https:' + sm.group(2) if sm.group(2).startswith('//') else sm.group(2)})
    out['images'] = imgs
    dm = re.search(r'js-product-description[^"]*">(.*?)</div>', s, re.S)
    out['description'] = text_of(dm.group(1)) if dm else ''
    return out


def main():
    import os
    prev = json.load(open(sys.argv[2], encoding='utf-8')) if os.path.exists(sys.argv[2]) else []
    done = {p['slug'] for p in prev}
    paths = [l.strip() for l in open(sys.argv[1]) if l.strip() and l.strip().split('/')[-1] not in done]
    res, errs = list(prev), []

    def work(p):
        try:
            return parse(p)
        except Exception as e:  # noqa
            errs.append((p, str(e)))

    with ThreadPoolExecutor(1) as ex:
        for r in ex.map(work, paths):
            if r:
                res.append(r)
    json.dump(res, open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(len(res), 'ok', len(errs), 'errores', errs[:5])


main()
