# JLPTFlashcards

A free, static Japanese-learning website for the JLPT N5. No database, login, backend, ads or tracking.

Built with Next.js (App Router), TypeScript and Tailwind CSS, exported as a static site and hosted on GitHub Pages.

## Run locally

```bash
npm install      # first time only
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run build      # static site → out/
npx serve out      # preview the built site
```

## Deploy to GitHub Pages

Deployment is automatic via [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

1. Create an empty repository on GitHub and push this project to it (`main` or `master`).
2. In the repository, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Every push then lints, type-checks, builds and publishes the site to
   `https://<username>.github.io/<repo>/`.

The workflow sets `NEXT_PUBLIC_BASE_PATH=/<repo>` so links and assets work under that subpath
(or no base path if the repository is named `<username>.github.io`).

## Project layout

```
data/                     Study data (source of truth; never modified by the site)
  N5_vocab.json           809 N5 vocabulary entries
  N5_hiragana.json        71 hiragana
  N5_katakana.json        71 katakana
  N5_kanji_main.json      110 kanji shown on the site (kun'yomi with okurigana)
  N5_kanji.json           Same 110 kanji; used to download stroke-order data
scripts/                  Maintenance scripts (stroke-order data download)
assets/originals/         Original artwork (kept in the repo, not deployed)
public/images/            Optimised images that are deployed
public/stroke-order/      KanjiVG stroke data, one file per kanji
src/app/                  Pages (routes are generated per level from src/config/levels.ts)
src/components/           Layout, UI, flashcards and table components
src/config/               Levels and study sections
src/lib/vocabulary/       Vocabulary loading, validation and categories
src/lib/kana/             Kana loading, validation and chart layout
src/lib/kanji/            Kanji loading and validation
src/lib/flashcards/       Batch selection (Shuffle / See more) and local progress storage
```

## Adding study data

All data files are validated at build time; problems (duplicates, blank fields, unknown types or
groups, mismatched counts) stop the build with a clear message. The files are never modified.

- **Vocabulary:** `data/N5_vocab.json`.
- **Hiragana / Katakana:** `data/N5_hiragana.json`, `data/N5_katakana.json` — `{ japanese, reading, group }`.
  The chart layout comes from the file order and each romaji's vowel.
- **Kanji:** `data/N5_kanji_main.json` — `{ kanji, meaning, onyomi, kunyomi }`; `-` or `—` means no reading.

English meanings in the vocabulary and kanji files come from the JMdict and KANJIDIC2 dictionaries
(Electronic Dictionaries Research Group, CC BY-SA 4.0), so those files are shared under CC BY-SA 4.0
and the site credits the source on every vocabulary and kanji page. See [LICENSE](LICENSE).

Kana and kanji entries have no `id` field, so the character itself (unique per file) is used as the
stable ID for flashcard progress.

### Stroke order

Stroke-order animations for kanji, hiragana and katakana use data from
[KanjiVG](https://kanjivg.tagaini.net) (© Ulrich Apel, CC BY-SA 3.0), bundled in `public/stroke-order/`.
To regenerate it, e.g. for a new level:

```bash
node scripts/fetch-stroke-order.mjs data/N5_kanji.json data/N5_hiragana.json data/N5_katakana.json
```

## Privacy

Flashcard progress is stored only in the visitor's browser (`localStorage`), separately for each
category, and can be cleared with **Reset progress**. Nothing is sent anywhere.
