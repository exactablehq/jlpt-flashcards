"use client";

import { useState } from "react";
import { comicPanel } from "@/components/ui/comic";
import { CHART_COLUMNS, type ChartRow } from "@/lib/kana/model";
import { CharacterDialog, type CharacterDetail } from "./character-detail";

/**
 * A kana chart: rows of characters under a i u e o columns, with romaji beneath each.
 * Clicking a character opens its data card with the stroke order.
 */
export function KanaChart({ caption, rows, note }: { caption: string; rows: ChartRow[]; note: string }) {
  const [detail, setDetail] = useState<CharacterDetail | null>(null);

  return (
    <div className={`${comicPanel} print-plain p-3 sm:p-5`}>
      <CharacterDialog detail={detail} onClose={() => setDetail(null)} />
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
                    <button
                      type="button"
                      onClick={() => setDetail({ character: cell.kana, primary: cell.romaji, note })}
                      aria-label={`${cell.kana}, ${cell.romaji}: show details`}
                      className="group flex w-full cursor-pointer flex-col items-center py-2 transition-colors duration-150 hover:bg-sakura-soft focus-visible:bg-sakura-soft sm:py-3 print:py-1"
                    >
                      <span
                        lang="ja"
                        className="font-study text-3xl leading-tight text-ink transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:scale-110 group-hover:text-accent sm:text-4xl print:text-2xl print:text-black"
                      >
                        {cell.kana}
                      </span>
                      <span className="mt-0.5 text-xs text-ink-muted sm:text-sm print:text-black">{cell.romaji}</span>
                    </button>
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
