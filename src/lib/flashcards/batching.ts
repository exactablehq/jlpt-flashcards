// Set selection for flashcard decks. This module has no imports so it can be
// tested on its own, independent of React and the bundler.
//
// Every deck is split into fixed sets of about 50 cards, in study order:
// vocabulary keeps each study set together, other decks are split evenly.
// A set always holds the same cards; its order is shuffled each time it is
// opened. Learners can move freely between sets.

export const BATCH_SIZE = 50;

export type Rng = () => number;

export interface DeckProgress {
  version: 1;
  /** Kept for compatibility with progress saved by older versions. */
  mode: "ordered" | "random";
  /** IDs in every set opened so far. */
  seen: string[];
  /** The current set, in display order. */
  batch: string[];
  /** Unused now; kept so older saved progress still loads. */
  review: string[];
  /** 1-based number of the current set. */
  batchNumber: number;
  /** Position within `batch`; `batch.length` is the "end of set" card. */
  index: number;
}

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function countUnseen(allIds: readonly string[], progress: DeckProgress): number {
  const seen = new Set(progress.seen);
  return allIds.filter((id) => !seen.has(id)).length;
}

/** Splits IDs into the fewest sets of at most `size`, as equal as possible (e.g. 110 → 37, 37, 36). */
export function splitEvenly(ids: readonly string[], size = BATCH_SIZE): string[][] {
  const count = Math.max(1, Math.ceil(ids.length / size));
  const sets: string[][] = [];
  for (let i = 0; i < count; i++) {
    sets.push(ids.slice(Math.round((i * ids.length) / count), Math.round(((i + 1) * ids.length) / count)));
  }
  return sets;
}

/**
 * Packs consecutive groups (e.g. study sets) into sets as close to BATCH_SIZE as
 * possible without splitting a group. Minimises the total squared distance
 * from BATCH_SIZE, so sets land around 35–65 instead of one tiny leftover.
 */
export function packGroups(groups: readonly (readonly string[])[], target = BATCH_SIZE): string[][] {
  const n = groups.length;
  const best = [0, ...Array<number>(n).fill(Infinity)];
  const cut = Array<number>(n + 1).fill(0);
  for (let end = 1; end <= n; end++) {
    let size = 0;
    for (let start = end - 1; start >= 0; start--) {
      size += groups[start].length;
      const cost = best[start] + (size - target) ** 2;
      if (cost < best[end]) {
        best[end] = cost;
        cut[end] = start;
      }
      if (size > target * 2) break;
    }
  }
  const sets: string[][] = [];
  for (let end = n; end > 0; end = cut[end]) sets.unshift(groups.slice(cut[end], end).flat());
  return sets;
}

/** Opens set `number` (1-based), freshly shuffled, at its first card. */
export function goToSet(
  sets: readonly (readonly string[])[],
  progress: DeckProgress | null,
  number: number,
  rng: Rng,
): DeckProgress {
  const n = Math.min(Math.max(number, 1), sets.length);
  const set = sets[n - 1];
  const seen = progress ? [...new Set([...progress.seen, ...set])] : [...set];
  return { version: 1, mode: "ordered", seen, batch: shuffle(set, rng), review: [], batchNumber: n, index: 0 };
}

/** Reorders the current set (always into a different order when possible) and goes back to its first card. */
export function shuffleBatch(progress: DeckProgress, rng: Rng): DeckProgress {
  let batch = shuffle(progress.batch, rng);
  for (let attempt = 0; attempt < 10 && batch.length > 1 && batch.every((id, i) => id === progress.batch[i]); attempt++) {
    batch = shuffle(progress.batch, rng);
  }
  return { ...progress, batch, index: 0 };
}

/**
 * Validates progress read from storage against the deck's current sets.
 * If the saved set no longer matches (e.g. after a data update, or progress
 * saved before sets were fixed), that set is reopened from its start.
 * Returns null if nothing usable remains.
 */
export function reconcileProgress(
  saved: unknown,
  sets: readonly (readonly string[])[],
  rng: Rng,
): DeckProgress | null {
  if (!saved || typeof saved !== "object") return null;
  const s = saved as Record<string, unknown>;
  if (s.version !== 1) return null;

  const valid = new Set(sets.flat());
  const clean = (value: unknown): string[] =>
    Array.isArray(value)
      ? [...new Set(value.filter((id): id is string => typeof id === "string" && valid.has(id)))]
      : [];

  const batch = clean(s.batch);
  if (batch.length === 0) return null;
  const seen = clean(s.seen);

  const rawNumber = typeof s.batchNumber === "number" && Number.isInteger(s.batchNumber) ? s.batchNumber : 1;
  const batchNumber = Math.min(Math.max(rawNumber, 1), sets.length);
  const set = sets[batchNumber - 1];
  const matches = batch.length === set.length && batch.every((id) => set.includes(id));
  if (!matches) return goToSet(sets, { ...(s as unknown as DeckProgress), seen }, batchNumber, rng);

  const rawIndex = typeof s.index === "number" && Number.isInteger(s.index) ? s.index : 0;
  const index = Math.min(Math.max(rawIndex, 0), batch.length);
  return { version: 1, mode: "ordered", seen: [...new Set([...seen, ...batch])], batch, review: [], batchNumber, index };
}
