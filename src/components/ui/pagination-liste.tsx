"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function paginerListe<T>(items: T[], page: number, parPage: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / parPage));
  const pageCourante = Math.min(Math.max(1, page), totalPages);
  const debut = (pageCourante - 1) * parPage;
  return {
    totalPages,
    pageCourante,
    debut,
    itemsPage: items.slice(debut, debut + parPage),
  };
}

interface PropsPaginationListe {
  page: number;
  totalPages: number;
  totalItems: number;
  parPage: number;
  onChange: (page: number) => void;
  labelPrec?: string;
  labelSuiv?: string;
  className?: string;
  compact?: boolean;
}

export function PaginationListe({
  page,
  totalPages,
  totalItems,
  parPage,
  onChange,
  labelPrec = "Préc.",
  labelSuiv = "Suiv.",
  className,
  compact = false,
}: PropsPaginationListe) {
  if (totalItems <= parPage) return null;

  const debut = (page - 1) * parPage + 1;
  const fin = Math.min(page * parPage, totalItems);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 border-t border-gris-bordure bg-slate-50/80 px-3",
        compact ? "py-2" : "py-2.5",
        className
      )}
    >
      <p className="text-[11px] text-texte-secondaire">
        <span className="font-medium text-texte-principal">
          {debut}–{fin}
        </span>{" "}
        / {totalItems}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="inline-flex items-center gap-0.5 rounded-md border border-gris-bordure bg-white px-2 py-1 text-[11px] font-medium text-texte-principal hover:bg-gris-tres-clair disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {labelPrec}
        </button>
        <span className="min-w-[3rem] text-center text-[11px] font-medium text-texte-principal">
          {page}/{totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="inline-flex items-center gap-0.5 rounded-md border border-gris-bordure bg-white px-2 py-1 text-[11px] font-medium text-texte-principal hover:bg-gris-tres-clair disabled:cursor-not-allowed disabled:opacity-40"
        >
          {labelSuiv}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
