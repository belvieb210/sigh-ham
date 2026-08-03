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

const STATUTS_TRANSFERT_CONFIRMÉS = new Set(["ACCEPTE", "EN_TRAITEMENT", "TERMINE"]);

interface ContexteSelectionTransfert {
  patientSelectionne: PatientEnregistre | null;
  selectionnerPourPanneau: (patient: PatientEnregistre) => Promise<void>;
  changerOrientationTransfert: (codeSalle: string) => Promise<void>;
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
  const { definirOrientation } = useOrientationRapide();
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

  const appliquerMiseAJourOrientationLocale = useCallback(
    (codeFinalSalle: string, salleDestination?: string) => {
      const orientationAffichee = libelleOrientation(codeFinalSalle, salleDestination);
      const orientationCouleur = couleurOrientation(orientationAffichee);

      setPatientSelectionne((courant) =>
        courant
          ? {
              ...courant,
              codeSalleDestination: codeFinalSalle,
              orientation: orientationAffichee,
              orientationCouleur,
              statutTransfert: courant.statutTransfert ?? "EN_ATTENTE",
              statut: courant.statutTransfert ? courant.statut : "À confirmer",
              statutCouleur: courant.statutTransfert
                ? courant.statutCouleur
                : "bg-orange-100 text-orange-800",
              transfertId: courant.transfertId,
            }
          : courant
      );

      const patientId = patientSelectionne?.id;
      if (patientId) {
        const detail: DetailPatientOrientationModifiee = {
          type: "orientation",
          patientId,
          orientation: orientationAffichee,
          orientationCouleur,
          codeSalleDestination: codeFinalSalle,
        };
        window.dispatchEvent(
          new CustomEvent(EVENEMENT_RECEPTION_PATIENTS_MODIFIES, { detail })
        );
      }

      return orientationAffichee;
    },
    [patientSelectionne?.id]
  );

  const changerOrientationTransfert = useCallback(
    async (codeSalle: string) => {
      if (!patientSelectionne) return;

      if (orientationVerrouillee) {
        setMessagePanneau(
          "Ce transfert est déjà confirmé : l'orientation rapide ne peut plus être modifiée."
        );
        if (patientSelectionne.codeSalleDestination) {
          definirOrientation(patientSelectionne.codeSalleDestination);
        }
        return;
      }

      if (!peutModifierOrientation && !peutCreerTransfertRapide) {
        setMessagePanneau("Sélectionnez un patient pour appliquer l'orientation rapide.");
        return;
      }

      if (patientSelectionne.codeSalleDestination === codeSalle && peutModifierOrientation) {
        return;
      }

      setModificationEnCours(true);
      setMessagePanneau(null);

      try {
        /** Modifier un transfert encore en attente */
        if (peutModifierOrientation && patientSelectionne.transfertId) {
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
          appliquerMiseAJourOrientationLocale(codeFinalSalle, data.salleDestination);
          setMessagePanneau(data.message ?? "Destination mise à jour.");
          return;
        }

        /** Créer (ou mettre à jour via API manuelle) un transfert rapide */
        const res = await fetch("/api/reception/transferts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transfertManuel: true,
            numeroPatient: patientSelectionne.id,
            dossierId: patientSelectionne.dossierId || undefined,
            orientation: codeSalle,
          }),
        });

        const data = (await res.json()) as {
          message?: string;
          salleDestination?: string;
          transfertId?: string;
          codeSalle?: string;
        };

        if (!res.ok) throw new Error(data.message ?? "Transfert rapide impossible.");

        const codeFinalSalle = data.codeSalle ?? codeSalle;
        const orientationAffichee = libelleOrientation(codeFinalSalle, data.salleDestination);
        const orientationCouleur = couleurOrientation(orientationAffichee);

        setPatientSelectionne((courant) =>
          courant
            ? {
                ...courant,
                transfertId: data.transfertId ?? courant.transfertId,
                statutTransfert: "EN_ATTENTE",
                codeSalleDestination: codeFinalSalle,
                orientation: orientationAffichee,
                orientationCouleur,
                statut: "À confirmer",
                statutCouleur: "bg-orange-100 text-orange-800",
                motif: courant.motif === "—" ? "Transfert manuel" : courant.motif,
              }
            : courant
        );

        setMessagePanneau(data.message ?? "Transfert rapide créé — à confirmer dans la liste.");

        /** Rafraîchir listes (statut + badge orientation) */
        window.dispatchEvent(new CustomEvent(EVENEMENT_RECEPTION_PATIENTS_MODIFIES));
      } catch (error) {
        setMessagePanneau(
          error instanceof Error ? error.message : "Impossible d'appliquer l'orientation rapide."
        );
        if (patientSelectionne.codeSalleDestination) {
          definirOrientation(patientSelectionne.codeSalleDestination);
        }
      } finally {
        setModificationEnCours(false);
      }
    },
    [
      patientSelectionne,
      orientationVerrouillee,
      peutModifierOrientation,
      peutCreerTransfertRapide,
      definirOrientation,
      appliquerMiseAJourOrientationLocale,
    ]
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
