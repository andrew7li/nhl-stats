"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SPORTS } from "@/lib/sports";

export function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex items-center gap-1">
      {SPORTS.map((sport) => {
        const active =
          pathname === `/${sport.slug}` ||
          pathname.startsWith(`/${sport.slug}/`);
        return (
          <li key={sport.slug}>
            <Link
              href={`/${sport.slug}`}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-foreground text-background"
                  : "text-muted hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              {sport.name}
              {!sport.available && (
                <span
                  className="size-1.5 rounded-full bg-current opacity-40"
                  aria-label="coming soon"
                />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
