export type ExamenResultatPublic = {
  id: string;
  libelle: string;
  resultatLe: string | null;
};

export type ExamenExcluPublic = {
  libelle: string;
};

export type ResultatPatientPublic = {
  token: string;
  nomFichier: string;
  patient: {
    nom: string;
    prenom: string;
    numeroPatient: string;
    sexe: string | null;
    age: number | null;
    telephone: string | null;
    adresse: string | null;
  };
  facture: {
    numeroFacture: string;
    statut: string;
    montantTotal: number;
    devise: string;
    emiseLe: string | null;
  };
  /** Examens approuvés et inclus dans le PDF. */
  examens: ExamenResultatPublic[];
  /** Examens de cette facture pas encore disponibles en ligne. */
  examensExclus: ExamenExcluPublic[];
  prescripteur: string | null;
  dateAnalyse: string | null;
};

export type ResultatEnAttentePublic = {
  patient: {
    nom: string;
    prenom: string;
    numeroPatient: string;
  };
  facture: {
    numeroFacture: string;
  };
  examensEnAttente: ExamenExcluPublic[];
};

export type ReponseRechercheResultatsPublic =
  | { type: "succes"; resultat: ResultatPatientPublic }
  | { type: "en_attente"; attente: ResultatEnAttentePublic }
  | { type: "introuvable" };
