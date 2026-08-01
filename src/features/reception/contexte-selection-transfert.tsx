"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PatientEnregistre } from "@/constants/reception";
import {
  COULEURS_ORIENTATION_LISTE,
  EVENEMENT_RECEPTION_PATIENTS_MODIFIES,
  ORIENTATIONS_RAPIDES,
  type DetailPatientOrientationModifiee,
} from "@/constants/reception";
import { useOrientationRapide } from "@/features/reception/contexte-orientation-rapide";
import { useResumePatient } from "@/features/reception/contexte-resume-patient";
import type { DonneesFormulairePatient } from "@/lib/reception/types";

interface ContexteSelectionTransfert {
  patientSelectionne: PatientEnregistre | null;
  selectionnerPourPanneau: (patient: PatientEnregistre) => Promise<void>;
  changerOrientationTransfert: (codeSalle: string) => Promise<void>;
  synchroniserSelection: (patients: PatientEnregistre[]) => void;
  peutModifierOrientation: boolean;
  modificationEnCours: boolean;
  messagePanneau: string | null;
}

const ContexteSelection = createContext<ContexteSelectionTransfert | null>(null);

export function FournisseurSelectionTransfert({ children }: { children: ReactNode }) {
  const { definirDepuisDonneesCompletes } = useResumePatient();
  const { definirOrientation } = useOrientationRapide();
  const [patientSelectionne, setPatientSelectionne] = useState<PatientEnregistre | null>(null);
  const [modificationEnCours, setModificationEnCours] = useState(false);
  const [messagePanneau, setMessagePanneau] = useState<string | null>(null);

  const peutModifierOrientation =
    patientSelectionne?.statutTransfert === "EN_ATTENTE" && !patientSelectionne.enRecuperation;

  const selectionnerPourPanneau = useCallback(
    async (patient: PatientEnregistre) => {
      setMessagePanneau(null);
      setPatientSelectionne(patient);

      if (patient.codeSalleDestination) {
        definirOrientation(patient.codeSalleDestination);
      }

      try {
        const res = await fetch(`/api/reception/patients/${encodeURIComponent(patient.id)}`);
        if (res.ok) {
          const donnees = (await res.json()) as DonneesFormulairePatient;
          definirDepuisDonneesCompletes({
            ...donnees,
            dossierId: patient.dossierId ?? donnees.dossierId,
          });
        }
      } catch {
        /* le résumé minimal depuis la ligne suffit */
      }
    },
    [definirDepuisDonneesCompletes, definirOrientation]
  );

  const changerOrientationTransfert = useCallback(
    async (codeSalle: string) => {
      if (!patientSelectionne?.transfertId || !peutModifierOrientation) return;
      if (patientSelectionne.codeSalleDestination === codeSalle) return;

      setModificationEnCours(true);
      setMessagePanneau(null);

      try {
        const res = await fetch(
          `/api/reception/transferts/${encodeURIComponent(patientSelectionne.transfertId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orientation: codeSalle }),
          }
        );

        const data = (await res.json()) as {
          message?: string;
          salleDestination?: string;
          codeSalle?: string;
        };

        if (!res.ok) throw new Error(data.message ?? "Modification impossible.");

        const codeFinalSalle = data.codeSalle ?? codeSalle;
        const orientationAffichee =
          ORIENTATIONS_RAPIDES.find((o) => o.value === codeFinalSalle)?.label ??
          data.salleDestination ??
          codeFinalSalle;

        const orientationCouleur =
          COULEURS_ORIENTATION_LISTE[orientationAffichee] ??
          COULEURS_ORIENTATION_LISTE["Non orienté"];

        setPatientSelectionne((courant) =>
          courant
            ? {
                ...courant,
                codeSalleDestination: codeFinalSalle,
                orientation: orientationAffichee,
                orientationCouleur,
              }
            : courant
        );

        setMessagePanneau(data.message ?? "Destination mise à jour.");

        /** Mise à jour locale de la ligne — pas de rechargement de toute la liste */
        const detail: DetailPatientOrientationModifiee = {
          type: "orientation",
          patientId: patientSelectionne.id,
          orientation: orientationAffichee,
          orientationCouleur,
          codeSalleDestination: codeFinalSalle,
        };
        window.dispatchEvent(
          new CustomEvent(EVENEMENT_RECEPTION_PATIENTS_MODIFIES, { detail })
        );
      } catch (error) {
        setMessagePanneau(
          error instanceof Error ? error.message : "Impossible de changer la destination."
        );
        if (patientSelectionne.codeSalleDestination) {
          definirOrientation(patientSelectionne.codeSalleDestination);
        }
      } finally {
        setModificationEnCours(false);
      }
    },
    [patientSelectionne, peutModifierOrientation, definirOrientation]
  );

  const synchroniserSelection = useCallback((patients: PatientEnregistre[]) => {
    setPatientSelectionne((courant) => {
      if (!courant) return courant;
      return patients.find((p) => p.id === courant.id) ?? null;
    });
  }, []);

  const valeur = useMemo(
    () => ({
      patientSelectionne,
      selectionnerPourPanneau,
      changerOrientationTransfert,
      synchroniserSelection,
      peutModifierOrientation,
      modificationEnCours,
      messagePanneau,
    }),
    [
      patientSelectionne,
      selectionnerPourPanneau,
      changerOrientationTransfert,
      synchroniserSelection,
      peutModifierOrientation,
      modificationEnCours,
      messagePanneau,
    ]
  );

  return <ContexteSelection.Provider value={valeur}>{children}</ContexteSelection.Provider>;
}

export function useSelectionTransfert() {
  const contexte = useContext(ContexteSelection);
  if (!contexte) {
    throw new Error("useSelectionTransfert doit être utilisé dans FournisseurSelectionTransfert.");
  }
  return contexte;
}

/** Retourne null si le provider n'est pas monté (pages sans sélection transfert). */
export function useSelectionTransfertOptionnel() {
  return useContext(ContexteSelection);
}
