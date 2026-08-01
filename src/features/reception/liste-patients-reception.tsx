"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Download, Filter, Search } from "lucide-react";
import type { PatientEnregistre } from "@/constants/reception";
import { FILTRES_ORIENTATION_PATIENT, FILTRES_STATUT_PATIENT } from "@/constants/reception";
import { TableauPatients, type VarianteActionsPatient } from "@/features/reception/composants-liste-patients";
import { Bouton } from "@/components/ui/bouton";
import { useTraductionsReception } from "@/hooks/use-traductions-reception";
import { cn } from "@/lib/utils";

const PATIENTS_PAR_PAGE = 8;

export interface CarteStatPatient {
  /** Identifiant stable pour la logique (indépendant de la langue) */
  cle?: string;
  label: string;
  valeur: number | string;
  accent?: "default" | "bleu" | "vert" | "ambre";
}

interface PropsListePatientsReception {
  patients: PatientEnregistre[];
  titreTableau: string;
  cartesStat: CarteStatPatient[];
  afficherFiltreStatut?: boolean;
  placeholderRecherche?: string;
  varianteActions?: VarianteActionsPatient;
  onRafraichirTransferts?: () => void;
  onSelectionnerPatient?: (patient: PatientEnregistre) => void;
  onVoirExamens?: (patient: PatientEnregistre) => void;
  patientSelectionneId?: string | null;
}

const accentClasses = {
  default: "text-texte-principal",
  bleu: "text-bleu-medical",
  vert: "text-emerald-600",
  ambre: "text-amber-600",
};

export function ListePatientsReception({
  patients,
  titreTableau,
  cartesStat,
  afficherFiltreStatut = true,
  placeholderRecherche,
  varianteActions = "defaut",
  onRafraichirTransferts,
  onSelectionnerPatient,
  onVoirExamens,
  patientSelectionneId = null,
}: PropsListePatientsReception) {
  const { t } = useTranslation();
  const { traduireStatut, traduireOrientation } = useTraductionsReception();
  const [recherche, setRecherche] = useState("");
  const [statut, setStatut] = useState<(typeof FILTRES_STATUT_PATIENT)[number]>("Tous");
  const [orientation, setOrientation] =
    useState<(typeof FILTRES_ORIENTATION_PATIENT)[number]>("Toutes");
  const [page, setPage] = useState(1);
  const [filtresOuverts, setFiltresOuverts] = useState(false);

  const patientsFiltres = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    return patients.filter((patient) => {
      const correspondRecherche =
        !terme ||
        patient.nom.toLowerCase().includes(terme) ||
        patient.id.toLowerCase().includes(terme) ||
        patient.telephone.includes(terme) ||
        patient.motif.toLowerCase().includes(terme);

      const correspondStatut =
        !afficherFiltreStatut || statut === "Tous" || patient.statut === statut;
      const correspondOrientation =
        orientation === "Toutes" || patient.orientation === orientation;

      return correspondRecherche && correspondStatut && correspondOrientation;
    });
  }, [patients, recherche, statut, orientation, afficherFiltreStatut]);

  const totalPages = Math.max(1, Math.ceil(patientsFiltres.length / PATIENTS_PAR_PAGE));
  const pageCourante = Math.min(page, totalPages);
  const debut = (pageCourante - 1) * PATIENTS_PAR_PAGE;
  const patientsPage = patientsFiltres.slice(debut, debut + PATIENTS_PAR_PAGE);

  const cartesAffichees = cartesStat.map((carte) =>
    carte.cle === "resultats" ? { ...carte, valeur: patientsFiltres.length } : carte
  );

  const reinitialiserFiltres = () => {
    setRecherche("");
    setStatut("Tous");
    setOrientation("Toutes");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "grid gap-3",
          cartesStat.length >= 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3"
        )}
      >
        {cartesAffichees.map((carte) => (
          <div
            key={carte.label}
            className={cn(
              "rounded-xl border border-gris-bordure bg-white px-4 py-3 shadow-sm",
              cartesStat.length === 3 && carte.cle === "enAttente" && "hidden sm:block"
            )}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-texte-secondaire">
              {carte.label}
            </p>
            <p
              className={cn(
                "mt-1 text-2xl font-bold",
                accentClasses[carte.accent ?? "default"]
              )}
            >
              {carte.valeur}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gris-bordure bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire" />
            <input
              type="search"
              value={recherche}
              onChange={(e) => {
                setRecherche(e.target.value);
                setPage(1);
              }}
              placeholder={placeholderRecherche ?? t("reception.pages.enregistres.placeholder")}
              className="w-full rounded-lg border border-gris-bordure bg-gris-tres-clair/50 py-2.5 pl-9 pr-3 text-sm text-texte-principal placeholder:text-texte-secondaire/70 focus:border-bleu-medical focus:bg-white focus:outline-none focus:ring-2 focus:ring-bleu-medical/15"
            />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltresOuverts((v) => !v)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors lg:hidden",
                filtresOuverts
                  ? "border-bleu-medical bg-bleu-medical-clair text-bleu-medical"
                  : "border-gris-bordure text-texte-principal hover:bg-gris-tres-clair"
              )}
            >
              <Filter className="h-4 w-4" />
              {t("reception.liste.filtres")}
            </button>
            <Bouton type="button" variante="contour" taille="moyen" className="hidden sm:inline-flex">
              <Download className="h-4 w-4" />
              {t("reception.liste.exporter")}
            </Bouton>
          </div>
        </div>

        <div
          className={cn(
            "mt-3 grid gap-3 border-t border-gris-bordure pt-3 sm:grid-cols-2",
            afficherFiltreStatut ? "lg:grid-cols-3" : "lg:grid-cols-2",
            !filtresOuverts && "hidden lg:grid"
          )}
        >
          {afficherFiltreStatut && (
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-texte-secondaire">
                {t("reception.liste.statut")}
              </label>
              <select
                value={statut}
                onChange={(e) => {
                  setStatut(e.target.value as typeof statut);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gris-bordure bg-white px-3 py-2 text-sm focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15"
              >
                {FILTRES_STATUT_PATIENT.map((s) => (
                  <option key={s} value={s}>
                    {traduireStatut(s)}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-texte-secondaire">
              {t("reception.liste.serviceDestination")}
            </label>
            <select
              value={orientation}
              onChange={(e) => {
                setOrientation(e.target.value as typeof orientation);
                setPage(1);
              }}
              className="w-full rounded-lg border border-gris-bordure bg-white px-3 py-2 text-sm focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15"
            >
              {FILTRES_ORIENTATION_PATIENT.map((o) => (
                <option key={o} value={o}>
                  {traduireOrientation(o)}
                </option>
              ))}
            </select>
          </div>
          <div className={cn("flex items-end", afficherFiltreStatut && "sm:col-span-2 lg:col-span-1")}>
            <button
              type="button"
              onClick={reinitialiserFiltres}
              className="w-full rounded-lg border border-dashed border-gris-bordure py-2 text-sm font-medium text-texte-secondaire transition-colors hover:border-bleu-medical hover:text-bleu-medical"
            >
              {t("reception.liste.reinitialiserFiltres")}
            </button>
          </div>
        </div>
      </div>

      <TableauPatients
        patients={patientsPage}
        titre={titreTableau}
        afficherEnTete
        varianteActions={varianteActions}
        onRafraichirTransferts={onRafraichirTransferts}
        onSelectionnerPatient={onSelectionnerPatient}
        onVoirExamens={onVoirExamens}
        patientSelectionneId={patientSelectionneId}
      />

      {patientsFiltres.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-gris-bordure bg-white px-4 py-3 shadow-sm sm:flex-row">
          <p className="text-sm text-texte-secondaire">
            {t("reception.liste.affichage")}{" "}
            <span className="font-medium text-texte-principal">
              {debut + 1}–{Math.min(debut + PATIENTS_PAR_PAGE, patientsFiltres.length)}
            </span>{" "}
            {t("reception.liste.sur")}{" "}
            <span className="font-medium text-texte-principal">{patientsFiltres.length}</span>{" "}
            {patientsFiltres.length > 1
              ? t("reception.liste.patients")
              : t("reception.liste.patient")}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pageCourante <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1 rounded-lg border border-gris-bordure px-3 py-1.5 text-sm font-medium text-texte-principal transition-colors hover:bg-gris-tres-clair disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("reception.liste.prec")}
            </button>
            <span className="min-w-[4rem] text-center text-sm font-medium text-texte-principal">
              {pageCourante} / {totalPages}
            </span>
            <button
              type="button"
              disabled={pageCourante >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1 rounded-lg border border-gris-bordure px-3 py-1.5 text-sm font-medium text-texte-principal transition-colors hover:bg-gris-tres-clair disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("reception.liste.suiv")}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
