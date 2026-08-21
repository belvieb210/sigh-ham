"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Eye,
  FlaskConical,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  SlidersHorizontal,
  SquarePen,
  Trash2,
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
import {
  compterFiltresExamensAdmin,
  FILTRES_EXAMENS_ADMIN_VIDES,
  FormulaireFiltresExamensAdmin,
  examenCorrespondFiltresAdmin,
  type FiltresExamensAdmin,
} from "@/features/admin/formulaire-filtres-examens-admin";
import {
  FORM_EXAMEN_ADMIN_VIDE,
  appliquerCategorieAuFormulaire,
  FormulaireExamenAdmin,
  nouveauParametreExamen,
  type FormExamenAdmin,
} from "@/features/admin/formulaire-examen-admin";
import { useDemanderConfirmation } from "@/components/ui/fournisseur-modale-confirmation";
import { cn } from "@/lib/utils";

type ExamenItem = {
  id: string;
  code: string;
  libelle: string;
  categorie: string;
  prix: number;
  delaiHeures: number;
  actif: boolean;
  packPrenuptial: boolean;
  formulaire?: string | null;
  serviceLabo?: string | null;
  specimen?: string | null;
  uniteDefaut?: string | null;
  rangeUsuelle?: string | null;
  description?: string | null;
  parametres?: {
    id: string;
    nom: string;
    unite: string | null;
    rangeUsuelle: string | null;
    obligatoire: boolean;
    ordre: number;
  }[];
};

type ModePanneau = "creation" | "consultation" | "edition";

const EXAMENS_PAR_PAGE = 16;

const CLASSE_BOUTON_ACTION =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gris-bordure bg-white text-slate-600 transition-colors hover:bg-gris-tres-clair hover:text-bleu-medical disabled:cursor-not-allowed disabled:opacity-40";

function formaterPrixUsd(n: number) {
  return `$ ${n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function itemVersForm(item: ExamenItem): FormExamenAdmin {
  const base: FormExamenAdmin = {
    code: item.code,
    libelle: item.libelle,
    categorie: item.categorie,
    prix: String(item.prix),
    delaiHeures: String(item.delaiHeures),
    actif: item.actif,
    packPrenuptial: item.packPrenuptial,
    description: item.description ?? "",
    specimen: item.specimen ?? "",
    serviceLabo: item.serviceLabo ?? "",
    formulaire: item.formulaire ?? "",
    uniteDefaut: item.uniteDefaut ?? "",
    rangeUsuelle: item.rangeUsuelle ?? "",
    parametres: (item.parametres ?? [])
      .slice()
      .sort((a, b) => a.ordre - b.ordre)
      .map((p, index) => ({
        ...nouveauParametreExamen(index + 1),
        id: p.id,
        nom: p.nom,
        unite: p.unite ?? "",
        rangeUsuelle: p.rangeUsuelle ?? "",
        obligatoire: p.obligatoire,
        ordre: p.ordre + 1,
      })),
  };
  return appliquerCategorieAuFormulaire(base, base.categorie);
}

export function ContenuExamensAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t } = useTranslation();
  const demanderConfirmation = useDemanderConfirmation();
  const [liste, setListe] = useState<ExamenItem[]>([]);
  const [rechercheRapide, setRechercheRapide] = useState("");
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillon, setBrouillon] = useState<FiltresExamensAdmin>(
    FILTRES_EXAMENS_ADMIN_VIDES
  );
  const [appliques, setAppliques] = useState<FiltresExamensAdmin>(
    FILTRES_EXAMENS_ADMIN_VIDES
  );
  const [idsCoches, setIdsCoches] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectionId, setSelectionId] = useState<string | null>(null);
  const [form, setForm] = useState<FormExamenAdmin>({ ...FORM_EXAMEN_ADMIN_VIDE });
  const [modePanneau, setModePanneau] = useState<ModePanneau>("creation");
  const [menuOuvertId, setMenuOuvertId] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const lectureSeule = modePanneau === "consultation";

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/admin/examens");
      const data = (await res.json()) as {
        examens?: ExamenItem[];
        message?: string;
      };
      if (!res.ok) throw new Error(data.message ?? t("admin.examens.erreur"));
      setListe(data.examens ?? []);
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.examens.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const e of liste) {
      if (e.categorie.trim()) set.add(e.categorie.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
  }, [liste]);

  const listeFiltree = useMemo(
    () =>
      liste.filter((e) =>
        examenCorrespondFiltresAdmin(e, appliques, rechercheRapide)
      ),
    [liste, appliques, rechercheRapide]
  );

  const pageData = useMemo(
    () => paginerListe(listeFiltree, page, EXAMENS_PAR_PAGE),
    [listeFiltree, page]
  );

  useEffect(() => {
    setPage(1);
  }, [rechercheRapide, appliques]);

  const nbFiltres = compterFiltresExamensAdmin(appliques);
  const toutSelectionne =
    listeFiltree.length > 0 &&
    listeFiltree.every((e) => idsCoches.includes(e.id));

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
    setModePanneau("creation");
    setSelectionId(null);
    setMenuOuvertId(null);
    setForm({ ...FORM_EXAMEN_ADMIN_VIDE });
    setMessage(null);
    setErreur(null);
  };

  const consulter = (item: ExamenItem) => {
    setModePanneau("consultation");
    setSelectionId(item.id);
    setMenuOuvertId(null);
    setForm(itemVersForm(item));
    setMessage(null);
    setErreur(null);
  };

  const editer = (item: ExamenItem) => {
    setModePanneau("edition");
    setSelectionId(item.id);
    setMenuOuvertId(null);
    setForm(itemVersForm(item));
    setMessage(null);
    setErreur(null);
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
    setIdsCoches(listeFiltree.map((e) => e.id));
  };

  const exporterSelection = () => {
    const coches = new Set(idsCoches);
    const cibles =
      coches.size > 0
        ? listeFiltree.filter((e) => coches.has(e.id))
        : listeFiltree;
    if (cibles.length === 0) return;
    telechargerCsv(
      `admin-examens-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        t("admin.examens.code"),
        t("admin.examens.libelle"),
        t("admin.examens.categorie"),
        t("admin.examens.prix"),
        t("admin.examens.specimen"),
        t("admin.examens.delai"),
        t("admin.examens.colonnes.statut"),
        t("admin.examens.packPrenuptial"),
      ],
      cibles.map((e) => [
        e.code,
        e.libelle,
        e.categorie,
        String(e.prix),
        e.specimen ?? "",
        String(e.delaiHeures),
        e.actif ? t("admin.examens.actif") : t("admin.examens.inactif"),
        e.packPrenuptial ? t("admin.examens.oui") : t("admin.examens.non"),
      ])
    );
  };

  const changerActif = async (item: ExamenItem, actif: boolean) => {
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    setMenuOuvertId(null);
    try {
      const res = await fetch(`/api/admin/examens/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actif }),
      });
      const data = (await res.json()) as { message?: string; examen?: ExamenItem };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setMessage(
        actif ? t("admin.examens.active") : t("admin.examens.desactive")
      );
      if (selectionId === item.id && data.examen) {
        setForm(itemVersForm(data.examen));
      }
      await charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const supprimerDefinitivement = (item: ExamenItem) => {
    setMenuOuvertId(null);
    demanderConfirmation({
      titre: t("admin.examens.supprimerDefinitivement"),
      description: t("admin.examens.confirmerSuppressionDefinitive", {
        libelle: item.libelle,
        code: item.code,
      }),
      libelleConfirmer: t("admin.examens.supprimerDefinitivement"),
      libelleAnnuler: t("admin.examens.annuler"),
      variante: "danger",
      onConfirmer: async () => {
        setEnCours(true);
        setErreur(null);
        setMessage(null);
        try {
          const res = await fetch(`/api/admin/examens/${item.id}`, {
            method: "DELETE",
          });
          const data = (await res.json()) as { message?: string };
          if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
          setMessage(t("admin.examens.supprimeOk"));
          if (selectionId === item.id) {
            setSelectionId(null);
            setModePanneau("creation");
            setForm({ ...FORM_EXAMEN_ADMIN_VIDE });
          }
          setIdsCoches((ids) => ids.filter((id) => id !== item.id));
          await charger();
        } catch (e: unknown) {
          const msg =
            e instanceof Error ? e.message : t("admin.common.erreur");
          setErreur(msg);
          throw e instanceof Error ? e : new Error(msg);
        } finally {
          setEnCours(false);
        }
      },
    });
  };

  const soumettre = async () => {
    if (!form.code.trim() || !form.libelle.trim() || !form.categorie.trim()) {
      setErreur(t("admin.examens.champsRequis"));
      return;
    }
    const prix = Number(form.prix);
    const delaiHeures = Number(form.delaiHeures);
    if (!Number.isFinite(prix) || prix < 0) {
      setErreur(t("admin.examens.prixInvalide"));
      return;
    }
    if (!Number.isFinite(delaiHeures) || delaiHeures < 1) {
      setErreur(t("admin.examens.delaiInvalide"));
      return;
    }

    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const payload = {
        code: form.code,
        libelle: form.libelle,
        categorie: form.categorie,
        prix,
        delaiHeures,
        actif: form.actif,
        packPrenuptial: form.packPrenuptial,
        description: form.description,
        specimen: form.specimen,
        serviceLabo: form.serviceLabo,
        formulaire: form.formulaire,
        uniteDefaut: form.uniteDefaut,
        rangeUsuelle: form.rangeUsuelle,
        parametres: [...form.parametres]
          .sort((a, b) => a.ordre - b.ordre)
          .map((p) => ({
            id: p.id ?? null,
            nom: p.nom,
            unite: p.unite,
            rangeUsuelle: p.rangeUsuelle,
            obligatoire: p.obligatoire,
          })),
      };
      const creation = modePanneau === "creation";
      const res = await fetch(
        creation ? "/api/admin/examens" : `/api/admin/examens/${selectionId}`,
        {
          method: creation ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = (await res.json()) as {
        message?: string;
        examen?: ExamenItem;
      };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setMessage(
        data.message ??
          (creation ? t("admin.examens.cree") : t("admin.examens.maj"))
      );
      if (data.examen) {
        setSelectionId(data.examen.id);
        setModePanneau("edition");
        setForm(itemVersForm(data.examen));
      }
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
      titre={t("admin.examens.titre")}
      sousTitre={t("admin.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <EnTetePageReception
          icone={FlaskConical}
          titre={t("admin.examens.titre")}
          description={t("admin.examens.description")}
          fil={[
            { label: t("admin.common.salle"), href: "/sigh/admin" },
            { label: t("admin.examens.fil") },
          ]}
        />

        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex h-11 min-w-[180px] w-full max-w-md flex-1 items-center gap-2 rounded-lg border-2 border-slate-400 bg-white px-3 text-sm text-texte-principal shadow-sm transition-colors focus-within:border-bleu-medical focus-within:ring-2 focus-within:ring-bleu-medical/25">
              <Search className="h-4 w-4 shrink-0 text-slate-600" aria-hidden />
              <input
                type="search"
                value={rechercheRapide}
                onChange={(e) => setRechercheRapide(e.target.value)}
                placeholder={t("admin.examens.recherche")}
                aria-label={t("admin.examens.recherche")}
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-600"
              />
              {rechercheRapide ? (
                <button
                  type="button"
                  onClick={() => setRechercheRapide("")}
                  aria-label={t("admin.examens.effacerRecherche")}
                  className="shrink-0 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </label>

            <div className="flex shrink-0 items-center justify-end gap-2">
              <Bouton type="button" taille="petit" onClick={ouvrirCreation}>
                <Plus className="h-4 w-4" />
                {t("admin.examens.nouveau")}
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
            <FormulaireFiltresExamensAdmin
              valeurs={brouillon}
              onChange={setBrouillon}
              onRechercher={() => {
                setAppliques(brouillon);
                setPage(1);
              }}
              onReinitialiser={() => {
                setBrouillon(FILTRES_EXAMENS_ADMIN_VIDES);
                setAppliques(FILTRES_EXAMENS_ADMIN_VIDES);
                setPage(1);
              }}
              categories={categories}
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
          <div className="rounded-xl border border-gris-bordure bg-white shadow-sm">
            {chargement ? (
              <p className="flex items-center gap-2 p-6 text-sm text-texte-secondaire">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("admin.common.chargement")}
              </p>
            ) : listeFiltree.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
                {t("admin.examens.aucunResultat")}
              </p>
            ) : (
              <>
                <div className="conteneur-tableau-sigh overflow-visible">
                  <table className="tableau-sigh min-w-[640px]">
                    <thead className="bg-gris-tres-clair text-xs uppercase text-texte-secondaire">
                      <tr>
                        <th className="w-10 px-3 py-2">
                          <span className="sr-only">
                            {t("reception.liste.selectionnerTout")}
                          </span>
                        </th>
                        <th className="px-3 py-2">{t("admin.examens.code")}</th>
                        <th className="px-3 py-2">{t("admin.examens.libelle")}</th>
                        <th className="hidden px-3 py-2 md:table-cell">
                          {t("admin.examens.categorie")}
                        </th>
                        <th className="hidden px-3 py-2 lg:table-cell">
                          {t("admin.examens.prix")}
                        </th>
                        <th className="px-3 py-2">
                          {t("admin.examens.colonnes.statut")}
                        </th>
                        <th className="w-[9.5rem] min-w-[9.5rem] px-2 py-2 text-center">
                          {t("admin.examens.colonnes.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageData.itemsPage.map((item) => (
                        <tr
                          key={item.id}
                          className={cn(
                            "cursor-pointer border-t border-gris-bordure hover:bg-bleu-medical-clair/20",
                            selectionId === item.id && "bg-bleu-medical-clair/30"
                          )}
                          onClick={() => consulter(item)}
                        >
                          <td
                            className="px-3 py-2.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={idsCoches.includes(item.id)}
                              onChange={() => basculerCoche(item.id)}
                              aria-label={item.libelle}
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="font-mono text-xs font-semibold text-texte-principal">
                              {item.code}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <p className="font-medium text-texte-principal">
                              {item.libelle}
                            </p>
                            <p className="text-xs text-texte-secondaire">
                              {item.specimen ? `${item.specimen} · ` : ""}
                              {t("admin.examens.nbParametres", {
                                count: item.parametres?.length ?? 0,
                              })}
                              <span className="lg:hidden">
                                {" · "}
                                {formaterPrixUsd(item.prix)}
                              </span>
                            </p>
                          </td>
                          <td className="hidden px-3 py-2.5 md:table-cell">
                            <span className="inline-flex rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800">
                              {item.categorie}
                            </span>
                          </td>
                          <td className="hidden px-3 py-2.5 text-sm tabular-nums lg:table-cell">
                            {formaterPrixUsd(item.prix)}
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                                item.actif
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-700"
                              )}
                            >
                              {item.actif
                                ? t("admin.examens.actif")
                                : t("admin.examens.inactif")}
                            </span>
                            {item.packPrenuptial ? (
                              <span className="ml-1 inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-800">
                                {t("admin.examens.badgePack")}
                              </span>
                            ) : null}
                          </td>
                          <td
                            className="whitespace-nowrap px-2 py-2.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex flex-nowrap items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => consulter(item)}
                                className={CLASSE_BOUTON_ACTION}
                                aria-label={t("admin.examens.voir")}
                                title={t("admin.examens.voir")}
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => editer(item)}
                                className={CLASSE_BOUTON_ACTION}
                                aria-label={t("admin.examens.editer")}
                                title={t("admin.examens.editer")}
                              >
                                <SquarePen className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                disabled={enCours}
                                onClick={() => void supprimerDefinitivement(item)}
                                className={cn(
                                  CLASSE_BOUTON_ACTION,
                                  "hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                                )}
                                aria-label={t("admin.examens.supprimer")}
                                title={t("admin.examens.supprimer")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <div
                                className="relative"
                                ref={
                                  menuOuvertId === item.id ? menuRef : undefined
                                }
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setMenuOuvertId((id) =>
                                      id === item.id ? null : item.id
                                    )
                                  }
                                  className={CLASSE_BOUTON_ACTION}
                                  aria-label={t("admin.examens.plusActions")}
                                  title={t("admin.examens.plusActions")}
                                  aria-expanded={menuOuvertId === item.id}
                                  aria-haspopup="menu"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                                {menuOuvertId === item.id ? (
                                  <div
                                    role="menu"
                                    className="absolute bottom-full right-0 z-50 mb-1 min-w-[240px] rounded-lg border border-gris-bordure bg-white py-1 shadow-lg"
                                  >
                                    {item.actif ? (
                                      <button
                                        type="button"
                                        role="menuitem"
                                        disabled={enCours}
                                        onClick={() =>
                                          void changerActif(item, false)
                                        }
                                        className="block w-full px-3 py-2.5 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                                      >
                                        {t("admin.examens.exclureCatalogue")}
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        role="menuitem"
                                        disabled={enCours}
                                        onClick={() =>
                                          void changerActif(item, true)
                                        }
                                        className="block w-full px-3 py-2.5 text-left text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                                      >
                                        {t("admin.examens.inclureCatalogue")}
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      role="menuitem"
                                      disabled={enCours}
                                      onClick={() =>
                                        void supprimerDefinitivement(item)
                                      }
                                      className="block w-full border-t border-gris-bordure px-3 py-2.5 text-left text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                                    >
                                      {t("admin.examens.supprimerDefinitivement")}
                                    </button>
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
                  parPage={EXAMENS_PAR_PAGE}
                  onChange={setPage}
                  labelPrec={t("reception.liste.prec")}
                  labelSuiv={t("reception.liste.suiv")}
                />
              </>
            )}
          </div>

          <FormulaireExamenAdmin
            form={form}
            onChange={setForm}
            categories={categories}
            modePanneau={modePanneau}
            lectureSeule={lectureSeule}
            enCours={enCours}
            onSoumettre={() => void soumettre()}
            onAnnuler={ouvrirCreation}
          />
        </div>
      </div>
    </MiseEnPageAdmin>
  );
}
