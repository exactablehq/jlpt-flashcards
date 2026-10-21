// Downloads stroke-order data from KanjiVG for every character in a data file
// (kanji, or hiragana/katakana) and writes one small JSON file per character to
// public/stroke-order/.
//
//   node scripts/fetch-stroke-order.mjs data/N5_kanji.json data/N5_hiragana.json ...
//
// Only the stroke paths are kept (in stroke order); everything else in the
// SVG is discarded, and each path is checked to contain drawing commands only.
// KanjiVG is © Ulrich Apel, CC BY-SA 3.0 — https://kanjivg.tagaini.net

import { mkdir, readFile, writeFile } from "node:fs/promises";

const SOURCE = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji";
const OUT_DIR = new URL("../public/stroke-order/", import.meta.url);
const PATH_DATA = /^[MmLlHhVvCcSsQqTtAaZz0-9.,\-\s]+$/;

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: node scripts/fetch-stroke-order.mjs <data json file> [...more files]");
  process.exit(1);
}

// Kanji files use a `kanji` field; kana files use `japanese`.
const characters = [];
for (const file of files) {
  for (const entry of JSON.parse(await readFile(file, "utf8"))) characters.push(entry.kanji ?? entry.japanese);
}
await mkdir(OUT_DIR, { recursive: true });

const missing = [];
for (const kanji of characters) {
  const hex = kanji.codePointAt(0).toString(16).padStart(5, "0");
  const response = await fetch(`${SOURCE}/${hex}.svg`);
  if (!response.ok) {
    missing.push(`${kanji} (HTTP ${response.status})`);
    continue;
  }
  const svg = await response.text();

  // Stroke paths have ids like "kvg:05c71-s1", numbered in stroke order.
  const strokes = [...svg.matchAll(/<path\b[^>]*\bid="kvg:[0-9a-f]+-s(\d+)"[^>]*\bd="([^"]+)"/g)]
    .map(([, number, d]) => ({ number: Number(number), d }))
    .sort((a, b) => a.number - b.number);

  const numbered = strokes.every((stroke, i) => stroke.number === i + 1);
  const clean = strokes.every((stroke) => PATH_DATA.test(stroke.d));
  if (strokes.length === 0 || !numbered || !clean) {
    missing.push(`${kanji} (unexpected stroke data)`);
    continue;
  }

  const data = { kanji, source: "KanjiVG", strokes: strokes.map((stroke) => stroke.d) };
  await writeFile(new URL(`${hex}.json`, OUT_DIR), JSON.stringify(data));
  console.log(`${kanji}  ${hex}  ${strokes.length} strokes`);
}

await writeFile(
  new URL("LICENSE.txt", OUT_DIR),
  [
    "Stroke-order data in this folder is derived from KanjiVG.",
    "KanjiVG is copyright (C) Ulrich Apel and released under the Creative Commons",
    "Attribution-Share Alike 3.0 licence: https://creativecommons.org/licenses/by-sa/3.0/",
    "Website: https://kanjivg.tagaini.net",
    "",
    "These files are distributed under the same licence.",
    "",
  ].join("\n"),
);

if (missing.length > 0) {
  console.error(`\nNo stroke data for: ${missing.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log(`\nDone: ${characters.length} characters.`);
}
