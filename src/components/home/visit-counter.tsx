"use client";

import { useEffect, useState } from "react";

// Abacus (https://abacus.jasoncameron.dev) keeps a single shared number: no
// account, no cookies, nothing stored about the visitor. `hit` adds one and
// returns the total; `get` only reads it.
const COUNTER = "https://abacus.jasoncameron.dev";
const NAMESPACE = "jlptflashcards-site";
const KEY = "home-visits";
// Count each browser session once, so refreshes and returning to the homepage don't inflate it.
const SESSION_FLAG = "jlptflashcards:counted";

function alreadyCounted(): boolean {
  try {
    return window.sessionStorage.getItem(SESSION_FLAG) === "1";
  } catch {
    return false;
  }
}

function markCounted(): void {
  try {
    window.sessionStorage.setItem(SESSION_FLAG, "1");
  } catch {
    // Storage blocked: this session may be counted again, which is harmless.
  }
}

/** A paw and the number of homepage visits, in the top-right corner. Hidden if the counter can't be reached. */
export function VisitCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // Local development reads the number but never adds to it.
    const shouldHit = process.env.NODE_ENV === "production" && !alreadyCounted();
    const controller = new AbortController();
    fetch(`${COUNTER}/${shouldHit ? "hit" : "get"}/${NAMESPACE}/${KEY}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((json: { value?: unknown }) => {
        if (typeof json.value !== "number") return;
        if (shouldHit) markCounted();
        setCount(json.value);
      })
      .catch(() => {
        // Counter unavailable: just don't show it.
      });
    return () => controller.abort();
  }, []);

  if (count === null) return null;

  return (
    <div
      title={`${count.toLocaleString()} visits`}
      className="no-print absolute top-6 right-3 z-20 flex items-center gap-1.5 rounded-full border-2 border-accent bg-white px-3 py-1 text-sm font-bold text-accent tabular-nums comic-shadow-sm sm:top-8 sm:right-6"
    >
      <PawIcon />
      <span>
        {count.toLocaleString()}
        <span className="sr-only"> visits</span>
      </span>
    </div>
  );
}

function PawIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="currentColor">
      <ellipse cx="5" cy="10" rx="2.2" ry="2.8" />
      <ellipse cx="9.3" cy="5.5" rx="2.2" ry="2.9" />
      <ellipse cx="14.7" cy="5.5" rx="2.2" ry="2.9" />
      <ellipse cx="19" cy="10" rx="2.2" ry="2.8" />
      <path d="M12 11c-3.3 0-6.5 3.6-6.5 6.6 0 2 1.5 3 3.2 3 1.4 0 2.2-.7 3.3-.7s1.9.7 3.3.7c1.7 0 3.2-1 3.2-3 0-3-3.2-6.6-6.5-6.6Z" />
    </svg>
  );
}
