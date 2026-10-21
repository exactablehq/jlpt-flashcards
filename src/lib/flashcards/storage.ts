// Flashcard progress lives only in this browser's localStorage. Nothing is
// sent anywhere. Every access is guarded: storage can be unavailable (private
// browsing, blocked site data), in which case progress simply isn't kept.

const PREFIX = "jlptflashcards:v1:";

export function readStored(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or blocked; progress just won't persist.
  }
}

export function removeStored(key: string): void {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    // Nothing to do.
  }
}
