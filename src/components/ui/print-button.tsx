"use client";

import { Button } from "./button";

/** Opens the browser's print dialog, where "Save as PDF" is also available. */
export function PrintButton({ label = "Print / Save as PDF" }: { label?: string }) {
  return (
    <Button variant="secondary" className="no-print" onClick={() => window.print()}>
      {label}
    </Button>
  );
}
