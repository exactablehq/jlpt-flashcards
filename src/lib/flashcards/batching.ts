// Batch selection for flashcard decks. This module has no imports so it can be
// tested on its own, independent of React and the bundler.
//
// A "round" goes through every card in a deck once, in batches of up to 50.
// The first batch is all new cards. Each later batch ("See More") mixes mostly
// new cards with a few cards from earlier batches for review, then shuffles.
// When every card has been dealt, the learner can start a new round.

export const BATCH_SIZE = 50;
/** Review cards mixed into each new full batch: 3–5 of 50 is 6–10%. */
export const REVIEW_MIN = 3;
export const REVIEW_MAX = 5;
/** Keeps reviews at or below 10% of any batch: at most 1 review per 9 new cards. */
const NEW_PER_REVIEW = 9;

export type Rng = () => number;
/** "ordered" deals new cards in the original learning order; "random" draws them at random. */
export type RoundMode = "ordered" | "random";

export interface DeckProgress {
  version: 1;
  mode: RoundMode;
  /** IDs dealt so far this round, oldest first. Includes the current batch. */
  seen: string[];
  /** The current batch, in display order. */
  batch: string[];
  /** IDs in the current batch that were dealt in an earlier batch. */
  review: string[];
  batchNumber: number;
  /** Position of the current card within `batch`. */
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

function randomInt(min: number, max: number, rng: Rng): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function unseenIds(allIds: readonly string[], seen: readonly string[]): string[] {
  const seenSet = new Set(seen);
  return allIds.filter((id) => !seenSet.has(id));
}

export function countUnseen(allIds: readonly string[], progress: DeckProgress): number {
  return unseenIds(allIds, progress.seen).length;
}

export function isRoundComplete(allIds: readonly string[], progress: DeckProgress): boolean {
  return countUnseen(allIds, progress) === 0;
}

/** Starts a fresh round. In ordered mode the first batch keeps the original order. */
export function startRound(allIds: readonly string[], mode: RoundMode, rng: Rng): DeckProgress {
  const pool = mode === "ordered" ? [...allIds] : shuffle(allIds, rng);
  const first = pool.slice(0, BATCH_SIZE);
  return { version: 1, mode, seen: first, batch: first, review: [], batchNumber: 1, index: 0 };
}

/**
 * Deals the next batch: up to 50 cards, normally 45–47 new and 3–5 review,
 * shuffled together. Returns null when every card has already been dealt.
 */
export function dealNextBatch(allIds: readonly string[], progress: DeckProgress, rng: Rng): DeckProgress | null {
  const unseen = unseenIds(allIds, progress.seen);
  if (unseen.length === 0) return null;

  let reviewCount = Math.min(randomInt(REVIEW_MIN, REVIEW_MAX, rng), Math.floor(unseen.length / NEW_PER_REVIEW));
  // If all remaining new cards fit in one batch, deal them all and only use spare room for reviews.
  if (unseen.length <= BATCH_SIZE) reviewCount = Math.min(reviewCount, BATCH_SIZE - unseen.length);

  // Prefer reviews from before the batch just finished, so repeats are spaced out.
  const current = new Set(progress.batch);
  const older = progress.seen.filter((id) => !current.has(id));
  const reviewPool = older.length >= reviewCount ? older : progress.seen;
  const review = shuffle(reviewPool, rng).slice(0, reviewCount);

  const newCount = Math.min(unseen.length, BATCH_SIZE - review.length);
  const fresh = (progress.mode === "ordered" ? unseen : shuffle(unseen, rng)).slice(0, newCount);

  return {
    ...progress,
    seen: [...progress.seen, ...fresh],
    batch: shuffle([...fresh, ...review], rng),
    review,
    batchNumber: progress.batchNumber + 1,
    index: 0,
  };
}

/** Reorders the current batch (always into a different order when possible) without changing what's in it. */
export function shuffleBatch(progress: DeckProgress, rng: Rng): DeckProgress {
  let batch = shuffle(progress.batch, rng);
  for (let attempt = 0; attempt < 10 && batch.length > 1 && batch.every((id, i) => id === progress.batch[i]); attempt++) {
    batch = shuffle(progress.batch, rng);
  }
  return { ...progress, batch, index: 0 };
}

/**
 * Validates progress read from storage against the deck's current cards.
 * Unknown IDs (e.g. after a data update) are dropped. Returns null if nothing usable remains.
 */
export function reconcileProgress(saved: unknown, allIds: readonly string[]): DeckProgress | null {
  if (!saved || typeof saved !== "object") return null;
  const s = saved as Record<string, unknown>;
  if (s.version !== 1 || (s.mode !== "ordered" && s.mode !== "random")) return null;

  const valid = new Set(allIds);
  const clean = (value: unknown): string[] =>
    Array.isArray(value)
      ? [...new Set(value.filter((id): id is string => typeof id === "string" && valid.has(id)))]
      : [];

  const batch = clean(s.batch);
  if (batch.length === 0) return null;
  const seen = clean(s.seen);
  const seenSet = new Set(seen);
  for (const id of batch) if (!seenSet.has(id)) seen.push(id);
  const inBatch = new Set(batch);
  const review = clean(s.review).filter((id) => inBatch.has(id));

  const batchNumber = typeof s.batchNumber === "number" && Number.isInteger(s.batchNumber) && s.batchNumber > 0 ? s.batchNumber : 1;
  const rawIndex = typeof s.index === "number" && Number.isInteger(s.index) ? s.index : 0;
  const index = Math.min(Math.max(rawIndex, 0), batch.length - 1);

  return { version: 1, mode: s.mode, seen, batch, review, batchNumber, index };
}
