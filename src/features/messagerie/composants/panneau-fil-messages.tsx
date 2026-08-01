"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Loader2,
  MessageSquarePlus,
  MoreVertical,
  Paperclip,
  Pin,
  Send,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ConversationResume, MessageConversation } from "@/lib/messagerie/types";
import type { PrioriteMessage } from "@/generated/prisma/enums";
import { AvatarMessagerie } from "@/features/messagerie/composants/avatar-messagerie";
import { ApercuPiecesJointesBrouillon } from "@/features/messagerie/composants/apercu-pieces-jointes-brouillon";
import { BulleMessage } from "@/features/messagerie/composants/bulle-message";
import { traduireContenuMessage } from "@/features/messagerie/traduire-contenu-message";
import {
  couleurPriorite,
  grouperMessagesParDate,
} from "@/features/messagerie/utilitaires-messagerie";
import { cn } from "@/lib/utils";

interface PropsPanneauFilMessages {
  conversation: ConversationResume | null;
  messages: MessageConversation[];
  chargementMessages: boolean;
  locale: string;
  libelleActif: { libelle: string; sousTitre: string | null } | null;
  nbEnLigne: number;
  texteMessage: string;
  onTexteChange: (valeur: string) => void;
  priorite: PrioriteMessage;
  onPrioriteChange: (p: PrioriteMessage) => void;
  fichiersLocaux: File[];
  onFichiersChange: (fichiers: File[]) => void;
  messageReponse: MessageConversation | null;
  onAnnulerReponse: () => void;
  envoiEnCours: boolean;
  onEnvoyer: () => void;
  onReagir: (messageId: string, emoji: string) => void;
  onRepondre: (message: MessageConversation) => void;
  onCopier: (message: MessageConversation) => void;
  onTransférer: (message: MessageConversation) => void;
  onEpingleMessage: (messageId: string) => void;
  onModifier: (message: MessageConversation) => void;
  onSupprimerMessage: (messageId: string, portee: "moi" | "tous") => void;
  onEpingle: () => void;
  peutEpingle?: boolean;
  onRetourListe: () => void;
  onOuvrirDetails?: () => void;
  vueMobileFil: boolean;
  filRef: React.RefObject<HTMLDivElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function PanneauFilMessages({
  conversation,
  messages,
  chargementMessages,
  locale,
  libelleActif,
  nbEnLigne,
  texteMessage,
  onTexteChange,
  priorite,
  onPrioriteChange,
  fichiersLocaux,
  onFichiersChange,
  messageReponse,
  onAnnulerReponse,
  envoiEnCours,
  onEnvoyer,
  onReagir,
  onRepondre,
  onCopier,
  onTransférer,
  onEpingleMessage,
  onModifier,
  onSupprimerMessage,
  onEpingle,
  peutEpingle = true,
  onRetourListe,
  onOuvrirDetails,
  vueMobileFil,
  filRef,
  textareaRef,
}: PropsPanneauFilMessages) {
  const { t } = useTranslation();
  const [menuPriorite, setMenuPriorite] = useState(false);

  const groupes = grouperMessagesParDate(messages, locale, t);
  const estEpinglee = conversation?.epinglePerso ?? false;
  const libelleEpingle = estEpinglee
    ? t("reception.messagerie.desepingle")
    : t("reception.messagerie.epingle");

  if (!conversation) {
    return (
      <section className="hidden min-w-0 flex-1 flex-col md:flex">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bleu-medical-clair">
            <MessageSquarePlus className="h-8 w-8 text-bleu-medical" />
          </div>
          <h3 className="text-lg font-semibold text-texte-principal">
            {t("reception.messagerie.selectionnerConversation")}
          </h3>
          <p className="max-w-sm text-sm text-texte-secondaire">
            {t("reception.messagerie.selectionnerDescription")}
          </p>
        </div>
      </section>
    );
  }

  const totalMembres = conversation.participants.length;

  return (
    <section
      className={cn(
        "relative flex min-w-0 flex-1 flex-col bg-[#f8fafc]",
        !conversation && "hidden md:flex",
        conversation && !vueMobileFil && "hidden md:flex",
        conversation && vueMobileFil && "flex"
      )}
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-gris-bordure bg-white px-4 py-3">
        <button
          type="button"
          className="rounded-lg p-2 text-texte-secondaire hover:bg-gris-tres-clair md:hidden"
          onClick={onRetourListe}
          aria-label={t("reception.messagerie.retourListe")}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <AvatarMessagerie
          type={conversation.type}
          libelle={libelleActif?.libelle ?? conversation.libelle}
          imageUrl={conversation.photoUrl}
          taille="sm"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-texte-principal">
            {libelleActif?.libelle ?? conversation.libelle}
          </h3>
          <p className="truncate text-xs text-texte-secondaire">
            {t("reception.messagerie.pro.membresEnLigne", {
              total: totalMembres,
              enLigne: nbEnLigne,
            })}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {peutEpingle && (
            <button
              type="button"
              onClick={onEpingle}
              aria-label={libelleEpingle}
              aria-pressed={estEpinglee}
              title={libelleEpingle}
              className={cn(
                "rounded-lg p-2 transition-colors",
                estEpinglee
                  ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                  : "text-texte-secondaire hover:bg-gris-tres-clair hover:text-texte-principal"
              )}
            >
              <Pin className={cn("h-4 w-4", estEpinglee && "fill-current")} />
            </button>
          )}
          {onOuvrirDetails && (
            <button
              type="button"
              onClick={onOuvrirDetails}
              className="rounded-lg p-2 text-texte-secondaire hover:bg-gris-tres-clair lg:hidden"
              aria-label={t("reception.messagerie.pro.detailsConversation")}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      <div ref={filRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {chargementMessages ? (
          <div className="space-y-4" aria-busy="true">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex animate-pulse gap-2">
                <div className="h-8 w-8 rounded-full bg-slate-200" />
                <div className="h-16 flex-1 rounded-2xl bg-slate-100" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-texte-secondaire">
            {t("reception.messagerie.aucunMessage")}
          </p>
        ) : (
          <div className="space-y-4">
            {groupes.map((groupe) => (
              <div key={groupe.cle}>
                <div className="relative my-4 flex items-center">
                  <div className="flex-1 border-t border-gris-bordure" />
                  <span className="mx-3 shrink-0 rounded-full bg-white px-3 py-0.5 text-[11px] font-semibold text-texte-secondaire shadow-sm">
                    {groupe.libelle}
                  </span>
                  <div className="flex-1 border-t border-gris-bordure" />
                </div>
                <div className="space-y-3">
                  {groupe.messages.map((msg) => (
                    <BulleMessage
                      key={msg.id}
                      message={msg}
                      locale={locale}
                      onReagir={onReagir}
                      onRepondre={onRepondre}
                      onCopier={onCopier}
                      onTransférer={onTransférer}
                      onEpingle={onEpingleMessage}
                      onModifier={onModifier}
                      onSupprimer={onSupprimerMessage}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-gris-bordure bg-white p-3">
        {messageReponse && (
          <div className="mb-2 flex items-center justify-between rounded-lg bg-gris-tres-clair px-3 py-2 text-xs">
            <div>
              <p className="font-semibold">
                {t("reception.messagerie.pro.reponseA", {
                  nom: messageReponse.expediteur.prenom,
                })}
              </p>
              <p className="truncate text-texte-secondaire">
                {traduireContenuMessage(messageReponse.contenu, t)}
              </p>
            </div>
            <button type="button" onClick={onAnnulerReponse} aria-label={t("reception.messagerie.annuler")}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <ApercuPiecesJointesBrouillon
          fichiers={fichiersLocaux}
          onRetirer={(index) =>
            onFichiersChange(fichiersLocaux.filter((_, i) => i !== index))
          }
        />
        <div className="flex items-end gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuPriorite((v) => !v)}
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gris-bordure text-texte-secondaire hover:bg-gris-tres-clair",
                priorite !== "NORMALE" && "border-amber-300 bg-amber-50 text-amber-700"
              )}
              title={t("reception.messagerie.pro.priorite")}
              aria-label={t("reception.messagerie.pro.priorite")}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
            {menuPriorite && (
              <div className="absolute bottom-full left-0 z-10 mb-1 w-36 rounded-lg border border-gris-bordure bg-white py-1 shadow-lg">
                {(["NORMALE", "URGENTE", "CRITIQUE"] as PrioriteMessage[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      onPrioriteChange(p);
                      setMenuPriorite(false);
                    }}
                    className={cn(
                      "block w-full px-3 py-1.5 text-left text-xs font-semibold hover:bg-gris-tres-clair",
                      priorite === p && couleurPriorite(p)
                    )}
                  >
                    {t(`reception.messagerie.priorites.${p}`)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <label className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-gris-bordure text-texte-secondaire hover:bg-gris-tres-clair">
            <Paperclip className="h-5 w-5" />
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length > 0) {
                  onFichiersChange([...fichiersLocaux, ...files]);
                }
                e.target.value = "";
              }}
            />
          </label>
          <textarea
            ref={textareaRef}
            value={texteMessage}
            onChange={(e) => onTexteChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onEnvoyer();
              }
            }}
            rows={1}
            placeholder={t("reception.messagerie.pro.ecrireMessage")}
            className="min-h-[44px] flex-1 resize-none rounded-xl border border-gris-bordure px-3 py-2.5 text-sm focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15"
          />
          <button
            type="button"
            disabled={(!texteMessage.trim() && fichiersLocaux.length === 0) || envoiEnCours}
            onClick={onEnvoyer}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bleu-medical text-white transition hover:bg-bleu-medical-fonce disabled:opacity-40"
            aria-label={t("reception.messagerie.envoyer")}
          >
            {envoiEnCours ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
