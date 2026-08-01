"use client";

import { Check, Forward, Loader2, Paperclip, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { traduireContenuMessage } from "@/features/messagerie/traduire-contenu-message";
import { AvatarMessagerie } from "@/features/messagerie/composants/avatar-messagerie";
import { traduireConversation } from "@/features/messagerie/traduire-conversation";
import type { ConversationResume, MessageConversation } from "@/lib/messagerie/types";
import { cn } from "@/lib/utils";

interface PropsModaleTransfertMessage {
  ouverte: boolean;
  message: MessageConversation | null;
  conversations: ConversationResume[];
  conversationSourceId: string | null;
  utilisateurId: string;
  estEnLigne?: (id: string) => boolean;
  onFermer: () => void;
  onTransferer: (conversationIds: string[]) => Promise<void>;
}

function trierParActivite(conversations: ConversationResume[]): ConversationResume[] {
  return [...conversations].sort((a, b) => {
    const da = a.dernierMessage?.envoyeLe ?? "";
    const db = b.dernierMessage?.envoyeLe ?? "";
    return db.localeCompare(da);
  });
}

function participantDirect(conv: ConversationResume, utilisateurId: string) {
  if (conv.type !== "DIRECT") return null;
  return conv.participants.find((p) => p.id !== utilisateurId) ?? conv.participants[0] ?? null;
}

function enLigneConversation(
  conv: ConversationResume,
  utilisateurId: string,
  estEnLigne?: (id: string) => boolean
): boolean | undefined {
  if (!estEnLigne) return undefined;
  const direct = participantDirect(conv, utilisateurId);
  if (direct) return estEnLigne(direct.id);
  if (conv.type === "DIRECT") return undefined;
  return conv.participants.some((p) => p.id !== utilisateurId && estEnLigne(p.id));
}

export function ModaleTransfertMessage({
  ouverte,
  message,
  conversations,
  conversationSourceId,
  utilisateurId,
  estEnLigne,
  onFermer,
  onTransferer,
}: PropsModaleTransfertMessage) {
  const { t } = useTranslation();
  const [recherche, setRecherche] = useState("");
  const [selection, setSelection] = useState<string[]>([]);
  const [enCours, setEnCours] = useState(false);

  const reinitialiser = useCallback(() => {
    setRecherche("");
    setSelection([]);
    setEnCours(false);
  }, []);

  useEffect(() => {
    if (!ouverte) reinitialiser();
  }, [ouverte, reinitialiser]);

  const conversationsEligibles = useMemo(
    () => conversations.filter((c) => c.id !== conversationSourceId),
    [conversations, conversationSourceId]
  );

  const conversationsFiltrees = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    if (!terme) return trierParActivite(conversationsEligibles);

    return trierParActivite(
      conversationsEligibles.filter((conv) => {
        const { libelle, sousTitre } = traduireConversation(conv, utilisateurId, t);
        return (
          libelle.toLowerCase().includes(terme) ||
          (sousTitre?.toLowerCase().includes(terme) ?? false) ||
          conv.participants.some(
            (p) =>
              `${p.prenom} ${p.nom}`.toLowerCase().includes(terme) ||
              p.role.toLowerCase().includes(terme)
          )
        );
      })
    );
  }, [conversationsEligibles, recherche, utilisateurId, t]);

  const selectionSet = useMemo(() => new Set(selection), [selection]);

  const basculerSelection = (id: string) => {
    setSelection((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const confirmer = async () => {
    if (selection.length === 0 || enCours) return;
    setEnCours(true);
    try {
      await onTransferer(selection);
      onFermer();
    } finally {
      setEnCours(false);
    }
  };

  const libelleTypeConversation = (conv: ConversationResume) => {
    if (conv.type === "CANAL_SALLE") return t("reception.messagerie.actionsMessage.transfererTypeCanal");
    if (conv.type === "GROUPE") return t("reception.messagerie.actionsMessage.transfererTypeGroupe");
    if (conv.type === "DIRECT") return t("reception.messagerie.actionsMessage.transfererTypeDirect");
    return t("reception.messagerie.actionsMessage.transfererTypeAutre");
  };

  if (!ouverte || !message) return null;

  const aPieceJointe = Boolean(message.piecesJointes?.length);
  const apercuContenu = message.supprime
    ? t("reception.messagerie.messageSupprime")
    : traduireContenuMessage(message.contenu.trim(), t) ||
      (aPieceJointe ? t("reception.messagerie.actionsMessage.transfererPieceJointe") : "");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modale-transfert-titre"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !enCours) onFermer();
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-2xl sm:max-h-[85vh] sm:rounded-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-gris-bordure px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bleu-medical-clair text-bleu-medical">
              <Forward className="h-4 w-4" />
            </div>
            <h3 id="modale-transfert-titre" className="text-base font-semibold text-texte-principal">
              {t("reception.messagerie.actionsMessage.transfererTitre")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onFermer}
            disabled={enCours}
            className="rounded-lg p-2 text-texte-secondaire hover:bg-gris-tres-clair disabled:opacity-40"
            aria-label={t("reception.messagerie.annuler")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="shrink-0 border-b border-gris-bordure bg-[#f8fafc] px-4 py-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-texte-secondaire">
            {t("reception.messagerie.actionsMessage.transfererApercu")}
          </p>
          <div className="rounded-xl border border-gris-bordure bg-white p-3 shadow-sm">
            <p className="text-xs font-semibold text-bleu-medical">
              {message.expediteur.prenom} {message.expediteur.nom}
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-texte-principal">{apercuContenu}</p>
            {aPieceJointe && (
              <p className="mt-1.5 flex items-center gap-1 text-[11px] text-texte-secondaire">
                <Paperclip className="h-3.5 w-3.5" />
                {t("reception.messagerie.actionsMessage.transfererNbPiecesJointes", {
                  count: message.piecesJointes!.length,
                })}
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 border-b border-gris-bordure px-4 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire" />
            <input
              type="search"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder={t("reception.messagerie.actionsMessage.transfererRechercher")}
              className="w-full rounded-xl border border-gris-bordure bg-white py-2.5 pl-10 pr-3 text-sm focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15"
              autoFocus
            />
          </div>
          {selection.length > 0 && (
            <p className="mt-2 text-xs font-medium text-bleu-medical">
              {t("reception.messagerie.actionsMessage.transfererSelection", {
                count: selection.length,
              })}
            </p>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {conversationsFiltrees.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-texte-secondaire">
              {t("reception.messagerie.actionsMessage.transfererAucunResultat")}
            </p>
          ) : (
            <ul role="list">
              {conversationsFiltrees.map((conv) => {
                const { libelle, sousTitre } = traduireConversation(conv, utilisateurId, t);
                const direct = participantDirect(conv, utilisateurId);
                const selectionne = selectionSet.has(conv.id);

                return (
                  <li key={conv.id}>
                    <button
                      type="button"
                      disabled={enCours}
                      onClick={() => basculerSelection(conv.id)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left transition",
                        "border-b border-gris-bordure/40 hover:bg-slate-50",
                        selectionne && "bg-bleu-medical-clair/40 hover:bg-bleu-medical-clair/55"
                      )}
                    >
                      <AvatarMessagerie
                        type={conv.type}
                        prenom={direct?.prenom}
                        nom={direct?.nom}
                        libelle={libelle}
                        imageUrl={conv.photoUrl}
                        taille="liste"
                        enLigne={enLigneConversation(conv, utilisateurId, estEnLigne)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-texte-principal">
                          {libelle}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-texte-secondaire">
                          {sousTitre ?? libelleTypeConversation(conv)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition",
                          selectionne
                            ? "border-bleu-medical bg-bleu-medical text-white"
                            : "border-slate-300 bg-white"
                        )}
                        aria-hidden
                      >
                        {selectionne && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-gris-bordure px-4 py-3">
          <button
            type="button"
            onClick={onFermer}
            disabled={enCours}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-texte-secondaire hover:bg-gris-tres-clair disabled:opacity-40"
          >
            {t("reception.messagerie.annuler")}
          </button>
          <button
            type="button"
            disabled={selection.length === 0 || enCours}
            onClick={() => void confirmer()}
            className="inline-flex min-w-[9rem] items-center justify-center gap-2 rounded-xl bg-bleu-medical px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-bleu-medical-fonce disabled:opacity-40"
          >
            {enCours ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("reception.messagerie.actionsMessage.transfererEnCours")}
              </>
            ) : selection.length > 1 ? (
              t("reception.messagerie.actionsMessage.transfererConfirmer_plural", {
                count: selection.length,
              })
            ) : (
              t("reception.messagerie.actionsMessage.transfererConfirmer")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
