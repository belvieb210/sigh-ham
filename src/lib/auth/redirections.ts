import type { CodeSalle } from "@/generated/prisma/client";

/** Cartographie salle SIGH → route d'accueil du module */
const ROUTES_PAR_SALLE: Record<CodeSalle, string> = {
  RECEPTION: "/sigh/reception",
  INFIRMIERS: "/sigh/infirmiers",
  MEDECINS: "/sigh/medecins",
  CAISSE: "/sigh/caisse",
  LABORATOIRE: "/sigh/laboratoire",
  PHARMACIE: "/sigh/pharmacie",
  EGLISE: "/sigh/eglise",
  MEDECINS_EXTERNES: "/sigh/medecins-externes",
  HOSPITALISATION: "/sigh/hospitalisation",
  ADMIN: "/sigh/admin",
  MESSAGERIE: "/sigh/messagerie",
};

const ROUTES_PAR_ROLE: Record<string, string> = {
  SUPER_ADMIN: "/sigh/admin",
};

type RoleRedirection = {
  code: string;
  salle?: { code: CodeSalle } | null;
};

export function obtenirRouteApresConnexion(role: RoleRedirection): string {
  if (ROUTES_PAR_ROLE[role.code]) {
    return ROUTES_PAR_ROLE[role.code];
  }
  if (role.salle?.code) {
    return ROUTES_PAR_SALLE[role.salle.code] ?? "/sigh/reception";
  }
  return "/sigh/reception";
}

export function utilisateurPeutAccederSalle(
  salleCode: CodeSalle,
  role: RoleRedirection
): boolean {
  if (role.code === "SUPER_ADMIN" || role.code === "ADMIN") return true;
  return role.salle?.code === salleCode;
}
