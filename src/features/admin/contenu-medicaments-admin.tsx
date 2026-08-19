"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  Eye,
  Loader2,
  MoreVertical,
  Pill,
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
  compterFiltresMedicamentsAdmin,
  FILTRES_MEDICAMENTS_ADMIN_VIDES,
  FormulaireFiltresMedicamentsAdmin,
  medicamentCorrespondFiltresAdmin,
  type FiltresMedicamentsAdmin,
} from "@/features/admin/formulaire-filtres-medicaments-admin";
import {
  FORM_MEDICAMENT_ADMIN_VIDE,
  FormulaireMedicamentAdmin,
  type FormMedicamentAdmin,
} from "@/features/admin/formulaire-medicament-admin";
import {
  CATEGORIES_MEDICAMENT,
  FORMES_MEDICAMENT,
  choixDepuisValeur,
  valeurDepuisChoix,
} from "@/constants/catalogue-medicaments";
import { formaterPrixFc } from "@/features/caisse/utils-format";
import { cn } from "@/lib/utils";

type MedicamentItem = {
  id: string;
  code: string;
  nom: string;
  categorie: string | null;
  forme: string | null;
  dosage: string | null;
  prixAchat: number | null;
  prixUnitaire: number;
  stockMinimum: number;
  stockMaximum: number | null;
  emplacement: string | null;
  actif: boolean;
  firme: string | null;
  telephoneFirme: string | null;
  classeMedicamenteuse: string | null;
  voieAdministration: string | null;
  expirationLe: string | null;
  recuPar: string | null;
  autresInformations: string | null;
  description: string | null;
  stockActuel: number;
  expirationProche: string | null;
  alerteStock: boolean;
  alerteExpiration: boolean;
  joursAvantExpiration: number | null;
};

type ModePanneau = "creation" | "consultation" | "edition";

const MEDICAMENTS_PAR_PAGE = 16;

const CLASSE_BOUTON_ACTION =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gris-bordure text-slate-500 transition-colors hover:bg-gris-tres-clair hover:text-bleu-medical";

function formaterPrix(n: number) {
  return formaterPrixFc(n);
}

function itemVersForm(item: MedicamentItem): FormMedicamentAdmin {
  const categorie = choixDepuisValeur(item.categorie, CATEGORIES_MEDICAMENT);
  const forme = choixDepuisValeur(item.forme, FORMES_MEDICAMENT);
  return {
    code: item.code,
    nom: item.nom,
    categorieChoix: categorie.choix,
    categorieAutre: categorie.autre,
    formeChoix: forme.choix,
    formeAutre: forme.autre,
    dosage: item.dosage ?? "",
    voieAdministration: item.voieAdministration ?? "",
    firme: item.firme ?? "",
    telephoneFirme: item.telephoneFirme ?? "",
    classeMedicamenteuse: item.classeMedicamenteuse ?? "",
    prixAchat: item.prixAchat != null ? String(item.prixAchat) : "",
    prixUnitaire: String(item.prixUnitaire),
    stockMinimum: String(item.stockMinimum),
    stockMaximum: item.stockMaximum != null ? String(item.stockMaximum) : "",
    emplacement: item.emplacement ?? "",
    expirationLe: item.expirationLe ?? "",
    recuPar: item.recuPar ?? "",
    autresInformations: item.autresInformations ?? "",
    description: item.description ?? "",
    actif: item.actif,
  };
}

export function ContenuMedicamentsAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t } = useTranslation();
  const [liste, setListe] = useState<MedicamentItem[]>([]);
  const [rechercheRapide, setRechercheRapide] = useState("");
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillon, setBrouillon] = useState<FiltresMedicamentsAdmin>(
    FILTRES_MEDICAMENTS_ADMIN_VIDES
  );
  const [appliques, setAppliques] = useState<FiltresMedicamentsAdmin>(
    FILTRES_MEDICAMENTS_ADMIN_VIDES
  );
  const [idsCoches, setIdsCoches] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectionId, setSelectionId] = useState<string | null>(null);
  const [form, setForm] = useState<FormMedicamentAdmin>({
    ...FORM_MEDICAMENT_ADMIN_VIDE,
  });
  const [modePanneau, setModePanneau] = useState<ModePanneau>("creation");
  const [menuOuvertId, setMenuOuvertId] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const lectureSeule = modePanneau === "consultation";

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/admin/medicaments");
      const data = (await res.json()) as {
        medicaments?: MedicamentItem[];
        message?: string;
      };
      if (!res.ok) throw new Error(data.message ?? t("admin.medicaments.erreur"));
      setListe(data.medicaments ?? []);
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.medicaments.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const m of liste) {
      if (m.categorie?.trim()) set.add(m.categorie.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
  }, [liste]);

  const listeFiltree = useMemo(
    () =>
      liste.filter((m) =>
        medicamentCorrespondFiltresAdmin(m, appliques, rechercheRapide)
      ),
    [liste, appliques, rechercheRapide]
  );

  const pageData = useMemo(
    () => paginerListe(listeFiltree, page, MEDICAMENTS_PAR_PAGE),
    [listeFiltree, page]
  );

  useEffect(() => {
    setPage(1);
  }, [rechercheRapide, appliques]);

  const nbFiltres = compterFiltresMedicamentsAdmin(appliques);
  const toutSelectionne =
    listeFiltree.length > 0 &&
    listeFiltree.every((m) => idsCoches.includes(m.id));

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
    setForm({ ...FORM_MEDICAMENT_ADMIN_VIDE });
    setMessage(null);
    setErreur(null);
  };

  const consulter = (item: MedicamentItem) => {
    setModePanneau("consultation");
    setSelectionId(item.id);
    setMenuOuvertId(null);
    setForm(itemVersForm(item));
    setMessage(null);
    setErreur(null);
  };

  const editer = (item: MedicamentItem) => {
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
    setIdsCoches(listeFiltree.map((m) => m.id));
  };

  const exporterSelection = () => {
    const coches = new Set(idsCoches);
    const cibles =
      coches.size > 0
        ? listeFiltree.filter((m) => coches.has(m.id))
        : listeFiltree;
    if (cibles.length === 0) return;
    telechargerCsv(
      `admin-medicaments-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        t("admin.medicaments.code"),
        t("admin.medicaments.nom"),
        t("admin.medicaments.categorie"),
        t("admin.medicaments.forme"),
        t("admin.medicaments.voieAdministration"),
        t("admin.medicaments.dosage"),
        t("admin.medicaments.firme"),
        t("admin.medicaments.prixUnitaire"),
        t("admin.medicaments.expirationLe"),
        t("admin.medicaments.colonnes.statut"),
      ],
      cibles.map((m) => [
        m.code,
        m.nom,
        m.categorie ?? "",
        m.forme ?? "",
        m.voieAdministration ?? "",
        m.dosage ?? "",
        m.firme ?? "",
        String(m.prixUnitaire),
        m.expirationLe ?? "",
        m.actif ? t("admin.medicaments.actif") : t("admin.medicaments.inactif"),
      ])
    );
  };

  const changerActif = async (item: MedicamentItem, actif: boolean) => {
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    setMenuOuvertId(null);
    try {
      const res = await fetch(`/api/admin/medicaments/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actif }),
      });
      const data = (await res.json()) as {
        message?: string;
        medicament?: MedicamentItem;
      };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setMessage(
        actif ? t("admin.medicaments.active") : t("admin.medicaments.desactive")
      );
      if (selectionId === item.id && data.medicament) {
        setForm(itemVersForm(data.medicament));
      }
      await charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const soumettre = async () => {
    if (!form.code.trim() || !form.nom.trim()) {
      setErreur(t("admin.medicaments.champsRequis"));
      return;
    }
    const prixUnitaire = Number(form.prixUnitaire);
    if (!Number.isFinite(prixUnitaire) || prixUnitaire < 0) {
      setErreur(t("admin.medicaments.prixInvalide"));
      return;
    }

    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const payload = {
        code: form.code,
        nom: form.nom,
        categorie: valeurDepuisChoix(form.categorieChoix, form.categorieAutre),
        forme: valeurDepuisChoix(form.formeChoix, form.formeAutre),
        dosage: form.dosage || null,
        voieAdministration: form.voieAdministration || null,
        firme: form.firme || null,
        telephoneFirme: form.telephoneFirme || null,
        classeMedicamenteuse: form.classeMedicamenteuse || null,
        prixAchat: form.prixAchat === "" ? null : Number(form.prixAchat),
        prixUnitaire,
        stockMinimum: Number(form.stockMinimum),
        stockMaximum: form.stockMaximum === "" ? null : Number(form.stockMaximum),
        emplacement: form.emplacement || null,
        expirationLe: form.expirationLe || null,
        recuPar: form.recuPar || null,
        autresInformations: form.autresInformations || null,
        description: form.description || null,
        actif: form.actif,
      };
      const creation = modePanneau === "creation";
      const res = await fetch(
        creation
          ? "/api/admin/medicaments"
          : `/api/admin/medicaments/${selectionId}`,
        {
          method: creation ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = (await res.json()) as {
        message?: string;
        medicament?: MedicamentItem;
      };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setMessage(
        data.message ??
          (creation ? t("admin.medicaments.cree") : t("admin.medicaments.maj"))
      );
      if (data.medicament) {
        setSelectionId(data.medicament.id);
        setModePanneau("edition");
        setForm(itemVersForm(data.medicament));
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
      titre={t("admin.medicaments.titre")}
      sousTitre={t("admin.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <EnTetePageReception
          icone={Pill}
          titre={t("admin.medicaments.titre")}
          description={t("admin.medicaments.description")}
          fil={[
            { label: t("admin.common.salle"), href: "/sigh/admin" },
            { label: t("admin.medicaments.fil") },
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
                placeholder={t("admin.medicaments.recherche")}
                aria-label={t("admin.medicaments.recherche")}
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-600"
              />
              {rechercheRapide ? (
                <button
                  type="button"
                  onClick={() => setRechercheRapide("")}
                  aria-label={t("admin.medicaments.effacerRecherche")}
                  className="shrink-0 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </label>

            <div className="flex shrink-0 items-center justify-end gap-2">
              <Bouton type="button" taille="petit" onClick={ouvrirCreation}>
                <Plus className="h-4 w-4" />
                {t("admin.medicaments.nouveau")}
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
            <FormulaireFiltresMedicamentsAdmin
              valeurs={brouillon}
              onChange={setBrouillon}
              onRechercher={() => {
                setAppliques(brouillon);
                setPage(1);
              }}
              onReinitialiser={() => {
                setBrouillon(FILTRES_MEDICAMENTS_ADMIN_VIDES);
                setAppliques(FILTRES_MEDICAMENTS_ADMIN_VIDES);
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
          <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
            {chargement ? (
              <p className="flex items-center gap-2 p-6 text-sm text-texte-secondaire">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("admin.common.chargement")}
              </p>
            ) : listeFiltree.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
                {t("admin.medicaments.aucunResultat")}
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
                        <th className="px-3 py-2">{t("admin.medicaments.code")}</th>
                        <th className="px-3 py-2">{t("admin.medicaments.nom")}</th>
                        <th className="hidden px-3 py-2 md:table-cell">
                          {t("admin.medicaments.forme")}
                        </th>
                        <th className="hidden px-3 py-2 lg:table-cell">
                          {t("admin.medicaments.colonnes.stock")}
                        </th>
                        <th className="hidden px-3 py-2 lg:table-cell">
                          {t("admin.medicaments.prixUnitaire")}
                        </th>
                        <th className="px-3 py-2">
                          {t("admin.medicaments.colonnes.statut")}
                        </th>
                        <th className="px-3 py-2 text-center">
                          {t("admin.medicaments.colonnes.actions")}
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
                              aria-label={item.nom}
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="font-mono text-xs font-semibold text-texte-principal">
                              {item.code}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <p className="font-medium text-texte-principal">
                              {item.nom}
                            </p>
                            <p className="text-xs text-texte-secondaire">
                              {[item.categorie, item.dosage].filter(Boolean).join(" · ")}
                            </p>
                          </td>
                          <td className="hidden px-3 py-2.5 text-sm md:table-cell">
                            {item.forme ?? "—"}
                          </td>
                          <td className="hidden px-3 py-2.5 text-sm lg:table-cell">
                            <div className="flex flex-col gap-1">
                              <span
                                className={cn(
                                  "tabular-nums font-semibold",
                                  item.alerteStock ? "text-red-700" : "text-texte-principal"
                                )}
                              >
                                {item.stockActuel}
                                {item.stockMaximum != null ? ` / ${item.stockMaximum}` : ""}
                              </span>
                              {item.alerteStock ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700">
                                  <AlertTriangle className="h-3 w-3" />
                                  {item.stockActuel <= 0
                                    ? t("admin.medicaments.alerteRupture")
                                    : t("admin.medicaments.alerteStockFaible")}
                                </span>
                              ) : null}
                              {item.alerteExpiration ? (
                                <span className="text-[10px] font-semibold text-rose-700">
                                  {item.joursAvantExpiration != null &&
                                  item.joursAvantExpiration < 0
                                    ? t("admin.medicaments.alertePerime")
                                    : item.joursAvantExpiration === 0
                                      ? t("admin.medicaments.alerteExpireAujourdhui")
                                      : t("admin.medicaments.alerteExpireJours", {
                                          count: item.joursAvantExpiration ?? 0,
                                        })}
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="hidden px-3 py-2.5 text-sm tabular-nums lg:table-cell">
                            {formaterPrix(item.prixUnitaire)}
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
                                ? t("admin.medicaments.actif")
                                : t("admin.medicaments.inactif")}
                            </span>
                          </td>
                          <td
                            className="px-3 py-2.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => consulter(item)}
                                className={CLASSE_BOUTON_ACTION}
                                aria-label={t("admin.medicaments.voir")}
                                title={t("admin.medicaments.voir")}
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => editer(item)}
                                className={CLASSE_BOUTON_ACTION}
                                aria-label={t("admin.medicaments.editer")}
                                title={t("admin.medicaments.editer")}
                              >
                                <SquarePen className="h-4 w-4" />
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
                                  aria-label={t("admin.medicaments.plusActions")}
                                  title={t("admin.medicaments.plusActions")}
                                  aria-expanded={menuOuvertId === item.id}
                                  aria-haspopup="menu"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                                {menuOuvertId === item.id ? (
                                  <div
                                    role="menu"
                                    className="absolute right-0 top-10 z-20 min-w-[240px] overflow-hidden rounded-lg border border-gris-bordure bg-white py-1 shadow-lg"
                                  >
                                    {item.actif ? (
                                      <button
                                        type="button"
                                        role="menuitem"
                                        disabled={enCours}
                                        onClick={() =>
                                          void changerActif(item, false)
                                        }
                                        className="block w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                                      >
                                        {t("admin.medicaments.exclureCatalogue")}
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        role="menuitem"
                                        disabled={enCours}
                                        onClick={() =>
                                          void changerActif(item, true)
                                        }
                                        className="block w-full px-3 py-2 text-left text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                                      >
                                        {t("admin.medicaments.inclureCatalogue")}
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
                  parPage={MEDICAMENTS_PAR_PAGE}
                  onChange={setPage}
                  labelPrec={t("reception.liste.prec")}
                  labelSuiv={t("reception.liste.suiv")}
                />
              </>
            )}
          </div>

          <FormulaireMedicamentAdmin
            form={form}
            onChange={setForm}
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
