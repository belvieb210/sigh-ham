"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Eye,
  Layers,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  SlidersHorizontal,
  SquarePen,
  X,
} from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import {
  FormulairePaquetBilanAdmin,
  type FormPaquetBilan,
} from "@/features/admin/formulaire-paquet-bilan-admin";
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
import {
  compterFiltresPaquetsBilansAdmin,
  FILTRES_PAQUETS_BILANS_ADMIN_VIDES,
  FormulaireFiltresPaquetsBilansAdmin,
  paquetCorrespondFiltresAdmin,
  type FiltresPaquetsBilansAdmin,
} from "@/features/admin/formulaire-filtres-paquets-bilans-admin";
import type { ExamenPaquetOpt } from "@/lib/admin/filtrer-examens-paquet";
import { cn } from "@/lib/utils";

type PaquetItem = {
  id: string;
  code: string;
  libelle: string;
  description: string | null;
  prix: number;
  actif: boolean;
  ordre: number;
  nbExamens: number;
  prixSommeExamens: number;
  examens: { typeExamenId: string; code: string; libelle: string }[];
};

const FORM_VIDE: FormPaquetBilan = {
  code: "",
  libelle: "",
  description: "",
  prix: "0",
  remise: "0",
  ordre: "0",
  actif: true,
  typeExamenIds: [],
};

const PAQUETS_PAR_PAGE = 16;

const CLASSE_BOUTON_ACTION =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gris-bordure text-slate-500 transition-colors hover:bg-gris-tres-clair hover:text-bleu-medical";

function calculerRemiseInitiale(prixForfait: number, somme: number): string {
  if (somme <= 0 || prixForfait <= 0) return "0";
  const pct = Math.round((1 - prixForfait / somme) * 100);
  return String(Math.max(0, Math.min(100, pct)));
}

export function ContenuPaquetsBilansAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t } = useTranslation();
  const [liste, setListe] = useState<PaquetItem[]>([]);
  const [examens, setExamens] = useState<ExamenPaquetOpt[]>([]);
  const [rechercheRapide, setRechercheRapide] = useState("");
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillon, setBrouillon] = useState<FiltresPaquetsBilansAdmin>(
    FILTRES_PAQUETS_BILANS_ADMIN_VIDES
  );
  const [appliques, setAppliques] = useState<FiltresPaquetsBilansAdmin>(
    FILTRES_PAQUETS_BILANS_ADMIN_VIDES
  );
  const [idsCoches, setIdsCoches] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectionId, setSelectionId] = useState<string | null>(null);
  const [modeFormulaire, setModeFormulaire] = useState<"liste" | "creation" | "edition">(
    "liste"
  );
  const [form, setForm] = useState<FormPaquetBilan>({ ...FORM_VIDE });
  const [enCours, setEnCours] = useState(false);
  const [menuOuvertId, setMenuOuvertId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const [pRes, eRes] = await Promise.all([
        fetch("/api/admin/paquets-bilans"),
        fetch("/api/admin/examens?actif=true"),
      ]);
      const pData = (await pRes.json()) as { paquets?: PaquetItem[]; message?: string };
      const eData = (await eRes.json()) as {
        examens?: {
          id: string;
          code: string;
          libelle: string;
          prix: number;
          categorie: string;
        }[];
      };
      if (!pRes.ok) throw new Error(pData.message ?? t("admin.paquetsBilans.erreur"));
      setListe(pData.paquets ?? []);
      setExamens(
        (eData.examens ?? []).map((e) => ({
          id: e.id,
          code: e.code,
          libelle: e.libelle,
          prix: e.prix,
          categorie: e.categorie,
        }))
      );
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.paquetsBilans.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const listeFiltree = useMemo(
    () =>
      liste.filter((p) =>
        paquetCorrespondFiltresAdmin(p, appliques, rechercheRapide)
      ),
    [liste, appliques, rechercheRapide]
  );

  const pageData = useMemo(
    () => paginerListe(listeFiltree, page, PAQUETS_PAR_PAGE),
    [listeFiltree, page]
  );

  useEffect(() => {
    setPage(1);
  }, [rechercheRapide, appliques]);

  const nbFiltres = compterFiltresPaquetsBilansAdmin(appliques);
  const toutSelectionne =
    listeFiltree.length > 0 &&
    listeFiltree.every((p) => idsCoches.includes(p.id));

  useEffect(() => {
    if (!menuOuvertId) return;
    const fermer = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setMenuOuvertId(null);
    };
    document.addEventListener("mousedown", fermer);
    return () => document.removeEventListener("mousedown", fermer);
  }, [menuOuvertId]);

  const ouvrirCreation = () => {
    setModeFormulaire("creation");
    setSelectionId(null);
    setMenuOuvertId(null);
    setForm({ ...FORM_VIDE, typeExamenIds: [] });
    setMessage(null);
    setErreur(null);
  };

  const ouvrirEdition = (item: PaquetItem) => {
    setModeFormulaire("edition");
    setSelectionId(item.id);
    setMenuOuvertId(null);
    setForm({
      code: item.code,
      libelle: item.libelle,
      description: item.description ?? "",
      prix: String(item.prix),
      remise: calculerRemiseInitiale(item.prix, item.prixSommeExamens),
      ordre: String(item.ordre),
      actif: item.actif,
      typeExamenIds: item.examens.map((e) => e.typeExamenId),
    });
    setMessage(null);
    setErreur(null);
  };

  const fermerFormulaire = () => {
    setModeFormulaire("liste");
    setSelectionId(null);
    setForm({ ...FORM_VIDE });
  };

  const basculerCoche = (id: string) => {
    setIdsCoches((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    );
  };

  const basculerSelectionTout = () => {
    if (toutSelectionne) {
      setIdsCoches([]);
      return;
    }
    setIdsCoches(listeFiltree.map((p) => p.id));
  };

  const exporterSelection = () => {
    const coches = new Set(idsCoches);
    const cibles =
      coches.size > 0
        ? listeFiltree.filter((p) => coches.has(p.id))
        : listeFiltree;
    if (cibles.length === 0) return;
    telechargerCsv(
      `admin-paquets-bilans-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        t("admin.paquetsBilans.colCode"),
        t("admin.paquetsBilans.colLibelle"),
        t("admin.paquetsBilans.colExamens"),
        t("admin.paquetsBilans.colPrix"),
        t("admin.paquetsBilans.colStatut"),
      ],
      cibles.map((p) => [
        p.code,
        p.libelle,
        String(p.nbExamens),
        String(p.prix),
        p.actif ? t("admin.paquetsBilans.actif") : t("admin.paquetsBilans.inactif"),
      ])
    );
  };

  const changerActif = async (item: PaquetItem, actif: boolean) => {
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    setMenuOuvertId(null);
    try {
      const res = await fetch(`/api/admin/paquets-bilans/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actif }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setMessage(
        actif ? t("admin.paquetsBilans.active") : t("admin.paquetsBilans.desactive")
      );
      await charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const sauvegarder = async () => {
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const payload = {
        code: form.code.trim(),
        libelle: form.libelle.trim(),
        description: form.description.trim() || null,
        prix: Number(form.prix),
        ordre: Number(form.ordre),
        actif: form.actif,
        typeExamenIds: form.typeExamenIds,
      };
      const res = await fetch(
        modeFormulaire === "creation"
          ? "/api/admin/paquets-bilans"
          : `/api/admin/paquets-bilans/${selectionId}`,
        {
          method: modeFormulaire === "creation" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = (await res.json()) as { message?: string; paquet?: PaquetItem };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setMessage(data.message ?? t("admin.common.enregistrer"));
      if (data.paquet) {
        setSelectionId(data.paquet.id);
        setModeFormulaire("edition");
      }
      await charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const afficheFormulaire = modeFormulaire !== "liste";

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.paquetsBilans.titre")}
      sousTitre={t("admin.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1200px] pb-8">
        {afficheFormulaire ? (
          <button
            type="button"
            onClick={fermerFormulaire}
            className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-bleu-medical hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("admin.paquetsBilans.form.retourListe")}
          </button>
        ) : (
          <EnTetePageReception
            icone={Layers}
            titre={t("admin.paquetsBilans.titre")}
            description={t("admin.paquetsBilans.description")}
            fil={[
              { label: t("admin.common.salle"), href: "/sigh/admin" },
              { label: t("admin.paquetsBilans.fil") },
            ]}
          />
        )}

        {message ? (
          <p className="mb-3 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
            {message}
          </p>
        ) : null}
        {erreur ? (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {erreur}
          </p>
        ) : null}

        {afficheFormulaire ? (
          <FormulairePaquetBilanAdmin
            mode={modeFormulaire === "creation" ? "creation" : "edition"}
            form={form}
            onChange={setForm}
            examens={examens}
            enCours={enCours}
            onAnnuler={fermerFormulaire}
            onSauvegarder={() => void sauvegarder()}
          />
        ) : (
          <>
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex h-11 min-w-[180px] w-full max-w-md flex-1 items-center gap-2 rounded-lg border-2 border-slate-400 bg-white px-3 text-sm text-texte-principal shadow-sm transition-colors focus-within:border-bleu-medical focus-within:ring-2 focus-within:ring-bleu-medical/25">
                  <Search className="h-4 w-4 shrink-0 text-slate-600" aria-hidden />
                  <input
                    type="search"
                    value={rechercheRapide}
                    onChange={(e) => setRechercheRapide(e.target.value)}
                    placeholder={t("admin.paquetsBilans.recherchePlaceholder")}
                    aria-label={t("admin.paquetsBilans.recherchePlaceholder")}
                    autoComplete="off"
                    className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-600"
                  />
                  {rechercheRapide ? (
                    <button
                      type="button"
                      onClick={() => setRechercheRapide("")}
                      aria-label={t("admin.paquetsBilans.effacerRecherche")}
                      className="shrink-0 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </label>

                <div className="flex shrink-0 items-center justify-end gap-2">
                  <Bouton type="button" taille="petit" onClick={ouvrirCreation}>
                    <Plus className="h-4 w-4" />
                    {t("admin.paquetsBilans.nouveau")}
                  </Bouton>
                  <button
                    type="button"
                    onClick={() => setFiltresOuverts((o) => !o)}
                    aria-expanded={filtresOuverts}
                    aria-label={
                      filtresOuverts
                        ? t("reception.tableau.fermerFiltres")
                        : t("reception.tableau.ouvrirFiltres")
                    }
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
                <FormulaireFiltresPaquetsBilansAdmin
                  valeurs={brouillon}
                  onChange={setBrouillon}
                  onRechercher={() => {
                    setAppliques(brouillon);
                    setPage(1);
                  }}
                  onReinitialiser={() => {
                    setBrouillon(FILTRES_PAQUETS_BILANS_ADMIN_VIDES);
                    setAppliques(FILTRES_PAQUETS_BILANS_ADMIN_VIDES);
                    setPage(1);
                  }}
                />
              ) : null}
            </div>

            <section className="mt-4 overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
              {chargement ? (
                <p className="flex items-center gap-2 p-6 text-sm text-texte-secondaire">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("admin.common.chargement")}
                </p>
              ) : listeFiltree.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
                  {t("admin.paquetsBilans.aucunResultat")}
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
                            {t("admin.paquetsBilans.colCode")}
                          </th>
                          <th className="px-3 py-2">
                            {t("admin.paquetsBilans.colLibelle")}
                          </th>
                          <th className="hidden px-3 py-2 md:table-cell">
                            {t("admin.paquetsBilans.colExamens")}
                          </th>
                          <th className="hidden px-3 py-2 lg:table-cell">
                            {t("admin.paquetsBilans.colPrix")}
                          </th>
                          <th className="px-3 py-2">
                            {t("admin.paquetsBilans.colStatut")}
                          </th>
                          <th className="px-3 py-2 text-center">
                            {t("admin.paquetsBilans.colonnes.actions")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageData.itemsPage.map((p) => (
                          <tr
                            key={p.id}
                            onClick={() => ouvrirEdition(p)}
                            className={cn(
                              "cursor-pointer border-t border-gris-bordure hover:bg-bleu-medical-clair/20",
                              selectionId === p.id && "bg-bleu-medical-clair/30"
                            )}
                          >
                            <td
                              className="px-3 py-2.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={idsCoches.includes(p.id)}
                                onChange={() => basculerCoche(p.id)}
                                aria-label={p.libelle}
                              />
                            </td>
                            <td className="px-3 py-2.5 font-mono text-xs font-semibold">
                              {p.code}
                            </td>
                            <td className="px-3 py-2.5">
                              <p className="font-medium text-texte-principal">
                                {p.libelle}
                              </p>
                              <p className="text-xs text-texte-secondaire md:hidden">
                                {p.nbExamens} · {p.prix.toLocaleString("fr-FR")} FC
                              </p>
                            </td>
                            <td className="hidden px-3 py-2.5 text-sm md:table-cell">
                              {p.nbExamens}
                            </td>
                            <td className="hidden px-3 py-2.5 lg:table-cell">
                              <span className="font-semibold tabular-nums">
                                {p.prix.toLocaleString("fr-FR")} FC
                              </span>
                              <span className="ml-1 text-[10px] text-texte-secondaire">
                                ({t("admin.paquetsBilans.sommeIndividuelle")}{" "}
                                {p.prixSommeExamens.toLocaleString("fr-FR")})
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              <span
                                className={cn(
                                  "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                                  p.actif
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-700"
                                )}
                              >
                                {p.actif
                                  ? t("admin.paquetsBilans.actif")
                                  : t("admin.paquetsBilans.inactif")}
                              </span>
                            </td>
                            <td
                              className="px-3 py-2.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => ouvrirEdition(p)}
                                  className={CLASSE_BOUTON_ACTION}
                                  aria-label={t("admin.paquetsBilans.voir")}
                                  title={t("admin.paquetsBilans.voir")}
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => ouvrirEdition(p)}
                                  className={CLASSE_BOUTON_ACTION}
                                  aria-label={t("admin.paquetsBilans.editer")}
                                  title={t("admin.paquetsBilans.editer")}
                                >
                                  <SquarePen className="h-4 w-4" />
                                </button>
                                <div
                                  className="relative"
                                  ref={menuOuvertId === p.id ? menuRef : undefined}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setMenuOuvertId((id) =>
                                        id === p.id ? null : p.id
                                      )
                                    }
                                    className={CLASSE_BOUTON_ACTION}
                                    aria-label={t("admin.paquetsBilans.plusActions")}
                                    title={t("admin.paquetsBilans.plusActions")}
                                    aria-expanded={menuOuvertId === p.id}
                                    aria-haspopup="menu"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </button>
                                  {menuOuvertId === p.id ? (
                                    <div
                                      role="menu"
                                      className="absolute right-0 top-10 z-20 min-w-[240px] overflow-hidden rounded-lg border border-gris-bordure bg-white py-1 shadow-lg"
                                    >
                                      {p.actif ? (
                                        <button
                                          type="button"
                                          role="menuitem"
                                          disabled={enCours}
                                          onClick={() => void changerActif(p, false)}
                                          className="block w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                                        >
                                          {t("admin.paquetsBilans.exclureCatalogue")}
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          role="menuitem"
                                          disabled={enCours}
                                          onClick={() => void changerActif(p, true)}
                                          className="block w-full px-3 py-2 text-left text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                                        >
                                          {t("admin.paquetsBilans.inclureCatalogue")}
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
                    parPage={PAQUETS_PAR_PAGE}
                    onChange={setPage}
                    labelPrec={t("reception.liste.prec")}
                    labelSuiv={t("reception.liste.suiv")}
                  />
                </>
              )}
            </section>
          </>
        )}
      </div>
    </MiseEnPageAdmin>
  );
}
