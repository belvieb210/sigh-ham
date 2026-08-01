"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bell,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
  Search,
  Settings,
} from "lucide-react";
import {
  CarteNotification,
  type NotificationItem,
} from "@/features/notifications/composants/carte-notification";
import { useNotificationsLive } from "@/features/notifications/hooks/use-notifications-live";
import { EVENT_RAFRAICHIR_NOTIFICATIONS } from "@/features/notifications/utilitaires-notifications";
import type { TypeNotification } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

interface PreferencesNotification {
  inApp: boolean;
  tableauBord: boolean;
  push: boolean;
  son: boolean;
  email: boolean;
  sms: boolean;
  silencieux: boolean;
  typesSilencieux: TypeNotification[];
}

const FILTRES_TYPE: (TypeNotification | "tous")[] = [
  "tous",
  "NOUVEAU_MESSAGE",
  "PATIENT_TRANSFERE",
  "NOUVEAU_PATIENT",
  "MENTION",
  "DIFFUSION",
];

export function InterfaceNotifications() {
  const { t } = useTranslation();
  const { totalNonLues, rafraichir, signalerRafraichissement } = useNotificationsLive();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filtre, setFiltre] = useState<"tous" | "non_lus" | "archives">("tous");
  const [filtreType, setFiltreType] = useState<TypeNotification | "tous">("tous");
  const [recherche, setRecherche] = useState("");
  const [chargement, setChargement] = useState(true);
  const [prefsOuvertes, setPrefsOuvertes] = useState(false);
  const [preferences, setPreferences] = useState<PreferencesNotification | null>(null);
  const [sauvegardePrefs, setSauvegardePrefs] = useState(false);
  const [messagePrefs, setMessagePrefs] = useState<string | null>(null);

  const charger = useCallback(async () => {
    try {
      const params = new URLSearchParams({ filtre });
      if (recherche.trim()) params.set("q", recherche.trim());
      if (filtreType !== "tous") params.set("type", filtreType);
      const res = await fetch(`/api/notifications?${params}`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { notifications: NotificationItem[] };
      setNotifications(data.notifications);
    } finally {
      setChargement(false);
    }
  }, [filtre, recherche, filtreType]);

  useEffect(() => {
    setChargement(true);
    void charger();
  }, [charger]);

  useEffect(() => {
    const handler = () => void charger();
    window.addEventListener(EVENT_RAFRAICHIR_NOTIFICATIONS, handler);
    return () => window.removeEventListener(EVENT_RAFRAICHIR_NOTIFICATIONS, handler);
  }, [charger]);

  const chargerPreferences = useCallback(async () => {
    const res = await fetch("/api/notifications/preferences");
    if (res.ok) {
      const data = (await res.json()) as { preferences: PreferencesNotification };
      setPreferences(data.preferences);
    }
  }, []);

  useEffect(() => {
    if (prefsOuvertes && !preferences) void chargerPreferences();
  }, [prefsOuvertes, preferences, chargerPreferences]);

  const enregistrerPreferences = async () => {
    if (!preferences) return;
    setSauvegardePrefs(true);
    setMessagePrefs(null);
    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });
      if (!res.ok) throw new Error();
      setMessagePrefs(t("reception.notificationsCentre.preferences.enregistre"));
      window.dispatchEvent(new CustomEvent("sigh:preferences-notifications"));
    } finally {
      setSauvegardePrefs(false);
    }
  };

  const apresAction = () => {
    void charger();
    void rafraichir();
    signalerRafraichissement();
  };

  const marquerLue = async (id: string) => {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "lu" }),
    });
    apresAction();
  };

  const archiver = async (id: string) => {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "archiver" }),
    });
    apresAction();
  };

  const toutMarquerLu = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    apresAction();
  };

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] min-h-[480px] flex-col overflow-hidden rounded-2xl border border-gris-bordure bg-white shadow-lg">
      <div className="flex shrink-0 flex-col gap-3 border-b border-gris-bordure bg-gradient-to-br from-bleu-medical via-bleu-medical-fonce to-[#1e3a5f] px-4 py-4 text-white sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{t("reception.notificationsCentre.titre")}</h2>
            <p className="text-xs text-white/80">
              {t("reception.notificationsCentre.sousTitre", { count: totalNonLues })}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {totalNonLues > 0 && (
            <button
              type="button"
              onClick={() => void toutMarquerLu()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold backdrop-blur-sm transition hover:bg-white/25"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {t("reception.notificationsCentre.toutLu")}
            </button>
          )}
          <button
            type="button"
            onClick={() => setPrefsOuvertes((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold backdrop-blur-sm transition hover:bg-white/25"
          >
            <Settings className="h-3.5 w-3.5" />
            {t("reception.notificationsCentre.preferences.titre")}
            {prefsOuvertes ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {prefsOuvertes && preferences && (
        <div className="border-b border-gris-bordure bg-gris-tres-clair/60 px-4 py-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                ["inApp", preferences.inApp],
                ["tableauBord", preferences.tableauBord],
                ["push", preferences.push],
                ["son", preferences.son],
                ["email", preferences.email],
                ["sms", preferences.sms],
                ["silencieux", preferences.silencieux],
              ] as const
            ).map(([cle, valeur]) => (
              <label key={cle} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={valeur}
                  disabled={cle === "email" || cle === "sms"}
                  onChange={(e) =>
                    setPreferences((p) => (p ? { ...p, [cle]: e.target.checked } : p))
                  }
                />
                {t(`reception.notificationsCentre.preferences.${cle}`)}
              </label>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              disabled={sauvegardePrefs}
              onClick={() => void enregistrerPreferences()}
              className="rounded-lg bg-bleu-medical px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              {sauvegardePrefs ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("reception.notificationsCentre.preferences.enregistrer")
              )}
            </button>
            {messagePrefs && <span className="text-xs text-emerald-700">{messagePrefs}</span>}
          </div>
        </div>
      )}

      <div className="shrink-0 border-b border-gris-bordure bg-[#f8fafc] p-3 sm:p-4">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder={t("reception.notificationsCentre.rechercher")}
            className="w-full rounded-xl border border-gris-bordure bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["tous", "non_lus", "archives"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltre(f)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-bold transition",
                filtre === f
                  ? "bg-bleu-medical text-white shadow-sm"
                  : "bg-white text-texte-secondaire ring-1 ring-gris-bordure hover:bg-gris-tres-clair"
              )}
            >
              {t(`reception.notificationsCentre.filtres.${f}`)}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTRES_TYPE.map((typeF) => (
            <button
              key={typeF}
              type="button"
              onClick={() => setFiltreType(typeF)}
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold transition",
                filtreType === typeF
                  ? "bg-slate-800 text-white"
                  : "bg-white text-texte-secondaire ring-1 ring-gris-bordure hover:bg-gris-tres-clair"
              )}
            >
              {typeF === "tous"
                ? t("reception.notificationsCentre.filtres.tous")
                : t(`reception.notificationsCentre.types.${typeF}`, typeF)}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-white">
        {chargement ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Loader2 className="h-7 w-7 animate-spin text-bleu-medical" />
            <p className="text-xs text-texte-secondaire">
              {t("reception.notificationsCentre.chargement")}
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bleu-medical-clair">
              <Bell className="h-8 w-8 text-bleu-medical/60" />
            </div>
            <h3 className="text-base font-semibold text-texte-principal">
              {t("reception.notificationsCentre.aucuneTitre")}
            </h3>
            <p className="max-w-xs text-sm text-texte-secondaire">
              {t("reception.notificationsCentre.aucune")}
            </p>
          </div>
        ) : (
          <ul>
            {notifications.map((n) => (
              <CarteNotification
                key={n.id}
                notification={n}
                onMarquerLue={(id) => void marquerLue(id)}
                onArchiver={(id) => void archiver(id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
