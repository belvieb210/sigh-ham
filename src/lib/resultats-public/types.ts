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
  examens: {
    id: string;
    libelle: string;
    resultatLe: string | null;
  }[];
  prescripteur: string | null;
  dateAnalyse: string | null;
};
