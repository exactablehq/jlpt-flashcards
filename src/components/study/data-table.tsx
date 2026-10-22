"use client";

import { useMemo, useState } from "react";
import { comicPanel } from "@/components/ui/comic";
import { CharacterDialog, type CharacterDetail } from "./character-detail";

export interface Column {
  key: string;
  header: string;
  /** Japanese text column: uses the study font and lang="ja". */
  japanese?: boolean;
  /** Show the Japanese text large, e.g. a single kanji. */
  large?: boolean;
  /** Hidden on small screens (still printed). */
  hideOnMobile?: boolean;
  className?: string;
  /** Show a dropdown in the header to filter rows by this column's values. */
  filterable?: boolean;
}

export interface Row {
  id: string;
  cells: Record<string, string>;
}

/**
 * A clean, printable study table. Rows keep the order they are given in.
 * Filterable columns get a dropdown in their header; printing prints the filtered rows.
 * Cell styling lives in globals.css (`.study-table`) rather than on every cell,
 * which keeps long tables (809 rows) light.
 */
export function DataTable({
  caption,
  columns,
  rows,
  centerRows = false,
  details,
}: {
  caption: string;
  columns: Column[];
  rows: Row[];
  /** Vertically centre cells, e.g. beside a large kanji. */
  centerRows?: boolean;
  /** Pop-up data cards by row ID. When given, rows highlight on hover and open their card on click. */
  details?: Record<string, CharacterDetail>;
}) {
  const [openDetail, setOpenDetail] = useState<CharacterDetail | null>(null);
  // The first Japanese column holds a real button, so the card can also be opened from the keyboard.
  const buttonColumn = details ? columns.find((column) => column.japanese)?.key : undefined;

  const cellClass = (column: Column) =>
    [
      column.japanese && "jp",
      column.japanese && column.large && "jp-lg",
      column.hideOnMobile && "mobile-hidden",
      column.className,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const [filters, setFilters] = useState<Record<string, string>>({});
  // Each filterable column's distinct values, in the order they first appear.
  const options = useMemo(
    () =>
      Object.fromEntries(
        columns
          .filter((column) => column.filterable)
          .map((column) => [column.key, [...new Set(rows.map((row) => row.cells[column.key]).filter(Boolean))]]),
      ),
    [columns, rows],
  );
  const active = Object.entries(filters).filter(([, value]) => value !== "");
  const shown = active.length ? rows.filter((row) => active.every(([key, value]) => row.cells[key] === value)) : rows;

  return (
    <>
      {active.length > 0 && (
        <p aria-live="polite" className="no-print mb-2 px-1 text-sm text-ink-muted">
          Showing {shown.length} of {rows.length} ·{" "}
          <button type="button" onClick={() => setFilters({})} className="font-bold text-accent hover:underline">
            Clear filter
          </button>
        </p>
      )}
      <div className={`${comicPanel} print-plain overflow-hidden`}>
        <table className={`study-table w-full border-collapse text-left ${centerRows ? "study-table-center" : ""}`}>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className={cellClass({ ...column, japanese: false })}>
                  {column.filterable ? (
                    <>
                      <span className="hidden print:inline">{column.header}</span>
                      {/* Plain "Type: All ▾" header text; the native select keeps it accessible. */}
                      <span className="no-print relative inline-flex items-center gap-1 hover:text-accent">
                        <select
                          aria-label={`Filter by ${column.header.toLowerCase()}`}
                          value={filters[column.key] ?? ""}
                          onChange={(event) =>
                            setFilters((current) => ({
                              ...current,
                              [column.key]: event.target.value,
                            }))
                          }
                          className="cursor-pointer appearance-none bg-transparent pr-4 font-medium tracking-wider uppercase focus-visible:rounded"
                        >
                          <option value="">{`${column.header}: All`}</option>
                          {options[column.key].map((value) => (
                            <option key={value} value={value}>
                              {`${column.header}: ${value}`}
                            </option>
                          ))}
                        </select>
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 12 12"
                          className="pointer-events-none absolute right-0 size-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m3 4.5 3 3 3-3" />
                        </svg>
                      </span>
                    </>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr
                key={row.id}
                onClick={details?.[row.id] ? () => setOpenDetail(details[row.id]) : undefined}
                className={details?.[row.id] ? "clickable-row" : undefined}
              >
                {columns.map((column) => (
                  <td key={column.key} lang={column.japanese ? "ja" : undefined} className={cellClass(column)}>
                    {column.key === buttonColumn && details?.[row.id] ? (
                      <button
                        type="button"
                        aria-label={`${row.cells[column.key]}: show details`}
                        className="cursor-pointer rounded-md"
                      >
                        {row.cells[column.key]}
                      </button>
                    ) : (
                      row.cells[column.key]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {details && <CharacterDialog detail={openDetail} onClose={() => setOpenDetail(null)} />}
    </>
  );
}
