/**
 * Attribution required by the EDRDG licence (CC BY-SA 4.0) for English meanings
 * taken from JMdict (vocabulary) and KANJIDIC2 (kanji).
 */
export function DictionaryCredit({ source }: { source: "JMdict" | "KANJIDIC2" }) {
  return (
    <p className="no-print mt-12 text-center text-xs text-ink-muted">
      English meanings are based on{" "}
      <a href="https://www.edrdg.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">
        {source}
      </a>
      , used in accordance with the{" "}
      <a
        href="https://www.edrdg.org/edrdg/licence.html"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-accent"
      >
        licence provisions
      </a>{" "}
      of the Electronic Dictionaries Research Group (
      <a
        href="https://creativecommons.org/licenses/by-sa/4.0/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-accent"
      >
        CC BY-SA 4.0
      </a>
      ).
    </p>
  );
}
