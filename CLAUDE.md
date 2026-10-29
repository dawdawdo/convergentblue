# convergentblue.com

Stephen Abrams's showcase site: restored posts from his old blog (2006–2020) plus new projects. Astro static site, deployed by **Cloudflare Workers** (static assets) on every push to `main` (~1 min). Not Cloudflare Pages, whatever the README says.

## Working here
- Stephen is fine with changes going straight to `main` / live.
- Run `npm run build` before committing; it must pass.
- Local preview: `npm run dev` (http://localhost:4321). Drafts show only with `$env:SHOW_DRAFTS="true"; npm run dev` (PowerShell). Production builds never include drafts.
- Node 22 (`.node-version`). `wrangler.jsonc` sets the 404 page and disables `*.workers.dev` / preview URLs; keep it that way.
- Stephen's local clone is `D:\AutoDev\webdev\convergentblue` (outside Google Drive on purpose); he commits and Syncs from VS Code. If he says he edited something that isn't on GitHub, he probably committed without syncing.

## Layout
- `src/content/blog/<slug>.md`: posts. Schema in `src/content.config.ts`.
- `src/pages/`: site pages plus interactive demos (`classify-your-face`, `color-threshold-test`, `color-swatch-test`). Demo scripts in `src/scripts/<name>/`.
- `worker/index.js`: Worker entry; `/api/submit` receives opt-in color-test results.
- `src/remark-strip-comments.mjs`: strips `<!-- -->` from posts at build (safe for drafting notes).
- `scripts/import_legacy.py`: one-time importer for the old WordPress posts.
- `public/images/YYYY/MM/...`, `public/files/`, `public/videos/`, `public/models/` (the Classify Your Face TF.js model is 72 MB; don't touch casually).

## Post front matter
`title`, `description`, `pubDate`, `tags: [...]`, plus optional:
- `draft: true`: hidden everywhere.
- `legacy: true`: adds "originally published on divergentblue.com" note.
- `cover: "/images/..."`: thumbnail (default: first image, then spiral fallback). `coverFit: contain` stops charts being cropped.
- `demo: /path/`: "Live demo" badge; makes the post the home page's featured card.

Tag `project` marks things Stephen built (`/tags/project/`). There is deliberately **no separate Projects section**.

## Markdown conventions
- KaTeX: `$...$` inline; `$$` on its own lines for display.
- Footnotes `[^label]`; display math inside a footnote is indented 4 spaces.
- Captions: `<figure><img ...><figcaption>...</figcaption></figure>`. Side-by-side: `<div class="pair">` (stacks on phones). Dark-mode images: `<picture>` with a dark `<source>`.
- `##` headings build the table of contents (3+ headings).
- US spelling.

## Design
Dark header band, animated golden-spiral hero, thumbnail card grids; brand blue from the spiral; light/dark follow the device. Stephen is happy with it and doesn't want nitpicking. He discriminates brightness well and hue/saturation poorly: rely on light/dark contrast, not color differences, to carry meaning.

## Rules
- Never link to divergentblue.com (the lapsed domain is now a phishing site). Refer to it only as text.
- Don't name private individuals (doctors, volunteers, collaborators) in posts.
- Never reproduce secrets found in source material (old worklogs contain GitHub tokens).
- When Claude drafts prose from Stephen's materials, say which parts are his words and which are Claude's.

## Style
Brief, direct answers. No rabbit holes, few options. Watch token cost: read write-ups before raw data, downscale images before viewing them.

## Known stale
`README.md` says "Cloudflare Pages" and may mention a dropped Projects section.
