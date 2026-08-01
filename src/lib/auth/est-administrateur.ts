/** Rôle autorisé à diffuser des annonces institutionnelles. */
export function estRoleAdministrateur(role: {
  code: string;
  systeme?: boolean | null;
}): boolean {
  return Boolean(
    role.systeme || role.code === "ADMIN" || role.code === "SUPER_ADMIN"
  );
}
