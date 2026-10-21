import { CasperMessage } from "@/components/home/casper-message";
import { LevelCard } from "@/components/home/level-card";
import { SpeechBubble, Squiggle } from "@/components/ui/comic";
import { LEVELS } from "@/config/levels";

export default function Home() {
  return (
    <>
      {/* Extra bottom padding lifts the content slightly, balancing Casper in the corner. */}
      <section
        aria-labelledby="welcome-heading"
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center pt-10 pb-16 text-center sm:pt-12 sm:pb-24 short:sm:pt-4 short:sm:pb-12"
      >
        <SpeechBubble lang="ja" className="text-base sm:text-lg">
          こんにちは！
        </SpeechBubble>

        <h1 id="welcome-heading" className="mt-6 short:sm:mt-4">
          <span className="font-study block text-xl text-ink-muted sm:text-3xl">Welcome to</span>
          <span className="font-display mt-1 block text-[2.6rem] leading-tight font-semibold tracking-tight text-ink [text-shadow:3px_3px_0_rgb(232_165_180_/_0.45)] sm:text-7xl sm:[text-shadow:5px_5px_0_rgb(232_165_180_/_0.45)] short:sm:text-6xl">
            {/* Pink on a pink shadow looks doubled, so "JLPT" gets a faint charcoal shadow instead. */}
            <span className="text-accent [text-shadow:3px_3px_0_rgb(59_50_54_/_0.13)] sm:[text-shadow:5px_5px_0_rgb(59_50_54_/_0.13)]">
              JLPT
            </span>
            Flashcards
          </span>
        </h1>

        <Squiggle className="my-7 sm:my-9 short:sm:my-6" />

        <div className="flex w-full max-w-lg flex-col gap-3">
          {LEVELS.map((level) => (
            <LevelCard key={level.id} level={level} />
          ))}
        </div>
      </section>

      <CasperMessage />
    </>
  );
}
