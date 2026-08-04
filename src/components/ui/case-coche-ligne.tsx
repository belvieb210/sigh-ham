"use client";

import { cn } from "@/lib/utils";

interface PropsCaseCocheLigne {
  coche: boolean;
  onChange: (coche: boolean) => void;
  ariaLabel?: string;
  className?: string;
}

/** Case à cocher pour sélection multi-patients dans les listes. */
export function CaseCocheLigne({
  coche,
  onChange,
  ariaLabel = "Sélectionner",
  className,
}: PropsCaseCocheLigne) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={coche}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!coche);
      }}
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
        coche
          ? "border-bleu-medical bg-bleu-medical text-white"
          : "border-gris-bordure bg-white hover:border-bleu-medical/50",
        className
      )}
    >
      {coche ? (
        <span className="text-[10px] font-bold leading-none">✓</span>
      ) : null}
    </button>
  );
}
