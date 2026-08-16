"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { DonneesFormulairePatient } from "@/lib/reception/types";
import {
  MiseEnPageEglise,
  type UtilisateurEglise,
} from "@/features/eglise/mise-en-page-eglise";
import { CartesStatistiquesReception } from "@/features/reception/cartes-statistiques";
import { FormulaireEnregistrement } from "@/features/reception/formulaire-enregistrement";
import { TableauPatientsRecents } from "@/features/reception/tableau-patients-recents";
import {
  PanneauDroitReception,
  SectionsMobileReception,
} from "@/features/reception/panneau-droit-reception";
import { ResumePatientMobile } from "@/features/reception/resume-patient-mobile";
import { useResumePatient } from "@/features/reception/contexte-resume-patient";
import { useEspaceApi } from "@/features/reception/contexte-espace-api";
import { useSelectionTransfertOptionnel } from "@/features/reception/contexte-selection-transfert";
import type { PatientEnregistre } from "@/constants/reception";
import type { DetailPatientRechercheSelectionne } from "@/constants/reception";

function CorpsAccueil({ agentNom }: { agentNom: string }) {
  const espace = useEspaceApi();
  const refFormulaire = useRef<HTMLElement>(null);
  const [donneesPrefill, setDonneesPrefill] = useState<DonneesFormulairePatient | null>(null);
  const [patientSelectionneId, setPatientSelectionneId] = useState<string | null>(null);
  const [chargementSelection, setChargementSelection] = useState(false);
  const { definirDepuisDonneesCompletes } = useResumePatient();
  const selection = useSelectionTransfertOptionnel();

  const selectionnerPatient = useCallback(
    async (patient: PatientEnregistre) => {
      if (chargementSelection) return;
      setChargementSelection(true);
      setPatientSelectionneId(patient.id);
      void selection?.selectionnerPourPanneau(patient);
      try {
        const res = await fetch(
          `${espace.prefixeApi}/patients/${encodeURIComponent(patient.id)}`
        );
        const data = (await res.json()) as DonneesFormulairePatient & {
          message?: string;
        };
        if (!res.ok) throw new Error(data.message ?? "Impossible de charger.");
        const dossierId = patient.dossierId ?? data.dossierId;
        definirDepuisDonneesCompletes({
          ...data,
          dossierId,
        });
        setDonneesPrefill({
          ...data,
          typeVisite: "ancien",
          dossierId,
        });
        refFormulaire.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch {
        setPatientSelectionneId(null);
      } finally {
        setChargementSelection(false);
      }
    },
    [chargementSelection, definirDepuisDonneesCompletes, espace.prefixeApi, selection]
  );

  useEffect(() => {
    const onRecherchePatient = (event: Event) => {
      const detail = (event as CustomEvent<DetailPatientRechercheSelectionne>).detail;
      if (!detail?.numeroPatient) return;
      void (async () => {
        try {
          const res = await fetch(
            `${espace.prefixeApi}/patients/${encodeURIComponent(detail.numeroPatient)}`
          );
          const data = (await res.json()) as DonneesFormulairePatient & {
            message?: string;
          };
          if (!res.ok) return;
          const dossierId = detail.dossierId ?? data.dossierId;
          definirDepuisDonneesCompletes({
            ...data,
            dossierId,
          });
          setDonneesPrefill({
            ...data,
            typeVisite: "ancien",
            dossierId,
          });
          setPatientSelectionneId(data.numeroPatient);
        } catch {
          /* ignore */
        }
      })();
    };
    window.addEventListener(espace.evenementPatientRecherche, onRecherchePatient);
    return () =>
      window.removeEventListener(espace.evenementPatientRecherche, onRecherchePatient);
  }, [definirDepuisDonneesCompletes, espace]);

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-4 lg:space-y-5">
      <CartesStatistiquesReception />
      <section ref={refFormulaire}>
        <FormulaireEnregistrement
          variante="apercu"
          donneesPrefill={donneesPrefill}
          onPrefillApplique={() => setDonneesPrefill(null)}
          agentNom={agentNom}
        />
      </section>
      <TableauPatientsRecents
        patientSelectionneId={patientSelectionneId}
        chargementSelection={chargementSelection}
        onSelectionnerPatient={selectionnerPatient}
      />
      <ResumePatientMobile />
      <SectionsMobileReception afficherTransfertManuel />
    </div>
  );
}

export function ContenuAccueilEglise({
  utilisateur,
}: {
  utilisateur: UtilisateurEglise;
}) {
  const { t } = useTranslation();
  const agentNom = `${utilisateur.prenom} ${utilisateur.nom}`.trim();

  return (
    <MiseEnPageEglise
      utilisateur={utilisateur}
      titre={t("eglise.dashboard.titre")}
      sousTitre={t("eglise.layout.sousTitre")}
      panneauDroit={<PanneauDroitReception afficherTransfertManuel />}
    >
      <CorpsAccueil agentNom={agentNom} />
    </MiseEnPageEglise>
  );
}
