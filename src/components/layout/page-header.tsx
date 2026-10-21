import type { ReactNode } from "react";
import { SpeechBubble, Squiggle } from "@/components/ui/comic";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";

interface PageHeaderProps {
  title: ReactNode;
  /** Japanese label shown in a speech bubble above the title. */
  eyebrow?: ReactNode;
  description?: ReactNode;
  breadcrumbs?: Crumb[];
  /** Buttons shown under the description, e.g. Print or Start Flashcards. */
  actions?: ReactNode;
}

/** Centered page title block, kept in the open middle of the painting. */
export function PageHeader({ title, eyebrow, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <header className="mb-7 flex flex-col items-center gap-3 text-center sm:mb-9">
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="mt-2 flex flex-col items-center">
        {eyebrow && (
          <SpeechBubble lang="ja" className="mb-3 text-sm sm:text-base print:hidden">
            {eyebrow}
          </SpeechBubble>
        )}
        <h1 className="font-display comic-text text-3xl font-semibold tracking-tight text-balance text-ink sm:text-5xl print:[text-shadow:none]">
          {title}
        </h1>
        <Squiggle className="mt-3 print:hidden" />
        {description && <p className="mt-3 max-w-xl text-balance text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="no-print mt-2 flex flex-wrap justify-center gap-3">{actions}</div>}
    </header>
  );
}
