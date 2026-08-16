"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Activity,
  ArrowRight,
  BarChart3,
  MessageSquare,
  ScrollText,
  ShieldAlert,
  Users,
} from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";

interface StatsAdmin {
  kpis: {
    utilisateursActifs: number;
    utilisateursTotal: number;
    utilisateursSuspendus: number;
    sessionsActives: number;
    patientsTotal: number;
    dossiersOuverts: number;
    connexionsJour: number;
    messagesJour: number;
    conversationsActives: number;
    facturesJour: number;
    examensPrescrits: number;
    examensTermines: number;
  };
  salles: { code: string; nom: string; enFile: number }[];
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

export function ContenuAccueilAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsAdmin | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(() => {
    fetch("/api/admin/stats")
      .then(async (res) => {
        const data = (await res.json()) as StatsAdmin & { message?: string };
        if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
        setStats(data);
      })
      .catch((e: unknown) => {
        setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
      });
  }, [t]);

  useEffect(() => {
    charger();
    const id = window.setInterval(charger, 30000);
    return () => window.clearInterval(id);
  }, [charger]);

  const raccourcis = [
    {
      href: "/sigh/admin/utilisateurs",
      icone: Users,
      titre: t("admin.raccourcis.utilisateurs"),
      desc: t("admin.raccourcis.utilisateursDesc"),
    },
    {
      href: "/sigh/admin/audit",
      icone: ScrollText,
      titre: t("admin.raccourcis.audit"),
      desc: t("admin.raccourcis.auditDesc"),
    },
    {
      href: "/sigh/admin/parametres",
      icone: BarChart3,
      titre: t("admin.raccourcis.parametres"),
      desc: t("admin.raccourcis.parametresDesc"),
    },
    {
      href: "/sigh/admin/moderation",
      icone: ShieldAlert,
      titre: t("admin.raccourcis.moderation"),
      desc: t("admin.raccourcis.moderationDesc"),
    },
    {
      href: "/sigh/admin/paquets-bilans",
      icone: Activity,
      titre: t("admin.raccourcis.paquetsBilans"),
      desc: t("admin.raccourcis.paquetsBilansDesc"),
    },
  ];

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.dashboard.titre")}
      sousTitre={t("admin.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1200px] space-y-6">
        <EnTetePageReception
          icone={Activity}
          titre={t("admin.dashboard.titre")}
          description={t("admin.dashboard.description")}
          fil={[{ label: t("admin.common.salle") }]}
        />

        {erreur ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erreur}
          </p>
        ) : null}

        {stats ? (
          <>
            {(stats.kpis.utilisateursSuspendus > 0 ||
              stats.kpis.sessionsActives > 50) && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {stats.kpis.utilisateursSuspendus > 0 ? (
                  <p>
                    {t("admin.dashboard.alerteSuspendus", {
                      count: stats.kpis.utilisateursSuspendus,
                    })}
                  </p>
                ) : null}
                {stats.kpis.sessionsActives > 50 ? (
                  <p>
                    {t("admin.dashboard.alerteSessions", {
                      count: stats.kpis.sessionsActives,
                    })}
                  </p>
                ) : null}
              </div>
            )}

            <div className="grille-kpi-sigh lg:grid-cols-4">
              <CarteKpi
                label={t("admin.dashboard.utilisateursActifs")}
                valeur={`${stats.kpis.utilisateursActifs}/${stats.kpis.utilisateursTotal}`}
              />
              <CarteKpi
                label={t("admin.dashboard.sessions")}
                valeur={stats.kpis.sessionsActives}
              />
              <CarteKpi
                label={t("admin.dashboard.dossiersOuverts")}
                valeur={stats.kpis.dossiersOuverts}
                hint={`${stats.kpis.patientsTotal} ${t("admin.dashboard.patients")}`}
              />
              <CarteKpi
                label={t("admin.dashboard.activiteJour")}
                valeur={stats.kpis.connexionsJour}
                hint={`${stats.kpis.messagesJour} ${t("admin.dashboard.messages")}`}
              />
            </div>

            <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-texte-principal">
                  {t("admin.dashboard.filesSalles")}
                </h2>
                <Link
                  href="/sigh/admin/supervision"
                  className="inline-flex items-center gap-1 text-xs font-medium text-bleu-medical hover:underline"
                >
                  {t("admin.dashboard.voirSupervision")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {stats.salles.map((s) => (
                  <div
                    key={s.code}
                    className="flex items-center justify-between rounded-lg border border-gris-bordure px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-semibold text-texte-principal">
                        {s.nom}
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-texte-secondaire">
                        {s.code}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        s.enFile > 0
                          ? "bg-bleu-medical-clair text-bleu-medical"
                          : "bg-gris-tres-clair text-texte-secondaire"
                      }`}
                    >
                      {s.enFile}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-texte-secondaire">
                {t("admin.dashboard.majAuto")}{" "}
                {new Date(stats.genereLe).toLocaleTimeString()}
              </p>
            </section>
          </>
        ) : (
          <p className="text-sm text-texte-secondaire">
            {t("admin.common.chargement")}
          </p>
        )}

        <section className="grid gap-3 sm:grid-cols-2">
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
    </MiseEnPageAdmin>
  );
}
