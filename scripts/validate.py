"""Validate the deployable site's links, image references and catalog counts."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import re, sys
ROOT = Path(__file__).resolve().parents[1]
class Document(HTMLParser):
    def __init__(self, path):
        super().__init__(); self.path = path; self.ids = []; self.refs = []; self.images = []; self.h1 = 0; self.cards = 0; self.arenas = 0; self.weapons = 0
        self.feed(path.read_text())
    def handle_starttag(self, tag, pairs):
        a = dict(pairs)
        if 'id' in a: self.ids.append(a['id'])
        for key in ('href', 'src'):
            if a.get(key): self.refs.append(a[key])
        if tag == 'img': self.images.append(a)
        self.h1 += tag == 'h1'
        self.cards += 'data-character' in a
        self.arenas += 'data-map' in a
        self.weapons += a.get('class') == 'weapon'
docs = {p: Document(p) for p in ROOT.glob('*.html')}
errors = []
for path, doc in docs.items():
    if doc.h1 != 1: errors.append(f'{path.name}: expected one h1, got {doc.h1}')
    if len(doc.ids) != len(set(doc.ids)): errors.append(f'{path.name}: duplicate IDs')
    for image in doc.images:
        if 'alt' not in image: errors.append(f'{path.name}: image without alt')
    for ref in doc.refs:
        url = urlsplit(ref)
        if url.scheme or url.netloc: continue
        target = (ROOT / unquote(url.path.lstrip('/'))) if url.path.startswith('/') else path.parent / unquote(url.path)
        if not url.path: target = path
        if target.is_dir(): target /= 'index.html'
        target = target.resolve()
        if not target.exists(): errors.append(f'{path.name}: missing {ref}')
        elif url.fragment and target in docs and unquote(url.fragment) not in docs[target].ids:
            errors.append(f'{path.name}: missing anchor {ref}')
for css in (ROOT/'css').glob('*.css'):
    for ref in re.findall(r'url\([\'"]?([^\)\'" ]+)', css.read_text()):
        if not urlsplit(ref).scheme and not (css.parent/ref).exists(): errors.append(f'{css.name}: missing {ref}')
main = docs[ROOT/'index.html']
for actual, expected, label in [(main.cards,31,'dossiers'), (main.arenas,11,'arenas'), (main.weapons,14,'weapons')]:
    if actual != expected: errors.append(f'Expected {expected} {label}, found {actual}')
if (ROOT/'CNAME').read_text().strip() != 'civicwatchgame.com': errors.append('Incorrect CNAME')
if errors:
    print('\n'.join(errors)); sys.exit(1)
print(f'PASS: {len(docs)} pages, local links/anchors, image and font references, 31 dossiers, 11 arenas, 14 weapons, CNAME.')
