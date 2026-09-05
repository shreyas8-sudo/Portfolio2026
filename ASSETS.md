# How to hand me assets

Three kinds of things, three workflows. Nothing here requires you to touch code.

---

## 1 · Photos → drop and run one command

```
media/inbox/places/tokyo.jpg          ← you drop raw photos here
media/inbox/layovers/dance-1.jpg
media/inbox/about/headshot.jpg

npm run media                          ← run this

public/media/places/tokyo.webp        ← optimised files land here
public/media/layovers/dance-1.webp
public/media/about/headshot.webp
```

It resizes, converts to webp, strips metadata, and prints how much it saved.
Filenames get slugified automatically (`My Photo 2.JPG` → `my-photo-2.webp`).

**iPhone photos:** HEIC isn't supported. Dragging photos out of the Photos app
exports JPEG automatically, which works. Or File → Export → JPEG.

**Folders that exist:** `places` · `layovers` · `about` · `basis` · `synechron`

---

## 2 · Map data → fill in a spreadsheet, I do the rest

Open **`content/places.csv`** and add one row per place:

```
place,date,caption,photo
Tokyo,Mar 2024,"first solo trip — got lost on purpose",tokyo.webp
Lisbon,Summer 2025,"worked from a balcony for two weeks",lisbon.webp
```

**Don't look up coordinates.** Give me the city name and I'll add accurate
lat/long when I convert this into the site data. That's the tedious part and
it's the part I'm fast at.

`date` is free text — "Mar 2024", "Summer 2023", "home", "2023 —" all work.
`caption` is one line in your voice. `photo` can be blank; the pin still works.

When you've filled it in, just say "places are ready" and I'll wire it up.

---

## 3 · Videos → drop them in directly

Case study cover videos don't go through the script (it only handles stills).

| Where | What |
|---|---|
| `public/media/basis/cover.mp4` | 8–14s loop, muted, 1600×900 |
| `public/media/basis/cover-poster.webp` | first frame |
| `public/media/synechron/cover.mp4` | same |
| `public/media/synechron/cover-poster.webp` | first frame |

**Recording tips:** QuickTime → File → New Screen Recording, capture just the
browser content (no chrome, no cursor trails), move deliberately, and end near
where you started so the loop is seamless. Trim in QuickTime, then compress:

```bash
ffmpeg -i raw.mov -vf scale=1600:-2 -c:v libx264 -crf 24 -an cover.mp4
```

(`-an` strips audio — the videos are muted anyway and it halves the file size.)

---

## Fastest order to do this in

1. **Two cover videos** — biggest visual impact, currently the only real gap on the landing page
2. **Headshot** — unblocks About
3. **`places.csv`** — unblocks the map
4. **Layover thumbnails** — 11 of them, but each is small
5. **Basis case study images** — most already exist in the old GitHub Pages repo

---

## Text I still need (just paste in chat)

- Beli + Instagram URLs
- LinkedIn URLs: Noah Howard, Adrian Thomas, Brian Ramires
- pienao live URL, adaptable-furniture live URL
- Synechron: what changed between dashboard V1 and V2, GitHub attempt count,
  and any adoption number for the skill
- Anything to add to the School tab in About (clubs, orgs)
