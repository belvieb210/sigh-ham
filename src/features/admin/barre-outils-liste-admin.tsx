"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  BoutonsOutilsListe,
} from "@/components/ui/boutons-outils-liste";
import { cn } from "@/lib/utils";

export function BarreOutilsListeAdmin({
  recherche,
  onRecherche,
  placeholder,
  filtresOuverts,
  onFiltres,
  nbFiltres,
  toutSelectionne,
  onSelectionnerTout,
  onExporter,
}: {
  recherche: string;
  onRecherche: (valeur: string) => void;
  placeholder: string;
  filtresOuverts: boolean;
  onFiltres: () => void;
  nbFiltres: number;
  toutSelectionne: boolean;
  onSelectionnerTout: () => void;
  onExporter: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <label className="flex h-11 min-w-[180px] w-full max-w-md flex-1 items-center gap-2 rounded-lg border-2 border-slate-400 bg-white px-3 text-sm text-texte-principal shadow-sm transition-colors focus-within:border-bleu-medical focus-within:ring-2 focus-within:ring-bleu-medical/25">
        <Search className="h-4 w-4 shrink-0 text-slate-600" aria-hidden />
        <input
          type="search"
          value={recherche}
          onChange={(e) => onRecherche(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-600"
        />
        {recherche ? (
          <button
            type="button"
            onClick={() => onRecherche("")}
            aria-label={t("admin.patients.effacerRecherche")}
            className="shrink-0 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </label>

      <div className="flex shrink-0 items-center justify-end gap-2">
        <button
          type="button"
          onClick={onFiltres}
          aria-expanded={filtresOuverts}
          aria-label={
            filtresOuverts
              ? t("reception.tableau.fermerFiltres")
              : t("reception.tableau.ouvrirFiltres")
          }
          className={cn(
            "relative inline-flex h-11 w-11 items-center justify-center rounded-lg border transition-colors",
            filtresOuverts
              ? "border-bleu-medical bg-bleu-medical-clair text-bleu-medical"
              : "border-gris-bordure bg-white text-texte-principal hover:bg-gris-tres-clair"
          )}
        >
          <SlidersHorizontal className="h-5 w-5" strokeWidth={2} />
          <span
            className={cn(
              "absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm",
              nbFiltres > 0 ? "bg-red-500" : "bg-slate-400"
            )}
          >
            {nbFiltres}
          </span>
        </button>
        <BoutonsOutilsListe
          toutSelectionne={toutSelectionne}
          onSelectionnerTout={onSelectionnerTout}
          onExporter={onExporter}
          labelSelectionnerTout={t("reception.liste.selectionnerTout")}
          labelExporter={t("reception.liste.exporterSelection")}
        />
      </div>
    </div>
  );
}
