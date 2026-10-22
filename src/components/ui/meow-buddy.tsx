"use client";

import Image from "next/image";
import { useState } from "react";
import { withBasePath } from "@/lib/paths";

const MEOWS = ["meow!", "mrrp?", "にゃー！", "meow ♡", "purr…", "mew!"];

/**
 * Easter egg: Casper (caspu) says a quick "meow" in a little bubble each time
 * he's clicked. The bubble stays until 4 seconds after the last click, then fades away.
 */
export function MeowBuddy({ className }: { className?: string }) {
  // Each click gets a new id, so the bubble remounts and its animation restarts.
  const [meow, setMeow] = useState<{ id: number; text: string } | null>(null);

  return (
    <button
      type="button"
      aria-label="Casper"
      onClick={() =>
        setMeow((current) => {
          // A random line, but never the one already showing, so every click says something new.
          const others = MEOWS.filter((text) => text !== current?.text);
          return { id: (current?.id ?? 0) + 1, text: others[Math.floor(Math.random() * others.length)] };
        })
      }
      className="pointer-events-auto relative block w-full cursor-pointer rounded-3xl"
    >
      {meow && (
        <span
          key={meow.id}
          role="status"
          onAnimationEnd={() => setMeow(null)}
          className="meow-pop font-study absolute bottom-[88%] left-1/2 z-10 rounded-full border-2 border-accent bg-white px-3 py-1 text-base whitespace-nowrap text-accent comic-shadow-sm sm:text-lg"
        >
          {meow.text}
        </span>
      )}
      <Image src={withBasePath("/images/caspu.webp")} alt="" width={480} height={591} className={className} />
    </button>
  );
}
