import "server-only";
import { prisma } from "@/lib/prisma";
import { enregistrerAudit } from "@/lib/admin/audit";

export async function listerPermissionsCatalogue() {
  return prisma.permission.findMany({
    orderBy: [{ module: "asc" }, { code: "asc" }],
  });
}

export async function obtenirPermissionsRole(roleId: string) {
  const rows = await prisma.rolePermission.findMany({
    where: { roleId },
    include: { permission: true },
  });
  return rows.map((r) => r.permission);
}

export async function definirPermissionsRole(
  acteur: { id: string; role: { code: string } },
  roleId: string,
  permissionIds: string[]
) {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new Error("Rôle introuvable.");

  if (role.code === "SUPER_ADMIN" && acteur.role.code !== "SUPER_ADMIN") {
    throw new Error(
      "Seul un super administrateur peut modifier les permissions SUPER_ADMIN."
    );
  }

  const uniques = [...new Set(permissionIds.filter(Boolean))];
  if (uniques.length > 0) {
    const count = await prisma.permission.count({
      where: { id: { in: uniques } },
    });
    if (count !== uniques.length) {
      throw new Error("Une ou plusieurs permissions sont invalides.");
    }
  }

  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId } }),
    ...(uniques.length > 0
      ? [
          prisma.rolePermission.createMany({
            data: uniques.map((permissionId) => ({ roleId, permissionId })),
          }),
        ]
      : []),
  ]);

  await enregistrerAudit({
    utilisateurId: acteur.id,
    type: "MODIFICATION",
    entite: "Role",
    entiteId: roleId,
    action: `Permissions mises à jour pour ${role.code}`,
    details: { permissionIds: uniques, count: uniques.length },
  });

  return obtenirPermissionsRole(roleId);
}

/** SUPER_ADMIN contourne toujours ; sinon vérifie RolePermission. */
export async function utilisateurAPermission(
  utilisateurId: string,
  codePermission: string
): Promise<boolean> {
  const user = await prisma.utilisateur.findUnique({
    where: { id: utilisateurId },
    select: {
      role: {
        select: {
          code: true,
          permissions: {
            where: { permission: { code: codePermission } },
            select: { permissionId: true },
            take: 1,
          },
        },
      },
    },
  });
  if (!user) return false;
  if (user.role.code === "SUPER_ADMIN") return true;
  return user.role.permissions.length > 0;
}

export async function assertPermissionAdmin(
  utilisateurId: string,
  codePermission: string
) {
  const ok = await utilisateurAPermission(utilisateurId, codePermission);
  if (!ok) {
    throw new Error("Permission insuffisante pour cette action.");
  }
}
