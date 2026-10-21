import { ButtonLink } from "@/components/ui/button";
import { SpeechBubble, Squiggle } from "@/components/ui/comic";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
      <SpeechBubble lang="ja" className="text-sm sm:text-base">
        迷子？
      </SpeechBubble>
      <h1 className="font-display comic-text mt-5 text-3xl font-semibold text-ink sm:text-4xl">Page not found</h1>
      <Squiggle className="my-4" />
      <p className="max-w-sm text-ink-muted">This page doesn&rsquo;t exist, but your study materials are just a step away.</p>
      <ButtonLink href="/" className="mt-8">
        Back to home
      </ButtonLink>
    </div>
  );
}
