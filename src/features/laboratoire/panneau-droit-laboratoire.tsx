"use client";

import { useTranslation } from "react-i18next";
import {
  ORIENTATIONS_DESTINATION_LABO,
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
import type { PatientFileLaboratoire } from "@/lib/laboratoire/types";

interface PropsPanneauDroitLaboratoire {
  variante: "patients" | "examens";
  patient: PatientFileLaboratoire | null;
  orientation: string | null;
  onOrientationChange: (id: string) => void;
  /** Destinations multiples */
  orientations?: string[];
  onOrientationsChange?: (ids: string[]) => void;
  /** false si aucun patient sélectionné ni coché */
  peutOrienter?: boolean;
  aideOrientation?: string;
  onAction: (id: IdActionRapideLabo) => void;
}

export function PanneauDroitLaboratoire({
  variante,
  patient,
  orientation,
  onOrientationChange,
  orientations = [],
  onOrientationsChange,
  peutOrienter,
  aideOrientation,
  onAction,
}: PropsPanneauDroitLaboratoire) {
  const { t } = useTranslation();
  const orientable = peutOrienter ?? Boolean(patient);

  const optionsDestination = ORIENTATIONS_DESTINATION_LABO.map((o) => ({
    id: o.id,
    icone: iconeDepuisNom(o.icone),
    couleur: o.couleur,
  }));

  const optionsStatut = ORIENTATIONS_STATUT_ANALYSE.map((o) => ({
    id: o.id,
    icone: iconeDepuisNom(o.icone),
    couleur: o.couleur,
  }));

  const afficherDestinations =
    variante === "patients" && Boolean(onOrientationsChange);

  return (
    <aside className="flex w-full min-w-0 shrink-0 flex-col gap-4">
      <section className="min-w-0 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("laboratoire.panneau.resumePatient")}
        </h2>
        <ResumePatientLaboratoire patient={patient} />
      </section>

      {variante === "examens" ? (
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

      {afficherDestinations ? (
        <section className="min-w-0 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
            {t("laboratoire.panneau.orientationRapide")}
          </h2>
          <ListeOrientationLaboratoire
            options={optionsDestination}
            cleTraduction="orientationsDestination"
            multiple
            valeurs={orientations}
            onChangeMulti={onOrientationsChange}
            desactive={!orientable}
            aide={
              aideOrientation ??
              (orientable
                ? t("laboratoire.panneau.aideOrientationPatientMulti")
                : t("laboratoire.panneau.selectionnerPatient"))
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
