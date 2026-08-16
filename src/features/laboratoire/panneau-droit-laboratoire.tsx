"use client";

import { useTranslation } from "react-i18next";
import {
  ORIENTATIONS_STATUT_ANALYSE,
} from "@/constants/laboratoire-orientations";
import { ResumePatientLaboratoire } from "@/features/laboratoire/resume-patient-laboratoire";
import {
  ListeOrientationLaboratoire,
  iconeDepuisNom,
} from "@/features/laboratoire/liste-orientation-laboratoire";
import {
  ActionsRapidesLaboratoire,
  type IdActionRapideLabo,
} from "@/features/laboratoire/actions-rapides-laboratoire";
import { DetailExamensPatientLaboratoire } from "@/features/laboratoire/detail-examens-patient-laboratoire";
import type { IdOrientationStatutAnalyse } from "@/constants/laboratoire-orientations";
import type { PatientFileLaboratoire } from "@/lib/laboratoire/types";

interface PropsPanneauDroitLaboratoire {
  variante: "patients" | "examens";
  patient: PatientFileLaboratoire | null;
  orientation: string | null;
  onOrientationChange: (id: string) => void;
  /** Pages statut (Reçus, En cours…) : affiche Résultats & paramètres filtrés par la page */
  modeDetailExamens?: boolean;
  statutPage?: IdOrientationStatutAnalyse | null;
  /** false si aucun patient sélectionné ni coché */
  peutOrienter?: boolean;
  onAction: (id: IdActionRapideLabo) => void;
}

export function PanneauDroitLaboratoire({
  variante,
  patient,
  orientation,
  onOrientationChange,
  modeDetailExamens = false,
  statutPage = null,
  peutOrienter,
  onAction,
}: PropsPanneauDroitLaboratoire) {
  const { t } = useTranslation();
  const orientable = peutOrienter ?? Boolean(patient);

  const optionsStatut = ORIENTATIONS_STATUT_ANALYSE.map((o) => ({
    id: o.id,
    icone: iconeDepuisNom(o.icone),
    couleur: o.couleur,
  }));

  return (
    <aside className="flex w-full min-w-0 shrink-0 flex-col gap-4">
      <section className="min-w-0 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("laboratoire.panneau.resumePatient")}
        </h2>
        <ResumePatientLaboratoire patient={patient} />
      </section>

      {variante === "examens" && modeDetailExamens && statutPage ? (
        <section className="min-w-0 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
            {t("laboratoire.panneau.resultatsExamens")}
          </h2>
          <DetailExamensPatientLaboratoire
            dossierId={patient?.dossierId ?? null}
            statutFiltre={statutPage}
          />
        </section>
      ) : null}

      {variante === "examens" && !modeDetailExamens ? (
        <section className="min-w-0 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
            {t("laboratoire.panneau.statutAnalyse")}
          </h2>
          <ListeOrientationLaboratoire
            options={optionsStatut}
            cleTraduction="orientationsStatut"
            valeur={orientation}
            onChange={onOrientationChange}
            desactive={!orientable}
            aide={
              orientable
                ? t("laboratoire.panneau.aideStatutAnalyse")
                : t("laboratoire.panneau.selectionnerPatient")
            }
          />
        </section>
      ) : null}

      <ActionsRapidesLaboratoire
        variante={variante}
        onAction={onAction}
        patientSelectionne={orientable}
      />
    </aside>
  );
}

/** Version empilée sous le tableau (mobile / tablette) */
export function SectionsMobileLaboratoire(props: PropsPanneauDroitLaboratoire) {
  return (
    <div className="xl:hidden">
      <PanneauDroitLaboratoire {...props} />
    </div>
  );
}
