"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, Loader2, ScrollText, Search, SlidersHorizontal, X } from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import {
  BoutonsOutilsListe,
  telechargerCsv,
} from "@/components/ui/boutons-outils-liste";
import {
  PaginationListe,
  paginerListe,
} from "@/components/ui/pagination-liste";
import {
  auditCorrespondFiltresAdmin,
  compterFiltresAuditAdmin,
  FILTRES_AUDIT_ADMIN_VIDES,
  FormulaireFiltresAuditAdmin,
  type FiltresAuditAdmin,
} from "@/features/admin/formulaire-filtres-audit-admin";
import { cn } from "@/lib/utils";

interface EntreeAudit {
  id: string;
  type: string;
  module: string | null;
  entite: string;
  entiteId?: string | null;
  action: string;
  details?: unknown;
  ipAddress?: string | null;
  createdAt: string;
  utilisateur: {
    prenom: string;
    nom: string;
    identifiant: string;
  } | null;
}

const AUDIT_PAR_PAGE = 16;
const CLASSE_BOUTON_ACTION =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gris-bordure text-slate-500 transition-colors hover:bg-gris-tres-clair hover:text-bleu-medical";

function classeType(type: string) {
  if (type === "CONNEXION") return "bg-emerald-50 text-emerald-700";
  if (type === "DECONNEXION") return "bg-slate-100 text-slate-700";
  if (type === "CREATION") return "bg-sky-50 text-sky-800";
  if (type === "MODIFICATION") return "bg-amber-50 text-amber-800";
  if (type === "SUPPRESSION") return "bg-red-50 text-red-700";
  if (type === "EXPORT") return "bg-violet-50 text-violet-800";
  if (type === "TRANSFERT") return "bg-orange-50 text-orange-800";
  return "bg-slate-50 text-slate-700";
}

export function ContenuAuditAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t, i18n } = useTranslation();
  const [entrees, setEntrees] = useState<EntreeAudit[]>([]);
  const [rechercheRapide, setRechercheRapide] = useState("");
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillon, setBrouillon] = useState<FiltresAuditAdmin>(FILTRES_AUDIT_ADMIN_VIDES);
  const [appliques, setAppliques] = useState<FiltresAuditAdmin>(FILTRES_AUDIT_ADMIN_VIDES);
  const [idsCoches, setIdsCoches] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [selectionId, setSelectionId] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/admin/audit?limite=500");
      const data = (await res.json()) as {
        entrees?: EntreeAudit[];
        message?: string;
      };
      if (!res.ok) throw new Error(data.message ?? t("admin.audit.erreur"));
      setEntrees(data.entrees ?? []);
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.audit.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const listeFiltree = useMemo(
    () =>
      entrees.filter((e) =>
        auditCorrespondFiltresAdmin(e, appliques, rechercheRapide)
      ),
    [entrees, appliques, rechercheRapide]
  );

  const pageData = useMemo(
    () => paginerListe(listeFiltree, page, AUDIT_PAR_PAGE),
    [listeFiltree, page]
  );

  useEffect(() => {
    setPage(1);
  }, [rechercheRapide, appliques]);

  const nbFiltres = compterFiltresAuditAdmin(appliques);
  const toutSelectionne =
    listeFiltree.length > 0 &&
    listeFiltree.every((e) => idsCoches.includes(e.id));
  const selection = entrees.find((e) => e.id === selectionId) ?? null;

  const basculerCoche = (id: string) => {
    setIdsCoches((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    );
  };

  const basculerSelectionTout = () => {
    setIdsCoches(toutSelectionne ? [] : listeFiltree.map((e) => e.id));
  };

  const exporterSelection = () => {
    const coches = new Set(idsCoches);
    const cibles =
      coches.size > 0 ? listeFiltree.filter((e) => coches.has(e.id)) : listeFiltree;
    if (cibles.length === 0) return;
    telechargerCsv(
      `admin-audit-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        t("admin.audit.colonnes.date"),
        t("admin.audit.colonnes.acteur"),
        t("admin.audit.colonnes.type"),
        t("admin.audit.colonnes.entite"),
        t("admin.audit.colonnes.action"),
      ],
      cibles.map((e) => [
        new Date(e.createdAt).toISOString(),
        e.utilisateur
          ? `${e.utilisateur.prenom} ${e.utilisateur.nom}`
          : "",
        e.type,
        e.entite,
        e.action,
      ])
    );
  };

  const labelType = (type: string) => {
    const cle = `admin.audit.types.${type}`;
    const traduit = t(cle);
    return traduit === cle ? type : traduit;
  };

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.audit.titre")}
      sousTitre={t("admin.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <EnTetePageReception
          icone={ScrollText}
          titre={t("admin.audit.titre")}
          description={t("admin.audit.description")}
          fil={[
            { label: t("admin.common.salle"), href: "/sigh/admin" },
            { label: t("admin.audit.fil") },
          ]}
        />

        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex h-11 min-w-[180px] w-full max-w-md flex-1 items-center gap-2 rounded-lg border-2 border-slate-400 bg-white px-3 text-sm text-texte-principal shadow-sm transition-colors focus-within:border-bleu-medical focus-within:ring-2 focus-within:ring-bleu-medical/25">
              <Search className="h-4 w-4 shrink-0 text-slate-600" />
              <input
                type="search"
                value={rechercheRapide}
                onChange={(e) => setRechercheRapide(e.target.value)}
                placeholder={t("admin.audit.recherche")}
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-600"
              />
              {rechercheRapide ? (
                <button
                  type="button"
                  onClick={() => setRechercheRapide("")}
                  className="shrink-0 rounded-full p-0.5 text-slate-400 hover:bg-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </label>
            <div className="flex shrink-0 items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setFiltresOuverts((o) => !o)}
                aria-expanded={filtresOuverts}
                className={cn(
                  "relative inline-flex h-11 w-11 items-center justify-center rounded-lg border transition-colors",
                  filtresOuverts
                    ? "border-bleu-medical bg-bleu-medical-clair text-bleu-medical"
                    : "border-gris-bordure bg-white text-texte-principal hover:bg-gris-tres-clair"
                )}
              >
                <SlidersHorizontal className="h-5 w-5" strokeWidth={2} />
                <span
                  className={cn(
                    "absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm",
                    nbFiltres > 0 ? "bg-red-500" : "bg-slate-400"
                  )}
                >
                  {nbFiltres}
                </span>
              </button>
              <BoutonsOutilsListe
                toutSelectionne={toutSelectionne}
                onSelectionnerTout={basculerSelectionTout}
                onExporter={exporterSelection}
                labelSelectionnerTout={t("reception.liste.selectionnerTout")}
                labelExporter={t("reception.liste.exporterSelection")}
              />
            </div>
          </div>
          {filtresOuverts ? (
            <FormulaireFiltresAuditAdmin
              valeurs={brouillon}
              onChange={setBrouillon}
              onRechercher={() => {
                setAppliques(brouillon);
                setPage(1);
              }}
              onReinitialiser={() => {
                setBrouillon(FILTRES_AUDIT_ADMIN_VIDES);
                setAppliques(FILTRES_AUDIT_ADMIN_VIDES);
                setPage(1);
              }}
            />
          ) : null}
        </div>

        {erreur ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {erreur}
          </p>
        ) : null}

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
            {chargement ? (
              <p className="flex items-center gap-2 p-6 text-sm text-texte-secondaire">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("admin.common.chargement")}
              </p>
            ) : listeFiltree.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
                {t("admin.audit.aucunResultat")}
              </p>
            ) : (
              <>
                <div className="conteneur-tableau-sigh">
                  <table className="tableau-sigh min-w-[640px]">
                    <thead className="bg-gris-tres-clair text-xs uppercase text-texte-secondaire">
                      <tr>
                        <th className="w-10 px-3 py-2">
                          <span className="sr-only">
                            {t("reception.liste.selectionnerTout")}
                          </span>
                        </th>
                        <th className="px-3 py-2">{t("admin.audit.colonnes.date")}</th>
                        <th className="px-3 py-2">{t("admin.audit.colonnes.acteur")}</th>
                        <th className="px-3 py-2">{t("admin.audit.colonnes.type")}</th>
                        <th className="hidden px-3 py-2 lg:table-cell">
                          {t("admin.audit.colonnes.action")}
                        </th>
                        <th className="px-3 py-2 text-center">
                          {t("admin.audit.colonnes.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageData.itemsPage.map((e) => (
                        <tr
                          key={e.id}
                          className={cn(
                            "cursor-pointer border-t border-gris-bordure hover:bg-bleu-medical-clair/20",
                            selectionId === e.id && "bg-bleu-medical-clair/30"
                          )}
                          onClick={() => setSelectionId(e.id)}
                        >
                          <td className="px-3 py-2.5" onClick={(ev) => ev.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={idsCoches.includes(e.id)}
                              onChange={() => basculerCoche(e.id)}
                            />
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-xs">
                            {new Date(e.createdAt).toLocaleString(i18n.language)}
                          </td>
                          <td className="px-3 py-2.5 text-sm">
                            {e.utilisateur
                              ? `${e.utilisateur.prenom} ${e.utilisateur.nom}`
                              : "—"}
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                                classeType(e.type)
                              )}
                            >
                              {labelType(e.type)}
                            </span>
                          </td>
                          <td className="hidden max-w-[240px] truncate px-3 py-2.5 text-sm lg:table-cell">
                            {e.action}
                          </td>
                          <td className="px-3 py-2.5" onClick={(ev) => ev.stopPropagation()}>
                            <div className="flex justify-center">
                              <button
                                type="button"
                                onClick={() => setSelectionId(e.id)}
                                className={CLASSE_BOUTON_ACTION}
                                title={t("admin.audit.voir")}
                              >
                                <Eye className="h-4 w-4" />
                              </button>
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
                  parPage={AUDIT_PAR_PAGE}
                  onChange={setPage}
                  labelPrec={t("reception.liste.prec")}
                  labelSuiv={t("reception.liste.suiv")}
                />
              </>
            )}
          </div>

          <div className="flex max-h-[calc(100vh-8rem)] flex-col rounded-xl border border-gris-bordure bg-white shadow-sm">
            <div className="flex items-start justify-between gap-3 border-b border-gris-bordure px-4 py-3">
              <div>
                <h3 className="text-base font-bold text-bleu-medical">
                  {t("admin.audit.ficheTitre")}
                </h3>
                <p className="mt-0.5 text-xs text-texte-secondaire">
                  {t("admin.audit.ficheAide")}
                </p>
              </div>
              {selection ? (
                <button
                  type="button"
                  onClick={() => setSelectionId(null)}
                  className="rounded-lg p-1 text-texte-secondaire hover:bg-gris-tres-clair"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            {!selection ? (
              <p className="px-4 py-10 text-center text-sm text-texte-secondaire">
                {t("admin.audit.ficheAide")}
              </p>
            ) : (
              <dl className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-texte-secondaire">
                    {t("admin.audit.colonnes.date")}
                  </dt>
                  <dd className="mt-0.5">
                    {new Date(selection.createdAt).toLocaleString(i18n.language)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-texte-secondaire">
                    {t("admin.audit.colonnes.acteur")}
                  </dt>
                  <dd className="mt-0.5">
                    {selection.utilisateur
                      ? `${selection.utilisateur.prenom} ${selection.utilisateur.nom} (${selection.utilisateur.identifiant})`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-texte-secondaire">
                    {t("admin.audit.colonnes.type")}
                  </dt>
                  <dd className="mt-0.5">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        classeType(selection.type)
                      )}
                    >
                      {labelType(selection.type)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-texte-secondaire">
                    {t("admin.audit.colonnes.entite")}
                  </dt>
                  <dd className="mt-0.5">
                    {selection.entite}
                    {selection.module ? ` · ${selection.module}` : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-texte-secondaire">
                    {t("admin.audit.colonnes.action")}
                  </dt>
                  <dd className="mt-0.5">{selection.action}</dd>
                </div>
                {selection.ipAddress ? (
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-texte-secondaire">
                      IP
                    </dt>
                    <dd className="mt-0.5 font-mono text-xs">{selection.ipAddress}</dd>
                  </div>
                ) : null}
              </dl>
            )}
          </div>
        </div>
      </div>
    </MiseEnPageAdmin>
  );
}
