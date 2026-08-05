import "server-only";
import { prisma } from "@/lib/prisma";
import { enregistrerAudit } from "@/lib/admin/audit";
import type { CodeSalle } from "@/generated/prisma/client";

export async function listerRolesAdmin() {
  return prisma.role.findMany({
    include: {
      salle: { select: { code: true, nom: true } },
      _count: { select: { utilisateurs: true, permissions: true } },
    },
    orderBy: [{ systeme: "desc" }, { nom: "asc" }],
  });
}

export async function obtenirRoleAdmin(roleId: string) {
  return prisma.role.findUnique({
    where: { id: roleId },
    include: {
      salle: { select: { code: true, nom: true } },
      permissions: { include: { permission: true } },
      _count: { select: { utilisateurs: true, permissions: true } },
    },
  });
}

/** Toutes les salles (actives et inactives) pour l'admin. */
export async function listerSallesAdmin(options?: { toutes?: boolean }) {
  return prisma.salle.findMany({
    where: options?.toutes ? undefined : { actif: true },
    orderBy: { ordre: "asc" },
    select: {
      id: true,
      code: true,
      nom: true,
      description: true,
      ordre: true,
      actif: true,
      _count: { select: { roles: true } },
    },
  });
}

export async function mettreAJourSalleAdmin(
  acteur: { id: string },
  code: CodeSalle | string,
  data: {
    actif?: boolean;
    ordre?: number;
    nom?: string;
    description?: string | null;
  }
) {
  const salle = await prisma.salle.findUnique({
    where: { code: code as CodeSalle },
  });
  if (!salle) throw new Error("Service introuvable.");

  if (salle.code === "ADMIN" && data.actif === false) {
    throw new Error("Le service Administration ne peut pas être désactivé.");
  }

  const maj = await prisma.salle.update({
    where: { id: salle.id },
    data: {
      ...(data.actif !== undefined ? { actif: data.actif } : {}),
      ...(data.ordre !== undefined ? { ordre: data.ordre } : {}),
      ...(data.nom !== undefined ? { nom: data.nom.trim() } : {}),
      ...(data.description !== undefined
        ? { description: data.description?.trim() || null }
        : {}),
    },
  });

  await enregistrerAudit({
    utilisateurId: acteur.id,
    type: "MODIFICATION",
    entite: "Salle",
    entiteId: maj.id,
    action: `Service ${maj.code} mis à jour`,
    details: {
      actif: maj.actif,
      ordre: maj.ordre,
      nom: maj.nom,
    },
  });

  return maj;
}

/** Codes de salles actives utilisables comme destinations d'orientation. */
export async function listerCodesSallesActivesOrientation(): Promise<
  CodeSalle[]
> {
  const rows = await prisma.salle.findMany({
    where: {
      actif: true,
      code: {
        notIn: ["ADMIN", "MESSAGERIE", "RECEPTION"],
      },
    },
    select: { code: true },
  });
  return rows.map((r) => r.code);
}
