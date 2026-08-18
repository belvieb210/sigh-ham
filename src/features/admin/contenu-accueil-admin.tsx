"use client";

import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Activity,
  ArrowRight,
  BedDouble,
  Building2,
  FileText,
  FlaskConical,
  Headphones,
  Heart,
  HeartPulse,
  Loader2,
  LogIn,
  LogOut,
  MessageSquare,
  Pencil,
  Pill,
  Plus,
  Stethoscope,
  Trash2,
  UserPlus,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { AvatarUtilisateur } from "@/components/ui/avatar-utilisateur";
import { GraphiqueConnexionsAdmin } from "@/features/admin/graphique-connexions-admin";
import { GraphiqueExamensAdmin } from "@/features/admin/graphique-examens-admin";
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
    photoUrl?: string | null;
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
    connexionsHier: number;
    connexionsVariation: number;
    messagesJour: number;
    conversationsActives: number;
    facturesJour: number;
    facturesHier: number;
    facturesVariation: number;
    examensPrescrits: number;
    examensTermines: number;
    examensTerminesHier: number;
    examensVariation: number;
  };
  salles: {
    code: string;
    nom: string;
    enFile: number;
    enCours: number;
    attenteMoyMin: number;
    charge: "normal" | "modere" | "eleve";
  }[];
  examensJour: {
    termines: number;
    enCours: number;
    enAttente: number;
    nonRealises: number;
  };
  connexions7j: { date: string; valeur: number }[];
  journal: EntreeAuditDash[];
  sessions: SessionDash[];
  personnel: {
    total: number;
    avatars: {
      id: string;
      prenom: string;
      nom: string;
      photoUrl: string | null;
    }[];
    parRole: { label: string; count: number }[];
  };
  genereLe: string;
}

const ICONES_SALLE: Record<string, ComponentType<{ className?: string }>> = {
  RECEPTION: UserRound,
  INFIRMIERS: HeartPulse,
  MEDECINS: Stethoscope,
  CAISSE: Wallet,
  LABORATOIRE: FlaskConical,
  PHARMACIE: Pill,
  EGLISE: Heart,
  MEDECINS_EXTERNES: UserPlus,
  HOSPITALISATION: BedDouble,
  ADMIN: Building2,
  CLIENT: Headphones,
  MESSAGERIE: MessageSquare,
};

const ICONES_AUDIT: Record<string, ComponentType<{ className?: string }>> = {
  CONNEXION: LogIn,
  DECONNEXION: LogOut,
  CREATION: Plus,
  MODIFICATION: Pencil,
  SUPPRESSION: Trash2,
  TRANSFERT: ArrowRight,
  CONSULTATION: FileText,
  EXPORT: FileText,
};

const COULEURS_ICONE_AUDIT: Record<string, string> = {
  CONNEXION: "bg-emerald-50 text-emerald-700",
  DECONNEXION: "bg-rose-50 text-rose-700",
  CREATION: "bg-sky-50 text-sky-700",
  MODIFICATION: "bg-amber-50 text-amber-700",
  SUPPRESSION: "bg-red-50 text-red-700",
  TRANSFERT: "bg-orange-50 text-orange-700",
  CONSULTATION: "bg-violet-50 text-violet-700",
  EXPORT: "bg-slate-100 text-slate-600",
};

const POINT_AUDIT: Record<string, string> = {
  CONNEXION: "bg-emerald-500",
  DECONNEXION: "bg-rose-500",
  CREATION: "bg-sky-500",
  MODIFICATION: "bg-amber-500",
  SUPPRESSION: "bg-red-500",
  TRANSFERT: "bg-orange-500",
  CONSULTATION: "bg-violet-500",
  EXPORT: "bg-slate-400",
};

function libelleActeur(e: EntreeAuditDash, publicLabel: string) {
  if (!e.utilisateur) return publicLabel;
  return `${e.utilisateur.prenom} ${e.utilisateur.nom}`.trim();
}

function LienVoir({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-bleu-medical hover:underline"
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

function CarteKpi({
  label,
  valeur,
  sousTitre,
  icone: Icone,
  accent,
  badge,
  badgeClasse,
}: {
  label: string;
  valeur: string;
  sousTitre: string;
  icone: ComponentType<{ className?: string }>;
  accent: string;
  badge: string;
  badgeClasse: string;
}) {
  return (
    <article className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className={cn("rounded-lg p-2", accent)}>
          <Icone className="h-4 w-4" />
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            badgeClasse
          )}
        >
          {badge}
        </span>
      </div>
      <p className="mt-3 text-[11px] font-medium text-texte-secondaire">{label}</p>
      <p className="mt-0.5 text-2xl font-bold tabular-nums text-texte-principal">{valeur}</p>
      <p className="mt-1 text-[11px] text-texte-secondaire">{sousTitre}</p>
    </article>
  );
}

function EnTeteCarte({ titre, href, lien }: { titre: string; href: string; lien: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gris-bordure px-4 py-3">
      <h2 className="text-sm font-bold text-texte-principal">{titre}</h2>
      <LienVoir href={href}>{lien}</LienVoir>
    </div>
  );
}

function formaterVariation(pct: number) {
  if (pct === 0) return "0%";
  return `${pct > 0 ? "+ " : ""}${pct}%`;
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
    new Date(iso).toLocaleTimeString(i18n.language, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const activite = useMemo(() => stats?.journal.slice(0, 7) ?? [], [stats]);
  const auditMouvements = useMemo(() => {
    if (!stats) return [];
    const horsConnexion = stats.journal.filter(
      (e) => e.type !== "CONNEXION" && e.type !== "DECONNEXION"
    );
    return (horsConnexion.length > 0 ? horsConnexion : stats.journal).slice(0, 5);
  }, [stats]);

  const titreActivite = (type: string) => {
    if (type === "CONNEXION") return t("admin.dashboard.activite.connexion");
    if (type === "DECONNEXION") return t("admin.dashboard.activite.deconnexion");
    return t(`admin.audit.types.${type}`, { defaultValue: type });
  };

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.nav.accueil")}
      sousTitre={t("admin.dashboard.description")}
    >
      <div className="mx-auto w-full max-w-[1280px] space-y-4">
        {erreur ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
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
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
              <CarteKpi
                icone={Users}
                accent="bg-sky-50 text-sky-700"
                label={t("admin.dashboard.utilisateursActifs")}
                valeur={`${stats.kpis.utilisateursActifs} / ${stats.kpis.utilisateursTotal}`}
                sousTitre={t("admin.dashboard.hintUtilisateurs")}
                badge={
                  stats.kpis.utilisateursTotal > 0
                    ? `+ ${Math.round(
                        (stats.kpis.utilisateursActifs / stats.kpis.utilisateursTotal) * 100
                      )}%`
                    : "0%"
                }
                badgeClasse="bg-emerald-50 text-emerald-700"
              />
              <CarteKpi
                icone={Activity}
                accent="bg-violet-50 text-violet-700"
                label={t("admin.dashboard.sessions")}
                valeur={String(stats.kpis.sessionsActives)}
                sousTitre={t("admin.dashboard.hintSessions")}
                badge={t("admin.dashboard.badgeEnCours")}
                badgeClasse="bg-violet-50 text-violet-700"
              />
              <CarteKpi
                icone={FileText}
                accent="bg-indigo-50 text-indigo-700"
                label={t("admin.dashboard.dossiersOuverts")}
                valeur={String(stats.kpis.dossiersOuverts)}
                sousTitre={t("admin.dashboard.hintDossiers")}
                badge={t("admin.dashboard.badgeEnCours")}
                badgeClasse="bg-violet-50 text-violet-700"
              />
              <CarteKpi
                icone={LogIn}
                accent="bg-blue-50 text-blue-700"
                label={t("admin.dashboard.activiteJour")}
                valeur={String(stats.kpis.connexionsJour)}
                sousTitre={t("admin.dashboard.hintVsHier")}
                badge={formaterVariation(stats.kpis.connexionsVariation ?? 0)}
                badgeClasse={
                  (stats.kpis.connexionsVariation ?? 0) >= 0
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }
              />
              <CarteKpi
                icone={Wallet}
                accent="bg-emerald-50 text-emerald-700"
                label={t("admin.dashboard.facturesJour")}
                valeur={String(stats.kpis.facturesJour)}
                sousTitre={t("admin.dashboard.hintVsHier")}
                badge={formaterVariation(stats.kpis.facturesVariation ?? 0)}
                badgeClasse={
                  (stats.kpis.facturesVariation ?? 0) >= 0
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }
              />
              <CarteKpi
                icone={FlaskConical}
                accent="bg-violet-50 text-violet-700"
                label={t("admin.dashboard.examensTermines")}
                valeur={String(stats.kpis.examensTermines)}
                sousTitre={t("admin.dashboard.hintExamens")}
                badge={formaterVariation(stats.kpis.examensVariation ?? 0)}
                badgeClasse={
                  (stats.kpis.examensVariation ?? 0) >= 0
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }
              />
            </section>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(20rem,1fr)]">
              <section className="min-w-0 overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
                <EnTeteCarte
                  titre={t("admin.dashboard.filesSalles")}
                  href="/sigh/admin/supervision"
                  lien={t("admin.dashboard.voirSupervision")}
                />
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-gris-bordure bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-texte-secondaire">
                        <th className="px-4 py-2.5">{t("admin.dashboard.colService")}</th>
                        <th className="px-3 py-2.5">{t("admin.dashboard.colCode")}</th>
                        <th className="px-3 py-2.5 text-right">{t("admin.dashboard.colFile")}</th>
                        <th className="px-3 py-2.5 text-right">{t("admin.dashboard.colEnCours")}</th>
                        <th className="px-3 py-2.5 text-right">
                          {t("admin.dashboard.colAttente")}
                        </th>
                        <th className="px-4 py-2.5">{t("admin.dashboard.colStatut")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.salles.map((s) => {
                        const IconeSalle = ICONES_SALLE[s.code] ?? Building2;
                        return (
                          <tr
                            key={s.code}
                            className="border-b border-gris-bordure last:border-0"
                          >
                            <td className="px-4 py-2.5">
                              <span className="inline-flex items-center gap-2.5 font-medium text-texte-principal">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                                  <IconeSalle className="h-4 w-4" />
                                </span>
                                {s.nom}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 font-mono text-[11px] text-texte-secondaire">
                              {s.code}
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums text-texte-principal">
                              {s.enFile}
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums text-texte-principal">
                              {s.enCours ?? 0}
                            </td>
                            <td className="px-3 py-2.5 text-right text-xs tabular-nums text-texte-secondaire">
                              {s.attenteMoyMin > 0
                                ? t("admin.dashboard.minutes", { n: s.attenteMoyMin })
                                : "—"}
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={cn(
                                  "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                                  s.charge === "eleve" && "bg-orange-100 text-orange-800",
                                  s.charge === "modere" && "bg-amber-50 text-amber-700",
                                  s.charge === "normal" && "bg-emerald-50 text-emerald-700"
                                )}
                              >
                                {t(`admin.dashboard.charge.${s.charge}`)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="space-y-4">
                <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
                  <EnTeteCarte
                    titre={t("admin.dashboard.activiteTempsReel")}
                    href="/sigh/admin/audit"
                    lien={t("admin.dashboard.voirTout")}
                  />
                  {activite.length === 0 ? (
                    <p className="px-4 py-8 text-center text-xs text-texte-secondaire">
                      {t("admin.dashboard.journalVide")}
                    </p>
                  ) : (
                    <ul className="max-h-[320px] divide-y divide-gris-bordure overflow-y-auto">
                      {activite.map((e) => {
                        const Icone = ICONES_AUDIT[e.type] ?? Activity;
                        return (
                          <li key={e.id} className="flex items-start gap-3 px-4 py-2.5">
                            <span
                              className={cn(
                                "relative mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                COULEURS_ICONE_AUDIT[e.type] ?? "bg-slate-50 text-slate-600"
                              )}
                            >
                              <Icone className="h-3.5 w-3.5" />
                              <span
                                className={cn(
                                  "absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-2 ring-white",
                                  POINT_AUDIT[e.type] ?? "bg-slate-400"
                                )}
                              />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-texte-principal">
                                {titreActivite(e.type)}
                              </p>
                              <p className="truncate text-[11px] text-texte-secondaire">
                                {libelleActeur(e, t("admin.dashboard.public"))}
                              </p>
                            </div>
                            <time className="shrink-0 font-mono text-[11px] text-texte-secondaire">
                              {fmtHeure(e.createdAt)}
                            </time>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>

                <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
                  <EnTeteCarte
                    titre={`${t("admin.dashboard.sessionsEnLigne")} (${stats.personnel?.total ?? stats.sessions.length})`}
                    href="/sigh/admin/supervision"
                    lien={t("admin.dashboard.voirTout")}
                  />
                  {(stats.personnel?.total ?? 0) === 0 ? (
                    <p className="px-4 py-8 text-center text-xs text-texte-secondaire">
                      {t("admin.dashboard.aucuneSession")}
                    </p>
                  ) : (
                    <div className="px-4 py-4">
                      <div className="flex items-center">
                        {(stats.personnel?.avatars ?? []).map((u, i) => (
                          <div
                            key={u.id}
                            className={cn("relative", i > 0 && "-ml-2")}
                            style={{ zIndex: 10 - i }}
                            title={`${u.prenom} ${u.nom}`}
                          >
                            <AvatarUtilisateur
                              prenom={u.prenom}
                              nom={u.nom}
                              photoUrl={u.photoUrl}
                              taille="sm"
                              className="ring-2 ring-white"
                            />
                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                          </div>
                        ))}
                        {(stats.personnel?.total ?? 0) > (stats.personnel?.avatars.length ?? 0) ? (
                          <span className="-ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-texte-secondaire ring-2 ring-white">
                            +
                            {(stats.personnel?.total ?? 0) -
                              (stats.personnel?.avatars.length ?? 0)}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-texte-secondaire">
                        {(stats.personnel?.parRole ?? [])
                          .map((r) => `${r.label} ${r.count}`)
                          .join(" · ")}
                      </p>
                    </div>
                  )}
                </section>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
                <EnTeteCarte
                  titre={t("admin.dashboard.connexions7j")}
                  href="/sigh/admin/statistiques"
                  lien={t("admin.dashboard.voirRapport")}
                />
                <div className="px-3 py-3">
                  <GraphiqueConnexionsAdmin
                    points={stats.connexions7j ?? []}
                    labelSerie={t("admin.dashboard.serieConnexions")}
                    locale={i18n.language}
                  />
                </div>
              </section>

              <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
                <EnTeteCarte
                  titre={t("admin.dashboard.repartitionExamens")}
                  href="/sigh/admin/statistiques"
                  lien={t("admin.dashboard.voirRapport")}
                />
                <div className="px-4 py-4">
                  <GraphiqueExamensAdmin
                    data={
                      stats.examensJour ?? {
                        termines: 0,
                        enCours: 0,
                        enAttente: 0,
                        nonRealises: 0,
                      }
                    }
                    labels={{
                      termines: t("admin.dashboard.examens.termines"),
                      enCours: t("admin.dashboard.examens.enCours"),
                      enAttente: t("admin.dashboard.examens.enAttente"),
                      nonRealises: t("admin.dashboard.examens.nonRealises"),
                    }}
                    totalLabel={t("admin.dashboard.total")}
                  />
                </div>
              </section>

              <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm lg:col-span-2 xl:col-span-1">
                <EnTeteCarte
                  titre={t("admin.dashboard.journalTitre")}
                  href="/sigh/admin/audit"
                  lien={t("admin.dashboard.voirTout")}
                />
                {auditMouvements.length === 0 ? (
                  <p className="px-4 py-8 text-center text-xs text-texte-secondaire">
                    {t("admin.dashboard.journalVide")}
                  </p>
                ) : (
                  <ul className="divide-y divide-gris-bordure">
                    {auditMouvements.map((e) => {
                      const Icone = ICONES_AUDIT[e.type] ?? FileText;
                      return (
                        <li key={e.id} className="flex items-start gap-3 px-4 py-2.5">
                          <span
                            className={cn(
                              "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                              COULEURS_ICONE_AUDIT[e.type] ?? "bg-slate-50 text-slate-600"
                            )}
                          >
                            <Icone className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-texte-principal">
                              {t(`admin.audit.types.${e.type}`, { defaultValue: e.type })}
                              {e.entite ? ` · ${e.entite}` : ""}
                            </p>
                            <p className="line-clamp-2 text-[11px] text-texte-secondaire">
                              {e.action}
                            </p>
                          </div>
                          <time className="shrink-0 font-mono text-[11px] text-texte-secondaire">
                            {fmtHeure(e.createdAt)}
                          </time>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </MiseEnPageAdmin>
  );
}
