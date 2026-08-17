"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Eye,
  Loader2,
  MoreVertical,
  Search,
  SlidersHorizontal,
  SquarePen,
  X,
} from "lucide-react";
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
  compterFiltresServicesAdmin,
  FILTRES_SERVICES_ADMIN_VIDES,
  FormulaireFiltresServicesAdmin,
  serviceCorrespondFiltresAdmin,
  type FiltresServicesAdmin,
} from "@/features/admin/formulaire-filtres-services-admin";
import {
  FORM_SERVICE_ADMIN_VIDE,
  FormulaireServiceAdmin,
  type FormServiceAdmin,
} from "@/features/admin/formulaire-service-admin";
import { cn } from "@/lib/utils";

interface SalleItem {
  id: string;
  code: string;
  nom: string;
  description: string | null;
  ordre: number;
  actif: boolean;
  _count: { roles: number };
}

type ModePanneau = "vide" | "consultation" | "edition";

const SERVICES_PAR_PAGE = 16;
const CLASSE_BOUTON_ACTION =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gris-bordure text-slate-500 transition-colors hover:bg-gris-tres-clair hover:text-bleu-medical";

function itemVersForm(s: SalleItem): FormServiceAdmin {
  return {
    code: s.code,
    nom: s.nom,
    description: s.description ?? "",
    ordre: String(s.ordre),
    actif: s.actif,
  };
}

export function ContenuServicesAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t } = useTranslation();
  const [salles, setSalles] = useState<SalleItem[]>([]);
  const [files, setFiles] = useState<Record<string, number>>({});
  const [rechercheRapide, setRechercheRapide] = useState("");
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillon, setBrouillon] = useState<FiltresServicesAdmin>(
    FILTRES_SERVICES_ADMIN_VIDES
  );
  const [appliques, setAppliques] = useState<FiltresServicesAdmin>(
    FILTRES_SERVICES_ADMIN_VIDES
  );
  const [idsCoches, setIdsCoches] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [selectionId, setSelectionId] = useState<string | null>(null);
  const [form, setForm] = useState<FormServiceAdmin>({ ...FORM_SERVICE_ADMIN_VIDE });
  const [modePanneau, setModePanneau] = useState<ModePanneau>("vide");
  const [menuOuvertId, setMenuOuvertId] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [chargement, setChargement] = useState(true);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const [sRes, stRes] = await Promise.all([
        fetch("/api/admin/salles?toutes=1"),
        fetch("/api/admin/stats"),
      ]);
      const sData = (await sRes.json()) as { salles?: SalleItem[]; message?: string };
      const stData = (await stRes.json()) as {
        salles?: { code: string; enFile: number }[];
      };
      if (!sRes.ok) throw new Error(sData.message ?? t("admin.services.erreur"));
      setSalles(sData.salles ?? []);
      const map: Record<string, number> = {};
      for (const s of stData.salles ?? []) map[s.code] = s.enFile;
      setFiles(map);
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.services.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const listeFiltree = useMemo(
    () =>
      salles.filter((s) =>
        serviceCorrespondFiltresAdmin(s, appliques, rechercheRapide)
      ),
    [salles, appliques, rechercheRapide]
  );

  const pageData = useMemo(
    () => paginerListe(listeFiltree, page, SERVICES_PAR_PAGE),
    [listeFiltree, page]
  );

  useEffect(() => {
    setPage(1);
  }, [rechercheRapide, appliques]);

  const nbFiltres = compterFiltresServicesAdmin(appliques);
  const toutSelectionne =
    listeFiltree.length > 0 &&
    listeFiltree.every((s) => idsCoches.includes(s.id));
  const lectureSeule = modePanneau !== "edition";

  useEffect(() => {
    if (!menuOuvertId) return;
    const fermer = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setMenuOuvertId(null);
    };
    document.addEventListener("mousedown", fermer);
    return () => document.removeEventListener("mousedown", fermer);
  }, [menuOuvertId]);

  const ouvrir = (s: SalleItem, mode: ModePanneau) => {
    setSelectionId(s.id);
    setModePanneau(mode);
    setForm(itemVersForm(s));
    setMenuOuvertId(null);
    setMessage(null);
    setErreur(null);
  };

  const fermerPanneau = () => {
    setModePanneau("vide");
    setSelectionId(null);
    setForm({ ...FORM_SERVICE_ADMIN_VIDE });
  };

  const basculerCoche = (id: string) => {
    setIdsCoches((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    );
  };

  const basculerSelectionTout = () => {
    setIdsCoches(toutSelectionne ? [] : listeFiltree.map((s) => s.id));
  };

  const exporterSelection = () => {
    const coches = new Set(idsCoches);
    const cibles =
      coches.size > 0 ? listeFiltree.filter((s) => coches.has(s.id)) : listeFiltree;
    if (cibles.length === 0) return;
    telechargerCsv(
      `admin-services-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        t("admin.services.champs.code"),
        t("admin.services.champs.nom"),
        t("admin.services.colonnes.statut"),
        t("admin.services.roles"),
        t("admin.services.enFile"),
        t("admin.services.ordre"),
      ],
      cibles.map((s) => [
        s.code,
        s.nom,
        s.actif ? t("admin.services.actif") : t("admin.services.inactif"),
        String(s._count.roles),
        String(files[s.code] ?? 0),
        String(s.ordre),
      ])
    );
  };

  const changerActif = async (salle: SalleItem, actif: boolean) => {
    if (salle.code === "ADMIN" && !actif) {
      setErreur(t("admin.services.impossibleAdmin"));
      setMenuOuvertId(null);
      return;
    }
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    setMenuOuvertId(null);
    try {
      const res = await fetch("/api/admin/salles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: salle.code, actif }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setMessage(
        actif ? t("admin.services.active") : t("admin.services.desactive")
      );
      await charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const soumettre = async () => {
    if (!form.nom.trim()) {
      setErreur(t("admin.services.champsRequis"));
      return;
    }
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/salles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          nom: form.nom.trim(),
          description: form.description.trim() || null,
          ordre: Number(form.ordre),
          actif: form.actif,
        }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setMessage(data.message ?? t("admin.services.maj"));
      await charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.services.titre")}
      sousTitre={t("admin.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <EnTetePageReception
          icone={Building2}
          titre={t("admin.services.titre")}
          description={t("admin.services.description")}
          fil={[
            { label: t("admin.common.salle"), href: "/sigh/admin" },
            { label: t("admin.services.fil") },
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
                placeholder={t("admin.services.recherche")}
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-600"
              />
              {rechercheRapide ? (
                <button
                  type="button"
                  onClick={() => setRechercheRapide("")}
                  className="shrink-0 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
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
            <FormulaireFiltresServicesAdmin
              valeurs={brouillon}
              onChange={setBrouillon}
              onRechercher={() => {
                setAppliques(brouillon);
                setPage(1);
              }}
              onReinitialiser={() => {
                setBrouillon(FILTRES_SERVICES_ADMIN_VIDES);
                setAppliques(FILTRES_SERVICES_ADMIN_VIDES);
                setPage(1);
              }}
            />
          ) : null}
        </div>

        {message ? (
          <p className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
            {message}
          </p>
        ) : null}
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
                {t("admin.services.aucunResultat")}
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
                        <th className="px-3 py-2">
                          {t("admin.services.colonnes.service")}
                        </th>
                        <th className="hidden px-3 py-2 md:table-cell">
                          {t("admin.services.enFile")}
                        </th>
                        <th className="px-3 py-2">
                          {t("admin.services.colonnes.statut")}
                        </th>
                        <th className="px-3 py-2 text-center">
                          {t("admin.services.colonnes.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageData.itemsPage.map((s) => (
                        <tr
                          key={s.id}
                          className={cn(
                            "cursor-pointer border-t border-gris-bordure hover:bg-bleu-medical-clair/20",
                            selectionId === s.id && "bg-bleu-medical-clair/30"
                          )}
                          onClick={() => ouvrir(s, "consultation")}
                        >
                          <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={idsCoches.includes(s.id)}
                              onChange={() => basculerCoche(s.id)}
                              aria-label={s.nom}
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <p className="font-medium text-texte-principal">{s.nom}</p>
                            <p className="text-xs text-texte-secondaire">
                              {s.code} · {s._count.roles} {t("admin.services.roles")}
                            </p>
                          </td>
                          <td className="hidden px-3 py-2.5 font-semibold tabular-nums md:table-cell">
                            {files[s.code] ?? 0}
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                                s.actif
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-700"
                              )}
                            >
                              {s.actif
                                ? t("admin.services.actif")
                                : t("admin.services.inactif")}
                            </span>
                          </td>
                          <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => ouvrir(s, "consultation")}
                                className={CLASSE_BOUTON_ACTION}
                                title={t("admin.services.voir")}
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => ouvrir(s, "edition")}
                                className={CLASSE_BOUTON_ACTION}
                                title={t("admin.services.editer")}
                              >
                                <SquarePen className="h-4 w-4" />
                              </button>
                              <div
                                className="relative"
                                ref={menuOuvertId === s.id ? menuRef : undefined}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setMenuOuvertId((id) => (id === s.id ? null : s.id))
                                  }
                                  className={CLASSE_BOUTON_ACTION}
                                  title={t("admin.services.plusActions")}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                                {menuOuvertId === s.id ? (
                                  <div
                                    role="menu"
                                    className="absolute right-0 top-10 z-20 min-w-[220px] overflow-hidden rounded-lg border border-gris-bordure bg-white py-1 shadow-lg"
                                  >
                                    {s.actif ? (
                                      <button
                                        type="button"
                                        disabled={enCours || s.code === "ADMIN"}
                                        onClick={() => void changerActif(s, false)}
                                        className="block w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                                      >
                                        {t("admin.services.desactiver")}
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        disabled={enCours}
                                        onClick={() => void changerActif(s, true)}
                                        className="block w-full px-3 py-2 text-left text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                                      >
                                        {t("admin.services.activer")}
                                      </button>
                                    )}
                                  </div>
                                ) : null}
                              </div>
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
                  parPage={SERVICES_PAR_PAGE}
                  onChange={setPage}
                  labelPrec={t("reception.liste.prec")}
                  labelSuiv={t("reception.liste.suiv")}
                />
              </>
            )}
          </div>

          <FormulaireServiceAdmin
            form={form}
            onChange={setForm}
            modePanneau={modePanneau}
            lectureSeule={lectureSeule}
            enCours={enCours}
            onSoumettre={() => void soumettre()}
            onAnnuler={fermerPanneau}
          />
        </div>
      </div>
    </MiseEnPageAdmin>
  );
}
