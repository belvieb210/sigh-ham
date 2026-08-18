"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowRight, Loader2 } from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { cn } from "@/lib/utils";

interface EntreeAuditDash {
  id: string;
  type: string;
  module: string | null;
  entite: string;
  action: string;
  createdAt: string;
  utilisateur: {
    prenom: string;
    nom: string;
    identifiant: string;
  } | null;
}

interface SessionDash {
  id: string;
  createdAt: string;
  utilisateur: {
    prenom: string;
    nom: string;
    identifiant: string;
    role: {
      nom: string;
      salle: { code: string; nom: string } | null;
    };
  };
  derniereAction: string | null;
}

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
  journal: EntreeAuditDash[];
  sessions: SessionDash[];
  genereLe: string;
}

function libelleActeur(e: EntreeAuditDash, publicLabel: string) {
  if (!e.utilisateur) return publicLabel;
  return `${e.utilisateur.prenom} ${e.utilisateur.nom}`.trim();
}

function classeType(type: string) {
  if (type === "CONNEXION") return "text-emerald-700";
  if (type === "DECONNEXION") return "text-slate-500";
  if (type === "CREATION") return "text-sky-700";
  if (type === "MODIFICATION") return "text-amber-700";
  if (type === "SUPPRESSION") return "text-red-700";
  if (type === "EXPORT") return "text-violet-700";
  if (type === "TRANSFERT") return "text-orange-700";
  if (type === "CONSULTATION") return "text-bleu-medical";
  return "text-texte-secondaire";
}

export function ContenuAccueilAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState<StatsAdmin | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(() => {
    fetch("/api/admin/stats")
      .then(async (res) => {
        const data = (await res.json()) as StatsAdmin & { message?: string };
        if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
        setStats(data);
        setErreur(null);
      })
      .catch((e: unknown) => {
        setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
      });
  }, [t]);

  useEffect(() => {
    charger();
    const id = window.setInterval(charger, 15000);
    return () => window.clearInterval(id);
  }, [charger]);

  const fmtHeure = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });

  const kpis = stats
    ? [
        {
          label: t("admin.dashboard.utilisateursActifs"),
          valeur: `${stats.kpis.utilisateursActifs}/${stats.kpis.utilisateursTotal}`,
        },
        {
          label: t("admin.dashboard.sessions"),
          valeur: String(stats.kpis.sessionsActives),
        },
        {
          label: t("admin.dashboard.dossiersOuverts"),
          valeur: String(stats.kpis.dossiersOuverts),
        },
        {
          label: t("admin.dashboard.activiteJour"),
          valeur: String(stats.kpis.connexionsJour),
        },
        {
          label: t("admin.dashboard.facturesJour"),
          valeur: String(stats.kpis.facturesJour),
        },
        {
          label: t("admin.dashboard.examensTermines"),
          valeur: String(stats.kpis.examensTermines),
        },
      ]
    : [];

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.dashboard.titre")}
      sousTitre={t("admin.dashboard.description")}
    >
      <div className="mx-auto w-full max-w-[1280px] space-y-5">
        {erreur ? (
          <p className="border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {erreur}
          </p>
        ) : null}

        {!stats ? (
          <div className="flex items-center gap-2 py-16 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("admin.common.chargement")}
          </div>
        ) : (
          <>
            {(stats.kpis.utilisateursSuspendus > 0 ||
              stats.kpis.sessionsActives > 50) && (
              <div className="border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
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

            <section className="overflow-hidden border border-gris-bordure bg-white">
              <div className="grid grid-cols-2 divide-x divide-y divide-gris-bordure sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
                {kpis.map((k) => (
                  <div key={k.label} className="px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-texte-secondaire">
                      {k.label}
                    </p>
                    <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-texte-principal">
                      {k.valeur}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <section className="min-w-0 overflow-hidden border border-gris-bordure bg-white">
                <div className="flex items-center justify-between border-b border-gris-bordure px-4 py-2.5">
                  <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-texte-secondaire">
                    {t("admin.dashboard.filesSalles")}
                  </h2>
                  <Link
                    href="/sigh/admin/supervision"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-bleu-medical hover:underline"
                  >
                    {t("admin.dashboard.voirSupervision")}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-gris-bordure text-[10px] font-semibold uppercase tracking-wider text-texte-secondaire">
                        <th className="px-4 py-2 font-semibold">
                          {t("admin.dashboard.colService")}
                        </th>
                        <th className="px-4 py-2 font-semibold">
                          {t("admin.dashboard.colCode")}
                        </th>
                        <th className="px-4 py-2 text-right font-semibold">
                          {t("admin.dashboard.colFile")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.salles.map((s) => (
                        <tr
                          key={s.code}
                          className="border-b border-gris-bordure last:border-0"
                        >
                          <td className="px-4 py-2 font-medium text-texte-principal">
                            {s.nom}
                          </td>
                          <td className="px-4 py-2 font-mono text-[11px] text-texte-secondaire">
                            {s.code}
                          </td>
                          <td
                            className={cn(
                              "px-4 py-2 text-right font-mono text-sm tabular-nums",
                              s.enFile > 0
                                ? "font-semibold text-bleu-medical"
                                : "text-texte-secondaire"
                            )}
                          >
                            {s.enFile}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="overflow-hidden border border-gris-bordure bg-white">
                <div className="border-b border-gris-bordure px-4 py-2.5">
                  <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-texte-secondaire">
                    {t("admin.dashboard.sessionsEnLigne")}
                  </h2>
                </div>
                {stats.sessions.length === 0 ? (
                  <p className="px-4 py-8 text-center text-xs text-texte-secondaire">
                    {t("admin.dashboard.aucuneSession")}
                  </p>
                ) : (
                  <ul className="max-h-[420px] divide-y divide-gris-bordure overflow-y-auto">
                    {stats.sessions.map((s) => (
                      <li key={s.id} className="px-4 py-2.5">
                        <p className="truncate text-sm font-medium text-texte-principal">
                          {s.utilisateur.prenom} {s.utilisateur.nom}
                        </p>
                        <p className="truncate text-[11px] text-texte-secondaire">
                          {s.utilisateur.role.salle?.nom ?? s.utilisateur.role.nom}
                          {" · "}
                          {t("admin.dashboard.connecteDepuis")}{" "}
                          {fmtHeure(s.createdAt)}
                        </p>
                        {s.derniereAction ? (
                          <p className="mt-0.5 truncate text-[11px] text-bleu-medical">
                            {s.derniereAction}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <section className="overflow-hidden border border-gris-bordure bg-white">
              <div className="flex items-center justify-between border-b border-gris-bordure px-4 py-2.5">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-texte-secondaire">
                    {t("admin.dashboard.journalTitre")}
                  </h2>
                  <p className="mt-0.5 text-[11px] text-texte-secondaire">
                    {t("admin.dashboard.majAuto")}{" "}
                    {new Date(stats.genereLe).toLocaleTimeString()}
                  </p>
                </div>
                <Link
                  href="/sigh/admin/audit"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-bleu-medical hover:underline"
                >
                  {t("admin.dashboard.journalComplet")}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              {stats.journal.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-texte-secondaire">
                  {t("admin.dashboard.journalVide")}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-gris-bordure text-[10px] font-semibold uppercase tracking-wider text-texte-secondaire">
                        <th className="px-4 py-2 font-semibold">
                          {t("admin.audit.colonnes.date")}
                        </th>
                        <th className="px-4 py-2 font-semibold">
                          {t("admin.dashboard.colSalle")}
                        </th>
                        <th className="px-4 py-2 font-semibold">
                          {t("admin.audit.colonnes.acteur")}
                        </th>
                        <th className="px-4 py-2 font-semibold">
                          {t("admin.audit.colonnes.type")}
                        </th>
                        <th className="px-4 py-2 font-semibold">
                          {t("admin.audit.colonnes.action")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.journal.map((e) => (
                        <tr
                          key={e.id}
                          className="border-b border-gris-bordure last:border-0"
                        >
                          <td className="whitespace-nowrap px-4 py-2 font-mono text-[11px] text-texte-secondaire">
                            {fmtHeure(e.createdAt)}
                          </td>
                          <td className="px-4 py-2 font-mono text-[11px] text-texte-secondaire">
                            {e.module ?? "—"}
                          </td>
                          <td className="max-w-[160px] truncate px-4 py-2 text-texte-principal">
                            {libelleActeur(e, t("admin.dashboard.public"))}
                          </td>
                          <td
                            className={cn(
                              "px-4 py-2 text-[11px] font-semibold uppercase tracking-wide",
                              classeType(e.type)
                            )}
                          >
                            {t(`admin.audit.types.${e.type}`, {
                              defaultValue: e.type,
                            })}
                          </td>
                          <td className="max-w-[420px] truncate px-4 py-2 text-texte-principal">
                            {e.action}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </MiseEnPageAdmin>
  );
}
