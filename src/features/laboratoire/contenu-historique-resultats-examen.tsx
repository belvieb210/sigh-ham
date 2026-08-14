"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ArrowLeft, FlaskConical, Loader2, UserRound } from "lucide-react";
import {
  MiseEnPageLaboratoire,
  type UtilisateurLaboratoire,
} from "@/features/laboratoire/mise-en-page-laboratoire";
import { formaterParametre } from "@/features/laboratoire/utils-saisie-resultats";
import type { HistoriqueResultatsExamenDto } from "@/lib/laboratoire/historique-resultats-examen";
import { cn } from "@/lib/utils";

interface PropsContenuHistoriqueResultatsExamen {
  utilisateur: UtilisateurLaboratoire;
  dossierId: string;
  examenId: string;
  urlRetour: string;
}

function formaterDateHeure(iso: string | null, locale: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function ContenuHistoriqueResultatsExamen({
  utilisateur,
  dossierId,
  examenId,
  urlRetour,
}: PropsContenuHistoriqueResultatsExamen) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [historique, setHistorique] = useState<HistoriqueResultatsExamenDto | null>(
    null
  );
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;
    setChargement(true);
    (async () => {
      try {
        const res = await fetch(
          `/api/laboratoire/examens/${encodeURIComponent(examenId)}/historique-resultats`
        );
        const data = (await res.json()) as {
          historique?: HistoriqueResultatsExamenDto;
          erreur?: string;
        };
        if (annule) return;
        if (!res.ok) {
          setErreur(data.erreur ?? t("laboratoire.historiqueResultats.erreur"));
          return;
        }
        setHistorique(data.historique ?? null);
        setErreur(null);
      } catch {
        if (!annule) setErreur(t("laboratoire.historiqueResultats.erreur"));
      } finally {
        if (!annule) setChargement(false);
      }
    })();
    return () => {
      annule = true;
    };
  }, [examenId, t]);

  const nomPatient = historique
    ? `${historique.patient.prenom} ${historique.patient.nom}`.trim()
    : "";

  return (
    <MiseEnPageLaboratoire
      utilisateur={utilisateur}
      titre={t("laboratoire.historiqueResultats.titre")}
      sousTitre={
        historique
          ? t("laboratoire.historiqueResultats.sousTitre", {
              examen: historique.typeExamen.libelle,
              patient: nomPatient,
            })
          : t("laboratoire.saisieResultats.chargement")
      }
    >
      <div className="mx-auto w-full max-w-[1100px] space-y-4 pb-8">
        <button
          type="button"
          onClick={() => router.push(urlRetour)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("laboratoire.historiqueResultats.retourFormulaire")}
        </button>

        {chargement && (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            {t("laboratoire.historiqueResultats.chargement")}
          </div>
        )}

        {!chargement && erreur && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {erreur}
          </div>
        )}

        {!chargement && !erreur && historique && historique.occurrences.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
            {t("laboratoire.historiqueResultats.aucuneOccurrence")}
          </div>
        )}

        {!chargement &&
          !erreur &&
          historique?.occurrences.map((occ, index) => {
            const estCourant = occ.examenId === historique.examenCourantId;
            return (
              <section
                key={occ.examenId}
                className={cn(
                  "overflow-hidden rounded-xl border bg-white shadow-sm",
                  estCourant ? "border-violet-300 ring-1 ring-violet-100" : "border-slate-200"
                )}
              >
                <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                      <FlaskConical className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {t("laboratoire.historiqueResultats.occurrence", {
                          numero: historique.occurrences.length - index,
                        })}
                        {estCourant && (
                          <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
                            {t("laboratoire.historiqueResultats.examenCourant")}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {t("laboratoire.historiqueResultats.numeroDossier")} :{" "}
                        {occ.numeroDossier}
                        {occ.dossierId !== dossierId && (
                          <span className="ml-1 text-slate-400">
                            ({t("laboratoire.historiqueResultats.autreDossier")})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-600">
                    <p className="font-semibold text-slate-800">
                      {formaterDateHeure(occ.dateResultat, i18n.language)}
                    </p>
                    <p className="mt-1 inline-flex items-center justify-end gap-1">
                      <UserRound className="h-3.5 w-3.5 text-slate-400" />
                      {t("laboratoire.historiqueResultats.enregistrePar")} :{" "}
                      {occ.enregistrePar ?? "—"}
                    </p>
                  </div>
                </header>

                {(occ.orientationAnalyse || occ.remarque) && (
                  <div className="space-y-1 border-b border-slate-100 px-4 py-3 text-sm text-slate-700">
                    {occ.orientationAnalyse && (
                      <p>
                        <span className="font-medium text-slate-900">
                          {t("laboratoire.historiqueResultats.orientation")} :
                        </span>{" "}
                        {occ.orientationAnalyse}
                      </p>
                    )}
                    {occ.remarque && (
                      <p>
                        <span className="font-medium text-slate-900">
                          {t("laboratoire.historiqueResultats.remarque")} :
                        </span>{" "}
                        {occ.remarque}
                      </p>
                    )}
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-white text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-2.5">
                          {t("laboratoire.saisieResultats.colParametre")}
                        </th>
                        <th className="px-4 py-2.5">
                          {t("laboratoire.saisieResultats.colResultat")}
                        </th>
                        <th className="px-4 py-2.5">
                          {t("laboratoire.saisieResultats.colUnite")}
                        </th>
                        <th className="px-4 py-2.5">
                          {t("laboratoire.saisieResultats.colValeursReference")}
                        </th>
                        <th className="px-4 py-2.5">
                          {t("laboratoire.saisieResultats.commentaireParametre")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {occ.parametres.map((p) => {
                        const { acronyme, libelle } = formaterParametre(p.nom);
                        const afficher = p.nonRequis
                          ? "NR"
                          : p.valeur.trim() || "—";
                        return (
                          <tr key={`${occ.examenId}-${p.nom}`} className="hover:bg-slate-50/60">
                            <td className="px-4 py-2.5">
                              <p className="font-semibold text-violet-900">{acronyme}</p>
                              {libelle && libelle !== acronyme && (
                                <p className="text-xs text-slate-500">{libelle}</p>
                              )}
                            </td>
                            <td className="px-4 py-2.5 font-medium text-slate-900">
                              {afficher}
                              {p.flag && !p.nonRequis && (
                                <span className="ml-1 text-xs text-rose-600">{p.flag}</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-slate-600">{p.unite ?? "—"}</td>
                            <td className="px-4 py-2.5 text-slate-600">
                              {p.rangeUsuelle ?? "—"}
                            </td>
                            <td className="px-4 py-2.5 text-slate-600">
                              {p.commentaire?.trim() || "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
      </div>
    </MiseEnPageLaboratoire>
  );
}
