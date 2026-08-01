import type { TFunction } from "i18next";
import type { CodeSalle, TypeConversation } from "@/generated/prisma/enums";
import type { ConversationResume } from "@/lib/messagerie/types";

interface ParticipantLibelle {
  id: string;
  prenom: string;
  nom: string;
}

/** Traduit le nom d'une salle (CodeSalle) via i18n, avec repli sur orientations. */
export function traduireSalle(code: CodeSalle | null | undefined, t: TFunction): string | null {
  if (!code) return null;
  const cle = `reception.messagerie.salles.${code}`;
  const traduit = t(cle, { defaultValue: "" });
  if (traduit) return traduit;
  const orient = t(`reception.orientations.${code}.label`, { defaultValue: "" });
  return orient || code;
}

function traduireHashtagCanal(salle: string, t: TFunction): string {
  const slug = salle.toLowerCase().replace(/\s+/g, "-");
  return t("reception.messagerie.canal.hashtag", { nom: slug, defaultValue: `#${slug}` });
}

/** Libellé affiché d'une conversation — recalculé côté client selon la langue active. */
export function traduireConversation(
  conv: Pick<
    ConversationResume,
    "type" | "sujet" | "salleCode" | "participants" | "libelle" | "sousTitre"
  >,
  utilisateurId: string,
  t: TFunction
): { libelle: string; sousTitre: string | null } {
  if (conv.type === "CANAL_SALLE" && conv.salleCode) {
    const salle = traduireSalle(conv.salleCode, t) ?? conv.salleCode;
    return {
      libelle: traduireHashtagCanal(salle, t),
      sousTitre: t("reception.messagerie.canal.officiel", { salle }),
    };
  }

  if (conv.type === "DIFFUSION") {
    return {
      libelle: conv.sujet?.trim() || t("reception.messagerie.types.DIFFUSION"),
      sousTitre: t("reception.messagerie.diffusion.titre"),
    };
  }

  if (conv.type === "GROUPE" && !conv.sujet?.trim()) {
    const autres = conv.participants.filter((p) => p.id !== utilisateurId);
    return {
      libelle: t("reception.messagerie.groupe.interServices"),
      sousTitre: autres.length
        ? autres.map((p) => `${p.prenom} ${p.nom}`).join(", ")
        : t("reception.messagerie.groupe.defaut"),
    };
  }

  if (conv.sujet?.trim()) {
    const autres = conv.participants.filter((p) => p.id !== utilisateurId);
    return {
      libelle: conv.sujet.trim(),
      sousTitre: autres.length
        ? autres.map((p) => `${p.prenom} ${p.nom}`).join(", ")
        : null,
    };
  }

  if (conv.type === "DIRECT") {
    const autre = conv.participants.find((p) => p.id !== utilisateurId);
    if (autre) {
      return { libelle: `${autre.prenom} ${autre.nom}`, sousTitre: null };
    }
  }

  const noms = conv.participants
    .filter((p) => p.id !== utilisateurId)
    .map((p) => `${p.prenom} ${p.nom}`);

  return {
    libelle: noms.length ? noms.join(", ") : t("reception.messagerie.conversation.defaut"),
    sousTitre:
      conv.type === "GROUPE" ? t("reception.messagerie.groupe.defaut") : null,
  };
}

/** Recherche locale sur libellés traduits + contenu brut. */
export function conversationCorrespondRecherche(
  conv: ConversationResume,
  utilisateurId: string,
  q: string,
  t: TFunction
): boolean {
  const terme = q.trim().toLowerCase();
  if (!terme) return true;

  const { libelle, sousTitre } = traduireConversation(conv, utilisateurId, t);

  return (
    libelle.toLowerCase().includes(terme) ||
    (sousTitre?.toLowerCase().includes(terme) ?? false) ||
    (conv.sujet?.toLowerCase().includes(terme) ?? false) ||
    (conv.salleCode?.toLowerCase().includes(terme) ?? false) ||
    conv.participants.some(
      (p) =>
        p.prenom.toLowerCase().includes(terme) ||
        p.nom.toLowerCase().includes(terme) ||
        p.role.toLowerCase().includes(terme)
    ) ||
    (conv.dernierMessage?.contenu.toLowerCase().includes(terme) ?? false)
  );
}

export function traduireContactSalle(
  salleCode: CodeSalle | null,
  salleNom: string | null,
  t: TFunction
): string | null {
  if (salleCode) {
    return traduireSalle(salleCode, t);
  }
  return salleNom;
}
