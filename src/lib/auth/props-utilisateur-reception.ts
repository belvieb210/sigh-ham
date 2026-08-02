export interface UtilisateurReception {
  prenom: string;
  nom: string;
  role: string;
  photoUrl?: string | null;
}

/** Adapte l'utilisateur session Prisma vers les props du layout réception. */
export function propsUtilisateurReception(utilisateur: {
  prenom: string;
  nom: string;
  photoUrl?: string | null;
  role: { nom: string };
}): UtilisateurReception {
  return {
    prenom: utilisateur.prenom,
    nom: utilisateur.nom,
    role: utilisateur.role.nom,
    photoUrl: utilisateur.photoUrl ?? null,
  };
}
