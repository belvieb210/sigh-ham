"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Image as ImageIcon,
  LayoutDashboard,
  Mail,
  Megaphone,
} from "lucide-react";
import {
  MiseEnPageClient,
  type UtilisateurClient,
} from "@/features/client/mise-en-page-client";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";

interface StatsClient {
  campagnesActives: number;
  pubsEnCours: number;
  brouillons: number;
  diaposHero: number;
  messagesContactNonLus: number;
  genereLe: string;
}

function CarteKpi({
  label,
  valeur,
  hint,
}: {
  label: string;
  valeur: number | string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-texte-secondaire">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-texte-principal">{valeur}</p>
      {hint ? (
        <p className="mt-1 text-xs text-texte-secondaire">{hint}</p>
      ) : null}
    </div>
  );
}

export function ContenuAccueilClient({
  utilisateur,
}: {
  utilisateur: UtilisateurClient;
}) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsClient | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(() => {
    fetch("/api/client/stats")
      .then(async (res) => {
        const data = (await res.json()) as StatsClient & { message?: string };
        if (!res.ok) throw new Error(data.message ?? t("client.common.erreur"));
        setStats(data);
      })
      .catch((e: unknown) => {
        setErreur(e instanceof Error ? e.message : t("client.common.erreur"));
      });
  }, [t]);

  useEffect(() => {
    charger();
    const id = window.setInterval(charger, 30000);
    return () => window.clearInterval(id);
  }, [charger]);

  const raccourcis = [
    {
      href: "/sigh/client/campagnes",
      icone: Megaphone,
      titre: t("client.raccourcis.campagnes"),
      desc: t("client.raccourcis.campagnesDesc"),
    },
    {
      href: "/sigh/client/hero",
      icone: ImageIcon,
      titre: t("client.raccourcis.hero"),
      desc: t("client.raccourcis.heroDesc"),
    },
    {
      href: "/sigh/client/messages",
      icone: Mail,
      titre: t("client.raccourcis.messages"),
      desc: t("client.raccourcis.messagesDesc"),
    },
  ];

  return (
    <MiseEnPageClient
      utilisateur={utilisateur}
      titre={t("client.dashboard.titre")}
      sousTitre={t("client.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1200px] space-y-6">
        <EnTetePageReception
          icone={LayoutDashboard}
          titre={t("client.dashboard.titre")}
          description={t("client.dashboard.description")}
          fil={[{ label: t("client.common.salle") }]}
        />

        {erreur ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erreur}
          </p>
        ) : null}

        {stats ? (
          <>
            {stats.messagesContactNonLus > 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <p>
                  {t("client.dashboard.alerteMessages", {
                    count: stats.messagesContactNonLus,
                  })}
                </p>
                <Link
                  href="/sigh/client/messages"
                  className="mt-1 inline-flex items-center gap-1 font-medium text-bleu-medical hover:underline"
                >
                  {t("client.dashboard.voirMessages")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <CarteKpi
                label={t("client.dashboard.campagnesActives")}
                valeur={stats.campagnesActives}
              />
              <CarteKpi
                label={t("client.dashboard.pubsEnCours")}
                valeur={stats.pubsEnCours}
              />
              <CarteKpi
                label={t("client.dashboard.brouillons")}
                valeur={stats.brouillons}
              />
              <CarteKpi
                label={t("client.dashboard.diaposHero")}
                valeur={stats.diaposHero}
              />
              <CarteKpi
                label={t("client.dashboard.messagesNonLus")}
                valeur={stats.messagesContactNonLus}
              />
            </div>

            <p className="text-[11px] text-texte-secondaire">
              {t("client.dashboard.majAuto")}{" "}
              {new Date(stats.genereLe).toLocaleTimeString()}
            </p>
          </>
        ) : (
          <p className="text-sm text-texte-secondaire">
            {t("client.common.chargement")}
          </p>
        )}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {raccourcis.map((r) => {
            const Icone = r.icone;
            return (
              <Link
                key={r.href}
                href={r.href}
                className="group rounded-xl border border-gris-bordure bg-white p-4 shadow-sm transition-colors hover:border-bleu-medical"
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-bleu-medical-clair text-bleu-medical">
                  <Icone className="h-4.5 w-4.5" />
                </div>
                <p className="font-semibold text-texte-principal group-hover:text-bleu-medical">
                  {r.titre}
                </p>
                <p className="mt-1 text-sm text-texte-secondaire">{r.desc}</p>
              </Link>
            );
          })}
        </section>
      </div>
    </MiseEnPageClient>
  );
}
