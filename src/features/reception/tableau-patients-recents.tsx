"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { PatientEnregistre } from "@/constants/reception";
import { EVENEMENT_RECEPTION_PATIENTS_MODIFIES, PATIENTS_ENREGISTRES } from "@/constants/reception";
import { TableauPatients } from "@/features/reception/composants-liste-patients";
import { ModaleExamensTransfert } from "@/features/reception/modale-examens-transfert";

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

  const charger = useCallback(async () => {
    try {
      const res = await fetch("/api/reception/patients?limite=4");
      if (res.ok) {
        const data = (await res.json()) as { patients?: PatientEnregistre[] };
        setPatients(data.patients ?? []);
        return;
      }
    } catch {
      /* fallback mock si API indisponible */
    }
    setPatients(PATIENTS_ENREGISTRES.slice(0, 4));
  }, []);

  useEffect(() => {
    charger().finally(() => setChargement(false));
  }, [charger]);

  useEffect(() => {
    const rafraichir = () => {
      void charger();
    };
    window.addEventListener(EVENEMENT_RECEPTION_PATIENTS_MODIFIES, rafraichir);
    return () => window.removeEventListener(EVENEMENT_RECEPTION_PATIENTS_MODIFIES, rafraichir);
  }, [charger]);

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
    <>
      <TableauPatients
        patients={patients}
        titre={t("reception.tableau.recents")}
        patientSelectionneId={patientSelectionneId}
        onSelectionnerPatient={chargementSelection ? undefined : onSelectionnerPatient}
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
        onModifie={() => void charger()}
      />
    </>
  );
}
