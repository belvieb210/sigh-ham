"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { PatientEnregistre } from "@/constants/reception";
import {
  EVENEMENT_RECEPTION_PATIENTS_MODIFIES,
  EVENEMENT_RECEPTION_PATIENT_RECHERCHE,
  type DetailPatientRechercheSelectionne,
} from "@/constants/reception";
import { useSelectionTransfert } from "@/features/reception/contexte-selection-transfert";
import { ListePatientsReception } from "@/features/reception/liste-patients-reception";
import { ModaleExamensTransfert } from "@/features/reception/modale-examens-transfert";

export function ListePatientsEnregistres() {
  const { t } = useTranslation();
  const { patientSelectionne, selectionnerPourPanneau, synchroniserSelection } =
    useSelectionTransfert();
  const [patients, setPatients] = useState<PatientEnregistre[]>([]);
  const [stats, setStats] = useState({ aujourdhui: 0, enAttente: 0 });
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [patientExamens, setPatientExamens] = useState<PatientEnregistre | null>(null);
  const [modaleExamensOuverte, setModaleExamensOuverte] = useState(false);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/reception/patients");
      const data = (await res.json()) as {
        patients?: PatientEnregistre[];
        stats?: { aujourdhui: number; enAttente: number };
        message?: string;
      };
      if (!res.ok) throw new Error(data.message ?? "Chargement impossible.");
      const liste = data.patients ?? [];
      setPatients(liste);
      synchroniserSelection(liste);
      setStats(data.stats ?? { aujourdhui: 0, enAttente: 0 });
    } catch (error) {
      setErreur(
        error instanceof Error ? error.message : "Impossible de charger les patients."
      );
    } finally {
      setChargement(false);
    }
  }, [synchroniserSelection]);

  useEffect(() => {
    charger();
  }, [charger]);

  useEffect(() => {
    const rafraichir = () => {
      void charger();
    };
    window.addEventListener(EVENEMENT_RECEPTION_PATIENTS_MODIFIES, rafraichir);
    return () => window.removeEventListener(EVENEMENT_RECEPTION_PATIENTS_MODIFIES, rafraichir);
  }, [charger]);

  useEffect(() => {
    const onRecherchePatient = (event: Event) => {
      const detail = (event as CustomEvent<DetailPatientRechercheSelectionne>).detail;
      if (!detail?.numeroPatient) return;

      const patient = patients.find((p) => p.id === detail.numeroPatient);
      if (patient) {
        void selectionnerPourPanneau(patient);
      }
    };

    window.addEventListener(EVENEMENT_RECEPTION_PATIENT_RECHERCHE, onRecherchePatient);
    return () =>
      window.removeEventListener(EVENEMENT_RECEPTION_PATIENT_RECHERCHE, onRecherchePatient);
  }, [patients, selectionnerPourPanneau]);

  if (chargement) {
    return (
      <div className="rounded-xl border border-gris-bordure bg-white px-6 py-16 text-center text-sm text-texte-secondaire shadow-sm">
        {t("reception.pages.enregistres.chargement")}
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center shadow-sm">
        <p className="text-sm text-red-700">{erreur}</p>
        <button
          type="button"
          onClick={charger}
          className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          {t("reception.liste.reessayer")}
        </button>
      </div>
    );
  }

  return (
    <>
      <ListePatientsReception
        patients={patients}
        titreTableau={t("reception.pages.enregistres.tableau")}
        cartesStat={[
          { cle: "aujourdhui", label: t("reception.liste.stats.aujourdhui"), valeur: stats.aujourdhui },
          { cle: "resultats", label: t("reception.liste.stats.resultats"), valeur: 0, accent: "bleu" },
          { cle: "enAttente", label: t("reception.liste.stats.enAttente"), valeur: stats.enAttente, accent: "ambre" },
        ]}
        afficherFiltreStatut
        placeholderRecherche={t("reception.pages.enregistres.placeholder")}
        patientSelectionneId={patientSelectionne?.id ?? null}
        onRafraichirTransferts={charger}
        onSelectionnerPatient={(patient) => {
          void selectionnerPourPanneau(patient);
        }}
        onVoirExamens={(patient) => {
          setPatientExamens(patient);
          setModaleExamensOuverte(true);
        }}
      />

      <ModaleExamensTransfert
        patient={patientExamens}
        ouverte={modaleExamensOuverte}
        onFermer={() => {
          setModaleExamensOuverte(false);
          setPatientExamens(null);
        }}
      />
    </>
  );
}
