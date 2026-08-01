import type { CodeSalle } from "@/generated/prisma/enums";

const LIBELLES_SALLE: Record<CodeSalle, string> = {
  RECEPTION: "Réception",
  INFIRMIERS: "Infirmiers",
  MEDECINS: "Médecins",
  CAISSE: "Caisse",
  LABORATOIRE: "Laboratoire",
  PHARMACIE: "Pharmacie",
  EGLISE: "Église",
  MEDECINS_EXTERNES: "Médecins externes",
  HOSPITALISATION: "Hospitalisation",
  ADMIN: "Administration",
  MESSAGERIE: "Messagerie",
};

export function libelleSalle(code: CodeSalle | null | undefined): string | null {
  if (!code) return null;
  return LIBELLES_SALLE[code] ?? code;
}

export function libelleCanalSalle(code: CodeSalle | null | undefined): string {
  const nom = libelleSalle(code);
  return nom ? `#${nom.toLowerCase().replace(/\s+/g, "-")}` : "#canal";
}

interface ParticipantLibelle {
  id: string;
  prenom: string;
  nom: string;
}

export function libelleConversation(
  type: string,
  sujet: string | null,
  salleCode: CodeSalle | null,
  participants: ParticipantLibelle[],
  utilisateurId: string
): { libelle: string; sousTitre: string | null } {
  if (type === "CANAL_SALLE" && salleCode) {
    return {
      libelle: libelleCanalSalle(salleCode),
      sousTitre: `Canal officiel — ${libelleSalle(salleCode)}`,
    };
  }

  if (sujet?.trim()) {
    const autres = participants.filter((p) => p.id !== utilisateurId);
    return {
      libelle: sujet.trim(),
      sousTitre: autres.length
        ? autres.map((p) => `${p.prenom} ${p.nom}`).join(", ")
        : null,
    };
  }

  if (type === "DIRECT") {
    const autre = participants.find((p) => p.id !== utilisateurId);
    if (autre) {
      return {
        libelle: `${autre.prenom} ${autre.nom}`,
        sousTitre: null,
      };
    }
  }

  const noms = participants
    .filter((p) => p.id !== utilisateurId)
    .map((p) => `${p.prenom} ${p.nom}`);

  return {
    libelle: noms.length ? noms.join(", ") : "Conversation",
    sousTitre: type === "GROUPE" ? "Groupe de travail" : null,
  };
}

export function initialesParticipant(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}
