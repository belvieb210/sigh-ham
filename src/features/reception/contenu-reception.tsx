"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { DonneesFormulairePatient } from "@/lib/reception/types";
import { MiseEnPageReception, type UtilisateurReception } from "@/features/reception/mise-en-page-reception";
import { CartesStatistiquesReception } from "@/features/reception/cartes-statistiques";
import { FormulaireEnregistrement } from "@/features/reception/formulaire-enregistrement";
import { TableauPatientsRecents } from "@/features/reception/tableau-patients-recents";
import {
  PanneauDroitReception,
  SectionsMobileReception,
} from "@/features/reception/panneau-droit-reception";
import { ResumePatientMobile } from "@/features/reception/resume-patient-mobile";
import { useResumePatient } from "@/features/reception/contexte-resume-patient";
import type { PatientEnregistre } from "@/constants/reception";
import {
  EVENEMENT_RECEPTION_PATIENT_RECHERCHE,
  type DetailPatientRechercheSelectionne,
} from "@/constants/reception";

interface PropsContenuReception {
  utilisateur: UtilisateurReception;
}

function CorpsAccueilReception() {
  const refFormulaire = useRef<HTMLElement>(null);
  const [donneesPrefill, setDonneesPrefill] = useState<DonneesFormulairePatient | null>(null);
  const [patientSelectionneId, setPatientSelectionneId] = useState<string | null>(null);
  const [chargementSelection, setChargementSelection] = useState(false);
  const { definirDepuisDonneesCompletes } = useResumePatient();

  const selectionnerPatient = useCallback(async (patient: PatientEnregistre) => {
    if (chargementSelection) return;

    setChargementSelection(true);
    setPatientSelectionneId(patient.id);

    try {
      const res = await fetch(`/api/reception/patients/${encodeURIComponent(patient.id)}`);
      if (!res.ok) throw new Error("Patient introuvable");

      const donnees = (await res.json()) as DonneesFormulairePatient;
      definirDepuisDonneesCompletes(donnees);
      setDonneesPrefill({
        ...donnees,
        typeVisite: "ancien",
        dossierId: patient.dossierId ?? donnees.dossierId,
      });

      refFormulaire.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      setPatientSelectionneId(null);
    } finally {
      setChargementSelection(false);
    }
  }, [chargementSelection, definirDepuisDonneesCompletes]);

  useEffect(() => {
    const onRecherchePatient = async (event: Event) => {
      const detail = (event as CustomEvent<DetailPatientRechercheSelectionne>).detail;
      if (!detail?.numeroPatient || chargementSelection) return;

      setChargementSelection(true);
      setPatientSelectionneId(detail.numeroPatient);

      try {
        const res = await fetch(
          `/api/reception/patients/${encodeURIComponent(detail.numeroPatient)}`
        );
        if (!res.ok) throw new Error("Patient introuvable");

        const donnees = (await res.json()) as DonneesFormulairePatient;
        setDonneesPrefill({
          ...donnees,
          typeVisite: "ancien",
          dossierId: detail.dossierId ?? donnees.dossierId,
        });

        refFormulaire.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch {
        setPatientSelectionneId(null);
      } finally {
        setChargementSelection(false);
      }
    };

    window.addEventListener(EVENEMENT_RECEPTION_PATIENT_RECHERCHE, onRecherchePatient);
    return () =>
      window.removeEventListener(EVENEMENT_RECEPTION_PATIENT_RECHERCHE, onRecherchePatient);
  }, [chargementSelection]);

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-4 lg:space-y-5">
      <CartesStatistiquesReception />
      <ResumePatientMobile />
      <FormulaireEnregistrement
        ref={refFormulaire}
        variante="apercu"
        donneesPrefill={donneesPrefill}
        onPrefillApplique={() => setDonneesPrefill(null)}
      />
      <TableauPatientsRecents
        patientSelectionneId={patientSelectionneId}
        chargementSelection={chargementSelection}
        onSelectionnerPatient={selectionnerPatient}
      />
      <SectionsMobileReception afficherTransfertManuel />
    </div>
  );
}

export function ContenuReception({ utilisateur }: PropsContenuReception) {
  const { t } = useTranslation();

  return (
    <MiseEnPageReception
      utilisateur={utilisateur}
      titre={t("reception.layout.titre")}
      sousTitre={t("reception.layout.sousTitre")}
      panneauDroit={<PanneauDroitReception afficherTransfertManuel />}
    >
      <CorpsAccueilReception />
    </MiseEnPageReception>
  );
}
