import "server-only";
import { prisma } from "@/lib/prisma";
import { enregistrerAudit } from "@/lib/admin/audit";

export async function listerSessionsActives(options?: {
  utilisateurId?: string;
  limite?: number;
}) {
  const limite = Math.min(options?.limite ?? 100, 200);
  return prisma.session.findMany({
    where: {
      expireLe: { gt: new Date() },
      ...(options?.utilisateurId
        ? { utilisateurId: options.utilisateurId }
        : {}),
    },
    include: {
      utilisateur: {
        select: {
          id: true,
          identifiant: true,
          prenom: true,
          nom: true,
          role: { select: { code: true, nom: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limite,
  });
}

export async function revoquerSession(
  acteur: { id: string; role: { code: string } },
  sessionId: string
) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { utilisateur: { include: { role: true } } },
  });
  if (!session) throw new Error("Session introuvable.");

  if (
    session.utilisateur.role.code === "SUPER_ADMIN" &&
    acteur.role.code !== "SUPER_ADMIN"
  ) {
    throw new Error("Impossible de révoquer la session d'un super administrateur.");
  }

  await prisma.session.delete({ where: { id: sessionId } });
  await enregistrerAudit({
    utilisateurId: acteur.id,
    type: "MODIFICATION",
    entite: "Session",
    entiteId: sessionId,
    action: `Révocation session de ${session.utilisateur.identifiant}`,
  });
}

export async function revoquerSessionsUtilisateur(
  acteur: { id: string; role: { code: string } },
  utilisateurId: string
) {
  const cible = await prisma.utilisateur.findUnique({
    where: { id: utilisateurId },
    include: { role: true },
  });
  if (!cible) throw new Error("Utilisateur introuvable.");
  if (cible.role.code === "SUPER_ADMIN" && acteur.role.code !== "SUPER_ADMIN") {
    throw new Error("Impossible de révoquer les sessions d'un super administrateur.");
  }

  const result = await prisma.session.deleteMany({
    where: { utilisateurId, expireLe: { gt: new Date() } },
  });

  await enregistrerAudit({
    utilisateurId: acteur.id,
    type: "MODIFICATION",
    entite: "Session",
    entiteId: utilisateurId,
    action: `Révocation de ${result.count} session(s) pour ${cible.identifiant}`,
    details: { count: result.count },
  });

  return result.count;
}
