"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  COULEURS_ORIENTATION_CAISSE,
  EVENEMENT_CAISSE_PATIENTS_MODIFIES,
  ORIENTATIONS_RAPIDES_CAISSE,
} from "@/constants/caisse";
import { useOrientationCaisse } from "@/features/caisse/contexte-orientation-caisse";
import { calculerAge, initiales } from "@/features/caisse/utils-format";
import type { PatientTransfertCaisse } from "@/lib/caisse/types";

export interface ResumePatientCaisse {
  initiales: string;
  nomComplet: string;
  numeroPatient: string | null;
  dossierId: string | null;
  age: string;
  telephone: string;
  vide: boolean;
}

export const RESUME_CAISSE_VIDE: ResumePatientCaisse = {
  initiales: "—",
  nomComplet: "Aucun patient sélectionné",
  numeroPatient: null,
  dossierId: null,
  age: "—",
  telephone: "—",
  vide: true,
};

interface ContexteSelectionTransfertCaisse {
  patientSelectionne: PatientTransfertCaisse | null;
  resume: ResumePatientCaisse;
  selectionnerPatient: (patient: PatientTransfertCaisse) => void;
  /** Applique l'orientation immédiatement (sans modal), comme à la réception */
  demanderOrientation: (codeSalle: string) => void;
  synchroniserSelection: (patients: PatientTransfertCaisse[]) => void;
  modificationEnCours: boolean;
  messagePanneau: string | null;
}

const Contexte = createContext<ContexteSelectionTransfertCaisse | null>(null);

export function FournisseurSelectionTransfertCaisse({ children }: { children: ReactNode }) {
  const { definirOrientation } = useOrientationCaisse();
  const [patientSelectionne, setPatientSelectionne] = useState<PatientTransfertCaisse | null>(
    null
  );
  const [resume, setResume] = useState<ResumePatientCaisse>(RESUME_CAISSE_VIDE);
  const [modificationEnCours, setModificationEnCours] = useState(false);
  const [messagePanneau, setMessagePanneau] = useState<string | null>(null);

  const selectionnerPatient = useCallback(
    (patient: PatientTransfertCaisse) => {
      setMessagePanneau(null);
      setPatientSelectionne(patient);
      definirOrientation(patient.codeSalleDestination || "LABORATOIRE");
      const age = calculerAge(patient.dateNaissance);
      setResume({
        initiales: initiales(patient.prenom, patient.nom),
        nomComplet: patient.nomComplet,
        numeroPatient: patient.numeroPatient,
        dossierId: patient.dossierId,
        age: age !== null ? `${age} ans` : "—",
        telephone: patient.telephone || "—",
        vide: false,
      });
    },
    [definirOrientation]
  );

  const demanderOrientation = useCallback(
    async (codeSalle: string) => {
      if (!patientSelectionne || modificationEnCours) return;
      if (codeSalle === "CAISSE") {
        setMessagePanneau("Le patient est déjà à la caisse.");
        return;
      }
      if (
        patientSelectionne.codeSalleDestination === codeSalle &&
        patientSelectionne.statutTransfertSortant === "EN_ATTENTE"
      ) {
        return;
      }

      definirOrientation(codeSalle);
      setModificationEnCours(true);
      setMessagePanneau(null);

      try {
        const res = await fetch("/api/caisse/transferts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dossierId: patientSelectionne.dossierId,
            orientation: codeSalle,
          }),
        });
        const data = (await res.json()) as {
          message?: string;
          salleDestination?: string;
          codeSalle?: string;
          transfertId?: string;
        };
        if (!res.ok) throw new Error(data.message ?? "Orientation impossible.");

        const codeFinal = data.codeSalle ?? codeSalle;
        const label =
          ORIENTATIONS_RAPIDES_CAISSE.find((o) => o.value === codeFinal)?.label ??
          data.salleDestination ??
          codeFinal;

        setMessagePanneau(
          data.message ?? `Transfert vers ${label} créé — confirmez via le menu ⋮ après la facture.`
        );
        setPatientSelectionne((courant) =>
          courant
            ? {
                ...courant,
                orientation: label,
                orientationCouleur:
                  COULEURS_ORIENTATION_CAISSE[label] ?? "bg-slate-100 text-slate-600",
                codeSalleDestination: codeFinal,
                transfertSortantId: data.transfertId ?? courant.transfertSortantId,
                statutTransfertSortant: "EN_ATTENTE",
                statut: "À confirmer",
                statutCouleur: "bg-orange-100 text-orange-800",
              }
            : courant
        );
        definirOrientation(codeFinal);
        window.dispatchEvent(new CustomEvent(EVENEMENT_CAISSE_PATIENTS_MODIFIES));
      } catch (error) {
        setMessagePanneau(
          error instanceof Error ? error.message : "Impossible d'orienter le patient."
        );
        if (patientSelectionne.codeSalleDestination) {
          definirOrientation(patientSelectionne.codeSalleDestination);
        }
      } finally {
        setModificationEnCours(false);
      }
    },
    [patientSelectionne, modificationEnCours, definirOrientation]
  );

  const synchroniserSelection = useCallback((patients: PatientTransfertCaisse[]) => {
    setPatientSelectionne((courant) => {
      if (!courant) return courant;
      return patients.find((p) => p.cleListe === courant.cleListe) ?? null;
    });
  }, []);

  const valeur = useMemo(
    () => ({
      patientSelectionne,
      resume,
      selectionnerPatient,
      demanderOrientation,
      synchroniserSelection,
      modificationEnCours,
      messagePanneau,
    }),
    [
      patientSelectionne,
      resume,
      selectionnerPatient,
      demanderOrientation,
      synchroniserSelection,
      modificationEnCours,
      messagePanneau,
    ]
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useSelectionTransfertCaisse() {
  const contexte = useContext(Contexte);
  if (!contexte) {
    throw new Error(
      "useSelectionTransfertCaisse doit être dans FournisseurSelectionTransfertCaisse."
    );
  }
  return contexte;
}

export function useSelectionTransfertCaisseOptionnel() {
  return useContext(Contexte);
}
