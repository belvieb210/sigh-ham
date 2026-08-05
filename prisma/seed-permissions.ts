/**
 * Catalogue permissions + affectation aux rôles ADMIN / SUPER_ADMIN.
 * Importé par seed-utilisateur-admin ; exécutable via npm run db:seed:permissions
 */
import type { CodeSalle, PrismaClient } from "../src/generated/prisma/client";

export const CATALOGUE_PERMISSIONS: {
  code: string;
  nom: string;
  description: string;
  module: CodeSalle | null;
}[] = [
  {
    code: "admin.users.read",
    nom: "Lire les utilisateurs",
    description: "Consulter la liste et le détail des comptes",
    module: "ADMIN",
  },
  {
    code: "admin.users.write",
    nom: "Gérer les utilisateurs",
    description: "Créer, modifier, suspendre, réinitialiser les mots de passe",
    module: "ADMIN",
  },
  {
    code: "admin.roles.read",
    nom: "Lire les rôles",
    description: "Consulter les rôles et permissions",
    module: "ADMIN",
  },
  {
    code: "admin.roles.write",
    nom: "Éditer les permissions des rôles",
    description: "Modifier la matrice rôle ↔ permissions",
    module: "ADMIN",
  },
  {
    code: "admin.services.write",
    nom: "Gérer les services",
    description: "Activer, désactiver, renommer les salles",
    module: "ADMIN",
  },
  {
    code: "admin.params.write",
    nom: "Modifier les paramètres",
    description: "Branding et politiques de sécurité",
    module: "ADMIN",
  },
  {
    code: "admin.audit.read",
    nom: "Lire l'audit",
    description: "Consulter le journal d'activité",
    module: "ADMIN",
  },
  {
    code: "admin.audit.export",
    nom: "Exporter l'audit",
    description: "Exporter le journal (CSV)",
    module: "ADMIN",
  },
  {
    code: "admin.stats.read",
    nom: "Statistiques",
    description: "Consulter supervision et rapports",
    module: "ADMIN",
  },
  {
    code: "admin.sessions.revoke",
    nom: "Révoquer des sessions",
    description: "Forcer la déconnexion d'utilisateurs",
    module: "ADMIN",
  },
  {
    code: "admin.backup.run",
    nom: "Sauvegardes",
    description: "Déclencher et télécharger les sauvegardes DB",
    module: "ADMIN",
  },
  {
    code: "messagerie.diffusion",
    nom: "Diffusion institutionnelle",
    description: "Envoyer un message à tous les services",
    module: "MESSAGERIE",
  },
];

const PERMS_ADMIN = CATALOGUE_PERMISSIONS.map((p) => p.code).filter(
  (c) => c !== "admin.backup.run"
);
const PERMS_SUPER = CATALOGUE_PERMISSIONS.map((p) => p.code);

export async function assurerPermissions(client: PrismaClient) {
  for (const p of CATALOGUE_PERMISSIONS) {
    await client.permission.upsert({
      where: { code: p.code },
      update: {
        nom: p.nom,
        description: p.description,
        module: p.module,
      },
      create: p,
    });
  }

  const toutes = await client.permission.findMany({
    select: { id: true, code: true },
  });
  const byCode = new Map(toutes.map((p) => [p.code, p.id]));

  async function syncRole(roleCode: string, codes: string[]) {
    const role = await client.role.findUnique({ where: { code: roleCode } });
    if (!role) {
      console.warn(`⚠ Rôle ${roleCode} introuvable — permissions ignorées`);
      return;
    }
    const ids = codes
      .map((c) => byCode.get(c))
      .filter((id): id is string => Boolean(id));

    await client.rolePermission.deleteMany({ where: { roleId: role.id } });
    if (ids.length > 0) {
      await client.rolePermission.createMany({
        data: ids.map((permissionId) => ({
          roleId: role.id,
          permissionId,
        })),
        skipDuplicates: true,
      });
    }
    console.log(`✓ ${roleCode} → ${ids.length} permission(s)`);
  }

  await syncRole("SUPER_ADMIN", PERMS_SUPER);
  await syncRole("ADMIN", PERMS_ADMIN);

  console.log(`✓ ${CATALOGUE_PERMISSIONS.length} permissions catalogue`);
}
