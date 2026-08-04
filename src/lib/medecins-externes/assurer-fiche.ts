import "server-only";
import { prisma } from "@/lib/prisma";

type UtilisateurSession = {
  id: string;
  prenom: string;
  nom: string;
  email?: string | null;
  telephone?: string | null;
  medecinExterneId?: string | null;
  photoUrl?: string | null;
  role: { nom: string; code: string; salle?: { code: string } | null };
};

/**
 * Garantit qu'un médecin externe a une fiche MedecinExterne liée.
 * Retourne l'utilisateur avec medecinExterneId non null.
 */
export async function assurerFicheMedecinExterne<T extends UtilisateurSession>(
  utilisateur: T
): Promise<T & { medecinExterneId: string }> {
  if (utilisateur.medecinExterneId) {
    return utilisateur as T & { medecinExterneId: string };
  }

  const fiche = await prisma.medecinExterne.create({
    data: {
      prenom: utilisateur.prenom,
      nom: utilisateur.nom,
      email: utilisateur.email ?? null,
      telephone: utilisateur.telephone ?? null,
      specialite: "Médecine générale",
    },
  });

  await prisma.utilisateur.update({
    where: { id: utilisateur.id },
    data: { medecinExterneId: fiche.id },
  });

  return { ...utilisateur, medecinExterneId: fiche.id };
}

export function exigerMedecinExterneId(
  medecinExterneId: string | null | undefined
): string {
  if (!medecinExterneId) {
    throw new Error("Fiche médecin externe manquante.");
  }
  return medecinExterneId;
}

/** Vérifie que le dossier appartient au médecin externe connecté. */
export async function assertDossierDuMedecinExterne(
  dossierId: string,
  medecinExterneId: string
) {
  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    include: { patient: { select: { medecinExterneId: true } } },
  });
  if (!dossier) throw new Error("DOSSIER_INTROUVABLE");
  if (dossier.patient.medecinExterneId !== medecinExterneId) {
    throw new Error("DOSSIER_NON_AUTORISE");
  }
  return dossier;
}
