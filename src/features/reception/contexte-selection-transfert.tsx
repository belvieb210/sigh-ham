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
} from "@/constants/reception";
import { useOrientationRapide } from "@/features/reception/contexte-orientation-rapide";
import { useResumePatient } from "@/features/reception/contexte-resume-patient";
import type { DonneesFormulairePatient } from "@/lib/reception/types";

const STATUTS_TRANSFERT_CONFIRMÉS = new Set(["ACCEPTE", "EN_TRAITEMENT", "TERMINE"]);

interface ContexteSelectionTransfert {
  patientSelectionne: PatientEnregistre | null;
  selectionnerPourPanneau: (patient: PatientEnregistre) => Promise<void>;
  changerOrientationTransfert: (codeSalle: string) => Promise<void>;
  changerOrientationsTransfert: (codesSalle: string[]) => Promise<void>;
  synchroniserSelection: (patients: PatientEnregistre[]) => void;
  /** Transfert EN_ATTENTE : on peut changer la destination */
  peutModifierOrientation: boolean;
  /** Pas encore de transfert actif : un clic crée le transfert rapide */
  peutCreerTransfertRapide: boolean;
  /** Confirmed / récupération : orientation rapide verrouillée */
  orientationVerrouillee: boolean;
  peutAppliquerOrientationRapide: boolean;
  modificationEnCours: boolean;
  messagePanneau: string | null;
}

const ContexteSelection = createContext<ContexteSelectionTransfert | null>(null);

function libelleOrientation(codeSalle: string, fallback?: string) {
  return (
    ORIENTATIONS_RAPIDES.find((o) => o.value === codeSalle)?.label ??
    fallback ??
    codeSalle
  );
}

function couleurOrientation(label: string) {
  return COULEURS_ORIENTATION_LISTE[label] ?? COULEURS_ORIENTATION_LISTE["Non orienté"];
}

export function FournisseurSelectionTransfert({ children }: { children: ReactNode }) {
  const { definirDepuisDonneesCompletes } = useResumePatient();
  const { definirOrientations } = useOrientationRapide();
  const [patientSelectionne, setPatientSelectionne] = useState<PatientEnregistre | null>(null);
  const [modificationEnCours, setModificationEnCours] = useState(false);
  const [messagePanneau, setMessagePanneau] = useState<string | null>(null);

  const peutModifierOrientation =
    patientSelectionne?.statutTransfert === "EN_ATTENTE" && !patientSelectionne.enRecuperation;

  const transfertConfirme = Boolean(
    patientSelectionne?.statutTransfert &&
      STATUTS_TRANSFERT_CONFIRMÉS.has(patientSelectionne.statutTransfert)
  );

  const peutCreerTransfertRapide = Boolean(
    patientSelectionne &&
      !patientSelectionne.enRecuperation &&
      !transfertConfirme &&
      patientSelectionne.statutTransfert !== "EN_ATTENTE"
  );

  const orientationVerrouillee = Boolean(
    patientSelectionne &&
      (transfertConfirme || patientSelectionne.enRecuperation === true)
  );

  const peutAppliquerOrientationRapide =
    (peutModifierOrientation || peutCreerTransfertRapide) && !modificationEnCours;

  const selectionnerPourPanneau = useCallback(
    async (patient: PatientEnregistre) => {
      setMessagePanneau(null);
      setPatientSelectionne(patient);

      if (patient.codeSalleDestination) {
        definirOrientations([patient.codeSalleDestination]);
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
    [definirDepuisDonneesCompletes, definirOrientations]
  );

  const changerOrientationsTransfert = useCallback(
    async (codesSalle: string[]) => {
      if (!patientSelectionne) return;

      if (orientationVerrouillee) {
        setMessagePanneau(
          "Ce transfert est déjà confirmé : l'orientation rapide ne peut plus être modifiée."
        );
        return;
      }

      if (!peutModifierOrientation && !peutCreerTransfertRapide) {
        setMessagePanneau("Sélectionnez un patient pour appliquer l'orientation rapide.");
        return;
      }

      const codes = [...new Set(codesSalle.filter(Boolean))];
      if (codes.length === 0) {
        setMessagePanneau("Sélectionnez au moins une destination.");
        return;
      }

      if (!patientSelectionne.dossierId) {
        setMessagePanneau("Dossier patient introuvable pour l'orientation.");
        return;
      }

      setModificationEnCours(true);
      setMessagePanneau(null);

      try {
        const res = await fetch("/api/reception/transferts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transfertManuel: true,
            numeroPatient: patientSelectionne.id,
            dossierId: patientSelectionne.dossierId,
            orientations: codes,
            orientation: codes[0],
          }),
        });

        const data = (await res.json()) as {
          message?: string;
          salleDestination?: string;
          transfertId?: string;
          codeSalle?: string;
          codesSalle?: string[];
        };

        if (!res.ok) throw new Error(data.message ?? "Transfert rapide impossible.");

        const codesFinal = data.codesSalle ?? codes;
        const orientationAffichee =
          data.salleDestination ??
          codesFinal.map((c) => libelleOrientation(c)).join(", ");
        const orientationCouleur = couleurOrientation(
          libelleOrientation(codesFinal[0] ?? codes[0]!)
        );

        setPatientSelectionne((courant) =>
          courant
            ? {
                ...courant,
                transfertId: data.transfertId ?? courant.transfertId,
                statutTransfert: "EN_ATTENTE",
                codeSalleDestination: codesFinal[0] ?? courant.codeSalleDestination,
                orientation: orientationAffichee,
                orientationCouleur,
                statut: "À confirmer",
                statutCouleur: "bg-orange-100 text-orange-800",
                motif: courant.motif === "—" ? "Transfert manuel" : courant.motif,
              }
            : courant
        );

        definirOrientations(codesFinal);
        setMessagePanneau(data.message ?? "Transfert(s) créé(s) — confirmez dans la liste.");
        window.dispatchEvent(new CustomEvent(EVENEMENT_RECEPTION_PATIENTS_MODIFIES));
      } catch (error) {
        setMessagePanneau(
          error instanceof Error ? error.message : "Impossible d'appliquer l'orientation rapide."
        );
      } finally {
        setModificationEnCours(false);
      }
    },
    [
      patientSelectionne,
      orientationVerrouillee,
      peutModifierOrientation,
      peutCreerTransfertRapide,
      definirOrientations,
    ]
  );

  const changerOrientationTransfert = useCallback(
    (codeSalle: string) => changerOrientationsTransfert([codeSalle]),
    [changerOrientationsTransfert]
  );

  const synchroniserSelection = useCallback((patients: PatientEnregistre[]) => {
    setPatientSelectionne((courant) => {
      if (!courant) return courant;
      return (
        patients.find((p) => p.cleListe === courant.cleListe) ??
        patients.find((p) => p.id === courant.id) ??
        null
      );
    });
  }, []);

  const valeur = useMemo(
    () => ({
      patientSelectionne,
      selectionnerPourPanneau,
      changerOrientationTransfert,
      changerOrientationsTransfert,
      synchroniserSelection,
      peutModifierOrientation,
      peutCreerTransfertRapide,
      orientationVerrouillee,
      peutAppliquerOrientationRapide,
      modificationEnCours,
      messagePanneau,
    }),
    [
      patientSelectionne,
      selectionnerPourPanneau,
      changerOrientationTransfert,
      changerOrientationsTransfert,
      synchroniserSelection,
      peutModifierOrientation,
      peutCreerTransfertRapide,
      orientationVerrouillee,
      peutAppliquerOrientationRapide,
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
