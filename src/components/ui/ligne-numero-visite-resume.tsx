"use client";

import { afficherNumeroVisite } from "@/lib/numeros/affichage";

export function LigneNumeroVisiteResume({
  label,
  numeroDossier,
}: {
  label: string;
  numeroDossier?: string | null;
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="shrink-0 text-texte-secondaire">{label}</span>
      <span className="max-w-[65%] truncate text-right font-mono font-medium text-texte-principal">
        {afficherNumeroVisite(numeroDossier)}
      </span>
    </div>
  );
}
