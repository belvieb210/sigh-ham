"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { PatientEnregistre } from "@/constants/reception";
import {
  EVENEMENT_RECEPTION_PATIENTS_MODIFIES,
  EVENEMENT_RECEPTION_PATIENT_RECHERCHE,
  type DetailPatientOrientationModifiee,
  type DetailPatientRechercheSelectionne,
} from "@/constants/reception";
import { useSelectionTransfert } from "@/features/reception/contexte-selection-transfert";
import { ListePatientsReception } from "@/features/reception/liste-patients-reception";
import { ModaleExamensTransfert } from "@/features/reception/modale-examens-transfert";

export function ListePatientsTransferes() {
  const { t } = useTranslation();
  const { patientSelectionne, selectionnerPourPanneau, synchroniserSelection } =
    useSelectionTransfert();
  const [patients, setPatients] = useState<PatientEnregistre[]>([]);
  const [stats, setStats] = useState({
    aujourdhui: 0,
    versInfirmiers: 0,
    versCaisse: 0,
  });
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [patientExamens, setPatientExamens] = useState<PatientEnregistre | null>(null);
  const [modaleExamensOuverte, setModaleExamensOuverte] = useState(false);

  const charger = useCallback(
    async (options?: { silencieux?: boolean }) => {
      const silencieux = options?.silencieux ?? false;
      if (!silencieux) {
        setChargement(true);
        setErreur(null);
      }
      try {
        const res = await fetch("/api/reception/transferts");
        const data = (await res.json()) as {
          patients?: PatientEnregistre[];
          stats?: { aujourdhui: number; versInfirmiers: number; versCaisse: number };
          message?: string;
        };
        if (!res.ok) throw new Error(data.message ?? "Chargement impossible.");
        const liste = data.patients ?? [];
        setPatients(liste);
        synchroniserSelection(liste);
        setStats(data.stats ?? { aujourdhui: 0, versInfirmiers: 0, versCaisse: 0 });
        setErreur(null);
      } catch (error) {
        if (!silencieux) {
          setErreur(
            error instanceof Error
              ? error.message
              : "Impossible de charger les patients transférés."
          );
        }
      } finally {
        if (!silencieux) setChargement(false);
      }
    },
    [synchroniserSelection]
  );

  useEffect(() => {
    void charger();
  }, [charger]);

  useEffect(() => {
    const onModifie = (event: Event) => {
      const detail = (event as CustomEvent<DetailPatientOrientationModifiee>).detail;

      if (detail?.type === "orientation" && detail.patientId) {
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
        return;
      }

      void charger({ silencieux: true });
    };
    window.addEventListener(EVENEMENT_RECEPTION_PATIENTS_MODIFIES, onModifie);
    return () => window.removeEventListener(EVENEMENT_RECEPTION_PATIENTS_MODIFIES, onModifie);
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
        {t("reception.pages.transferts.chargement")}
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center shadow-sm">
        <p className="text-sm text-red-700">{erreur}</p>
        <button
          type="button"
          onClick={() => void charger()}
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
        titreTableau={t("reception.pages.transferts.tableau")}
        placeholderRecherche={t("reception.pages.transferts.placeholder")}
        cartesStat={[
          {
            cle: "transferesAujourdhui",
            label: t("reception.liste.stats.transferesAujourdhui"),
            valeur: stats.aujourdhui,
            accent: "vert",
          },
          { cle: "resultats", label: t("reception.liste.stats.resultats"), valeur: 0, accent: "bleu" },
          {
            cle: "versInfirmiers",
            label: t("reception.liste.stats.versInfirmiers"),
            valeur: stats.versInfirmiers,
            accent: "default",
          },
          {
            cle: "versCaisse",
            label: t("reception.liste.stats.versCaisse"),
            valeur: stats.versCaisse,
            accent: "default",
          },
        ]}
        afficherFiltreStatut={false}
        idPrefixFiltres="filtre-transferts"
        varianteActions="transferts"
        onRafraichirTransferts={() => void charger({ silencieux: true })}
        patientSelectionneId={patientSelectionne?.id ?? null}
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
