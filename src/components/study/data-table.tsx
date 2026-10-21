import { comicPanel } from "@/components/ui/comic";

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
}

export interface Row {
  id: string;
  cells: Record<string, string>;
}

/**
 * A clean, printable study table. Rows keep the order they are given in.
 * Cell styling lives in globals.css (`.study-table`) rather than on every cell,
 * which keeps long tables (809 rows) light.
 */
export function DataTable({
  caption,
  columns,
  rows,
  centerRows = false,
}: {
  caption: string;
  columns: Column[];
  rows: Row[];
  /** Vertically centre cells, e.g. beside a large kanji. */
  centerRows?: boolean;
}) {
  const cellClass = (column: Column) =>
    [column.japanese && "jp", column.japanese && column.large && "jp-lg", column.hideOnMobile && "mobile-hidden", column.className]
      .filter(Boolean)
      .join(" ") ||
    undefined;

  return (
    <div className={`${comicPanel} print-plain overflow-hidden`}>
      <table className={`study-table w-full border-collapse text-left ${centerRows ? "study-table-center" : ""}`}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={cellClass({ ...column, japanese: false })}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.key} lang={column.japanese ? "ja" : undefined} className={cellClass(column)}>
                  {row.cells[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
