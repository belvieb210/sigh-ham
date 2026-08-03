"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Loader2,
  Search,
} from "lucide-react";
import { EVENEMENT_CAISSE_PATIENTS_MODIFIES } from "@/constants/caisse";
import { useSelectionTransfertCaisse } from "@/features/caisse/contexte-selection-transfert-caisse";
import { MenuActionsTransfertCaisse } from "@/features/caisse/menu-actions-transfert-caisse";
import { ModaleExamensCaisse } from "@/features/caisse/modale-examens-caisse";
import { formaterMontantCaisse } from "@/features/caisse/utils-format";
import type { PatientTransfertCaisse, StatsTransfertsCaisse } from "@/lib/caisse/types";
import { cn } from "@/lib/utils";

const PAR_PAGE = 8;

export function ListePatientsTransfertsCaisse() {
  const { t } = useTranslation();
  const { patientSelectionne, selectionnerPatient, synchroniserSelection } =
    useSelectionTransfertCaisse();
  const [patients, setPatients] = useState<PatientTransfertCaisse[]>([]);
  const [stats, setStats] = useState<StatsTransfertsCaisse>({
    enAttente: 0,
    enCours: 0,
    transferesAujourdhui: 0,
    versLaboratoire: 0,
  });
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);
  const [patientExamens, setPatientExamens] = useState<PatientTransfertCaisse | null>(null);
  const [modaleExamensOuverte, setModaleExamensOuverte] = useState(false);

  const charger = useCallback(
    async (options?: { silencieux?: boolean }) => {
      const silencieux = options?.silencieux ?? false;
      if (!silencieux) {
        setChargement(true);
        setErreur(null);
      }
      try {
        const res = await fetch("/api/caisse/transferts");
        const data = (await res.json()) as {
          patients?: PatientTransfertCaisse[];
          stats?: StatsTransfertsCaisse;
          message?: string;
        };
        if (!res.ok) throw new Error(data.message ?? "Chargement impossible.");
        const liste = data.patients ?? [];
        setPatients(liste);
        synchroniserSelection(liste);
        setStats(
          data.stats ?? {
            enAttente: 0,
            enCours: 0,
            transferesAujourdhui: 0,
            versLaboratoire: 0,
          }
        );
      } catch (error) {
        if (!silencieux) {
          setErreur(
            error instanceof Error ? error.message : "Impossible de charger la liste."
          );
        }
      } finally {
        if (!silencieux) setChargement(false);
      }
    },
    [synchroniserSelection]
  );

  useEffect(() => {
    void charger();
  }, [charger]);

  useEffect(() => {
    const onModifie = () => {
      void charger({ silencieux: true });
    };
    window.addEventListener(EVENEMENT_CAISSE_PATIENTS_MODIFIES, onModifie);
    return () => window.removeEventListener(EVENEMENT_CAISSE_PATIENTS_MODIFIES, onModifie);
  }, [charger]);

  const filtres = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    if (!terme) return patients;
    return patients.filter(
      (p) =>
        p.nomComplet.toLowerCase().includes(terme) ||
        p.numeroPatient.toLowerCase().includes(terme) ||
        p.numeroDossier.toLowerCase().includes(terme) ||
        p.telephone.toLowerCase().includes(terme) ||
        p.motif.toLowerCase().includes(terme)
    );
  }, [patients, recherche]);

  const totalPages = Math.max(1, Math.ceil(filtres.length / PAR_PAGE));
  const pageCourante = Math.min(page, totalPages);
  const debut = (pageCourante - 1) * PAR_PAGE;
  const pagePatients = filtres.slice(debut, debut + PAR_PAGE);

  if (chargement) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-white py-16 text-sm text-texte-secondaire">
        <Loader2 className="h-5 w-5 animate-spin" />
        {t("caisse.transferts.chargement")}
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
        <p className="text-sm text-red-700">{erreur}</p>
        <button
          type="button"
          onClick={() => void charger()}
          className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700"
        >
          {t("caisse.transferts.reessayer")}
        </button>
      </div>
    );
  }

  const cartes = [
    {
      label: t("caisse.transferts.stats.transferesAujourdhui"),
      valeur: stats.transferesAujourdhui,
      accent: "text-emerald-600",
    },
    {
      label: t("caisse.transferts.stats.resultats"),
      valeur: filtres.length,
      accent: "text-bleu-medical",
    },
    {
      label: t("caisse.transferts.stats.enAttente"),
      valeur: stats.enAttente,
      accent: "text-texte-principal",
    },
    {
      label: t("caisse.transferts.stats.enCours"),
      valeur: stats.enCours,
      accent: "text-texte-principal",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cartes.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-gris-bordure bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-texte-secondaire">
              {c.label}
            </p>
            <p className={cn("mt-1 text-2xl font-bold", c.accent)}>{c.valeur}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire" />
            <input
              value={recherche}
              onChange={(e) => {
                setRecherche(e.target.value);
                setPage(1);
              }}
              placeholder={t("caisse.transferts.placeholder")}
              className="w-full rounded-lg border border-gris-bordure py-2.5 pl-10 pr-3 text-sm focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gris-bordure px-4 py-2.5 text-sm font-medium text-texte-principal hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            {t("caisse.transferts.exporter")}
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            setRecherche("");
            setPage(1);
          }}
          className="mt-3 text-xs font-semibold text-bleu-medical hover:underline"
        >
          {t("caisse.transferts.reinitialiserFiltres")}
        </button>
      </div>

      <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
        <div className="border-b border-gris-bordure px-4 py-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
            {t("caisse.transferts.tableau")}
          </h3>
        </div>

        {pagePatients.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-texte-secondaire">
            {t("caisse.transferts.vide")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-texte-secondaire">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">ID</th>
                  <th className="px-4 py-2.5 font-semibold">{t("caisse.transferts.colNom")}</th>
                  <th className="hidden px-4 py-2.5 font-semibold md:table-cell">
                    {t("caisse.transferts.colTelephone")}
                  </th>
                  <th className="hidden px-4 py-2.5 font-semibold lg:table-cell">
                    {t("caisse.transferts.colProvenance")}
                  </th>
                  <th className="px-4 py-2.5 font-semibold">
                    {t("caisse.transferts.colOrientation")}
                  </th>
                  <th className="px-4 py-2.5 font-semibold">{t("caisse.transferts.colStatut")}</th>
                  <th className="px-4 py-2.5 font-semibold">{t("caisse.transferts.colHeure")}</th>
                  <th className="px-4 py-2.5 font-semibold">{t("caisse.transferts.colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {pagePatients.map((p) => {
                  const selectionne = patientSelectionne?.cleListe === p.cleListe;
                  return (
                    <tr
                      key={p.cleListe}
                      onClick={() => selectionnerPatient(p)}
                      className={cn(
                        "cursor-pointer border-t border-gris-bordure/70 transition-colors",
                        selectionne ? "bg-bleu-medical-clair/40" : "hover:bg-slate-50"
                      )}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-texte-secondaire">
                        {p.numeroPatient}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-texte-principal">{p.nomComplet}</p>
                        <p className="text-[11px] text-texte-secondaire">
                          {p.nombreExamens} examen(s) · {formaterMontantCaisse(p.montantEstime)}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3 text-texte-secondaire md:table-cell">
                        {p.telephone}
                      </td>
                      <td className="hidden max-w-[160px] truncate px-4 py-3 text-texte-secondaire lg:table-cell">
                        {p.provenance}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            p.orientationCouleur
                          )}
                        >
                          {p.orientation}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            p.statutCouleur
                          )}
                        >
                          {p.statut}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-texte-secondaire">{p.heure}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              selectionnerPatient(p);
                              setPatientExamens(p);
                              setModaleExamensOuverte(true);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gris-bordure text-texte-secondaire hover:border-bleu-medical/40 hover:text-bleu-medical"
                            aria-label={t("caisse.transferts.voirExamens")}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <MenuActionsTransfertCaisse
                            patient={p}
                            onRafraichir={() => void charger({ silencieux: true })}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gris-bordure px-4 py-3 text-xs text-texte-secondaire">
          <p>
            {t("caisse.transferts.pagination", {
              debut: filtres.length === 0 ? 0 : debut + 1,
              fin: Math.min(debut + PAR_PAGE, filtres.length),
              total: filtres.length,
            })}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pageCourante <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-gris-bordure px-3 py-1.5 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {t("caisse.transferts.prec")}
            </button>
            <button
              type="button"
              disabled={pageCourante >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-gris-bordure px-3 py-1.5 disabled:opacity-40"
            >
              {t("caisse.transferts.suiv")}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      <ModaleExamensCaisse
        patient={patientExamens}
        ouverte={modaleExamensOuverte}
        onFermer={() => {
          setModaleExamensOuverte(false);
          setPatientExamens(null);
        }}
      />
    </div>
  );
}
