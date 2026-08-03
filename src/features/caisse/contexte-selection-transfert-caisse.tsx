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

interface ConfirmationOrientation {
  codeSalle: string;
  label: string;
}

interface ContexteSelectionTransfertCaisse {
  patientSelectionne: PatientTransfertCaisse | null;
  resume: ResumePatientCaisse;
  selectionnerPatient: (patient: PatientTransfertCaisse) => void;
  demanderOrientation: (codeSalle: string) => void;
  confirmerOrientation: () => Promise<void>;
  annulerConfirmationOrientation: () => void;
  confirmationOrientation: ConfirmationOrientation | null;
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
  const [confirmationOrientation, setConfirmationOrientation] =
    useState<ConfirmationOrientation | null>(null);

  const selectionnerPatient = useCallback(
    (patient: PatientTransfertCaisse) => {
      setMessagePanneau(null);
      setConfirmationOrientation(null);
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
    (codeSalle: string) => {
      if (!patientSelectionne || modificationEnCours) return;
      if (codeSalle === "CAISSE") {
        setMessagePanneau("Le patient est déjà à la caisse.");
        return;
      }
      definirOrientation(codeSalle);
      const label =
        ORIENTATIONS_RAPIDES_CAISSE.find((o) => o.value === codeSalle)?.label ?? codeSalle;
      setConfirmationOrientation({ codeSalle, label });
    },
    [patientSelectionne, modificationEnCours, definirOrientation]
  );

  const annulerConfirmationOrientation = useCallback(() => {
    setConfirmationOrientation(null);
    if (patientSelectionne?.codeSalleDestination) {
      definirOrientation(patientSelectionne.codeSalleDestination);
    }
  }, [patientSelectionne, definirOrientation]);

  const confirmerOrientation = useCallback(async () => {
    if (!patientSelectionne || !confirmationOrientation || modificationEnCours) return;

    setModificationEnCours(true);
    setMessagePanneau(null);

    try {
      const res = await fetch("/api/caisse/transferts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dossierId: patientSelectionne.dossierId,
          orientation: confirmationOrientation.codeSalle,
        }),
      });
      const data = (await res.json()) as {
        message?: string;
        salleDestination?: string;
        codeSalle?: string;
        transfertId?: string;
      };
      if (!res.ok) throw new Error(data.message ?? "Orientation impossible.");

      const label =
        ORIENTATIONS_RAPIDES_CAISSE.find((o) => o.value === (data.codeSalle ?? confirmationOrientation.codeSalle))
          ?.label ??
        data.salleDestination ??
        confirmationOrientation.label;

      const codeFinal = data.codeSalle ?? confirmationOrientation.codeSalle;
      setMessagePanneau(data.message ?? `Transfert vers ${label} — à confirmer après facture.`);
      setConfirmationOrientation(null);
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
    } finally {
      setModificationEnCours(false);
    }
  }, [
    patientSelectionne,
    confirmationOrientation,
    modificationEnCours,
    definirOrientation,
  ]);

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
      confirmerOrientation,
      annulerConfirmationOrientation,
      confirmationOrientation,
      synchroniserSelection,
      modificationEnCours,
      messagePanneau,
    }),
    [
      patientSelectionne,
      resume,
      selectionnerPatient,
      demanderOrientation,
      confirmerOrientation,
      annulerConfirmationOrientation,
      confirmationOrientation,
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
