"""One-time import of recovered WordPress posts into src/content/blog. Kept for reference."""
import re, os, sys, glob, shutil
from PIL import Image
SRC, REPO = sys.argv[1], sys.argv[2]
OUT = f"{REPO}/src/content/blog"; PUB = f"{REPO}/public"
os.makedirs(OUT, exist_ok=True)

TAGS = {
 'introduction-games-are-fun': ['meta', 'games'],
 'how-long-will-it-take-to-get-to-free-parking': ['probability', 'games', 'simulation'],
 'monte-carlo-excel-dice-roller': ['probability', 'simulation', 'excel'],
 'learning-to-play-mancala': ['games', 'ai', 'strategy'],
 'squaring-a-triangle': ['probability', 'geometry'],
 'rage-faces-and-math': ['math', 'humor'],
 'derangement-can-solve-your-problems': ['probability', 'combinatorics'],
 'when-will-this-game-end': ['probability', 'markov-chains', 'football'],
 'entropy-the-opposite-of-chaos': ['information-theory', 'math'],
}
RENAME = {'hello-world': 'introduction-games-are-fun'}
# decisions from inventory.csv: Check posts and drafts stay in the repo as drafts (hidden)
DRAFT_OVERRIDE = {'entropy-the-opposite-of-chaos': False}

def fix_latex(m):
    body = m.group(1)
    body = body.replace('\\_', '_').replace('\\*', '*')
    color = None
    params = re.findall(r'&(\w+)=([0-9A-Fa-f]+)', body)
    body = re.sub(r'&\w+=[0-9A-Fa-f]+', '', body).strip()
    for k, v in params:
        if k == 'fg': color = v
    if color: body = f'\\color{{#{color}}}{{{body}}}'
    return f'${body}$'

for f in sorted(glob.glob(f'{SRC}/*/*.md')):
    if f'{os.sep}2006-blog{os.sep}' in f and not any(k in f for k in ('animated-delights', 'wedding-links')):
        continue
    if 'football-scores' in f:
        continue
    text = open(f, encoding='utf-8').read()
    fm, body = re.match(r'---\n(.*?)\n---\n(.*)', text, re.S).groups()
    meta = dict(re.findall(r'^(\w+): (.*)$', fm, re.M))
    slug = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', os.path.basename(f)[:-3])
    slug = RENAME.get(slug, slug)
    draft = DRAFT_OVERRIDE.get(slug, meta['status'] != 'publish' or '2006-blog' in f)
    # math
    body = re.sub(r'\$latex\s+(.*?)\$', fix_latex, body)
    body = re.sub(r'\\?\[latex\\?\](.*?)\\?\[/latex\\?\]', fix_latex, body, flags=re.S)
    # images -> /images/...
    for rel in set(re.findall(r'\.\./images/([^)\s"]+)', body)):
        src = f'{SRC}/images/{rel}'
        dst_rel = rel
        if rel.lower().endswith('.bmp'):
            dst_rel = rel[:-4] + '.png'
            os.makedirs(os.path.dirname(f'{PUB}/images/{dst_rel}'), exist_ok=True)
            Image.open(src).save(f'{PUB}/images/{dst_rel}', optimize=True)
        elif os.path.exists(src):
            os.makedirs(os.path.dirname(f'{PUB}/images/{rel}'), exist_ok=True)
            shutil.copy2(src, f'{PUB}/images/{rel}')
        body = body.replace(f'../images/{rel}', f'/images/{dst_rel}')
    # WordPress posts used bold-only paragraphs as section headings
    body = re.sub(r'^\*\*+([^*\n=(]{2,80}?)\*+\*\s*$', lambda m: '## ' + m.group(1).strip().strip('*').strip(), body, flags=re.M)
    body = re.sub(r'^## \*\*(.*?)\*\*\s*$', r'## \1', body, flags=re.M)
    # old internal links
    body = re.sub(r'https?://(?:www\.)?divergentblue\.com/blog/\d{4}/\d{2}/\d{2}/([\w-]+)/?', r'/blog/\1/', body)
    body = re.sub(r'https?://(?:www\.)?divergentblue\.com/?(?=[)\s])', '/', body)
    prose = '\n'.join(l for l in body.split('\n') if l.strip() and not l.lstrip().startswith(('#', '[![', '![', '|', '>')))
    prose = re.sub(r'\$[^$]*\$', '', prose)
    plain = re.sub(r'!\[[^\]]*\]\([^)]*\)|\[([^\]]*)\]\([^)]*\)|[*_#>\\]', lambda m: m.group(1) or '', prose)
    plain = ' '.join(plain.split())
    desc = (plain[:157].rsplit(' ', 1)[0] + '…') if len(plain) > 160 else plain
    tags = TAGS.get(slug, ['archive'])
    title = meta['title'].strip().strip('"').replace('"', '\\"')
    out = (f'---\ntitle: "{title}"\ndescription: "{desc.replace(chr(34), chr(39))}"\n'
           f'pubDate: {meta["date"]}\ntags: [{", ".join(tags)}]\ndraft: {str(draft).lower()}\n'
           f'legacy: true\n---\n\n{body.strip()}\n')
    open(f'{OUT}/{slug}.md', 'w', encoding='utf-8').write(out)
    print(('DRAFT ' if draft else 'LIVE  ') + slug)
