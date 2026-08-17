"use client";

import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";

export interface FiltresExamensAdmin {
  code: string;
  libelle: string;
  categorie: string;
  statut: "" | "actif" | "inactif";
  packPrenuptial: "" | "oui" | "non";
}

export const FILTRES_EXAMENS_ADMIN_VIDES: FiltresExamensAdmin = {
  code: "",
  libelle: "",
  categorie: "",
  statut: "",
  packPrenuptial: "",
};

export function compterFiltresExamensAdmin(f: FiltresExamensAdmin): number {
  let n = 0;
  if (f.code.trim()) n += 1;
  if (f.libelle.trim()) n += 1;
  if (f.categorie) n += 1;
  if (f.statut) n += 1;
  if (f.packPrenuptial) n += 1;
  return n;
}

export interface ExamenFiltrableAdmin {
  code: string;
  libelle: string;
  categorie: string;
  actif: boolean;
  packPrenuptial: boolean;
}

export function examenCorrespondFiltresAdmin(
  e: ExamenFiltrableAdmin,
  filtres: FiltresExamensAdmin,
  rechercheRapide = ""
): boolean {
  const q = rechercheRapide.trim().toLowerCase();
  if (q) {
    const haystack = `${e.code} ${e.libelle} ${e.categorie}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  const code = filtres.code.trim().toLowerCase();
  if (code && !e.code.toLowerCase().includes(code)) return false;

  const libelle = filtres.libelle.trim().toLowerCase();
  if (libelle && !e.libelle.toLowerCase().includes(libelle)) return false;

  if (filtres.categorie && e.categorie !== filtres.categorie) return false;

  if (filtres.statut === "actif" && !e.actif) return false;
  if (filtres.statut === "inactif" && e.actif) return false;

  if (filtres.packPrenuptial === "oui" && !e.packPrenuptial) return false;
  if (filtres.packPrenuptial === "non" && e.packPrenuptial) return false;

  return true;
}

const CLASSE_CHAMP =
  "w-full rounded-lg border border-gris-bordure bg-white px-3 py-2.5 text-sm text-texte-principal placeholder:text-texte-secondaire/70 focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15";

const CLASSE_LABEL =
  "mb-1 block text-[10px] font-bold uppercase tracking-wider text-texte-secondaire";

interface Props {
  valeurs: FiltresExamensAdmin;
  onChange: (valeurs: FiltresExamensAdmin) => void;
  onRechercher: () => void;
  onReinitialiser: () => void;
  categories: string[];
  idPrefix?: string;
}

export function FormulaireFiltresExamensAdmin({
  valeurs,
  onChange,
  onRechercher,
  onReinitialiser,
  categories,
  idPrefix = "filtre-examens-admin",
}: Props) {
  const { t } = useTranslation();

  const maj = <K extends keyof FiltresExamensAdmin>(
    cle: K,
    valeur: FiltresExamensAdmin[K]
  ) => onChange({ ...valeurs, [cle]: valeur });

  const id = (suffixe: string) => `${idPrefix}-${suffixe}`;

  return (
    <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("code")}>
            {t("admin.examens.code")}
          </label>
          <input
            id={id("code")}
            value={valeurs.code}
            onChange={(e) => maj("code", e.target.value)}
            className={CLASSE_CHAMP}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("libelle")}>
            {t("admin.examens.libelle")}
          </label>
          <input
            id={id("libelle")}
            value={valeurs.libelle}
            onChange={(e) => maj("libelle", e.target.value)}
            className={CLASSE_CHAMP}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("categorie")}>
            {t("admin.examens.categorie")}
          </label>
          <select
            id={id("categorie")}
            value={valeurs.categorie}
            onChange={(e) => maj("categorie", e.target.value)}
            className={CLASSE_CHAMP}
          >
            <option value="">{t("admin.examens.toutesCategories")}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("statut")}>
            {t("admin.examens.colonnes.statut")}
          </label>
          <select
            id={id("statut")}
            value={valeurs.statut}
            onChange={(e) =>
              maj("statut", e.target.value as FiltresExamensAdmin["statut"])
            }
            className={CLASSE_CHAMP}
          >
            <option value="">{t("admin.examens.tousStatuts")}</option>
            <option value="actif">{t("admin.examens.actifs")}</option>
            <option value="inactif">{t("admin.examens.inactifs")}</option>
          </select>
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("pack")}>
            {t("admin.examens.packPrenuptial")}
          </label>
          <select
            id={id("pack")}
            value={valeurs.packPrenuptial}
            onChange={(e) =>
              maj(
                "packPrenuptial",
                e.target.value as FiltresExamensAdmin["packPrenuptial"]
              )
            }
            className={CLASSE_CHAMP}
          >
            <option value="">{t("admin.examens.tousPacks")}</option>
            <option value="oui">{t("admin.examens.oui")}</option>
            <option value="non">{t("admin.examens.non")}</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <Bouton type="button" variante="contour" taille="moyen" onClick={onReinitialiser}>
          {t("reception.tableau.filtres.reinitialiser")}
        </Bouton>
        <Bouton type="button" variante="primaire" taille="moyen" onClick={onRechercher}>
          <Search className="h-4 w-4" />
          {t("reception.tableau.filtres.rechercher")}
        </Bouton>
      </div>
    </section>
  );
}
