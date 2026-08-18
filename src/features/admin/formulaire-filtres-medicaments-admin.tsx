"use client";

import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";

export interface FiltresMedicamentsAdmin {
  code: string;
  nom: string;
  categorie: string;
  forme: string;
  statut: "" | "actif" | "inactif";
}

export const FILTRES_MEDICAMENTS_ADMIN_VIDES: FiltresMedicamentsAdmin = {
  code: "",
  nom: "",
  categorie: "",
  forme: "",
  statut: "",
};

export function compterFiltresMedicamentsAdmin(f: FiltresMedicamentsAdmin): number {
  let n = 0;
  if (f.code.trim()) n += 1;
  if (f.nom.trim()) n += 1;
  if (f.categorie) n += 1;
  if (f.forme.trim()) n += 1;
  if (f.statut) n += 1;
  return n;
}

export interface MedicamentFiltrableAdmin {
  code: string;
  nom: string;
  categorie: string | null;
  forme: string | null;
  dosage: string | null;
  firme?: string | null;
  classeMedicamenteuse?: string | null;
  actif: boolean;
}

export function medicamentCorrespondFiltresAdmin(
  m: MedicamentFiltrableAdmin,
  filtres: FiltresMedicamentsAdmin,
  rechercheRapide = ""
): boolean {
  const q = rechercheRapide.trim().toLowerCase();
  if (q) {
    const haystack =
      `${m.code} ${m.nom} ${m.categorie ?? ""} ${m.forme ?? ""} ${m.dosage ?? ""} ${m.firme ?? ""} ${m.classeMedicamenteuse ?? ""}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  const code = filtres.code.trim().toLowerCase();
  if (code && !m.code.toLowerCase().includes(code)) return false;

  const nom = filtres.nom.trim().toLowerCase();
  if (nom && !m.nom.toLowerCase().includes(nom)) return false;

  if (filtres.categorie && (m.categorie ?? "") !== filtres.categorie) return false;

  const forme = filtres.forme.trim().toLowerCase();
  if (forme && !(m.forme ?? "").toLowerCase().includes(forme)) return false;

  if (filtres.statut === "actif" && !m.actif) return false;
  if (filtres.statut === "inactif" && m.actif) return false;

  return true;
}

const CLASSE_CHAMP =
  "w-full rounded-lg border border-gris-bordure bg-white px-3 py-2.5 text-sm text-texte-principal placeholder:text-texte-secondaire/70 focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15";

const CLASSE_LABEL =
  "mb-1 block text-[10px] font-bold uppercase tracking-wider text-texte-secondaire";

interface Props {
  valeurs: FiltresMedicamentsAdmin;
  onChange: (valeurs: FiltresMedicamentsAdmin) => void;
  onRechercher: () => void;
  onReinitialiser: () => void;
  categories: string[];
  idPrefix?: string;
}

export function FormulaireFiltresMedicamentsAdmin({
  valeurs,
  onChange,
  onRechercher,
  onReinitialiser,
  categories,
  idPrefix = "filtre-medicaments-admin",
}: Props) {
  const { t } = useTranslation();

  const maj = <K extends keyof FiltresMedicamentsAdmin>(
    cle: K,
    valeur: FiltresMedicamentsAdmin[K]
  ) => onChange({ ...valeurs, [cle]: valeur });

  const id = (suffixe: string) => `${idPrefix}-${suffixe}`;

  return (
    <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("code")}>
            {t("admin.medicaments.code")}
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
          <label className={CLASSE_LABEL} htmlFor={id("nom")}>
            {t("admin.medicaments.nom")}
          </label>
          <input
            id={id("nom")}
            value={valeurs.nom}
            onChange={(e) => maj("nom", e.target.value)}
            className={CLASSE_CHAMP}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("categorie")}>
            {t("admin.medicaments.categorie")}
          </label>
          <select
            id={id("categorie")}
            value={valeurs.categorie}
            onChange={(e) => maj("categorie", e.target.value)}
            className={CLASSE_CHAMP}
          >
            <option value="">{t("admin.medicaments.toutesCategories")}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("forme")}>
            {t("admin.medicaments.forme")}
          </label>
          <input
            id={id("forme")}
            value={valeurs.forme}
            onChange={(e) => maj("forme", e.target.value)}
            className={CLASSE_CHAMP}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("statut")}>
            {t("admin.medicaments.colonnes.statut")}
          </label>
          <select
            id={id("statut")}
            value={valeurs.statut}
            onChange={(e) =>
              maj("statut", e.target.value as FiltresMedicamentsAdmin["statut"])
            }
            className={CLASSE_CHAMP}
          >
            <option value="">{t("admin.medicaments.tousStatuts")}</option>
            <option value="actif">{t("admin.medicaments.actifs")}</option>
            <option value="inactif">{t("admin.medicaments.inactifs")}</option>
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
