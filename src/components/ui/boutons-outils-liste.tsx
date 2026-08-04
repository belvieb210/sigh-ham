"use client";

import { ListChecks, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Boutons sélection globale + export (même UI que /laboratoire/patients). */
export function BoutonsOutilsListe({
  onSelectionnerTout,
  onExporter,
  toutSelectionne = false,
  labelSelectionnerTout,
  labelExporter,
}: {
  onSelectionnerTout: () => void;
  onExporter: () => void;
  toutSelectionne?: boolean;
  labelSelectionnerTout: string;
  labelExporter: string;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onSelectionnerTout}
        aria-label={labelSelectionnerTout}
        title={labelSelectionnerTout}
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-lg border transition-colors",
          toutSelectionne
            ? "border-bleu-medical bg-bleu-medical-clair text-bleu-medical"
            : "border-gris-bordure bg-white text-texte-principal hover:bg-gris-tres-clair"
        )}
      >
        <ListChecks className="h-5 w-5" strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={onExporter}
        aria-label={labelExporter}
        title={labelExporter}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gris-bordure bg-white text-texte-principal transition-colors hover:bg-gris-tres-clair"
      >
        <Share2 className="h-5 w-5" strokeWidth={2} />
      </button>
    </>
  );
}

export function telechargerCsv(nomFichier: string, entetes: string[], lignes: string[][]) {
  const csv = [
    entetes.join(","),
    ...lignes.map((cols) =>
      cols.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomFichier;
  a.click();
  URL.revokeObjectURL(url);
}
