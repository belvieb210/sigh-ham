import type { StatutExamen } from "@/generated/prisma/client";
import type { IdOrientationStatutAnalyse } from "@/constants/laboratoire-orientations";
import type { PieceJointeExamenPersistee } from "@/constants/laboratoire-notes-examen";
import type { ConfigSaisieParametre } from "@/lib/laboratoire/config-saisie-parametre";

export type ActionEnregistrementResultat =
  | "brouillon"
  | "verifier"
  | "rejeter"
  | "approuver"
  | "restaurer"
  | "supprimer";

export interface ParametreSaisieDto {
  id: string;
  nom: string;
  unite: string | null;
  rangeUsuelle: string | null;
  obligatoire: boolean;
  ordre: number;
  valeur: string;
  flag: string | null;
  valeurSecondaire: string | null;
  nonRequis: boolean;
  commentaire: string;
  configSaisie?: ConfigSaisieParametre;
  /** Paramètre ajouté à la volée (hors catalogue type examen). */
  personnalise?: boolean;
}

export interface ExamenSaisieDto {
  id: string;
  code: string;
  libelle: string;
  categorie: string;
  prix: number;
  statut: StatutExamen;
  orientationAnalyse: IdOrientationStatutAnalyse | null;
  formulaire: string | null;
  remarque: string | null;
  parametres: ParametreSaisieDto[];
  piecesJointes: PieceJointeExamenPersistee[];
}

export interface SaisieResultatsDto {
  dossierId: string;
  numeroDossier: string;
  numeroEnregistrement: string;
  numeroTransfert: string | null;
  prenom: string;
  nom: string;
  sexe: string | null;
  age: number | null;
  telephone: string | null;
  examens: ExamenSaisieDto[];
}

export interface LigneResultatSaisie {
  /** Id catalogue ; null / omis pour un paramètre personnalisé. */
  parametreTypeExamenId?: string | null;
  /** Nom affiché — requis si personnalise. */
  nom?: string | null;
  /** true = hors catalogue (persisté avec parametreTypeExamenId null). */
  personnalise?: boolean;
  /**
   * Id ResultatExamen existant (rechargement).
   * Les ids client `perso-…` indiquent une nouvelle ligne.
   */
  resultatId?: string | null;
  valeur: string;
  valeurSecondaire?: string | null;
  nonRequis?: boolean;
  commentaire?: string | null;
}

export function cheminSaisieResultats(
  dossierId: string,
  opts?: { statut?: IdOrientationStatutAnalyse; examenId?: string }
) {
  const params = new URLSearchParams();
  if (opts?.statut) params.set("statut", opts.statut);
  if (opts?.examenId) params.set("examen", opts.examenId);
  const query = params.toString();
  return `/sigh/laboratoire/saisie-resultats/${dossierId}${query ? `?${query}` : ""}`;
}
