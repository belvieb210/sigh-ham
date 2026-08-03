"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SlidersHorizontal } from "lucide-react";
import type { PatientEnregistre } from "@/constants/reception";
import {
  EVENEMENT_RECEPTION_PATIENTS_MODIFIES,
  type DetailPatientOrientationModifiee,
} from "@/constants/reception";
import { TableauPatients } from "@/features/reception/composants-liste-patients";
import { ModaleExamensTransfert } from "@/features/reception/modale-examens-transfert";
import {
  compterFiltresRecents,
  FILTRES_RECENTS_VIDES,
  FormulaireFiltresRecentsReception,
  patientCorrespondFiltresListe,
  STATUTS_SANS_TRANSFERE,
  type FiltresRecentsReception,
} from "@/features/reception/formulaire-filtres-recents-reception";
import { cn } from "@/lib/utils";

interface PropsTableauPatientsRecents {
  patientSelectionneId?: string | null;
  chargementSelection?: boolean;
  onSelectionnerPatient?: (patient: PatientEnregistre) => void;
}

export function TableauPatientsRecents({
  patientSelectionneId = null,
  chargementSelection = false,
  onSelectionnerPatient,
}: PropsTableauPatientsRecents) {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<PatientEnregistre[]>([]);
  const [chargement, setChargement] = useState(true);
  const [patientExamens, setPatientExamens] = useState<PatientEnregistre | null>(null);
  const [modaleExamensOuverte, setModaleExamensOuverte] = useState(false);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillon, setBrouillon] = useState<FiltresRecentsReception>(FILTRES_RECENTS_VIDES);
  const [appliques, setAppliques] =
    useState<FiltresRecentsReception>(FILTRES_RECENTS_VIDES);

  const charger = useCallback(async () => {
    try {
      const res = await fetch("/api/reception/patients?limite=50&nonConfirmes=1");
      if (res.ok) {
        const data = (await res.json()) as { patients?: PatientEnregistre[] };
        setPatients(data.patients ?? []);
        return;
      }
      console.error("[patients récents] API", res.status);
    } catch (err) {
      console.error("[patients récents]", err);
    }
    setPatients([]);
  }, []);

  useEffect(() => {
    charger().finally(() => setChargement(false));
  }, [charger]);

  useEffect(() => {
    const rafraichir = (event: Event) => {
      const detail = (event as CustomEvent<DetailPatientOrientationModifiee>).detail;

      if (!detail?.type || detail.type !== "orientation") {
        void charger();
        return;
      }

      if (detail.patientId) {
        setPatients((liste) =>
          liste.map((p) =>
            p.id === detail.patientId
              ? {
                  ...p,
                  orientation: detail.orientation,
                  orientationCouleur: detail.orientationCouleur,
                  codeSalleDestination: detail.codeSalleDestination,
                }
              : p
          )
        );
      }
    };
    window.addEventListener(EVENEMENT_RECEPTION_PATIENTS_MODIFIES, rafraichir);
    return () => window.removeEventListener(EVENEMENT_RECEPTION_PATIENTS_MODIFIES, rafraichir);
  }, [charger]);

  const patientsFiltres = useMemo(
    () => patients.filter((p) => patientCorrespondFiltresListe(p, appliques)),
    [patients, appliques]
  );

  const nbFiltres = compterFiltresRecents(appliques);

  if (chargement) {
    return (
      <section className="rounded-xl border border-gris-bordure bg-white px-4 py-8 shadow-sm">
        <p className="text-center text-sm text-texte-secondaire">
          {t("reception.tableau.chargement")}
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
            {t("reception.tableau.recents")}
          </h2>
          <p className="mt-0.5 text-xs text-texte-secondaire">
            {t("reception.tableau.sousTitreNonConfirmes", {
              count: patientsFiltres.length,
            })}
          </p>
        </div>
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
          idPrefix="filtre-recents-accueil"
          valeurs={brouillon}
          onChange={setBrouillon}
          statutsOptions={STATUTS_SANS_TRANSFERE}
          onRechercher={() => setAppliques(brouillon)}
          onReinitialiser={() => {
            setBrouillon(FILTRES_RECENTS_VIDES);
            setAppliques(FILTRES_RECENTS_VIDES);
          }}
        />
      )}

      {patientsFiltres.length === 0 ? (
        <section className="rounded-xl border border-dashed border-gris-bordure bg-white px-4 py-10 text-center shadow-sm">
          <p className="text-sm text-texte-secondaire">
            {patients.length === 0
              ? t("reception.tableau.videNonConfirmes")
              : t("reception.liste.aucunPatient")}
          </p>
        </section>
      ) : (
        <TableauPatients
          patients={patientsFiltres}
          titre={t("reception.tableau.recents")}
          afficherEnTete={false}
          patientSelectionneId={patientSelectionneId}
          onSelectionnerPatient={chargementSelection ? undefined : onSelectionnerPatient}
          onRafraichirTransferts={() => void charger()}
          onVoirExamens={(patient) => {
            setPatientExamens(patient);
            setModaleExamensOuverte(true);
          }}
        />
      )}

      <ModaleExamensTransfert
        patient={patientExamens}
        ouverte={modaleExamensOuverte}
        onFermer={() => {
          setModaleExamensOuverte(false);
          setPatientExamens(null);
        }}
        onModifie={() => void charger()}
      />
    </div>
  );
}
