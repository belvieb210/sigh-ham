"use client";

import type { PrioriteMessage, TypeConversation } from "@/generated/prisma/enums";
import type { ContactMessagerie, ConversationResume } from "@/lib/messagerie/types";
import type { TFunction } from "i18next";
import i18n from "@/lib/i18n";
import { estLangueSupportee } from "@/lib/i18n-config";

function traduireCleMessagerie(cle: string, locale: string, t?: TFunction): string {
  if (t) return t(cle);
  const lngBrut = i18n.resolvedLanguage ?? locale.split("-")[0];
  const lng = estLangueSupportee(lngBrut) ? lngBrut : "fr";
  return i18n.t(cle, { lng });
}

export function formaterHeureMessage(iso: string, locale: string, t?: TFunction): string {
  const date = new Date(iso);
  const maintenant = new Date();
  const memeJour =
    date.getDate() === maintenant.getDate() &&
    date.getMonth() === maintenant.getMonth() &&
    date.getFullYear() === maintenant.getFullYear();

  if (memeJour) {
    return date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  }

  const hier = new Date(maintenant);
  hier.setDate(hier.getDate() - 1);
  const estHier =
    date.getDate() === hier.getDate() &&
    date.getMonth() === hier.getMonth() &&
    date.getFullYear() === hier.getFullYear();

  if (estHier) {
    return traduireCleMessagerie("reception.messagerie.dates.hier", locale, t);
  }

  return date.toLocaleDateString(locale, { day: "2-digit", month: "short" });
}

export function couleurPriorite(priorite: PrioriteMessage): string {
  switch (priorite) {
    case "CRITIQUE":
      return "bg-red-600 text-white";
    case "URGENTE":
      return "bg-amber-500 text-white";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export function iconeTypeConversation(type: TypeConversation): string {
  switch (type) {
    case "CANAL_SALLE":
      return "#";
    case "GROUPE":
      return "G";
    default:
      return "";
  }
}

export function couleurAvatarConversation(type: TypeConversation): string {
  switch (type) {
    case "CANAL_SALLE":
      return "bg-bleu-medical text-white";
    case "GROUPE":
      return "bg-violet-600 text-white";
    default:
      return "bg-degrade-ham text-white";
  }
}

export function initialesParticipant(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

export function formaterTailleFichier(octets: number): string {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
}

export function libelleDateGroupe(iso: string, locale: string, t?: TFunction): string {
  const date = new Date(iso);
  const maintenant = new Date();
  const memeJour =
    date.getDate() === maintenant.getDate() &&
    date.getMonth() === maintenant.getMonth() &&
    date.getFullYear() === maintenant.getFullYear();

  if (memeJour) {
    return traduireCleMessagerie("reception.messagerie.dates.aujourdhui", locale, t);
  }

  const hier = new Date(maintenant);
  hier.setDate(hier.getDate() - 1);
  const estHier =
    date.getDate() === hier.getDate() &&
    date.getMonth() === hier.getMonth() &&
    date.getFullYear() === hier.getFullYear();

  if (estHier) {
    return traduireCleMessagerie("reception.messagerie.dates.hier", locale, t);
  }

  return date.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: date.getFullYear() !== maintenant.getFullYear() ? "numeric" : undefined,
  });
}

export interface GroupeMessagesParDate {
  cle: string;
  libelle: string;
  messages: import("@/lib/messagerie/types").MessageConversation[];
}

export function grouperMessagesParDate(
  messages: import("@/lib/messagerie/types").MessageConversation[],
  locale: string,
  t?: TFunction
): GroupeMessagesParDate[] {
  const map = new Map<string, GroupeMessagesParDate>();

  for (const msg of messages) {
    const date = new Date(msg.envoyeLe);
    const cle = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const existant = map.get(cle);
    if (existant) {
      existant.messages.push(msg);
    } else {
      map.set(cle, {
        cle,
        libelle: libelleDateGroupe(msg.envoyeLe, locale, t),
        messages: [msg],
      });
    }
  }

  return Array.from(map.values());
}

export function extraireMediasMessages(
  messages: import("@/lib/messagerie/types").MessageConversation[]
): NonNullable<import("@/lib/messagerie/types").MessageConversation["piecesJointes"]> {
  const medias: NonNullable<
    import("@/lib/messagerie/types").MessageConversation["piecesJointes"]
  > = [];

  for (const msg of messages) {
    if (!msg.piecesJointes?.length) continue;
    for (const pj of msg.piecesJointes) {
      medias.push(pj);
    }
  }

  return medias.reverse();
}

export function estImageMime(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

export function estPdfMime(mimeType: string): boolean {
  return mimeType === "application/pdf" || mimeType.endsWith("/pdf");
}

const MIME_PAR_EXTENSION: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export function mimeTypeFichier(fichier: File): string {
  if (fichier.type) return fichier.type;
  const ext = fichier.name.split(".").pop()?.toLowerCase();
  return MIME_PAR_EXTENSION[ext ?? ""] ?? "application/octet-stream";
}

export function estImageFichier(fichier: File): boolean {
  return estImageMime(mimeTypeFichier(fichier));
}

export function estPdfFichier(fichier: File): boolean {
  return estPdfMime(mimeTypeFichier(fichier));
}

/** Ex. « Dorcas Kabongo » → « Dorcas K. » */
export function formaterNomCourtExpediteur(nomComplet: string): string {
  const parts = nomComplet.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  const prenom = parts[0];
  const nom = parts[parts.length - 1];
  return `${prenom} ${nom.charAt(0).toUpperCase()}.`;
}

export function formaterHeureListe(iso: string, locale: string, t?: TFunction): string {
  const date = new Date(iso);
  const maintenant = new Date();
  const memeJour =
    date.getDate() === maintenant.getDate() &&
    date.getMonth() === maintenant.getMonth() &&
    date.getFullYear() === maintenant.getFullYear();

  if (memeJour) {
    return date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  }

  const hier = new Date(maintenant);
  hier.setDate(hier.getDate() - 1);
  const estHier =
    date.getDate() === hier.getDate() &&
    date.getMonth() === hier.getMonth() &&
    date.getFullYear() === hier.getFullYear();

  if (estHier) {
    return traduireCleMessagerie("reception.messagerie.dates.hier", locale, t);
  }

  return date.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" });
}

export interface BrouillonDirect {
  contact: ContactMessagerie;
  /** Conversation directe vide déjà en base (legacy) — réutilisée à l'envoi */
  conversationId?: string;
}

export function construireConversationBrouillon(
  brouillon: BrouillonDirect,
  utilisateurId: string,
  moi: { prenom: string; nom: string }
): ConversationResume {
  const { contact } = brouillon;
  return {
    id: brouillon.conversationId ?? `brouillon-${contact.id}`,
    type: "DIRECT",
    sujet: null,
    photoUrl: null,
    salleCode: null,
    epingle: false,
    epinglePerso: false,
    nonLus: 0,
    dernierMessage: null,
    participants: [
      { id: utilisateurId, prenom: moi.prenom, nom: moi.nom, role: "", roleGroupe: "MEMBRE" },
      {
        id: contact.id,
        prenom: contact.prenom,
        nom: contact.nom,
        role: contact.role,
        roleGroupe: "MEMBRE",
      },
    ],
    libelle: `${contact.prenom} ${contact.nom}`,
    sousTitre: null,
  };
}
