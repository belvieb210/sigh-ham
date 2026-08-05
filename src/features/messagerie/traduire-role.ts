import type { TFunction } from "i18next";

/** Noms seed (fr) → codes rôle Prisma pour i18n. */
const NOM_VERS_CODE: Record<string, string> = {
  "Super administrateur": "SUPER_ADMIN",
  Administrateur: "ADMIN",
  Réceptionniste: "RECEPTIONNISTE",
  "Infirmier(ère)": "INFIRMIER",
  Médecin: "MEDECIN",
  "Caissier(ère)": "CAISSIER",
  "Laborantin(e)": "LABORANTIN",
  "Pharmacien(ne)": "PHARMACIEN",
  "Agent pastoral": "AGENT_EGLISE",
  "Médecin externe": "MEDECIN_EXTERNE",
  "Infirmier hospitalisation": "INFIRMIER_HOSP",
  "Agent service client": "AGENT_CLIENT",
};

export function traduireRoleHospitalier(role: string, t: TFunction): string {
  const code = NOM_VERS_CODE[role] ?? role;
  const traduit = t(`reception.messagerie.roles.${code}`, { defaultValue: "" });
  return traduit || role;
}
