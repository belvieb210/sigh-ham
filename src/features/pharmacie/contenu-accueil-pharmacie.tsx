"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  Banknote,
  ClipboardList,
  FileText,
  Loader2,
  Package,
  PackageCheck,
  Pill,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";
import {
  MiseEnPagePharmacie,
  type UtilisateurPharmacie,
} from "@/features/pharmacie/mise-en-page-pharmacie";
import type { ApercuDashboardPharmacie } from "@/lib/pharmacie/types";
import { cn } from "@/lib/utils";

function formaterMontant(v: number) {
  return `${Math.round(v).toLocaleString("fr-FR")} FC`;
}

function formaterHeure(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

const STYLES_ALERTE = {
  stock_faible: "bg-amber-100 text-amber-800",
  critique: "bg-red-100 text-red-800",
  expiration: "bg-yellow-100 text-yellow-900",
  perime: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-800",
} as const;

export function ContenuAccueilPharmacie({
  utilisateur,
}: {
  utilisateur: UtilisateurPharmacie;
}) {
  const { t } = useTranslation();
  const [apercu, setApercu] = useState<ApercuDashboardPharmacie | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let a = false;
    (async () => {
      try {
        const res = await fetch("/api/pharmacie/stats?apercu=1");
        const data = (await res.json()) as {
          apercu?: ApercuDashboardPharmacie;
          erreur?: string;
        };
        if (!a) {
          if (!res.ok || !data.apercu) {
            setErreur(data.erreur ?? t("pharmacie.dashboard.erreur"));
          } else {
            setApercu(data.apercu);
          }
        }
      } catch {
        if (!a) setErreur(t("pharmacie.dashboard.erreur"));
      } finally {
        if (!a) setChargement(false);
      }
    })();
    return () => {
      a = true;
    };
  }, [t]);

  const stats = apercu?.stats ?? null;

  const kpis = useMemo(
    () => [
      {
        label: t("pharmacie.dashboard.ordonnancesRecues"),
        valeur: stats?.ordonnancesRecuesJour ?? 0,
        sousTitre: t("pharmacie.dashboard.aujourdhui"),
        href: "/sigh/pharmacie/vente",
        icone: ClipboardList,
        couleurIcone: "bg-violet-100 text-violet-700",
      },
      {
        label: t("pharmacie.dashboard.ventesJour"),
        valeur: stats?.ventesDuJour ?? 0,
        sousTitre: t("pharmacie.dashboard.totalTransactions"),
        href: "/sigh/pharmacie/vente",
        icone: ShoppingCart,
        couleurIcone: "bg-blue-100 text-blue-700",
      },
      {
        label: t("pharmacie.dashboard.caJour"),
        valeur: formaterMontant(stats?.chiffreAffairesJour ?? 0),
        sousTitre: t("pharmacie.dashboard.aujourdhui"),
        href: "/sigh/pharmacie/rapports",
        icone: Banknote,
        couleurIcone: "bg-emerald-100 text-emerald-700",
      },
      {
        label: t("pharmacie.dashboard.enAttentePaiement"),
        valeur: stats?.ventesEnAttentePaiement ?? 0,
        sousTitre: t("pharmacie.dashboard.aTransmettreCaisse"),
        href: "/sigh/pharmacie/vente",
        icone: Wallet,
        couleurIcone: "bg-orange-100 text-orange-700",
      },
      {
        label: t("pharmacie.dashboard.paiementsValides"),
        valeur: stats?.paiementsValidesJour ?? 0,
        sousTitre: t("pharmacie.dashboard.paiementsValidesSousTitre"),
        href: "/sigh/pharmacie/paiements-valides",
        icone: FileText,
        couleurIcone: "bg-emerald-100 text-emerald-800",
      },
      {
        label: t("pharmacie.dashboard.stockFaible"),
        valeur: stats?.stockFaible ?? 0,
        sousTitre: t("pharmacie.dashboard.medicaments"),
        href: "/sigh/pharmacie/vente",
        icone: Package,
        couleurIcone: "bg-red-100 text-red-700",
      },
      {
        label: t("pharmacie.dashboard.perimes"),
        valeur: stats?.lotsExpires ?? 0,
        sousTitre: t("pharmacie.dashboard.medicaments"),
        href: "/sigh/pharmacie/vente",
        icone: AlertTriangle,
        couleurIcone: "bg-red-100 text-red-600",
      },
    ],
    [stats, t]
  );

  const actionsRapides = [
    {
      href: "/sigh/pharmacie/vente",
      label: t("pharmacie.dashboard.actionNouvelleVente"),
      icone: ShoppingCart,
      style: "border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100",
    },
    {
      href: "/sigh/pharmacie/nouveau-client",
      label: t("pharmacie.dashboard.actionNouveauClient"),
      icone: ClipboardList,
      style: "border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100",
    },
    {
      href: "/sigh/pharmacie/vente",
      label: t("pharmacie.dashboard.actionVenteDirecte"),
      icone: Pill,
      style: "border-cyan-200 bg-cyan-50 text-cyan-900 hover:bg-cyan-100",
    },
    {
      href: "/sigh/pharmacie/paiements-valides",
      label: t("pharmacie.dashboard.actionPaiementsValides"),
      icone: PackageCheck,
      style: "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100",
    },
    {
      href: "/sigh/pharmacie/vente",
      label: t("pharmacie.dashboard.actionNouveauMedicament"),
      icone: Package,
      style: "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100",
    },
    {
      href: "/sigh/pharmacie/vente",
      label: t("pharmacie.dashboard.actionAchatStock"),
      icone: Banknote,
      style: "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100",
    },
    {
      href: "/sigh/pharmacie/historique",
      label: t("pharmacie.dashboard.actionInventaire"),
      icone: FileText,
      style: "border-indigo-200 bg-indigo-50 text-indigo-900 hover:bg-indigo-100",
    },
  ];

  return (
    <MiseEnPagePharmacie
      utilisateur={utilisateur}
      titre={t("pharmacie.dashboard.titre")}
      sousTitre={t("pharmacie.dashboard.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1400px] space-y-5">
        {chargement ? (
          <div className="flex items-center gap-2 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("pharmacie.dashboard.chargement")}
          </div>
        ) : erreur ? (
          <p className="text-sm text-red-600">{erreur}</p>
        ) : (
          <>
            <div className="grille-kpi-sigh lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
              {kpis.map((kpi) => {
                const Icone = kpi.icone;
                return (
                  <Link
                    key={kpi.label}
                    href={kpi.href}
                    className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm transition-colors hover:border-bleu-medical/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-medium text-texte-secondaire">
                          {kpi.label}
                        </p>
                        <p className="mt-1 text-xl font-bold text-texte-principal xl:text-2xl">
                          {kpi.valeur}
                        </p>
                        <p className="mt-0.5 text-[10px] text-texte-secondaire">
                          {kpi.sousTitre}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          kpi.couleurIcone
                        )}
                      >
                        <Icone className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="grid gap-4 xl:grid-cols-12">
              <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm xl:col-span-3">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-texte-principal">
                    {t("pharmacie.dashboard.ordonnancesRecuesTitre")}
                  </h2>
                  <Link
                    href="/sigh/pharmacie/vente"
                    className="text-xs font-medium text-bleu-medical hover:underline"
                  >
                    {t("pharmacie.dashboard.voirTout")}
                  </Link>
                </div>
                {(apercu?.ordonnancesRecentes.length ?? 0) === 0 ? (
                  <p className="text-sm text-texte-secondaire">
                    {t("pharmacie.dashboard.aucuneOrdonnance")}
                  </p>
                ) : (
                  <ul className="divide-y divide-gris-bordure">
                    {apercu!.ordonnancesRecentes.map((o) => (
                      <li key={o.id}>
                        <Link
                          href={`/sigh/pharmacie/vente?dossier=${encodeURIComponent(o.dossierId)}`}
                          className="flex items-center gap-3 py-2.5 hover:bg-gris-tres-clair/50"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                            {o.nomComplet.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-bleu-medical">
                              {o.reference}
                            </p>
                            <p className="truncate text-sm font-medium text-texte-principal">
                              {o.nomComplet}
                            </p>
                            <p className="text-[11px] text-texte-secondaire">{o.sexeAge}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-xs text-texte-secondaire">{o.heure}</p>
                            <span className="mt-0.5 inline-flex rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                              {o.statut}
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm xl:col-span-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-texte-principal">
                    {t("pharmacie.dashboard.ventesEnAttenteTitre")}
                  </h2>
                  <Link
                    href="/sigh/pharmacie/vente"
                    className="text-xs font-medium text-bleu-medical hover:underline"
                  >
                    {t("pharmacie.dashboard.voirTout")}
                  </Link>
                </div>
                {(apercu?.ventesEnAttente.length ?? 0) === 0 ? (
                  <p className="text-sm text-texte-secondaire">
                    {t("pharmacie.dashboard.aucuneVenteAttente")}
                  </p>
                ) : (
                  <div className="overflow-hidden">
                    <table className="min-w-full text-left text-xs">
                      <thead className="border-b border-gris-bordure text-[10px] uppercase text-texte-secondaire">
                        <tr>
                          <th className="pb-2 pr-2">{t("pharmacie.dashboard.colVente")}</th>
                          <th className="pb-2 pr-2">{t("pharmacie.dashboard.colClient")}</th>
                          <th className="pb-2 pr-2">{t("pharmacie.dashboard.colMontant")}</th>
                          <th className="pb-2 pr-2">{t("pharmacie.dashboard.colHeure")}</th>
                          <th className="pb-2">{t("pharmacie.dashboard.colActions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apercu!.ventesEnAttente.map((v) => (
                          <tr key={v.id} className="border-b border-gris-bordure/60">
                            <td className="py-2 pr-2 font-medium text-bleu-medical">
                              {v.numero}
                            </td>
                            <td className="max-w-[8rem] truncate py-2 pr-2 text-texte-principal">
                              {v.nomComplet}
                            </td>
                            <td className="py-2 pr-2 font-medium">
                              {formaterMontant(v.montantTotal)}
                            </td>
                            <td className="py-2 pr-2 text-texte-secondaire">
                              {formaterHeure(v.creeLe)}
                            </td>
                            <td className="py-2">
                              <Link
                                href={`/sigh/pharmacie/vente?dossier=${encodeURIComponent(v.dossierId)}`}
                                className="inline-flex rounded-md border border-gris-bordure bg-white px-2 py-1 text-[10px] font-medium hover:bg-gris-tres-clair"
                              >
                                {t("pharmacie.dashboard.transmettre")}
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm xl:col-span-2">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-texte-principal">
                    {t("pharmacie.dashboard.topMedicamentsTitre")}
                  </h2>
                  <Link
                    href="/sigh/pharmacie/rapports"
                    className="text-xs font-medium text-bleu-medical hover:underline"
                  >
                    {t("pharmacie.dashboard.voirRapport")}
                  </Link>
                </div>
                {(apercu?.topMedicaments.length ?? 0) === 0 ? (
                  <p className="text-sm text-texte-secondaire">—</p>
                ) : (
                  <ol className="space-y-2">
                    {apercu!.topMedicaments.map((m, i) => (
                      <li
                        key={m.nom}
                        className="flex items-start gap-2 rounded-lg bg-gris-tres-clair/40 px-2 py-1.5"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-800">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-texte-principal">
                            {m.nom}
                          </p>
                          <p className="text-[10px] text-texte-secondaire">
                            {m.quantite} {t("pharmacie.dashboard.unites")}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm xl:col-span-2">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-texte-principal">
                    {t("pharmacie.dashboard.alertesTitre")}
                  </h2>
                  <Link
                    href="/sigh/pharmacie/vente"
                    className="text-xs font-medium text-bleu-medical hover:underline"
                  >
                    {t("pharmacie.dashboard.voirTout")}
                  </Link>
                </div>
                {(apercu?.alertes.length ?? 0) === 0 ? (
                  <p className="text-sm text-texte-secondaire">
                    {t("pharmacie.dashboard.aucuneAlerte")}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {apercu!.alertes.map((a) => (
                      <li
                        key={a.id}
                        className="flex items-start justify-between gap-2 border-b border-gris-bordure/60 pb-2 last:border-0"
                      >
                        <div className="flex min-w-0 items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                          <p className="text-xs text-texte-principal">{a.message}</p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                            STYLES_ALERTE[a.type]
                          )}
                        >
                          {a.libelle}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-texte-principal">
                {t("pharmacie.dashboard.actionsRapidesTitre")}
              </h2>
              <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
                {actionsRapides.map((action) => {
                  const Icone = action.icone;
                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-center text-[11px] font-medium transition-colors",
                        action.style
                      )}
                    >
                      <Icone className="h-5 w-5" />
                      <span>{action.label}</span>
                    </Link>
                  );
                })}
              </div>
            </section>

            <div className="flex items-center gap-2 text-xs text-texte-secondaire">
              <Users className="h-3.5 w-3.5" />
              {t("pharmacie.dashboard.patientsEnFile")} : {stats?.patientsEnFile ?? 0}
            </div>
          </>
        )}
      </div>
    </MiseEnPagePharmacie>
  );
}
