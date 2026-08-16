"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropsPaginationNumerotee {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
  maxVisible?: number;
}

/** Pagination numérotée (style maquette admin bilans). */
export function PaginationNumerotee({
  page,
  totalPages,
  onChange,
  className,
  maxVisible = 5,
}: PropsPaginationNumerotee) {
  if (totalPages <= 1) return null;

  const debut = Math.max(
    1,
    Math.min(page - Math.floor(maxVisible / 2), totalPages - maxVisible + 1)
  );
  const fin = Math.min(totalPages, debut + maxVisible - 1);
  const pages: number[] = [];
  for (let i = debut; i <= fin; i += 1) pages.push(i);

  return (
    <nav
      className={cn("flex items-center justify-center gap-1.5", className)}
      aria-label="Pagination"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gris-bordure bg-white text-texte-principal transition-colors hover:bg-gris-tres-clair disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Page précédente"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={cn(
            "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-semibold transition-colors",
            p === page
              ? "border-ham-plum bg-ham-plum text-white"
              : "border-gris-bordure bg-white text-texte-principal hover:bg-gris-tres-clair"
          )}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gris-bordure bg-white text-texte-principal transition-colors hover:bg-gris-tres-clair disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Page suivante"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
