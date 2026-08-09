import "server-only";
import type { CodeSalle } from "@/generated/prisma/enums";

export function lienMessagerieReception(conversationId: string): string {
  return `/sigh/reception/messagerie?conversation=${encodeURIComponent(conversationId)}`;
}

/** Page file / transferts selon la salle de destination. */
export function lienFileSalle(code: CodeSalle): string {
  switch (code) {
    case "LABORATOIRE":
      return "/sigh/laboratoire/patients";
    case "CAISSE":
      return "/sigh/caisse/transferts";
    case "RECEPTION":
      return "/sigh/reception/transferts";
    case "PHARMACIE":
      return "/sigh/pharmacie";
    case "INFIRMIERS":
      return "/sigh/infirmiers";
    case "MEDECINS":
      return "/sigh/medecins/file-attente";
    case "MEDECINS_EXTERNES":
      return "/sigh/medecins-externes/patients";
    case "EGLISE":
      return "/sigh/eglise/transferts";
    case "HOSPITALISATION":
      return "/sigh/medecins/hospitalisations";
    default:
      return "/sigh/reception/transferts";
  }
}

/** Centre de notifications selon le préfixe de route courant. */
export function lienCentreNotificationsDepuisChemin(pathname: string): string {
  if (pathname.startsWith("/sigh/laboratoire")) {
    return "/sigh/laboratoire/notifications";
  }
  if (pathname.startsWith("/sigh/caisse")) {
    return "/sigh/caisse/notifications";
  }
  if (pathname.startsWith("/sigh/reception")) {
    return "/sigh/reception/notifications";
  }
  if (pathname.startsWith("/sigh/medecins-externes")) {
    return "/sigh/medecins-externes/notifications";
  }
  if (pathname.startsWith("/sigh/medecins")) {
    return "/sigh/medecins/notifications";
  }
  if (pathname.startsWith("/sigh/infirmiers")) {
    return "/sigh/infirmiers/notifications";
  }
  if (pathname.startsWith("/sigh/eglise")) {
    return "/sigh/eglise/notifications";
  }
  if (pathname.startsWith("/sigh/pharmacie")) {
    return "/sigh/pharmacie/notifications";
  }
  return "/sigh/notifications";
}
