"use client";

import { Archive, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { traduireNotification } from "@/features/notifications/traduire-notification";
import {
  formaterTempsRelatif,
  styleTypeNotification,
} from "@/features/notifications/utilitaires-notifications";
import type { TypeNotification } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  type: TypeNotification;
  titre: string;
  message: string;
  lu: boolean;
  archivee: boolean;
  lien: string | null;
  creeLe: string;
  module: string | null;
  metadonnees?: Record<string, unknown> | null;
}

interface PropsCarteNotification {
  notification: NotificationItem;
  compact?: boolean;
  onMarquerLue?: (id: string) => void;
  onArchiver?: (id: string) => void;
  onCliquer?: (notification: NotificationItem) => void;
}

export function CarteNotification({
  notification: n,
  compact = false,
  onMarquerLue,
  onArchiver,
  onCliquer,
}: PropsCarteNotification) {
  const { t, i18n } = useTranslation();
  const { titre, message } = traduireNotification(n, t);
  const style = styleTypeNotification(n.type);
  const Icon = style.Icon;

  const handleClick = () => {
    if (!n.lu) onMarquerLue?.(n.id);
    onCliquer?.(n);
    if (n.lien) window.location.href = n.lien;
  };

  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className={cn(
          "group flex cursor-pointer gap-3 border-b border-gris-bordure/50 px-4 transition hover:bg-slate-50",
          compact ? "py-3" : "py-4",
          !n.lu && "border-l-[3px] border-l-bleu-medical bg-bleu-medical-clair/25 hover:bg-bleu-medical-clair/35"
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-xl border",
            compact ? "h-10 w-10" : "h-11 w-11",
            style.fond,
            style.texte,
            style.bordure
          )}
        >
          <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className={cn("text-sm text-texte-principal", !n.lu ? "font-bold" : "font-semibold")}>
              {titre}
            </p>
            <span className="shrink-0 text-[10px] tabular-nums text-texte-secondaire">
              {formaterTempsRelatif(n.creeLe, i18n.language, t)}
            </span>
          </div>
          <p className={cn("mt-0.5 text-texte-secondaire", compact ? "line-clamp-1 text-xs" : "line-clamp-2 text-sm")}>
            {message}
          </p>
          {!compact && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-texte-secondaire ring-1 ring-gris-bordure">
                {t(`reception.notificationsCentre.types.${n.type}`, n.type)}
              </span>
              {!n.lu && onMarquerLue && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarquerLue(n.id);
                  }}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold text-bleu-medical opacity-0 transition group-hover:opacity-100 hover:bg-bleu-medical-clair"
                >
                  <Check className="h-3 w-3" />
                  {t("reception.notificationsCentre.marquerLu")}
                </button>
              )}
              {!n.archivee && onArchiver && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchiver(n.id);
                  }}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-texte-secondaire opacity-0 transition group-hover:opacity-100 hover:bg-gris-tres-clair"
                >
                  <Archive className="h-3 w-3" />
                  {t("reception.notificationsCentre.archiver")}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
