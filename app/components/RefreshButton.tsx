"use client";

import { useFormStatus } from "react-dom";

// Must be a child of the <form>, not the page itself — useFormStatus only
// reads the status of the nearest parent form, which is why this can't just
// be inline state on the button in the (server) page component.
export function RefreshButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && (
        <span className="size-3 animate-spin rounded-full border-2 border-background/40 border-t-background" />
      )}
      {pending ? "Refreshing…" : "Refresh now"}
    </button>
  );
}
