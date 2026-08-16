"use client";

import { useTranslation } from "react-i18next";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import { RecherchePatientExistant } from "@/features/reception/recherche-patient-existant";
import type { ResultatRecherchePatientReception } from "@/lib/reception/types";

interface TypePatientOption {
  value: string;
  label: string;
}

interface PropsChampTypePatientRecherche {
  typeVisite: string;
  onTypeVisiteChange: (valeur: string) => void;
  typesPatient: TypePatientOption[];
  libellePatientSelectionne?: string | null;
  onPatientSelectionne: (patient: ResultatRecherchePatientReception) => void | Promise<void>;
  onEffacerPatient?: () => void;
  selectionEnCours?: boolean;
  className?: string;
}

export function ChampTypePatientRecherche({
  typeVisite,
  onTypeVisiteChange,
  typesPatient,
  libellePatientSelectionne = null,
  onPatientSelectionne,
  onEffacerPatient,
  selectionEnCours = false,
  className,
}: PropsChampTypePatientRecherche) {
  const { t } = useTranslation();
  const modeRecherche = typeVisite === "ancien";

  return (
    <div className={className}>
      <label className={CLASSE_LABEL_RECEPTION}>
        {t("reception.formulaire.champs.typePatient")}
      </label>

      {modeRecherche ? (
        <div className="space-y-1.5">
          <RecherchePatientExistant
            libelleSelectionne={libellePatientSelectionne}
            onEffacerSelection={onEffacerPatient}
            onSelectionner={onPatientSelectionne}
            selectionEnCours={selectionEnCours}
          />
          <button
            type="button"
            onClick={() => onTypeVisiteChange("nouveau")}
            className="text-xs font-medium text-bleu-medical hover:underline"
          >
            {t("reception.formulaire.recherchePatient.revenirNouveau")}
          </button>
        </div>
      ) : (
        <select
          className={CLASSE_CHAMP_RECEPTION}
          value={typeVisite}
          onChange={(event) => onTypeVisiteChange(event.target.value)}
        >
          {typesPatient.map((tp) => (
            <option key={tp.value} value={tp.value}>
              {tp.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
