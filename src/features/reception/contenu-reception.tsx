"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useEspaceApi } from "@/features/reception/contexte-espace-api";
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
  type DetailPatientEpingleRecents,
  type DetailPatientRechercheSelectionne,
} from "@/constants/reception";
import { useSelectionTransfertOptionnel } from "@/features/reception/contexte-selection-transfert";

interface PropsContenuReception {
  utilisateur: UtilisateurReception;
}

function CorpsAccueilReception({ agentNom }: { agentNom: string }) {
  const espace = useEspaceApi();
  const refFormulaire = useRef<HTMLElement>(null);
  const [donneesPrefill, setDonneesPrefill] = useState<DonneesFormulairePatient | null>(null);
  const [patientSelectionneId, setPatientSelectionneId] = useState<string | null>(null);
  const [chargementSelection, setChargementSelection] = useState(false);
  const { definirDepuisDonneesCompletes } = useResumePatient();
  const selection = useSelectionTransfertOptionnel();

  const selectionnerPatient = useCallback(async (patient: PatientEnregistre) => {
    if (chargementSelection) return;

    setChargementSelection(true);
    setPatientSelectionneId(patient.id);
    void selection?.selectionnerPourPanneau(patient);

    try {
      const res = await fetch(`${espace.prefixeApi}/patients/${encodeURIComponent(patient.id)}`);
      if (!res.ok) throw new Error("Patient introuvable");

      const donnees = (await res.json()) as DonneesFormulairePatient;
      const dossierId = patient.dossierId ?? donnees.dossierId;
      definirDepuisDonneesCompletes({
        ...donnees,
        dossierId,
      });
      setDonneesPrefill({
        ...donnees,
        typeVisite: "ancien",
        dossierId,
      });

      refFormulaire.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      setPatientSelectionneId(null);
    } finally {
      setChargementSelection(false);
    }
  }, [chargementSelection, definirDepuisDonneesCompletes, espace.prefixeApi, selection]);

  useEffect(() => {
    const onRecherchePatient = async (event: Event) => {
      const detail = (event as CustomEvent<DetailPatientRechercheSelectionne>).detail;
      if (!detail?.numeroPatient || chargementSelection) return;

      setChargementSelection(true);
      setPatientSelectionneId(detail.numeroPatient);

      try {
        const res = await fetch(
          `${espace.prefixeApi}/patients/${encodeURIComponent(detail.numeroPatient)}`
        );
        if (!res.ok) throw new Error("Patient introuvable");

        const donnees = (await res.json()) as DonneesFormulairePatient;
        const dossierId = detail.dossierId ?? donnees.dossierId;
        definirDepuisDonneesCompletes({
          ...donnees,
          dossierId,
        });
        setDonneesPrefill({
          ...donnees,
          typeVisite: "ancien",
          dossierId,
        });

        refFormulaire.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch {
        setPatientSelectionneId(null);
      } finally {
        setChargementSelection(false);
      }
    };

    window.addEventListener(espace.evenementPatientRecherche, onRecherchePatient);
    return () =>
      window.removeEventListener(espace.evenementPatientRecherche, onRecherchePatient);
  }, [chargementSelection, definirDepuisDonneesCompletes, espace.evenementPatientRecherche, espace.prefixeApi]);

  useEffect(() => {
    const onPatientEpingle = (event: Event) => {
      const detail = (event as CustomEvent<DetailPatientEpingleRecents>).detail;
      if (!detail?.patient) return;
      setPatientSelectionneId(detail.patient.id);
      void selection?.selectionnerPourPanneau(detail.patient);
    };

    window.addEventListener(espace.evenementPatientEpingleRecents, onPatientEpingle);
    return () =>
      window.removeEventListener(espace.evenementPatientEpingleRecents, onPatientEpingle);
  }, [espace.evenementPatientEpingleRecents, selection]);

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-4 lg:space-y-5">
      <CartesStatistiquesReception />
      <ResumePatientMobile />
      <FormulaireEnregistrement
        ref={refFormulaire}
        variante="apercu"
        donneesPrefill={donneesPrefill}
        onPrefillApplique={() => setDonneesPrefill(null)}
        agentNom={agentNom}
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
  const espace = useEspaceApi();
  const { t } = useTranslation();

  return (
    <MiseEnPageReception
      utilisateur={utilisateur}
      titre={t("reception.pages.accueil.titre")}
      sousTitre={t("reception.layout.sousTitre")}
      panneauDroit={<PanneauDroitReception afficherTransfertManuel />}
    >
      <CorpsAccueilReception
        agentNom={`${utilisateur.prenom} ${utilisateur.nom}`.trim()}
      />
    </MiseEnPageReception>
  );
}
