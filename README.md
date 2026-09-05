# shreyashanmugam.com

Portfolio. Designed in Figma, built with Claude Code, shipped on Vercel.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

## Structure

```
app/            routes (page.tsx = landing)
  globals.css   ← the whole design system lives here
components/     Nav, Footer, Hero, CaseCard, Plane, Logo, Clocks
lib/site.ts     ← all copy + content data
public/media/   images + video (see MEDIA.md)
```

Two files hold almost everything: `app/globals.css` (tokens, motion) and
`lib/site.ts` (copy). Change those before touching components.

## Design system

**Greyscale carries structure. Accents carry meaning.**

| Token | Use |
|---|---|
| `--color-blue` | identity, links, primary actions |
| `--color-sky` | secondary, ongoing status, HYD |
| `--color-marigold` | concept status, LAX |
| `--color-orange` | **shipped status only** — never decorative |
| `--color-peri` | ghost plane, footer accents |
| `--color-navy` | footer, dark surfaces |
| `--color-basis` | Basis case study accent |

Type: Instrument Sans (display + body), IBM Plex Mono (labels), Doto (flight
codes, clocks, gate numbers).

Rules that keep it from looking generated:
- no uniform radii — `sharp` / `card` / `panel` / `tag` are different on purpose
- page is never plain white; there's always the dot-grid texture
- motion must demonstrate, direct, or have character. Nothing ambient.
- one loud element per viewport, maximum

## Deploy

1. Push to GitHub
2. Import the repo at vercel.com — framework auto-detects as Next.js
3. Add the custom domain in Vercel → Settings → Domains
4. Update `SITE_URL` in `app/layout.tsx`

## Old site

Previous portfolio lives at `shreyas8-sudo.github.io/portfolio`. Keep GitHub
Pages **enabled** and replace each page with a redirect stub so old links
survive — see `redirects/` in that repo.
