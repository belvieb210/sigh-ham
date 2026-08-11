import type { StatutExamen } from "@/generated/prisma/client";
import type { IdOrientationStatutAnalyse } from "@/constants/laboratoire-orientations";

export type ActionEnregistrementResultat =
  | "brouillon"
  | "verifier"
  | "rejeter"
  | "approuver";

export interface ParametreSaisieDto {
  id: string;
  nom: string;
  unite: string | null;
  rangeUsuelle: string | null;
  obligatoire: boolean;
  ordre: number;
  valeur: string;
  nonRequis: boolean;
  commentaire: string;
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
}

export interface SaisieResultatsDto {
  dossierId: string;
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
  parametreTypeExamenId: string;
  valeur: string;
  nonRequis?: boolean;
  commentaire?: string | null;
}

export function cheminSaisieResultats(dossierId: string) {
  return `/sigh/laboratoire/saisie-resultats/${dossierId}`;
}
