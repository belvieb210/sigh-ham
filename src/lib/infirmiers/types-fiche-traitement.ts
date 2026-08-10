export interface LigneTraitementResume {
  id?: string;
  effectueLe: string | null;
  medicament: string;
  doseQuantite: string | null;
  nomTraiteur: string | null;
}

export interface CommentaireTraitementResume {
  id?: string;
  texte: string;
}

export interface FichierTraitementResume {
  id?: string;
  nom: string;
  url: string;
  typeMime: string | null;
}

export interface FicheTraitementResume {
  id: string;
  dossierId: string;
  numeroDossier: string;
  numeroPatient: string;
  nomComplet: string;
  telephone: string | null;
  medecinPrescripteur: string | null;
  telPrescripteur: string | null;
  numeroRecu: string | null;
  poidsKg: number | null;
  sexe: string | null;
  debutTraitementLe: string;
  finTraitementLe: string;
  finEffectiveLe: string;
  joursProlongation: number;
  statut: "EN_COURS" | "CLOTURE" | "ANNULE";
  pdfUrl: string | null;
  clotureLe: string | null;
  infirmierNom: string;
  lignes: LigneTraitementResume[];
  commentaires: CommentaireTraitementResume[];
  fichiers: FichierTraitementResume[];
}

export interface FormulaireFicheTraitementState {
  medecinPrescripteur: string;
  telPrescripteur: string;
  numeroRecu: string;
  poidsKg: string;
  sexe: string;
  debutTraitementLe: string;
  finTraitementLe: string;
  lignes: LigneTraitementResume[];
  commentaires: CommentaireTraitementResume[];
  fichiers: FichierTraitementResume[];
}

export const FORMULAIRE_FICHE_TRAITEMENT_VIDE: FormulaireFicheTraitementState = {
  medecinPrescripteur: "",
  telPrescripteur: "",
  numeroRecu: "",
  poidsKg: "",
  sexe: "",
  debutTraitementLe: "",
  finTraitementLe: "",
  lignes: [{ effectueLe: null, medicament: "", doseQuantite: "", nomTraiteur: "" }],
  commentaires: [{ texte: "" }],
  fichiers: [],
};
