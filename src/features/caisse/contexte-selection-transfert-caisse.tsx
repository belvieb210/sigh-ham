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
  demanderOrientations: (codesSalle: string[]) => void;
  synchroniserSelection: (patients: PatientTransfertCaisse[]) => void;
  modificationEnCours: boolean;
  messagePanneau: string | null;
}

const Contexte = createContext<ContexteSelectionTransfertCaisse | null>(null);

export function FournisseurSelectionTransfertCaisse({ children }: { children: ReactNode }) {
  const { definirOrientation, definirOrientations } = useOrientationCaisse();
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
      const codes =
        (patient as { codesSalleDestination?: string[] }).codesSalleDestination ??
        (patient.codeSalleDestination ? [patient.codeSalleDestination] : ["LABORATOIRE"]);
      definirOrientations(codes);
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
    [definirOrientations]
  );

  const demanderOrientations = useCallback(
    async (codesSalle: string[]) => {
      if (!patientSelectionne || modificationEnCours) return;
      const codes = codesSalle.filter((c) => c !== "CAISSE");
      if (codes.length === 0) {
        setMessagePanneau("Sélectionnez au moins une destination.");
        return;
      }

      definirOrientations(codes);
      setModificationEnCours(true);
      setMessagePanneau(null);

      try {
        const res = await fetch("/api/caisse/transferts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dossierId: patientSelectionne.dossierId,
            orientations: codes,
          }),
        });
        const data = (await res.json()) as {
          message?: string;
          salleDestination?: string;
          codeSalle?: string;
          codesSalle?: string[];
          transfertId?: string;
        };
        if (!res.ok) throw new Error(data.message ?? "Orientation impossible.");

        const codesFinal = data.codesSalle ?? codes;
        const label =
          data.salleDestination ??
          codesFinal
            .map(
              (c) =>
                ORIENTATIONS_RAPIDES_CAISSE.find((o) => o.value === c)?.label ?? c
            )
            .join(", ");

        setMessagePanneau(
          data.message ??
            `Transfert vers ${label} créé — confirmez via le menu ⋮ après la facture.`
        );
        setPatientSelectionne((courant) =>
          courant
            ? {
                ...courant,
                orientation: label,
                orientationCouleur:
                  COULEURS_ORIENTATION_CAISSE[label.split(",")[0]?.trim() ?? ""] ??
                  "bg-slate-100 text-slate-600",
                codeSalleDestination: codesFinal[0] ?? courant.codeSalleDestination,
                codesSalleDestination: codesFinal,
                transfertSortantId: data.transfertId ?? courant.transfertSortantId,
                statutTransfertSortant: "EN_ATTENTE",
                statut: "À confirmer",
                statutCouleur: "bg-orange-100 text-orange-800",
              }
            : courant
        );
        definirOrientations(codesFinal);
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
    [patientSelectionne, modificationEnCours, definirOrientation, definirOrientations]
  );

  const demanderOrientation = useCallback(
    (codeSalle: string) => demanderOrientations([codeSalle]),
    [demanderOrientations]
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
      demanderOrientations,
      synchroniserSelection,
      modificationEnCours,
      messagePanneau,
    }),
    [
      patientSelectionne,
      resume,
      selectionnerPatient,
      demanderOrientation,
      demanderOrientations,
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
