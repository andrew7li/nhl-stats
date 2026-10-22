"use client";

import { useState } from "react";

// Hides a run of table rows behind a single "show more" row. The rows
// themselves are rendered on the server and passed in as children; only the
// open/closed toggle lives on the client.
export function CollapsedRows({
  count,
  colSpan,
  children,
}: {
  count: number;
  colSpan: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (count === 0) return null;

  return (
    <>
      {open && children}
      <tr className="border-t border-line">
        <td colSpan={colSpan} className="p-0">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            className="w-full py-1.5 text-center text-xs font-medium text-muted hover:cursor-pointer hover:bg-surface-hover hover:text-foreground"
          >
            {open
              ? "Hide middle teams"
              : `Show ${count} more ${count === 1 ? "team" : "teams"}`}
          </button>
        </td>
      </tr>
    </>
  );
}
