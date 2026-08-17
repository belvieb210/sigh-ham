"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useEspaceApi } from "@/features/reception/contexte-espace-api";
import type { PatientEnregistre } from "@/constants/reception";
import {
  COULEURS_ORIENTATION_LISTE,
  ORIENTATIONS_RAPIDES,
} from "@/constants/reception";
import { filtrerOrientationsMedecinsExternes } from "@/constants/medecins-externes";
import { filtrerOrientationsEglise } from "@/constants/eglise";
import { filtrerOrientationsReception } from "@/constants/reception";
import { useOrientationRapide } from "@/features/reception/contexte-orientation-rapide";
import { useResumePatient } from "@/features/reception/contexte-resume-patient";
import type { DonneesFormulairePatient } from "@/lib/reception/types";
import {
  creerDebounce,
  orienterPatientsEnSerie,
} from "@/features/transferts/utilitaires-orientation-lot";

const STATUTS_TRANSFERT_CONFIRMÉS = new Set(["ACCEPTE", "EN_TRAITEMENT", "TERMINE"]);

interface ContexteSelectionTransfert {
  patientSelectionne: PatientEnregistre | null;
  selectionnerPourPanneau: (patient: PatientEnregistre) => Promise<void>;
  changerOrientationTransfert: (codeSalle: string) => Promise<void>;
  changerOrientationsTransfert: (codesSalle: string[]) => Promise<void>;
  synchroniserSelection: (patients: PatientEnregistre[]) => void;
  dossiersCoches: string[];
  basculerPatientCoche: (patient: PatientEnregistre) => void;
  definirPatientsCoches: (patients: PatientEnregistre[], coche: boolean) => void;
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
  const espace = useEspaceApi();
  const { definirDepuisDonneesCompletes } = useResumePatient();
  const { definirOrientations } = useOrientationRapide();
  const [patientSelectionne, setPatientSelectionne] = useState<PatientEnregistre | null>(null);
  const [patientsCoches, setPatientsCoches] = useState<PatientEnregistre[]>([]);
  const [modificationEnCours, setModificationEnCours] = useState(false);
  const [messagePanneau, setMessagePanneau] = useState<string | null>(null);
  const verrouOrientationRef = useRef(false);

  const dossiersCoches = patientsCoches
    .map((p) => p.dossierId)
    .filter((id): id is string => Boolean(id));

  const basculerPatientCoche = useCallback((patient: PatientEnregistre) => {
    if (!patient.dossierId) return;
    setPatientsCoches((prev) => {
      const existe = prev.some((p) => p.dossierId === patient.dossierId);
      return existe
        ? prev.filter((p) => p.dossierId !== patient.dossierId)
        : [...prev, patient];
    });
  }, []);

  const definirPatientsCoches = useCallback(
    (patients: PatientEnregistre[], coche: boolean) => {
      setPatientsCoches((prev) => {
        const map = new Map(
          prev.filter((p) => p.dossierId).map((p) => [p.dossierId!, p])
        );
        for (const p of patients) {
          if (!p.dossierId) continue;
          if (coche) map.set(p.dossierId, p);
          else map.delete(p.dossierId);
        }
        return [...map.values()];
      });
    },
    []
  );

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
    ((peutModifierOrientation || peutCreerTransfertRapide) ||
      patientsCoches.length > 0) &&
    !modificationEnCours;

  const selectionnerPourPanneau = useCallback(
    async (patient: PatientEnregistre) => {
      setMessagePanneau(null);
      setPatientSelectionne(patient);

      if (patient.codesSalleDestination?.length) {
        definirOrientations(patient.codesSalleDestination);
      } else if (patient.codeSalleDestination) {
        definirOrientations([patient.codeSalleDestination]);
      }

      try {
        const res = await fetch(`${espace.prefixeApi}/patients/${encodeURIComponent(patient.id)}`);
        if (res.ok) {
          const donnees = (await res.json()) as DonneesFormulairePatient;
          definirDepuisDonneesCompletes({
            ...donnees,
            dossierId: patient.dossierId ?? donnees.dossierId,
            numeroVisite: patient.numeroDossier ?? donnees.numeroVisite,
          });
        }
      } catch {
        /* le résumé minimal depuis la ligne suffit */
      }
    },
    [definirDepuisDonneesCompletes, definirOrientations]
  );

  const appliquerOrientationsTransfert = useCallback(
    async (codesSalle: string[]) => {
      const brutes = [...new Set(codesSalle.filter(Boolean))];
      const codes = espace.prefixeApi.includes("medecins-externes")
        ? filtrerOrientationsMedecinsExternes(brutes)
        : espace.prefixeApi.includes("eglise")
          ? filtrerOrientationsEglise(brutes)
          : filtrerOrientationsReception(brutes);
      if (codes.length === 0) {
        setMessagePanneau(
          espace.prefixeApi.includes("medecins-externes") ||
            espace.prefixeApi.includes("eglise")
            ? "La destination autorisée est la Caisse."
            : "Sélectionnez Caisse, Infirmiers ou Médecin."
        );
        return;
      }

      const cibles =
        patientsCoches.length > 0
          ? patientsCoches.filter((p) => p.dossierId)
          : patientSelectionne?.dossierId
            ? [patientSelectionne]
            : [];

      if (cibles.length === 0) {
        setMessagePanneau("Sélectionnez au moins un patient.");
        return;
      }

      if (patientsCoches.length === 0) {
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
      }

      if (verrouOrientationRef.current) return;
      verrouOrientationRef.current = true;
      setModificationEnCours(true);
      setMessagePanneau(null);

      try {
        const { ok, echecs, resultats, premierEchec } = await orienterPatientsEnSerie(
          cibles.map((p) => p.dossierId!),
          async (dossierId) => {
            const patient = cibles.find((p) => p.dossierId === dossierId)!;
            const res = await fetch(`${espace.prefixeApi}/transferts`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                transfertManuel: true,
                numeroPatient: patient.id,
                dossierId: patient.dossierId,
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
              confirme?: boolean;
            };
            if (!res.ok) throw new Error(data.message ?? "Transfert rapide impossible.");
            return data;
          }
        );

        if (ok === 0) {
          throw premierEchec ?? new Error("Transfert rapide impossible.");
        }

        const premierOk = resultats[0];
        const codesFinal = premierOk?.codesSalle ?? codes;
        const orientationAffichee =
          premierOk?.salleDestination ??
          codesFinal.map((c) => libelleOrientation(c)).join(", ");
        const orientationCouleur = couleurOrientation(
          libelleOrientation(codesFinal[0] ?? codes[0]!)
        );
        const transfertConfirme = Boolean(premierOk?.confirme);

        if (
          patientSelectionne &&
          cibles.some((c) => c.dossierId === patientSelectionne.dossierId)
        ) {
          setPatientSelectionne((courant) =>
            courant
              ? {
                  ...courant,
                  transfertId: premierOk?.transfertId ?? courant.transfertId,
                  statutTransfert: transfertConfirme ? "ACCEPTE" : "EN_ATTENTE",
                  codeSalleDestination: codesFinal[0] ?? courant.codeSalleDestination,
                  codesSalleDestination: codesFinal,
                  orientation: orientationAffichee,
                  orientationCouleur,
                  statut: transfertConfirme ? "Transféré" : "À confirmer",
                  statutCouleur: transfertConfirme
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-orange-100 text-orange-800",
                  motif: courant.motif === "—" ? "Transfert manuel" : courant.motif,
                }
              : courant
          );
        }

        definirOrientations(codesFinal);
        setPatientsCoches([]);
        setMessagePanneau(
          premierOk?.message ??
            (echecs > 0
              ? `${ok} patient(s) orienté(s) (${echecs} échec(s)) — confirmez dans la liste.`
              : cibles.length > 1
                ? `${ok} patients orientés vers ${orientationAffichee} — confirmez via ⋮.`
                : `Transfert vers ${orientationAffichee} créé — confirmez via le menu ⋮.`)
        );
        window.dispatchEvent(new CustomEvent(espace.evenementPatientsModifies));
      } catch (error) {
        setMessagePanneau(
          error instanceof Error ? error.message : "Impossible d'appliquer l'orientation rapide."
        );
      } finally {
        verrouOrientationRef.current = false;
        setModificationEnCours(false);
      }
    },
    [
      patientsCoches,
      patientSelectionne,
      orientationVerrouillee,
      peutModifierOrientation,
      peutCreerTransfertRapide,
      definirOrientations,
      espace.prefixeApi,
      espace.evenementPatientsModifies,
    ]
  );

  const debounceOrientationRef = useRef<ReturnType<
    typeof creerDebounce<(codes: string[]) => void>
  > | null>(null);

  useEffect(() => {
    debounceOrientationRef.current = creerDebounce((codes: string[]) => {
      void appliquerOrientationsTransfert(codes);
    }, 400);
    return () => debounceOrientationRef.current?.annuler();
  }, [appliquerOrientationsTransfert]);

  const changerOrientationsTransfert = useCallback(
    async (codesSalle: string[]) => {
      debounceOrientationRef.current?.(codesSalle);
    },
    []
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
    setPatientsCoches((prev) =>
      prev
        .map(
          (c) =>
            patients.find((p) => p.dossierId === c.dossierId) ??
            patients.find((p) => p.cleListe === c.cleListe)
        )
        .filter((p): p is PatientEnregistre => Boolean(p))
    );
  }, []);

  const valeur = useMemo(
    () => ({
      patientSelectionne,
      selectionnerPourPanneau,
      changerOrientationTransfert,
      changerOrientationsTransfert,
      synchroniserSelection,
      dossiersCoches,
      basculerPatientCoche,
      definirPatientsCoches,
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
      dossiersCoches,
      basculerPatientCoche,
      definirPatientsCoches,
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
