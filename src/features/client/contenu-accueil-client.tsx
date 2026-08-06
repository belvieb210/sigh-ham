"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Calendar,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  Mail,
  Megaphone,
  Stethoscope,
  Images,
  Hospital,
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
  demandesRdvNouvelles: number;
  genereLe: string;
}

function CarteKpi({
  label,
  valeur,
  hint,
  icone: Icone,
  couleurIcone,
}: {
  label: string;
  valeur: number | string;
  hint?: string;
  icone: React.ComponentType<{ className?: string }>;
  couleurIcone: string;
}) {
  return (
    <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-texte-secondaire">{label}</p>
        <span className={`rounded-lg p-2 ${couleurIcone}`}>
          <Icone className="h-4 w-4" />
        </span>
      </div>
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
  const [chargement, setChargement] = useState(true);

  const charger = useCallback(() => {
    fetch("/api/client/stats")
      .then(async (res) => {
        const data = (await res.json()) as StatsClient & { message?: string };
        if (!res.ok) throw new Error(data.message ?? t("client.common.erreur"));
        setStats(data);
        setErreur(null);
      })
      .catch((e: unknown) => {
        setErreur(e instanceof Error ? e.message : t("client.common.erreur"));
      })
      .finally(() => setChargement(false));
  }, [t]);

  useEffect(() => {
    charger();
    const id = window.setInterval(charger, 30000);
    return () => window.clearInterval(id);
  }, [charger]);

  const raccourcis = [
    {
      href: "/sigh/client/rendez-vous",
      icone: Calendar,
      titre: t("client.raccourcis.rdv"),
      desc: t("client.raccourcis.rdvDesc"),
      couleur: "bg-sky-50 text-sky-700",
    },
    {
      href: "/sigh/client/campagnes",
      icone: Megaphone,
      titre: t("client.raccourcis.campagnes"),
      desc: t("client.raccourcis.campagnesDesc"),
      couleur: "bg-violet-50 text-violet-700",
    },
    {
      href: "/sigh/client/hero",
      icone: ImageIcon,
      titre: t("client.raccourcis.hero"),
      desc: t("client.raccourcis.heroDesc"),
      couleur: "bg-amber-50 text-amber-700",
    },
    {
      href: "/sigh/client/messages",
      icone: Mail,
      titre: t("client.raccourcis.messages"),
      desc: t("client.raccourcis.messagesDesc"),
      couleur: "bg-rose-50 text-rose-700",
    },
    {
      href: "/sigh/client/services",
      icone: Hospital,
      titre: t("client.nav.services"),
      desc: t("client.services.description"),
      couleur: "bg-emerald-50 text-emerald-700",
    },
    {
      href: "/sigh/client/pages",
      icone: FileText,
      titre: t("client.nav.pages"),
      desc: t("client.pages.description"),
      couleur: "bg-teal-50 text-teal-700",
    },
    {
      href: "/sigh/client/medecins",
      icone: Stethoscope,
      titre: t("client.nav.medecins"),
      desc: t("client.medecins.description"),
      couleur: "bg-blue-50 text-blue-700",
    },
    {
      href: "/sigh/client/galerie",
      icone: Images,
      titre: t("client.nav.galerie"),
      desc: t("client.galerie.description"),
      couleur: "bg-indigo-50 text-indigo-700",
    },
  ];

  return (
    <MiseEnPageClient
      utilisateur={utilisateur}
      titre={t("client.dashboard.titre")}
      sousTitre={t("client.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-7xl space-y-5">
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

        {chargement && !stats ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-texte-secondaire">
            <Loader2 className="h-5 w-5 animate-spin" />
            {t("client.common.chargement")}
          </div>
        ) : null}

        {stats ? (
          <>
            {stats.demandesRdvNouvelles > 0 ? (
              <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                <p>
                  {t("client.dashboard.alerteRdv", {
                    count: stats.demandesRdvNouvelles,
                  })}
                </p>
                <Link
                  href="/sigh/client/rendez-vous"
                  className="mt-1 inline-flex items-center gap-1 font-medium text-bleu-medical hover:underline"
                >
                  {t("client.dashboard.voirRdv")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : null}

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

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <CarteKpi
                label={t("client.dashboard.campagnesActives")}
                valeur={stats.campagnesActives}
                icone={Megaphone}
                couleurIcone="bg-violet-50 text-violet-700"
              />
              <CarteKpi
                label={t("client.dashboard.pubsEnCours")}
                valeur={stats.pubsEnCours}
                icone={Megaphone}
                couleurIcone="bg-fuchsia-50 text-fuchsia-700"
              />
              <CarteKpi
                label={t("client.dashboard.brouillons")}
                valeur={stats.brouillons}
                icone={FileText}
                couleurIcone="bg-slate-100 text-slate-600"
              />
              <CarteKpi
                label={t("client.dashboard.diaposHero")}
                valeur={stats.diaposHero}
                icone={ImageIcon}
                couleurIcone="bg-amber-50 text-amber-700"
              />
              <CarteKpi
                label={t("client.dashboard.messagesNonLus")}
                valeur={stats.messagesContactNonLus}
                icone={Mail}
                couleurIcone="bg-rose-50 text-rose-700"
              />
              <CarteKpi
                label={t("client.dashboard.demandesRdv")}
                valeur={stats.demandesRdvNouvelles}
                icone={Calendar}
                couleurIcone="bg-sky-50 text-sky-700"
              />
            </div>

            <p className="text-[11px] text-texte-secondaire">
              {t("client.dashboard.majAuto")}{" "}
              {new Date(stats.genereLe).toLocaleTimeString()}
            </p>
          </>
        ) : null}

        <section className="rounded-xl border border-gris-bordure bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gris-bordure px-4 py-3">
            <LayoutDashboard className="h-4 w-4 text-bleu-medical" />
            <h3 className="text-sm font-semibold text-texte-principal">
              {t("client.nav.accueil")}
            </h3>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {raccourcis.map((r) => {
              const Icone = r.icone;
              return (
                <Link
                  key={r.href}
                  href={r.href}
                  className="group rounded-xl border border-gris-bordure bg-white p-4 transition-colors hover:border-bleu-medical hover:bg-slate-50/60"
                >
                  <div
                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${r.couleur}`}
                  >
                    <Icone className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-texte-principal group-hover:text-bleu-medical">
                    {r.titre}
                  </p>
                  <p className="mt-1 text-sm text-texte-secondaire">{r.desc}</p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </MiseEnPageClient>
  );
}
