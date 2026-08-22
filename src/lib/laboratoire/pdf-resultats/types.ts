/** Données normalisées pour le rendu PDF d'un résultat d'examen laboratoire. */

export interface LigneParametrePdf {
  name: string;
  value: string;
  other?: string;
  unit?: string;
  flag?: string;
  range?: string;
  nonRequis?: boolean;
  commentaire?: string;
}

export interface PieceJointeResultatPdf {
  nom: string;
  url: string;
  mimeType: string;
  /** Chemin local ou URL utilisable par react-pdf `<Image />`. */
  cheminAffichable?: string | null;
}

/** Une page annexe prête à l'affichage (après conversion PDF → images). */
export interface PageAnnexePieceJointePdf {
  nomFichier: string;
  libelle: string;
  cheminImage: string | null;
  integrable: boolean;
  mimeType: string;
  page?: number;
  totalPages?: number;
  messageErreur?: string;
  /** Dimensions en points pour react-pdf `<Image />` (pleine largeur page). */
  largeurAffichage?: number;
  hauteurAffichage?: number;
}

export interface DonneesPatientResultatPdf {
  dossierId: string;
  numeroEnregistrement: string;
  numeroPatient: string;
  /** N° transfert PAT (ex. PAT202600001) — usage interne, non affiché sur le PDF. */
  numeroTransfert: string | null;
  nom: string;
  prenom: string;
  sexe: string | null;
  age: number | null;
  telephone: string | null;
  adresse: string | null;
  medecinDemandeur?: string | null;
  cnomMedecin?: string | null;
  /** QR reçu facture (data URL PNG) — bandeau patient. */
  qrCodeDataUrl?: string | null;
}

export interface DonneesExamenResultatPdf {
  examenId: string;
  typeCode: string;
  typeFormulaire: string | null;
  /** Catégorie catalogue — fallback PDF si formulaire vide. */
  typeCategorie?: string | null;
  libelle: string;
  specimen: string | null;
  description: string | null;
  commentaireGlobal: string | null;
  dateAnalyse: string | null;
  resultats: LigneParametrePdf[];
  piecesJointes?: PieceJointeResultatPdf[];
  /** Pages annexe (images + PDF convertis) — affichées après FIN. */
  pagesAnnexe?: PageAnnexePieceJointePdf[];
}

export interface DonneesResultatExamenPdf {
  patient: DonneesPatientResultatPdf;
  examen: DonneesExamenResultatPdf;
  /** Type normalisé pour le registre de renders (ex. hemogramme, ionogramme). */
  typeRender: string;
}

/** Options du tableau générique `renderParamètres` (port PHP). */
export interface OptionsTableauParametresPdf {
  showFlag?: boolean;
  showRange?: boolean;
  showValues?: boolean;
  showUnit?: boolean;
  paramProportion?: number;
  centerAll?: boolean;
  equalFour?: boolean;
  commentProportion?: number;
}

export type ModeRenderExamenPdf =
  | { kind: "parametres"; options: OptionsTableauParametresPdf }
  | { kind: "serologie"; options?: OptionsTableauParametresPdf }
  | { kind: "groupageSanguin" }
  | { kind: "microfilaire" }
  | { kind: "goutteFraiche" }
  | { kind: "electrophorese" }
  | { kind: "malaria" }
  | { kind: "malariaTDR" }
  | { kind: "ziehlNelsen" }
  | { kind: "bilansTorch" }
  | {
      kind: "deuxColonnes";
      options: {
        col2Label: string;
        paramProportion?: number;
        majusculesValeur?: boolean;
        alignLeftCol2?: boolean;
      };
    }
  | { kind: "bioCliaHorm"; options?: OptionsTableauParametresPdf }
  | { kind: "generic"; options?: OptionsTableauParametresPdf };
