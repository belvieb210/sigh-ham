"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import {
  CarteNotification,
  type NotificationItem,
} from "@/features/notifications/composants/carte-notification";
import { useNotificationsLive } from "@/features/notifications/hooks/use-notifications-live";
import { EVENT_RAFRAICHIR_NOTIFICATIONS } from "@/features/notifications/utilitaires-notifications";
import { cn } from "@/lib/utils";

const LIEN_CENTRE = "/sigh/reception/notifications";

export function BoutonNotificationsEnTete() {
  const { t } = useTranslation();
  const { totalNonLues, rafraichir } = useNotificationsLive();
  const [ouvert, setOuvert] = useState(false);
  const [recentes, setRecentes] = useState<NotificationItem[]>([]);
  const [chargementListe, setChargementListe] = useState(false);
  const conteneurRef = useRef<HTMLDivElement>(null);

  const chargerRecentes = useCallback(async () => {
    setChargementListe(true);
    try {
      const res = await fetch("/api/notifications?filtre=non_lus");
      if (!res.ok) return;
      const data = (await res.json()) as { notifications: NotificationItem[] };
      setRecentes(data.notifications.slice(0, 5));
    } finally {
      setChargementListe(false);
    }
  }, []);

  useEffect(() => {
    if (!ouvert) return;
    void chargerRecentes();
    void rafraichir();
  }, [ouvert, chargerRecentes, rafraichir]);

  useEffect(() => {
    const handler = () => {
      void rafraichir();
      if (ouvert) void chargerRecentes();
    };
    window.addEventListener(EVENT_RAFRAICHIR_NOTIFICATIONS, handler);
    return () => window.removeEventListener(EVENT_RAFRAICHIR_NOTIFICATIONS, handler);
  }, [ouvert, chargerRecentes, rafraichir]);

  useEffect(() => {
    if (!ouvert) return;
    const fermerSiExterieur = (e: MouseEvent) => {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target as Node)) {
        setOuvert(false);
      }
    };
    document.addEventListener("mousedown", fermerSiExterieur);
    return () => document.removeEventListener("mousedown", fermerSiExterieur);
  }, [ouvert]);

  const marquerLue = async (id: string) => {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "lu" }),
    });
    void chargerRecentes();
    void rafraichir();
    window.dispatchEvent(new CustomEvent(EVENT_RAFRAICHIR_NOTIFICATIONS));
  };

  const toutMarquerLu = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setRecentes([]);
    void rafraichir();
    window.dispatchEvent(new CustomEvent(EVENT_RAFRAICHIR_NOTIFICATIONS));
  };

  return (
    <div ref={conteneurRef} className="relative">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        className={cn(
          "relative rounded-lg p-2 transition-colors",
          ouvert
            ? "bg-bleu-medical-clair text-bleu-medical"
            : "text-texte-secondaire hover:bg-gris-tres-clair hover:text-texte-principal"
        )}
        aria-label={t("reception.layout.notifications")}
        aria-expanded={ouvert}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5" />
        {totalNonLues > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 animate-pulse items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white sm:right-1 sm:top-1 sm:h-[18px] sm:min-w-[18px] sm:text-[10px]">
            {totalNonLues > 99 ? "99+" : totalNonLues}
          </span>
        )}
      </button>

      {ouvert && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-1.5rem,22rem)] overflow-hidden rounded-2xl border border-gris-bordure bg-white shadow-2xl sm:w-96">
          <div className="flex items-center justify-between border-b border-gris-bordure bg-gradient-to-r from-bleu-medical-clair/80 to-white px-4 py-3">
            <div>
              <p className="text-sm font-bold text-texte-principal">
                {t("reception.notificationsCentre.titre")}
              </p>
              <p className="text-[11px] text-texte-secondaire">
                {t("reception.notificationsCentre.sousTitre", { count: totalNonLues })}
              </p>
            </div>
            {totalNonLues > 0 && (
              <button
                type="button"
                onClick={() => void toutMarquerLu()}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-bleu-medical hover:bg-bleu-medical-clair"
              >
                <CheckCheck className="h-3 w-3" />
                {t("reception.notificationsCentre.toutLu")}
              </button>
            )}
          </div>

          <div className="max-h-[min(60vh,420px)] overflow-y-auto">
            {chargementListe ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-bleu-medical" />
              </div>
            ) : recentes.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto h-8 w-8 text-texte-secondaire/30" />
                <p className="mt-2 text-xs text-texte-secondaire">
                  {t("reception.notificationsCentre.aucune")}
                </p>
              </div>
            ) : (
              <ul>
                {recentes.map((n) => (
                  <CarteNotification
                    key={n.id}
                    notification={n}
                    compact
                    onMarquerLue={(id) => void marquerLue(id)}
                    onCliquer={() => setOuvert(false)}
                  />
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-gris-bordure bg-slate-50 px-4 py-2.5">
            <Link
              href={LIEN_CENTRE}
              onClick={() => setOuvert(false)}
              className="block rounded-lg py-2 text-center text-xs font-bold text-bleu-medical hover:bg-bleu-medical-clair"
            >
              {t("reception.notificationsCentre.voirTout")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
