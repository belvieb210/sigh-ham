/** Rôles créés par le service client — l'admin peut consulter/modifier/bloquer mais pas créer par défaut. */
export const ROLES_GERES_SERVICE_CLIENT = ["MEDECIN_EXTERNE", "AGENT_EGLISE"] as const;

export type RoleGereServiceClient = (typeof ROLES_GERES_SERVICE_CLIENT)[number];

export function estRoleGereParServiceClient(roleCode: string): boolean {
  return (ROLES_GERES_SERVICE_CLIENT as readonly string[]).includes(roleCode);
}

/** Rôles réservés à la création admin (salles internes). */
export function roleAssignableParAdmin(roleCode: string): boolean {
  if (roleCode === "SUPER_ADMIN") return false;
  return !estRoleGereParServiceClient(roleCode);
}
