"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Info,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { PaginationNumerotee } from "@/components/ui/pagination-numerotee";
import { paginerListe } from "@/components/ui/pagination-liste";
import {
  CLASSE_CHAMP_RECEPTION,
  CLASSE_LABEL_RECEPTION,
} from "@/constants/reception";
import {
  categoriesExamensUniques,
  filtrerExamensPaquet,
  type ExamenPaquetOpt,
} from "@/lib/admin/filtrer-examens-paquet";
import { cn } from "@/lib/utils";

export type FormPaquetBilan = {
  code: string;
  libelle: string;
  description: string;
  prix: string;
  remise: string;
  ordre: string;
  actif: boolean;
  typeExamenIds: string[];
};

const PAR_PAGE_EXAMENS = 5;

function formaterFc(montant: number) {
  return `${montant.toLocaleString("fr-FR")} FC`;
}

interface PropsFormulairePaquetBilanAdmin {
  mode: "creation" | "edition";
  form: FormPaquetBilan;
  onChange: (form: FormPaquetBilan) => void;
  examens: ExamenPaquetOpt[];
  enCours: boolean;
  onAnnuler: () => void;
  onSauvegarder: () => void;
}

export function FormulairePaquetBilanAdmin({
  mode,
  form,
  onChange,
  examens,
  enCours,
  onAnnuler,
  onSauvegarder,
}: PropsFormulairePaquetBilanAdmin) {
  const { t } = useTranslation();

  const [rechercheBrouillon, setRechercheBrouillon] = useState("");
  const [categorieBrouillon, setCategorieBrouillon] = useState("tous");
  const [rechercheAppliquee, setRechercheAppliquee] = useState("");
  const [categorieAppliquee, setCategorieAppliquee] = useState("tous");
  const [categoriePill, setCategoriePill] = useState("tous");
  const [pageExamens, setPageExamens] = useState(1);

  const categories = useMemo(() => categoriesExamensUniques(examens), [examens]);

  const examensDisponibles = useMemo(
    () => examens.filter((e) => !form.typeExamenIds.includes(e.id)),
    [examens, form.typeExamenIds]
  );

  const examensFiltres = useMemo(
    () =>
      filtrerExamensPaquet(examensDisponibles, {
        recherche: rechercheAppliquee,
        categorie: categorieAppliquee === "tous" ? categoriePill : categorieAppliquee,
      }),
    [examensDisponibles, rechercheAppliquee, categorieAppliquee, categoriePill]
  );

  const pageData = useMemo(
    () => paginerListe(examensFiltres, pageExamens, PAR_PAGE_EXAMENS),
    [examensFiltres, pageExamens]
  );

  const examensSelectionnes = useMemo(
    () =>
      form.typeExamenIds
        .map((id) => examens.find((e) => e.id === id))
        .filter((e): e is ExamenPaquetOpt => Boolean(e)),
    [examens, form.typeExamenIds]
  );

  const sommeIndividuelle = examensSelectionnes.reduce((s, e) => s + e.prix, 0);
  const prixForfait = Number(form.prix) || 0;
  const remisePct = Math.min(100, Math.max(0, Number(form.remise) || 0));
  const prixApresRemise =
    sommeIndividuelle > 0
      ? Math.round(sommeIndividuelle * (1 - remisePct / 100))
      : prixForfait;
  const economie = Math.max(0, sommeIndividuelle - prixForfait);

  useEffect(() => {
    setPageExamens(1);
  }, [rechercheAppliquee, categorieAppliquee, categoriePill]);

  const appliquerFiltres = () => {
    setRechercheAppliquee(rechercheBrouillon);
    setCategorieAppliquee(categorieBrouillon);
    setCategoriePill(categorieBrouillon);
    setPageExamens(1);
  };

  const ajouterExamen = (id: string) => {
    if (form.typeExamenIds.includes(id)) return;
    onChange({ ...form, typeExamenIds: [...form.typeExamenIds, id] });
  };

  const retirerExamen = (id: string) => {
    onChange({
      ...form,
      typeExamenIds: form.typeExamenIds.filter((x) => x !== id),
    });
  };

  const appliquerRemiseAuPrix = () => {
    if (sommeIndividuelle <= 0) return;
    onChange({
      ...form,
      prix: String(Math.round(sommeIndividuelle * (1 - remisePct / 100))),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-texte-principal">
            {mode === "creation"
              ? t("admin.paquetsBilans.form.titreCreation")
              : t("admin.paquetsBilans.form.titreEdition")}
          </h2>
          <p className="mt-1 text-sm text-texte-secondaire">
            {t("admin.paquetsBilans.form.sousTitre")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Bouton variante="contour" taille="petit" onClick={onAnnuler} disabled={enCours}>
            <X className="mr-1 h-4 w-4" />
            {t("admin.paquetsBilans.form.annuler")}
          </Bouton>
          <Bouton taille="petit" onClick={onSauvegarder} disabled={enCours}>
            {enCours ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1 h-4 w-4" />
            )}
            {t("admin.paquetsBilans.form.enregistrer")}
          </Bouton>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          {/* Informations générales */}
          <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
            <h3 className="text-sm font-bold text-texte-principal">
              {t("admin.paquetsBilans.form.infosGenerales")}
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className={CLASSE_LABEL_RECEPTION}>
                  {t("admin.paquetsBilans.libelle")} *
                </span>
                <input
                  value={form.libelle}
                  onChange={(e) => onChange({ ...form, libelle: e.target.value })}
                  placeholder={t("admin.paquetsBilans.form.placeholderLibelle")}
                  className={CLASSE_CHAMP_RECEPTION}
                />
              </label>
              <label className="block text-sm">
                <span className={CLASSE_LABEL_RECEPTION}>
                  {t("admin.paquetsBilans.code")} *
                </span>
                <input
                  value={form.code}
                  onChange={(e) => onChange({ ...form, code: e.target.value })}
                  placeholder="BIL-PREN-001"
                  className={CLASSE_CHAMP_RECEPTION}
                />
              </label>
              <label className="block text-sm">
                <span className={CLASSE_LABEL_RECEPTION}>
                  {t("admin.paquetsBilans.form.ordre")}
                </span>
                <input
                  type="number"
                  min={0}
                  value={form.ordre}
                  onChange={(e) => onChange({ ...form, ordre: e.target.value })}
                  className={CLASSE_CHAMP_RECEPTION}
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className={CLASSE_LABEL_RECEPTION}>
                  {t("admin.paquetsBilans.form.description")}
                </span>
                <textarea
                  rows={3}
                  maxLength={300}
                  value={form.description}
                  onChange={(e) => onChange({ ...form, description: e.target.value })}
                  placeholder={t("admin.paquetsBilans.form.placeholderDescription")}
                  className={cn(CLASSE_CHAMP_RECEPTION, "resize-y")}
                />
                <span className="mt-1 block text-right text-[10px] text-texte-secondaire">
                  {form.description.length}/300
                </span>
              </label>
            </div>
          </section>

          {/* Sélection des examens */}
          <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
            <h3 className="text-sm font-bold text-texte-principal">
              {t("admin.paquetsBilans.form.selectionExamens")}
            </h3>
            <p className="mt-1 text-xs text-texte-secondaire">
              {t("admin.paquetsBilans.form.selectionAide")}
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire" />
                <input
                  type="search"
                  value={rechercheBrouillon}
                  onChange={(e) => setRechercheBrouillon(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && appliquerFiltres()}
                  placeholder={t("admin.paquetsBilans.form.rechercheExamen")}
                  className="w-full rounded-full border border-gris-bordure py-2.5 pl-10 pr-4 text-sm outline-none focus:border-ham-plum focus:ring-2 focus:ring-ham-plum/20"
                />
              </label>
              <select
                value={categorieBrouillon}
                onChange={(e) => setCategorieBrouillon(e.target.value)}
                className="rounded-full border border-gris-bordure bg-white px-4 py-2.5 text-sm outline-none focus:border-ham-plum sm:min-w-[180px]"
              >
                <option value="tous">{t("admin.paquetsBilans.form.toutesCategories")}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <Bouton
                type="button"
                taille="petit"
                className="rounded-full bg-ham-plum hover:bg-ham-plum/90"
                onClick={appliquerFiltres}
              >
                {t("admin.paquetsBilans.rechercher")}
              </Bouton>
            </div>

            {categories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCategoriePill("tous");
                    setPageExamens(1);
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                    categoriePill === "tous"
                      ? "border-ham-plum bg-ham-plum text-white"
                      : "border-gris-bordure bg-white text-texte-principal hover:bg-gris-tres-clair"
                  )}
                >
                  {t("admin.paquetsBilans.form.toutesCategories")}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategoriePill(cat);
                      setPageExamens(1);
                    }}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                      categoriePill === cat
                        ? "border-ham-plum bg-ham-plum text-white"
                        : "border-gris-bordure bg-white text-texte-principal hover:bg-gris-tres-clair"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-gris-bordure">
                <div className="border-b border-gris-bordure px-3 py-2 text-xs font-bold uppercase tracking-wide text-texte-secondaire">
                  {t("admin.paquetsBilans.form.examensDisponibles")}
                </div>
                {pageData.itemsPage.length === 0 ? (
                  <p className="px-3 py-8 text-center text-sm text-texte-secondaire">
                    {t("admin.paquetsBilans.form.aucunExamenFiltre")}
                  </p>
                ) : (
                  <ul className="divide-y divide-gris-bordure">
                    {pageData.itemsPage.map((e) => (
                      <li
                        key={e.id}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gris-tres-clair/50"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-texte-principal">
                            {e.libelle}
                          </p>
                          <p className="text-[11px] text-texte-secondaire">
                            {e.code} · {formaterFc(e.prix)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => ajouterExamen(e.id)}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gris-bordure text-ham-plum hover:border-ham-plum hover:bg-ham-plum/5"
                          title={t("admin.paquetsBilans.form.ajouter")}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="border-t border-gris-bordure px-3 py-3">
                  <PaginationNumerotee
                    page={pageData.pageCourante}
                    totalPages={pageData.totalPages}
                    onChange={setPageExamens}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-gris-bordure">
                <div className="border-b border-gris-bordure px-3 py-2 text-xs font-bold uppercase tracking-wide text-texte-secondaire">
                  {t("admin.paquetsBilans.form.examensSelectionnes", {
                    count: examensSelectionnes.length,
                  })}
                </div>
                {examensSelectionnes.length === 0 ? (
                  <p className="px-3 py-8 text-center text-sm text-texte-secondaire">
                    {t("admin.paquetsBilans.form.aucunExamenSelectionne")}
                  </p>
                ) : (
                  <ul className="max-h-[320px] divide-y divide-gris-bordure overflow-y-auto">
                    {examensSelectionnes.map((e) => (
                      <li
                        key={e.id}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-texte-principal">
                            {e.libelle}
                          </p>
                          <p className="text-[11px] text-texte-secondaire">
                            {e.code} · {formaterFc(e.prix)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => retirerExamen(e.id)}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                          title={t("admin.paquetsBilans.form.retirer")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="border-t border-gris-bordure px-3 py-2 text-right text-xs text-texte-secondaire">
                  {t("admin.paquetsBilans.sommeSelection")} :{" "}
                  <span className="font-bold text-texte-principal">
                    {formaterFc(sommeIndividuelle)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Tarification */}
          <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
            <h3 className="text-sm font-bold text-texte-principal">
              {t("admin.paquetsBilans.form.tarification")}
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className="block text-sm">
                <span className={CLASSE_LABEL_RECEPTION}>
                  {t("admin.paquetsBilans.prixForfait")} *
                </span>
                <input
                  type="number"
                  min={0}
                  value={form.prix}
                  onChange={(e) => onChange({ ...form, prix: e.target.value })}
                  className={CLASSE_CHAMP_RECEPTION}
                />
              </label>
              <label className="block text-sm">
                <span className={CLASSE_LABEL_RECEPTION}>
                  {t("admin.paquetsBilans.form.remise")}
                </span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.remise}
                    onChange={(e) => onChange({ ...form, remise: e.target.value })}
                    className={CLASSE_CHAMP_RECEPTION}
                  />
                  <button
                    type="button"
                    onClick={appliquerRemiseAuPrix}
                    className="shrink-0 rounded-lg border border-gris-bordure px-2 text-[10px] font-semibold text-ham-plum hover:bg-gris-tres-clair"
                  >
                    {t("admin.paquetsBilans.form.appliquerRemise")}
                  </button>
                </div>
              </label>
              <label className="block text-sm">
                <span className={CLASSE_LABEL_RECEPTION}>
                  {t("admin.paquetsBilans.form.prixApresRemise")}
                </span>
                <input
                  readOnly
                  value={formaterFc(prixApresRemise)}
                  className={cn(CLASSE_CHAMP_RECEPTION, "bg-gris-tres-clair")}
                />
              </label>
            </div>
            <p className="mt-3 flex items-start gap-2 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-900">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              {t("admin.paquetsBilans.form.notePrixIndependant")}
            </p>
          </section>
        </div>

        <div className="space-y-5">
          {/* Statut */}
          <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-texte-principal">
              {t("admin.paquetsBilans.form.statutVisibilite")}
            </h3>
            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ ...form, actif: true })}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-semibold",
                    form.actif
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-gris-bordure text-texte-secondaire"
                  )}
                >
                  {t("admin.paquetsBilans.actif")}
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...form, actif: false })}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-semibold",
                    !form.actif
                      ? "border-slate-300 bg-slate-100 text-slate-700"
                      : "border-gris-bordure text-texte-secondaire"
                  )}
                >
                  {t("admin.paquetsBilans.inactif")}
                </button>
              </div>
            </div>
          </section>

          {/* Aperçu */}
          <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-texte-principal">
              {t("admin.paquetsBilans.form.apercu")}
            </h3>
            <div className="mt-4 rounded-xl border border-gris-bordure bg-gris-tres-clair/60 p-4">
              <p className="text-base font-bold text-texte-principal">
                {form.libelle.trim() || t("admin.paquetsBilans.form.apercuTitreVide")}
              </p>
              <p className="mt-1 text-xs text-texte-secondaire">
                {form.description.trim() ||
                  t("admin.paquetsBilans.form.apercuDescriptionVide")}
              </p>
              <p className="mt-3 text-xs text-texte-secondaire">
                {t("admin.paquetsBilans.form.apercuNbExamens", {
                  count: examensSelectionnes.length,
                })}
              </p>
              <div className="mt-4 flex items-end justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase text-texte-secondaire">
                    {t("admin.paquetsBilans.form.apercuPrixBilan")}
                  </p>
                  <p className="text-xl font-bold text-ham-plum">
                    {formaterFc(prixForfait)}
                  </p>
                </div>
                {economie > 0 && (
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800">
                    {t("admin.paquetsBilans.form.economie", {
                      montant: economie.toLocaleString("fr-FR"),
                    })}
                  </span>
                )}
              </div>
              {sommeIndividuelle > 0 && (
                <p className="mt-2 text-[10px] text-texte-secondaire line-through">
                  {formaterFc(sommeIndividuelle)}
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
