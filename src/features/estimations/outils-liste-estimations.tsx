"use client";

import { useTranslation } from "react-i18next";
import { SlidersHorizontal } from "lucide-react";
import {
  BoutonsOutilsListe,
  telechargerCsv,
} from "@/components/ui/boutons-outils-liste";
import { Bouton } from "@/components/ui/bouton";
import {
  compterFiltresEstimations,
  type EstimationFiltrable,
  type FiltresEstimations,
  FILTRES_ESTIMATIONS_VIDES,
} from "@/features/estimations/filtres-estimations";
import { cn } from "@/lib/utils";

const STATUTS_EMISSION = [
  { value: "", label: "Tous" },
  { value: "EMIS", label: "Émis" },
  { value: "ENVOYEE_CAISSE", label: "Envoyée caisse" },
  { value: "TRAITE", label: "Traité" },
];

const STATUTS_CAISSE = [
  { value: "", label: "Tous" },
  { value: "ENVOYEE_CAISSE", label: "En attente" },
  { value: "TRAITE", label: "Traité" },
];

const TYPES_CAISSE = [
  { value: "", label: "Toutes sources" },
  { value: "CONVENTION_EGLISE", label: "Service conventionné" },
  { value: "MEDECIN_EXTERNE", label: "Médecin externe" },
  { value: "PHARMACIE_CLIENT", label: "Client pharmacie" },
];

export function FormulaireFiltresEstimations({
  valeurs,
  onChange,
  variante = "emission",
  onRechercher,
  onReinitialiser,
}: {
  valeurs: FiltresEstimations;
  onChange: (v: FiltresEstimations) => void;
  variante?: "emission" | "caisse";
  onRechercher: () => void;
  onReinitialiser: () => void;
}) {
  const { t } = useTranslation();
  const statuts = variante === "caisse" ? STATUTS_CAISSE : STATUTS_EMISSION;

  return (
    <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block text-sm sm:col-span-2 lg:col-span-1">
          <span className="mb-1 block text-xs font-medium text-texte-secondaire">
            {t("reception.filtres.recherche", { defaultValue: "Recherche" })}
          </span>
          <input
            type="search"
            value={valeurs.recherche}
            onChange={(e) => onChange({ ...valeurs, recherche: e.target.value })}
            placeholder={t("reception.filtres.placeholderRecherche", {
              defaultValue: "Patient, N° dossier, émetteur…",
            })}
            className="w-full rounded-lg border border-gris-bordure px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-texte-secondaire">Statut</span>
          <select
            value={valeurs.statut}
            onChange={(e) => onChange({ ...valeurs, statut: e.target.value })}
            className="w-full rounded-lg border border-gris-bordure px-3 py-2 text-sm"
          >
            {statuts.map((s) => (
              <option key={s.value || "all"} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        {variante === "caisse" && (
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-texte-secondaire">Source</span>
            <select
              value={valeurs.typeEstimation}
              onChange={(e) => onChange({ ...valeurs, typeEstimation: e.target.value })}
              className="w-full rounded-lg border border-gris-bordure px-3 py-2 text-sm"
            >
              {TYPES_CAISSE.map((s) => (
                <option key={s.value || "all"} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Bouton taille="petit" onClick={onRechercher}>
          {t("reception.filtres.appliquer", { defaultValue: "Appliquer" })}
        </Bouton>
        <Bouton variante="contour" taille="petit" onClick={onReinitialiser}>
          {t("reception.filtres.reinitialiser", { defaultValue: "Réinitialiser" })}
        </Bouton>
      </div>
    </div>
  );
}

export function BarreOutilsListeEstimations<T extends EstimationFiltrable>({
  filtresOuverts,
  onBasculerFiltres,
  nbFiltres,
  toutSelectionne,
  onSelectionnerTout,
  onExporter,
  labelSelectionnerTout,
  labelExporter,
}: {
  filtresOuverts: boolean;
  onBasculerFiltres: () => void;
  nbFiltres: number;
  toutSelectionne: boolean;
  onSelectionnerTout: () => void;
  onExporter: () => void;
  labelSelectionnerTout: string;
  labelExporter: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onBasculerFiltres}
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
        labelSelectionnerTout={labelSelectionnerTout}
        labelExporter={labelExporter}
      />
    </div>
  );
}

export function exporterEstimationsCsv(
  items: EstimationFiltrable[],
  options?: { inclureType?: boolean; inclureMontants?: boolean }
) {
  if (items.length === 0) return;

  const entetes = [
    "patient",
    "numeroPatient",
    ...(options?.inclureType ? ["source"] : []),
    "statut",
    ...(options?.inclureMontants ? ["montant", "honoraire"] : []),
  ];

  telechargerCsv(
    `estimations-${new Date().toISOString().slice(0, 10)}.csv`,
    entetes,
    items.map((e) => {
      const row: string[] = [e.nomComplet, e.numeroPatient];
      if (options?.inclureType) {
        row.push(e.typeEstimation ?? "");
      }
      row.push(e.statut.replace("_", " "));
      if (options?.inclureMontants) {
        const ext = e as EstimationFiltrable & {
          totalPatientUsd?: number;
          honoraireUsd?: number;
        };
        row.push(String(ext.totalPatientUsd ?? ""), String(ext.honoraireUsd ?? ""));
      }
      return row;
    })
  );
}

export { FILTRES_ESTIMATIONS_VIDES, compterFiltresEstimations };
