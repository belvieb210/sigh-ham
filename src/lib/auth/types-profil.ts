export interface ProfilUtilisateurPublic {
  id: string;
  identifiant: string;
  email: string | null;
  prenom: string;
  nom: string;
  telephone: string | null;
  photoUrl: string | null;
  derniereConnexion: string | null;
  createdAt: string;
  role: {
    code: string;
    nom: string;
    salle: { code: string; nom: string } | null;
  };
}

export interface DonneesMiseAJourProfil {
  prenom: string;
  nom: string;
  email?: string | null;
  telephone?: string | null;
}
