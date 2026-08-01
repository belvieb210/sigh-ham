"use client";

import {
  AlertTriangle,
  Check,
  CheckCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { MessageConversation } from "@/lib/messagerie/types";
import type { PrioriteMessage } from "@/generated/prisma/enums";
import { AvatarMessagerie } from "@/features/messagerie/composants/avatar-messagerie";
import { CartePieceJointe } from "@/features/messagerie/composants/carte-piece-jointe";
import { MenuActionsMessage } from "@/features/messagerie/composants/menu-actions-message";
import { traduireContenuMessage } from "@/features/messagerie/traduire-contenu-message";
import { traduireRoleHospitalier } from "@/features/messagerie/traduire-role";
import {
  couleurPriorite,
  formaterHeureMessage,
} from "@/features/messagerie/utilitaires-messagerie";
import { cn } from "@/lib/utils";

interface PropsBulleMessage {
  message: MessageConversation;
  locale: string;
  onReagir: (messageId: string, emoji: string) => void;
  onRepondre: (message: MessageConversation) => void;
  onCopier: (message: MessageConversation) => void;
  onTransférer: (message: MessageConversation) => void;
  onEpingle: (messageId: string) => void;
  onModifier: (message: MessageConversation) => void;
  onSupprimer: (messageId: string, portee: "moi" | "tous") => void;
}

const DELAI_MODIFICATION_MS = 15 * 60 * 1000;

export function BulleMessage({
  message: msg,
  locale,
  onReagir,
  onRepondre,
  onCopier,
  onTransférer,
  onEpingle,
  onModifier,
  onSupprimer,
}: PropsBulleMessage) {
  const { t } = useTranslation();

  const epingle = !msg.supprime && (msg.reactions?.some((r) => r.emoji === "EPINGLE") ?? false);
  const peutModifier =
    msg.estMoi &&
    !msg.supprime &&
    Date.now() - new Date(msg.envoyeLe).getTime() < DELAI_MODIFICATION_MS;

  const contenuAffiche = msg.supprime
    ? t("reception.messagerie.messageSupprime")
    : traduireContenuMessage(msg.contenu, t);

  return (
    <div className={cn("group/message flex gap-2", msg.estMoi ? "justify-end" : "justify-start")}>
      {!msg.estMoi && (
        <AvatarMessagerie
          prenom={msg.expediteur.prenom}
          nom={msg.expediteur.nom}
          taille="sm"
          className="mt-1"
        />
      )}
      <div className={cn("relative max-w-[85%] sm:max-w-[70%]", msg.estMoi && "ml-auto")}>
        {!msg.estMoi && (
          <p className="mb-1 px-1 text-[11px] font-semibold text-texte-principal">
            {msg.expediteur.prenom} {msg.expediteur.nom}
            <span className="ml-1 font-normal text-texte-secondaire">
              ({traduireRoleHospitalier(msg.expediteur.role, t)})
            </span>
          </p>
        )}
        <div
          className={cn(
            "relative rounded-2xl px-4 py-2.5 shadow-sm",
            msg.estMoi
              ? "rounded-br-md bg-bleu-medical text-white"
              : "rounded-bl-md border border-gris-bordure bg-white text-texte-principal",
            epingle && "ring-2 ring-amber-400/60",
            msg.supprime && (msg.estMoi ? "bg-bleu-medical/80" : "bg-gris-tres-clair")
          )}
        >
          {!msg.supprime && (
            <MenuActionsMessage
              message={msg}
              estMoi={msg.estMoi}
              epingle={epingle}
              peutModifier={peutModifier}
              alignement={msg.estMoi ? "droite" : "gauche"}
              onRepondre={() => onRepondre(msg)}
              onCopier={() => onCopier(msg)}
              onTransférer={() => onTransférer(msg)}
              onEpingle={() => onEpingle(msg.id)}
              onModifier={() => onModifier(msg)}
              onSupprimer={(portee) => onSupprimer(msg.id, portee)}
            />
          )}

          {epingle && (
            <span
              className={cn(
                "absolute -top-2 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase",
                msg.estMoi
                  ? "right-2 bg-amber-400 text-amber-950"
                  : "left-2 bg-amber-100 text-amber-800"
              )}
            >
              📌 {t("reception.messagerie.actionsMessage.epingle")}
            </span>
          )}

          {msg.messageParent && !msg.supprime && (
            <div
              className={cn(
                "mb-2 rounded-lg border-l-2 px-2 py-1 text-xs",
                msg.estMoi
                  ? "border-white/40 bg-white/10"
                  : "border-bleu-medical/50 bg-gris-tres-clair"
              )}
            >
              <p className="font-semibold">{msg.messageParent.expediteurNom}</p>
              <p className="truncate opacity-80">
                {msg.messageParent.contenu
                  ? traduireContenuMessage(msg.messageParent.contenu, t)
                  : t("reception.messagerie.messageSupprime")}
              </p>
            </div>
          )}
          {!msg.supprime && msg.priorite !== "NORMALE" && (
            <span
              className={cn(
                "mb-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                couleurPriorite(msg.priorite as PrioriteMessage)
              )}
            >
              {msg.priorite === "CRITIQUE" && <AlertTriangle className="h-3 w-3" />}
              {t(`reception.messagerie.priorites.${msg.priorite}`)}
            </span>
          )}
          <p
            className={cn(
              "whitespace-pre-wrap break-words text-sm",
              msg.supprime && "italic opacity-80"
            )}
          >
            {contenuAffiche}
          </p>
          {msg.modifieLe && !msg.supprime && (
            <p
              className={cn(
                "mt-0.5 text-[10px] italic",
                msg.estMoi ? "text-white/60" : "text-texte-secondaire"
              )}
            >
              {t("reception.messagerie.actionsMessage.modifie")}
            </p>
          )}
          {!msg.supprime &&
            msg.piecesJointes?.map((pj) => (
              <CartePieceJointe key={pj.id} piece={pj} estMoi={msg.estMoi} />
            ))}

          {!msg.supprime &&
            msg.reactions &&
            msg.reactions.filter((r) => r.emoji !== "EPINGLE").length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {msg.reactions
                .filter((r) => r.emoji !== "EPINGLE")
                .map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onReagir(msg.id, r.emoji)}
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-xs",
                      msg.estMoi ? "bg-white/15" : "bg-gris-tres-clair"
                    )}
                  >
                    {r.emoji === "POUCES" ? "👍" : r.emoji === "COEUR" ? "❤️" : "✅"}
                  </button>
                ))}
            </div>
          )}

          <div
            className={cn(
              "mt-1 flex items-center justify-end gap-1 text-[10px]",
              msg.estMoi ? "text-white/70" : "text-texte-secondaire"
            )}
          >
            <span>{formaterHeureMessage(msg.envoyeLe, locale, t)}</span>
            {msg.estMoi &&
              (msg.nbLectures > 1 ? (
                <CheckCheck className="h-3.5 w-3.5" aria-label={t("reception.messagerie.lu")} />
              ) : (
                <Check className="h-3.5 w-3.5" aria-label={t("reception.messagerie.envoye")} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
