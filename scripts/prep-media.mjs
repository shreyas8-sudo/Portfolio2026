#!/usr/bin/env node
/**
 * Media prep.
 *
 *   1. Drop raw photos into  media/inbox/<section>/   (jpg / png / webp)
 *   2. Run                   npm run media
 *   3. Optimised .webp lands in public/media/<section>/
 *
 * Resizes to sane widths, converts to webp, strips metadata.
 * iPhone HEIC isn't supported — in Photos, File → Export → JPEG first
 * (or just drag photos out of Photos, which exports JPEG automatically).
 */

import { readdir, mkdir, stat, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";

const exec = promisify(execFile);

/** macOS converts HEIC natively via sips; elsewhere try ffmpeg. */
async function heicToJpeg(src) {
  const tmp = path.join(
    os.tmpdir(),
    `heic-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
  );
  if (os.platform() === "darwin") {
    try {
      await exec("sips", ["-s", "format", "jpeg", src, "--out", tmp]);
      return tmp;
    } catch {
      /* fall through */
    }
  }
  try {
    await exec("ffmpeg", ["-y", "-loglevel", "error", "-i", src, tmp]);
    return tmp;
  } catch {
    return null;
  }
}

const INBOX = "media/inbox";
const OUT = "public/media";

/* target width per section — keeps files small without visible loss */
const WIDTH = {
  places: 1200,
  layovers: 1000,
  about: 900,
  basis: 1800,
  synechron: 1800,
  default: 1400,
};

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function run() {
  if (!existsSync(INBOX)) {
    console.log(`\n  No ${INBOX}/ folder yet.`);
    console.log(`  Create it, add sub-folders per section, drop photos in.\n`);
    console.log(`  e.g.  ${INBOX}/places/tokyo.jpg  →  ${OUT}/places/tokyo.webp\n`);
    return;
  }

  const sections = (await readdir(INBOX, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  if (!sections.length) {
    console.log(`\n  ${INBOX}/ is empty — add a sub-folder like "places".\n`);
    return;
  }

  let total = 0;
  let saved = 0;

  for (const section of sections) {
    const inDir = path.join(INBOX, section);
    const outDir = path.join(OUT, section);
    await mkdir(outDir, { recursive: true });

    const files = (await readdir(inDir))
      .filter((f) => /\.(jpe?g|png|webp|tiff?|heic|heif)$/i.test(f))
      .sort();
    if (!files.length) continue;

    console.log(`\n  ${section}/`);
    const used = new Set();

    for (const file of files) {
      const src = path.join(inDir, file);
      const width = WIDTH[section] ?? WIDTH.default;

      /* several photos of one place → name-2, name-3 … */
      const base = slug(file);
      let name = `${base}.webp`;
      let i = 2;
      while (used.has(name)) name = `${base}-${i++}.webp`;
      used.add(name);
      const dest = path.join(outDir, name);

      const before = (await stat(src)).size;

      let input = src;
      let tmp = null;
      if (/\.(heic|heif)$/i.test(file)) {
        tmp = await heicToJpeg(src);
        if (!tmp) {
          console.log(`    ${file}  —  SKIPPED (HEIC needs macOS; export as JPEG)`);
          continue;
        }
        input = tmp;
      }

      await sharp(input)
        .rotate() // respect EXIF orientation
        .resize({ width, withoutEnlargement: true })
        /* 80 was crushing the fine text in UI screenshots. 92 roughly
           doubles file size and keeps 11px labels legible. */
        .webp({ quality: 92 })
        .toFile(dest);

      if (tmp) await unlink(tmp).catch(() => {});

      const after = (await stat(dest)).size;
      total += 1;
      saved += before - after;
      const pct = Math.round((1 - after / before) * 100);
      console.log(
        `    ${file}  →  ${name}   ${(after / 1024).toFixed(0)}kb  (−${pct}%)`
      );
    }
  }

  console.log(
    `\n  ${total} file${total === 1 ? "" : "s"} · ${(saved / 1024 / 1024).toFixed(1)}mb saved\n`
  );
}

run().catch((err) => {
  console.error("\n  Failed:", err.message, "\n");
  process.exit(1);
});
