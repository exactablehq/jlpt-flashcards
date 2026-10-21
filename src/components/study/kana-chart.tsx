import { comicPanel } from "@/components/ui/comic";
import { CHART_COLUMNS, type ChartRow } from "@/lib/kana";

/** A kana chart: rows of characters under a i u e o columns, with romaji beneath each. */
export function KanaChart({ caption, rows }: { caption: string; rows: ChartRow[] }) {
  return (
    <div className={`${comicPanel} print-plain p-3 sm:p-5`}>
      <table className="kana-chart w-full table-fixed border-collapse">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {CHART_COLUMNS.map((vowel) => (
              <th key={vowel} scope="col">
                {vowel}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c}>
                  {cell && (
                    <div className="flex flex-col items-center py-2 sm:py-3 print:py-1">
                      <span lang="ja" className="font-study text-3xl leading-tight text-ink sm:text-4xl print:text-2xl print:text-black">
                        {cell.kana}
                      </span>
                      <span className="mt-0.5 text-xs text-ink-muted sm:text-sm print:text-black">{cell.romaji}</span>
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
