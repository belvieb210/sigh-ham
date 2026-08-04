"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { SlidersHorizontal } from "lucide-react";
import { BoutonsOutilsListe } from "@/components/ui/boutons-outils-liste";
import {
  FormulaireFiltresLaboratoire,
  type FiltresLaboratoireUi,
  compterFiltresLaboratoire,
} from "@/features/laboratoire/formulaire-filtres-laboratoire";
import { cn } from "@/lib/utils";

interface PropsBarreFiltresLaboratoire {
  titre?: string;
  sousTitre?: string;
  filtresOuverts: boolean;
  onToggle: () => void;
  brouillon: FiltresLaboratoireUi;
  onChangeBrouillon: (v: FiltresLaboratoireUi) => void;
  appliques: FiltresLaboratoireUi;
  onRechercher: () => void;
  onReinitialiser: () => void;
  idPrefix?: string;
  /** Boutons supplémentaires après le filtre (ex. patients) */
  actionsApresFiltre?: ReactNode;
}

export function BarreFiltresLaboratoire({
  titre,
  sousTitre,
  filtresOuverts,
  onToggle,
  brouillon,
  onChangeBrouillon,
  appliques,
  onRechercher,
  onReinitialiser,
  idPrefix = "filtre-labo",
  actionsApresFiltre,
}: PropsBarreFiltresLaboratoire) {
  const { t } = useTranslation();
  const nbFiltres = compterFiltresLaboratoire(appliques);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          {titre ? (
            <h2 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
              {titre}
            </h2>
          ) : null}
          {sousTitre ? (
            <p className="mt-0.5 text-xs text-texte-secondaire">{sousTitre}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={filtresOuverts}
            aria-label={
              filtresOuverts
                ? t("laboratoire.filtres.fermer")
                : t("laboratoire.filtres.ouvrir")
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
          {actionsApresFiltre}
        </div>
      </div>

      {filtresOuverts && (
        <FormulaireFiltresLaboratoire
          idPrefix={idPrefix}
          valeurs={brouillon}
          onChange={onChangeBrouillon}
          onRechercher={onRechercher}
          onReinitialiser={onReinitialiser}
        />
      )}
    </div>
  );
}

/** Boutons sélection / exporter pour la page patients */
export function BoutonsOutilsListeLaboratoire({
  onSelectionnerTout,
  onExporter,
  toutSelectionne,
}: {
  onSelectionnerTout: () => void;
  onExporter: () => void;
  toutSelectionne?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <BoutonsOutilsListe
      onSelectionnerTout={onSelectionnerTout}
      onExporter={onExporter}
      toutSelectionne={toutSelectionne}
      labelSelectionnerTout={t("laboratoire.outils.selectionnerTout")}
      labelExporter={t("laboratoire.outils.exporter")}
    />
  );
}
