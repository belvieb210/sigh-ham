"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { EVENEMENT_MEDECINS_PATIENTS_MODIFIES, ORIENTATIONS_RAPIDES_MEDECINS } from "@/constants/medecins";
import { useOrientationMedecins } from "@/features/medecins/contexte-orientation-medecins";
import type { PatientFileMedecins } from "@/lib/medecins/types";

export interface ResumePatientMedecins {
  initiales: string;
  nomComplet: string;
  numeroPatient: string | null;
  dossierId: string | null;
  age: string;
  telephone: string;
  motif: string;
  provenance: string;
  vide: boolean;
}

export const RESUME_MEDECINS_VIDE: ResumePatientMedecins = {
  initiales: "—",
  nomComplet: "Aucun patient sélectionné",
  numeroPatient: null,
  dossierId: null,
  age: "—",
  telephone: "—",
  motif: "—",
  provenance: "—",
  vide: true,
};

function initiales(prenom: string, nom: string) {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || "—";
}

interface ContexteSelectionMedecins {
  patientSelectionne: PatientFileMedecins | null;
  resume: ResumePatientMedecins;
  selectionnerPatient: (patient: PatientFileMedecins) => void;
  dossiersCoches: string[];
  basculerDossierCoche: (dossierId: string) => void;
  definirCoches: (dossierIds: string[], coche: boolean) => void;
  viderCoches: () => void;
  demanderOrientation: (codeSalle: string) => void;
  demanderOrientations: (codesSalle: string[]) => void;
  synchroniserSelection: (patients: PatientFileMedecins[]) => void;
  modificationEnCours: boolean;
  messagePanneau: string | null;
}

const Contexte = createContext<ContexteSelectionMedecins | null>(null);

export function FournisseurSelectionMedecins({ children }: { children: ReactNode }) {
  const { definirOrientation, definirOrientations } = useOrientationMedecins();
  const [patientSelectionne, setPatientSelectionne] =
    useState<PatientFileMedecins | null>(null);
  const [resume, setResume] = useState<ResumePatientMedecins>(RESUME_MEDECINS_VIDE);
  const [dossiersCoches, setDossiersCoches] = useState<string[]>([]);
  const [modificationEnCours, setModificationEnCours] = useState(false);
  const [messagePanneau, setMessagePanneau] = useState<string | null>(null);

  const selectionnerPatient = useCallback(
    (patient: PatientFileMedecins) => {
      setMessagePanneau(null);
      setPatientSelectionne(patient);
      const codes =
        patient.codesSalleDestination?.length
          ? patient.codesSalleDestination
          : patient.codeSalleDestination && patient.codeSalleDestination !== "MEDECINS"
            ? [patient.codeSalleDestination]
            : ["LABORATOIRE"];
      definirOrientations(codes);
      setResume({
        initiales: initiales(patient.prenom, patient.nom),
        nomComplet: patient.nomComplet,
        numeroPatient: patient.numeroPatient,
        dossierId: patient.dossierId,
        age: patient.age !== null ? `${patient.age} ans` : "—",
        telephone: patient.telephone || "—",
        motif: patient.motif || "—",
        provenance: patient.provenance || "—",
        vide: false,
      });
    },
    [definirOrientations]
  );

  const basculerDossierCoche = useCallback((dossierId: string) => {
    setDossiersCoches((prev) =>
      prev.includes(dossierId)
        ? prev.filter((id) => id !== dossierId)
        : [...prev, dossierId]
    );
  }, []);

  const definirCoches = useCallback((dossierIds: string[], coche: boolean) => {
    setDossiersCoches((prev) => {
      const set = new Set(prev);
      for (const id of dossierIds) {
        if (coche) set.add(id);
        else set.delete(id);
      }
      return [...set];
    });
  }, []);

  const viderCoches = useCallback(() => setDossiersCoches([]), []);

  const demanderOrientations = useCallback(
    async (codesSalle: string[]) => {
      const codes = codesSalle.filter((c) => c !== "MEDECINS");
      if (codes.length === 0) {
        setMessagePanneau("Sélectionnez au moins une destination.");
        return;
      }

      const cibles =
        dossiersCoches.length > 0
          ? dossiersCoches
          : patientSelectionne
            ? [patientSelectionne.dossierId]
            : [];

      if (cibles.length === 0 || modificationEnCours) {
        if (cibles.length === 0) {
          setMessagePanneau("Sélectionnez au moins un patient.");
        }
        return;
      }

      definirOrientations(codes);
      setModificationEnCours(true);
      setMessagePanneau(null);

      try {
        const resultats = await Promise.allSettled(
          cibles.map(async (dossierId) => {
            const res = await fetch("/api/medecins/transferts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ dossierId, orientations: codes }),
            });
            const data = (await res.json()) as {
              message?: string;
              salleDestination?: string;
              codesSalle?: string[];
              transfertId?: string;
            };
            if (!res.ok) throw new Error(data.message ?? "Orientation impossible.");
            return data;
          })
        );

        const ok = resultats.filter((r) => r.status === "fulfilled").length;
        const echecs = resultats.length - ok;
        if (ok === 0) {
          const premier = resultats.find((r) => r.status === "rejected") as
            | PromiseRejectedResult
            | undefined;
          throw new Error(
            premier?.reason instanceof Error
              ? premier.reason.message
              : "Orientation impossible."
          );
        }

        const premierOk = (
          resultats.find((r) => r.status === "fulfilled") as
            | PromiseFulfilledResult<{
                salleDestination?: string;
                codesSalle?: string[];
                transfertId?: string;
              }>
            | undefined
        )?.value;

        const codesFinal = premierOk?.codesSalle ?? codes;
        const label =
          premierOk?.salleDestination ??
          codesFinal
            .map(
              (c) =>
                ORIENTATIONS_RAPIDES_MEDECINS.find((o) => o.value === c)?.labelKey ?? c
            )
            .join(", ");

        setMessagePanneau(
          echecs > 0
            ? `${ok} patient(s) orienté(s) vers ${label} (${echecs} échec(s)). Confirmez via ⋮.`
            : cibles.length > 1
              ? `${ok} patients orientés vers ${label} — confirmez via le menu ⋮.`
              : `Transfert vers ${label} créé — confirmez via le menu ⋮.`
        );

        if (patientSelectionne && cibles.includes(patientSelectionne.dossierId)) {
          setPatientSelectionne((courant) =>
            courant
              ? {
                  ...courant,
                  orientation: label,
                  codeSalleDestination: codesFinal[0] ?? courant.codeSalleDestination,
                  codesSalleDestination: codesFinal,
                  transfertSortantId:
                    premierOk?.transfertId ?? courant.transfertSortantId,
                  statutTransfertSortant: "EN_ATTENTE",
                  statut: "À confirmer",
                  statutCouleur: "bg-orange-100 text-orange-800",
                }
              : courant
          );
        }

        definirOrientations(codesFinal);
        setDossiersCoches([]);
        window.dispatchEvent(new CustomEvent(EVENEMENT_MEDECINS_PATIENTS_MODIFIES));
      } catch (error) {
        setMessagePanneau(
          error instanceof Error ? error.message : "Impossible d'orienter le patient."
        );
        if (
          patientSelectionne?.codeSalleDestination &&
          patientSelectionne.codeSalleDestination !== "MEDECINS"
        ) {
          definirOrientation(patientSelectionne.codeSalleDestination);
        }
      } finally {
        setModificationEnCours(false);
      }
    },
    [
      dossiersCoches,
      patientSelectionne,
      modificationEnCours,
      definirOrientation,
      definirOrientations,
    ]
  );

  const demanderOrientation = useCallback(
    (codeSalle: string) => demanderOrientations([codeSalle]),
    [demanderOrientations]
  );

  const synchroniserSelection = useCallback((patients: PatientFileMedecins[]) => {
    setPatientSelectionne((courant) => {
      if (!courant) return courant;
      return patients.find((p) => p.cleListe === courant.cleListe) ?? null;
    });
    setDossiersCoches((prev) =>
      prev.filter((id) => patients.some((p) => p.dossierId === id))
    );
  }, []);

  const valeur = useMemo(
    () => ({
      patientSelectionne,
      resume,
      selectionnerPatient,
      dossiersCoches,
      basculerDossierCoche,
      definirCoches,
      viderCoches,
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
      dossiersCoches,
      basculerDossierCoche,
      definirCoches,
      viderCoches,
      demanderOrientation,
      demanderOrientations,
      synchroniserSelection,
      modificationEnCours,
      messagePanneau,
    ]
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useSelectionMedecins() {
  const contexte = useContext(Contexte);
  if (!contexte) {
    throw new Error(
      "useSelectionMedecins doit être dans FournisseurSelectionMedecins."
    );
  }
  return contexte;
}

export function useSelectionMedecinsOptionnel() {
  return useContext(Contexte);
}
