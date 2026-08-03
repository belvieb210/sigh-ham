"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import type { PatientEnregistre } from "@/constants/reception";
import { FILTRES_STATUT_PATIENT } from "@/constants/reception";
import { TableauPatients, type VarianteActionsPatient } from "@/features/reception/composants-liste-patients";
import {
  compterFiltresRecents,
  FILTRES_RECENTS_VIDES,
  FormulaireFiltresRecentsReception,
  patientCorrespondFiltresListe,
  type FiltresRecentsReception,
} from "@/features/reception/formulaire-filtres-recents-reception";
import { cn } from "@/lib/utils";

const PATIENTS_PAR_PAGE = 5;

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
  /** @deprecated Conservé pour compatibilité — le filtre unifié remplace la barre de recherche. */
  placeholderRecherche?: string;
  varianteActions?: VarianteActionsPatient;
  onRafraichirTransferts?: () => void;
  onSelectionnerPatient?: (patient: PatientEnregistre) => void;
  onVoirExamens?: (patient: PatientEnregistre) => void;
  patientSelectionneId?: string | null;
  idPrefixFiltres?: string;
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
  varianteActions = "defaut",
  onRafraichirTransferts,
  onSelectionnerPatient,
  onVoirExamens,
  patientSelectionneId = null,
  idPrefixFiltres = "filtre-liste-reception",
}: PropsListePatientsReception) {
  const { t } = useTranslation();
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillon, setBrouillon] = useState<FiltresRecentsReception>(FILTRES_RECENTS_VIDES);
  const [appliques, setAppliques] =
    useState<FiltresRecentsReception>(FILTRES_RECENTS_VIDES);
  const [page, setPage] = useState(1);

  const patientsFiltres = useMemo(
    () =>
      patients.filter((patient) =>
        patientCorrespondFiltresListe(patient, appliques, {
          ignorerStatut: !afficherFiltreStatut,
        })
      ),
    [patients, appliques, afficherFiltreStatut]
  );

  const totalPages = Math.max(1, Math.ceil(patientsFiltres.length / PATIENTS_PAR_PAGE));
  const pageCourante = Math.min(page, totalPages);
  const debut = (pageCourante - 1) * PATIENTS_PAR_PAGE;
  const patientsPage = patientsFiltres.slice(debut, debut + PATIENTS_PAR_PAGE);

  const cartesAffichees = cartesStat.map((carte) =>
    carte.cle === "resultats" ? { ...carte, valeur: patientsFiltres.length } : carte
  );

  const nbFiltres = compterFiltresRecents(appliques, {
    ignorerStatut: !afficherFiltreStatut,
  });

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

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setFiltresOuverts((o) => !o)}
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
      </div>

      {filtresOuverts && (
        <FormulaireFiltresRecentsReception
          idPrefix={idPrefixFiltres}
          valeurs={brouillon}
          onChange={setBrouillon}
          masquerStatut={!afficherFiltreStatut}
          statutsOptions={FILTRES_STATUT_PATIENT}
          onRechercher={() => {
            setAppliques(brouillon);
            setPage(1);
          }}
          onReinitialiser={() => {
            setBrouillon(FILTRES_RECENTS_VIDES);
            setAppliques(FILTRES_RECENTS_VIDES);
            setPage(1);
          }}
        />
      )}

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
