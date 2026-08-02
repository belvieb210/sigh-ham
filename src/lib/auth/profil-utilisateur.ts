import "server-only";
import { prisma } from "@/lib/prisma";
import { hasherMotDePasse, verifierMotDePasse } from "@/lib/auth/mot-de-passe";
import {
  sauvegarderPhotoUtilisateur,
  supprimerPhotoUtilisateurLocale,
  validerPhotoUtilisateur,
} from "@/lib/auth/photo-utilisateur";
import type {
  DonneesMiseAJourProfil,
  ProfilUtilisateurPublic,
} from "@/lib/auth/types-profil";

export type { DonneesMiseAJourProfil, ProfilUtilisateurPublic };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formaterProfil(utilisateur: {
  id: string;
  identifiant: string;
  email: string | null;
  prenom: string;
  nom: string;
  telephone: string | null;
  photoUrl: string | null;
  derniereConnexion: Date | null;
  createdAt: Date;
  role: {
    code: string;
    nom: string;
    salle: { code: string; nom: string } | null;
  };
}): ProfilUtilisateurPublic {
  return {
    id: utilisateur.id,
    identifiant: utilisateur.identifiant,
    email: utilisateur.email,
    prenom: utilisateur.prenom,
    nom: utilisateur.nom,
    telephone: utilisateur.telephone,
    photoUrl: utilisateur.photoUrl,
    derniereConnexion: utilisateur.derniereConnexion?.toISOString() ?? null,
    createdAt: utilisateur.createdAt.toISOString(),
    role: {
      code: utilisateur.role.code,
      nom: utilisateur.role.nom,
      salle: utilisateur.role.salle
        ? { code: utilisateur.role.salle.code, nom: utilisateur.role.salle.nom }
        : null,
    },
  };
}

export async function obtenirProfilUtilisateur(
  utilisateurId: string
): Promise<ProfilUtilisateurPublic | null> {
  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id: utilisateurId },
    select: {
      id: true,
      identifiant: true,
      email: true,
      prenom: true,
      nom: true,
      telephone: true,
      photoUrl: true,
      derniereConnexion: true,
      createdAt: true,
      role: {
        select: {
          code: true,
          nom: true,
          salle: { select: { code: true, nom: true } },
        },
      },
    },
  });

  return utilisateur ? formaterProfil(utilisateur) : null;
}

export function validerDonneesProfil(donnees: Partial<DonneesMiseAJourProfil>): string | null {
  if (!donnees.prenom?.trim()) return "Le prénom est obligatoire.";
  if (!donnees.nom?.trim()) return "Le nom est obligatoire.";
  if (donnees.prenom.trim().length < 2) return "Le prénom doit contenir au moins 2 caractères.";
  if (donnees.nom.trim().length < 2) return "Le nom doit contenir au moins 2 caractères.";

  const email = donnees.email?.trim();
  if (email && !EMAIL_REGEX.test(email)) return "Adresse e-mail invalide.";

  const telephone = donnees.telephone?.trim();
  if (telephone && telephone.length < 8) {
    return "Le numéro de téléphone semble invalide.";
  }

  return null;
}

export async function mettreAJourProfilUtilisateur(
  utilisateurId: string,
  donnees: DonneesMiseAJourProfil
): Promise<ProfilUtilisateurPublic> {
  const erreur = validerDonneesProfil(donnees);
  if (erreur) throw new Error(erreur);

  const email = donnees.email?.trim() || null;
  if (email) {
    const conflit = await prisma.utilisateur.findFirst({
      where: { email, NOT: { id: utilisateurId } },
      select: { id: true },
    });
    if (conflit) throw new Error("Cette adresse e-mail est déjà utilisée.");
  }

  const utilisateur = await prisma.utilisateur.update({
    where: { id: utilisateurId },
    data: {
      prenom: donnees.prenom.trim(),
      nom: donnees.nom.trim().toUpperCase(),
      email,
      telephone: donnees.telephone?.trim() || null,
    },
    select: {
      id: true,
      identifiant: true,
      email: true,
      prenom: true,
      nom: true,
      telephone: true,
      photoUrl: true,
      derniereConnexion: true,
      createdAt: true,
      role: {
        select: {
          code: true,
          nom: true,
          salle: { select: { code: true, nom: true } },
        },
      },
    },
  });

  await prisma.journalAudit.create({
    data: {
      utilisateurId,
      type: "MODIFICATION",
      module: utilisateur.role.salle?.code,
      entite: "Utilisateur",
      entiteId: utilisateurId,
      action: "Mise à jour du profil",
      details: {
        champs: ["prenom", "nom", "email", "telephone"],
      },
    },
  });

  return formaterProfil(utilisateur);
}

export function validerNouveauMotDePasse(nouveau: string, confirmation: string): string | null {
  if (!nouveau || nouveau.length < 8) {
    return "Le nouveau mot de passe doit contenir au moins 8 caractères.";
  }
  if (!/[A-Za-z]/.test(nouveau) || !/[0-9]/.test(nouveau)) {
    return "Le mot de passe doit contenir au moins une lettre et un chiffre.";
  }
  if (nouveau !== confirmation) {
    return "La confirmation du mot de passe ne correspond pas.";
  }
  return null;
}

export async function changerMotDePasseUtilisateur(
  utilisateurId: string,
  sessionId: string,
  actuel: string,
  nouveau: string,
  confirmation: string
): Promise<void> {
  const erreur = validerNouveauMotDePasse(nouveau, confirmation);
  if (erreur) throw new Error(erreur);
  if (!actuel) throw new Error("Le mot de passe actuel est obligatoire.");

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id: utilisateurId },
    select: {
      motDePasseHash: true,
      role: { select: { salle: { select: { code: true } } } },
    },
  });

  if (!utilisateur) throw new Error("Utilisateur introuvable.");

  const valide = await verifierMotDePasse(actuel, utilisateur.motDePasseHash);
  if (!valide) throw new Error("Mot de passe actuel incorrect.");

  const meme = await verifierMotDePasse(nouveau, utilisateur.motDePasseHash);
  if (meme) throw new Error("Le nouveau mot de passe doit être différent de l'actuel.");

  const hash = await hasherMotDePasse(nouveau);

  await prisma.$transaction([
    prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: { motDePasseHash: hash },
    }),
    /** Révoque les autres sessions (sécurité entreprise) */
    prisma.session.deleteMany({
      where: { utilisateurId, id: { not: sessionId } },
    }),
    prisma.journalAudit.create({
      data: {
        utilisateurId,
        type: "MODIFICATION",
        module: utilisateur.role.salle?.code,
        entite: "Utilisateur",
        entiteId: utilisateurId,
        action: "Changement de mot de passe",
      },
    }),
  ]);
}

export async function mettreAJourPhotoProfil(
  utilisateurId: string,
  photo: File
): Promise<ProfilUtilisateurPublic> {
  const erreur = validerPhotoUtilisateur(photo);
  if (erreur) throw new Error(erreur);

  const actuel = await prisma.utilisateur.findUnique({
    where: { id: utilisateurId },
    select: {
      photoUrl: true,
      role: { select: { salle: { select: { code: true } } } },
    },
  });
  if (!actuel) throw new Error("Utilisateur introuvable.");

  const photoUrl = await sauvegarderPhotoUtilisateur(utilisateurId, photo);

  const utilisateur = await prisma.utilisateur.update({
    where: { id: utilisateurId },
    data: { photoUrl },
    select: {
      id: true,
      identifiant: true,
      email: true,
      prenom: true,
      nom: true,
      telephone: true,
      photoUrl: true,
      derniereConnexion: true,
      createdAt: true,
      role: {
        select: {
          code: true,
          nom: true,
          salle: { select: { code: true, nom: true } },
        },
      },
    },
  });

  await supprimerPhotoUtilisateurLocale(actuel.photoUrl);
  await prisma.journalAudit.create({
    data: {
      utilisateurId,
      type: "MODIFICATION",
      module: actuel.role.salle?.code,
      entite: "Utilisateur",
      entiteId: utilisateurId,
      action: "Mise à jour de la photo de profil",
    },
  });

  return formaterProfil(utilisateur);
}

export async function supprimerPhotoProfil(
  utilisateurId: string
): Promise<ProfilUtilisateurPublic> {
  const actuel = await prisma.utilisateur.findUnique({
    where: { id: utilisateurId },
    select: {
      photoUrl: true,
      role: { select: { salle: { select: { code: true } } } },
    },
  });
  if (!actuel) throw new Error("Utilisateur introuvable.");

  const utilisateur = await prisma.utilisateur.update({
    where: { id: utilisateurId },
    data: { photoUrl: null },
    select: {
      id: true,
      identifiant: true,
      email: true,
      prenom: true,
      nom: true,
      telephone: true,
      photoUrl: true,
      derniereConnexion: true,
      createdAt: true,
      role: {
        select: {
          code: true,
          nom: true,
          salle: { select: { code: true, nom: true } },
        },
      },
    },
  });

  await supprimerPhotoUtilisateurLocale(actuel.photoUrl);
  await prisma.journalAudit.create({
    data: {
      utilisateurId,
      type: "MODIFICATION",
      module: actuel.role.salle?.code,
      entite: "Utilisateur",
      entiteId: utilisateurId,
      action: "Suppression de la photo de profil",
    },
  });

  return formaterProfil(utilisateur);
}
