"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Activity,
  FileText,
  FlaskConical,
  Loader2,
  MessageSquare,
  Receipt,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { Bouton } from "@/components/ui/bouton";
import {
  BoutonsOutilsListe,
  telechargerCsv,
} from "@/components/ui/boutons-outils-liste";
import {
  PaginationListe,
  paginerListe,
} from "@/components/ui/pagination-liste";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import { cn } from "@/lib/utils";

interface StatsAdmin {
  kpis: Record<string, number>;
  salles: { code: string; nom: string; enFile: number }[];
  genereLe: string;
}

const SALLES_PAR_PAGE = 16;

function CarteKpi({
  icone: Icone,
  label,
  valeur,
  accent,
}: {
  icone: typeof Activity;
  label: string;
  valeur: number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-texte-secondaire">
          {label}
        </p>
        <span className={cn("rounded-lg p-1.5", accent)}>
          <Icone className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-texte-principal">
        {valeur}
      </p>
    </div>
  );
}

export function ContenuSupervisionAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsAdmin | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [rechercheRapide, setRechercheRapide] = useState("");
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [chargeBrouillon, setChargeBrouillon] = useState("");
  const [chargeApplique, setChargeApplique] = useState("");
  const [idsCoches, setIdsCoches] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const charger = useCallback(() => {
    fetch("/api/admin/stats")
      .then(async (res) => {
        const data = (await res.json()) as StatsAdmin & { message?: string };
        if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
        setStats(data);
        setErreur(null);
      })
      .catch((e: unknown) =>
        setErreur(e instanceof Error ? e.message : t("admin.common.erreur"))
      );
  }, [t]);

  useEffect(() => {
    charger();
    const id = window.setInterval(charger, 15000);
    return () => window.clearInterval(id);
  }, [charger]);

  const listeFiltree = useMemo(() => {
    const salles = stats?.salles ?? [];
    const q = rechercheRapide.trim().toLowerCase();
    return salles.filter((s) => {
      if (chargeApplique === "occupees" && s.enFile === 0) return false;
      if (chargeApplique === "vides" && s.enFile > 0) return false;
      if (!q) return true;
      return `${s.nom} ${s.code}`.toLowerCase().includes(q);
    });
  }, [stats, rechercheRapide, chargeApplique]);

  const pageData = useMemo(
    () => paginerListe(listeFiltree, page, SALLES_PAR_PAGE),
    [listeFiltree, page]
  );

  useEffect(() => {
    setPage(1);
  }, [rechercheRapide, chargeApplique]);

  const nbFiltres = chargeApplique ? 1 : 0;
  const toutSelectionne =
    listeFiltree.length > 0 &&
    listeFiltree.every((s) => idsCoches.includes(s.code));
  const maxFile = Math.max(1, ...listeFiltree.map((s) => s.enFile));

  const exporterSelection = () => {
    const coches = new Set(idsCoches);
    const cibles =
      coches.size > 0
        ? listeFiltree.filter((s) => coches.has(s.code))
        : listeFiltree;
    if (cibles.length === 0) return;
    telechargerCsv(
      `admin-supervision-${new Date().toISOString().slice(0, 10)}.csv`,
      [t("admin.services.colonnes.service"), t("admin.services.enFile")],
      cibles.map((s) => [s.nom, String(s.enFile)])
    );
  };

  const kpis = stats?.kpis;

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.supervision.titre")}
      sousTitre={t("admin.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <EnTetePageReception
          icone={Activity}
          titre={t("admin.supervision.titre")}
          description={t("admin.supervision.description")}
          fil={[
            { label: t("admin.common.salle"), href: "/sigh/admin" },
            { label: t("admin.supervision.fil") },
          ]}
        />

        <div className="mt-2 flex items-center gap-2 text-xs text-texte-secondaire">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          {t("admin.dashboard.majAuto")}{" "}
          {stats ? new Date(stats.genereLe).toLocaleTimeString() : "—"}
        </div>

        {erreur ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {erreur}
          </p>
        ) : null}

        {!stats || !kpis ? (
          <p className="mt-6 flex items-center gap-2 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("admin.common.chargement")}
          </p>
        ) : (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <CarteKpi
                icone={Users}
                label={t("admin.dashboard.sessionsActives")}
                valeur={kpis.sessionsActives ?? 0}
                accent="bg-sky-50 text-sky-700"
              />
              <CarteKpi
                icone={Activity}
                label={t("admin.dashboard.connexionsJour")}
                valeur={kpis.connexionsJour ?? 0}
                accent="bg-emerald-50 text-emerald-700"
              />
              <CarteKpi
                icone={MessageSquare}
                label={t("admin.dashboard.messagesJour")}
                valeur={kpis.messagesJour ?? 0}
                accent="bg-violet-50 text-violet-700"
              />
              <CarteKpi
                icone={FileText}
                label={t("admin.dashboard.dossiersOuverts")}
                valeur={kpis.dossiersOuverts ?? 0}
                accent="bg-amber-50 text-amber-800"
              />
              <CarteKpi
                icone={Receipt}
                label={t("admin.dashboard.facturesJour")}
                valeur={kpis.facturesJour ?? 0}
                accent="bg-orange-50 text-orange-700"
              />
              <CarteKpi
                icone={FlaskConical}
                label={t("admin.dashboard.examensPrescrits")}
                valeur={kpis.examensPrescrits ?? 0}
                accent="bg-teal-50 text-teal-700"
              />
              <CarteKpi
                icone={FlaskConical}
                label={t("admin.dashboard.examensTermines")}
                valeur={kpis.examensTermines ?? 0}
                accent="bg-indigo-50 text-indigo-700"
              />
              <CarteKpi
                icone={MessageSquare}
                label={t("admin.dashboard.conversationsActives")}
                valeur={kpis.conversationsActives ?? 0}
                accent="bg-pink-50 text-pink-700"
              />
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex h-11 min-w-[180px] w-full max-w-md flex-1 items-center gap-2 rounded-lg border-2 border-slate-400 bg-white px-3 text-sm shadow-sm focus-within:border-bleu-medical focus-within:ring-2 focus-within:ring-bleu-medical/25">
                  <Search className="h-4 w-4 shrink-0 text-slate-600" />
                  <input
                    type="search"
                    value={rechercheRapide}
                    onChange={(e) => setRechercheRapide(e.target.value)}
                    placeholder={t("admin.supervision.recherche")}
                    className="min-w-0 flex-1 bg-transparent outline-none"
                  />
                  {rechercheRapide ? (
                    <button type="button" onClick={() => setRechercheRapide("")}>
                      <X className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                  ) : null}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFiltresOuverts((o) => !o)}
                    className={cn(
                      "relative inline-flex h-11 w-11 items-center justify-center rounded-lg border",
                      filtresOuverts
                        ? "border-bleu-medical bg-bleu-medical-clair text-bleu-medical"
                        : "border-gris-bordure bg-white"
                    )}
                  >
                    <SlidersHorizontal className="h-5 w-5" />
                    <span
                      className={cn(
                        "absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white",
                        nbFiltres > 0 ? "bg-red-500" : "bg-slate-400"
                      )}
                    >
                      {nbFiltres}
                    </span>
                  </button>
                  <BoutonsOutilsListe
                    toutSelectionne={toutSelectionne}
                    onSelectionnerTout={() =>
                      setIdsCoches(
                        toutSelectionne ? [] : listeFiltree.map((s) => s.code)
                      )
                    }
                    onExporter={exporterSelection}
                    labelSelectionnerTout={t("reception.liste.selectionnerTout")}
                    labelExporter={t("reception.liste.exporterSelection")}
                  />
                </div>
              </div>
              {filtresOuverts ? (
                <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                  <label className={CLASSE_LABEL_RECEPTION} htmlFor="sup-charge">
                    {t("admin.supervision.filtreCharge")}
                  </label>
                  <select
                    id="sup-charge"
                    className={CLASSE_CHAMP_RECEPTION}
                    value={chargeBrouillon}
                    onChange={(e) => setChargeBrouillon(e.target.value)}
                  >
                    <option value="">{t("admin.supervision.toutesFiles")}</option>
                    <option value="occupees">
                      {t("admin.supervision.filesOccupees")}
                    </option>
                    <option value="vides">{t("admin.supervision.filesVides")}</option>
                  </select>
                  <div className="mt-3 flex justify-end gap-2">
                    <Bouton
                      type="button"
                      variante="contour"
                      taille="moyen"
                      onClick={() => {
                        setChargeBrouillon("");
                        setChargeApplique("");
                      }}
                    >
                      {t("reception.tableau.filtres.reinitialiser")}
                    </Bouton>
                    <Bouton
                      type="button"
                      taille="moyen"
                      onClick={() => setChargeApplique(chargeBrouillon)}
                    >
                      {t("reception.tableau.filtres.rechercher")}
                    </Bouton>
                  </div>
                </section>
              ) : null}
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
              {listeFiltree.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
                  {t("admin.supervision.aucunResultat")}
                </p>
              ) : (
                <>
                  <div className="conteneur-tableau-sigh">
                    <table className="tableau-sigh min-w-[560px]">
                      <thead className="bg-gris-tres-clair text-xs uppercase text-texte-secondaire">
                        <tr>
                          <th className="w-10 px-3 py-2">
                            <span className="sr-only">
                              {t("reception.liste.selectionnerTout")}
                            </span>
                          </th>
                          <th className="px-3 py-2">
                            {t("admin.services.colonnes.service")}
                          </th>
                          <th className="px-3 py-2">{t("admin.services.enFile")}</th>
                          <th className="hidden px-3 py-2 md:table-cell">
                            {t("admin.supervision.charge")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageData.itemsPage.map((s) => (
                          <tr key={s.code} className="border-t border-gris-bordure">
                            <td className="px-3 py-2.5">
                              <input
                                type="checkbox"
                                checked={idsCoches.includes(s.code)}
                                onChange={() =>
                                  setIdsCoches((ids) =>
                                    ids.includes(s.code)
                                      ? ids.filter((c) => c !== s.code)
                                      : [...ids, s.code]
                                  )
                                }
                              />
                            </td>
                            <td className="px-3 py-2.5">
                              <p className="font-medium">{s.nom}</p>
                              <p className="text-xs text-texte-secondaire">{s.code}</p>
                            </td>
                            <td className="px-3 py-2.5">
                              <span
                                className={cn(
                                  "inline-flex min-w-[2rem] justify-center rounded-full px-2 py-0.5 text-xs font-semibold",
                                  s.enFile === 0
                                    ? "bg-slate-100 text-slate-600"
                                    : s.enFile < 5
                                      ? "bg-amber-50 text-amber-800"
                                      : "bg-red-50 text-red-700"
                                )}
                              >
                                {s.enFile}
                              </span>
                            </td>
                            <td className="hidden px-3 py-2.5 md:table-cell">
                              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    s.enFile === 0
                                      ? "bg-slate-300"
                                      : s.enFile < 5
                                        ? "bg-amber-400"
                                        : "bg-red-500"
                                  )}
                                  style={{
                                    width: `${Math.max(4, (s.enFile / maxFile) * 100)}%`,
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <PaginationListe
                    page={pageData.pageCourante}
                    totalPages={pageData.totalPages}
                    totalItems={listeFiltree.length}
                    parPage={SALLES_PAR_PAGE}
                    onChange={setPage}
                    labelPrec={t("reception.liste.prec")}
                    labelSuiv={t("reception.liste.suiv")}
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </MiseEnPageAdmin>
  );
}
