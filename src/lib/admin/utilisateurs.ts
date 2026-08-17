import "server-only";
import type { StatutUtilisateur } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { hasherMotDePasse } from "@/lib/auth/mot-de-passe";
import { enregistrerAudit } from "@/lib/admin/audit";
import { lireParametre } from "@/lib/admin/parametres";
import { estRoleGereParServiceClient } from "@/constants/admin-utilisateurs";
import {
  sauvegarderPhotoUtilisateur,
  supprimerPhotoUtilisateurLocale,
} from "@/lib/auth/photo-utilisateur";

const selectPublic = {
  id: true,
  identifiant: true,
  email: true,
  prenom: true,
  nom: true,
  telephone: true,
  photoUrl: true,
  statut: true,
  messagerieBloquee: true,
  notesAdmin: true,
  derniereConnexion: true,
  createdAt: true,
  updatedAt: true,
  role: {
    select: {
      id: true,
      code: true,
      nom: true,
      systeme: true,
      salle: { select: { code: true, nom: true } },
    },
  },
} as const;

export async function listerUtilisateursAdmin(options?: {
  q?: string;
  roleId?: string;
  statut?: StatutUtilisateur;
  limite?: number;
}) {
  const q = options?.q?.trim();
  const limite = Math.min(options?.limite ?? 100, 200);

  return prisma.utilisateur.findMany({
    where: {
      ...(options?.roleId ? { roleId: options.roleId } : {}),
      ...(options?.statut ? { statut: options.statut } : {}),
      ...(q
        ? {
            OR: [
              { identifiant: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { prenom: { contains: q, mode: "insensitive" } },
              { nom: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: selectPublic,
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    take: limite,
  });
}

export async function obtenirUtilisateurAdmin(id: string) {
  return prisma.utilisateur.findUnique({
    where: { id },
    select: selectPublic,
  });
}

function validerMotDePasse(mdp: string, exigerFort: boolean) {
  if (mdp.length < 8) {
    throw new Error("Le mot de passe doit contenir au moins 8 caractères.");
  }
  if (exigerFort) {
    if (!/[A-Z]/.test(mdp) || !/[a-z]/.test(mdp) || !/[0-9]/.test(mdp)) {
      throw new Error(
        "Mot de passe fort requis : majuscule, minuscule et chiffre."
      );
    }
  }
}

async function assertRoleAssignable(
  roleId: string,
  acteurRoleCode: string
) {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new Error("Rôle introuvable.");
  if (role.code === "SUPER_ADMIN" && acteurRoleCode !== "SUPER_ADMIN") {
    throw new Error("Seul un super administrateur peut attribuer ce rôle.");
  }
  return role;
}

export async function creerUtilisateurAdmin(
  acteur: { id: string; role: { code: string } },
  data: {
    identifiant: string;
    email?: string;
    prenom: string;
    nom: string;
    telephone?: string;
    roleId: string;
    motDePasse: string;
    statut?: StatutUtilisateur;
    notesAdmin?: string | null;
  }
) {
  const identifiant = data.identifiant.trim().toLowerCase();
  if (!identifiant) throw new Error("Identifiant requis.");
  if (!data.prenom.trim() || !data.nom.trim()) {
    throw new Error("Prénom et nom requis.");
  }

  const role = await assertRoleAssignable(data.roleId, acteur.role.code);
  if (estRoleGereParServiceClient(role.code)) {
    throw new Error(
      "Ce rôle est géré par le service client (médecins externes / Église). Utilisez le module Service client pour créer ce compte."
    );
  }
  const exigerFort =
    (await lireParametre("securite.exigerMotDePasseFort", "true")) === "true";
  validerMotDePasse(data.motDePasse, exigerFort);

  const existant = await prisma.utilisateur.findFirst({
    where: {
      OR: [
        { identifiant },
        ...(data.email?.trim()
          ? [{ email: data.email.trim().toLowerCase() }]
          : []),
      ],
    },
  });
  if (existant) throw new Error("Identifiant ou e-mail déjà utilisé.");

  const hash = await hasherMotDePasse(data.motDePasse);
  const cree = await prisma.utilisateur.create({
    data: {
      identifiant,
      email: data.email?.trim().toLowerCase() || null,
      prenom: data.prenom.trim(),
      nom: data.nom.trim(),
      telephone: data.telephone?.trim() || null,
      roleId: data.roleId,
      motDePasseHash: hash,
      statut: data.statut ?? "ACTIF",
      notesAdmin: data.notesAdmin?.trim() || null,
    },
    select: selectPublic,
  });

  await enregistrerAudit({
    utilisateurId: acteur.id,
    type: "CREATION",
    entite: "Utilisateur",
    entiteId: cree.id,
    action: `Création utilisateur ${cree.identifiant}`,
    details: { role: cree.role.code },
  });

  return cree;
}

export async function mettreAJourUtilisateurAdmin(
  acteur: { id: string; role: { code: string } },
  id: string,
  data: {
    email?: string | null;
    prenom?: string;
    nom?: string;
    telephone?: string | null;
    roleId?: string;
    statut?: StatutUtilisateur;
    motDePasse?: string;
    messagerieBloquee?: boolean;
    notesAdmin?: string | null;
  }
) {
  const cible = await prisma.utilisateur.findUnique({
    where: { id },
    include: { role: true },
  });
  if (!cible) throw new Error("Utilisateur introuvable.");

  if (acteur.id === id && data.statut && data.statut !== "ACTIF") {
    throw new Error("Vous ne pouvez pas désactiver votre propre compte.");
  }

  if (
    cible.role.code === "SUPER_ADMIN" &&
    acteur.role.code !== "SUPER_ADMIN" &&
    acteur.id !== id
  ) {
    throw new Error("Impossible de modifier un super administrateur.");
  }

  if (data.roleId) {
    const role = await assertRoleAssignable(data.roleId, acteur.role.code);
    if (
      estRoleGereParServiceClient(role.code) &&
      cible.role.code !== role.code
    ) {
      throw new Error(
        "Impossible d'attribuer ce rôle depuis l'administration. Compte réservé au service client."
      );
    }
  }

  if (data.motDePasse) {
    const exigerFort =
      (await lireParametre("securite.exigerMotDePasseFort", "true")) === "true";
    validerMotDePasse(data.motDePasse, exigerFort);
  }

  const maj = await prisma.utilisateur.update({
    where: { id },
    data: {
      ...(data.prenom !== undefined ? { prenom: data.prenom.trim() } : {}),
      ...(data.nom !== undefined ? { nom: data.nom.trim() } : {}),
      ...(data.email !== undefined
        ? { email: data.email?.trim().toLowerCase() || null }
        : {}),
      ...(data.telephone !== undefined
        ? { telephone: data.telephone?.trim() || null }
        : {}),
      ...(data.roleId ? { roleId: data.roleId } : {}),
      ...(data.statut ? { statut: data.statut } : {}),
      ...(data.motDePasse
        ? { motDePasseHash: await hasherMotDePasse(data.motDePasse) }
        : {}),
      ...(data.messagerieBloquee !== undefined
        ? { messagerieBloquee: data.messagerieBloquee }
        : {}),
      ...(data.notesAdmin !== undefined
        ? { notesAdmin: data.notesAdmin?.trim() || null }
        : {}),
    },
    select: selectPublic,
  });

  if (maj.statut !== "ACTIF") {
    await prisma.session.deleteMany({ where: { utilisateurId: id } });
  }

  await enregistrerAudit({
    utilisateurId: acteur.id,
    type: "MODIFICATION",
    entite: "Utilisateur",
    entiteId: id,
    action: `Modification utilisateur ${maj.identifiant}`,
    details: {
      statut: maj.statut,
      role: maj.role.code,
      motDePasseChange: Boolean(data.motDePasse),
    },
  });

  return maj;
}

export async function mettreAJourPhotoUtilisateurAdmin(
  acteur: { id: string },
  id: string,
  photo: File
) {
  const actuel = await prisma.utilisateur.findUnique({
    where: { id },
    select: { identifiant: true, photoUrl: true },
  });
  if (!actuel) throw new Error("Utilisateur introuvable.");

  const photoUrl = await sauvegarderPhotoUtilisateur(id, photo);
  const maj = await prisma.utilisateur.update({
    where: { id },
    data: { photoUrl },
    select: selectPublic,
  });
  await supprimerPhotoUtilisateurLocale(actuel.photoUrl);
  await enregistrerAudit({
    utilisateurId: acteur.id,
    type: "MODIFICATION",
    entite: "Utilisateur",
    entiteId: id,
    action: `Photo utilisateur ${actuel.identifiant}`,
  });
  return maj;
}
