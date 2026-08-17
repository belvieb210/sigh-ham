"use client";

import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";

export interface FiltresRolesAdmin {
  nom: string;
  code: string;
  salleCode: string;
  type: "" | "systeme" | "metier";
}

export const FILTRES_ROLES_ADMIN_VIDES: FiltresRolesAdmin = {
  nom: "",
  code: "",
  salleCode: "",
  type: "",
};

export function compterFiltresRolesAdmin(f: FiltresRolesAdmin): number {
  let n = 0;
  if (f.nom.trim()) n += 1;
  if (f.code.trim()) n += 1;
  if (f.salleCode) n += 1;
  if (f.type) n += 1;
  return n;
}

export interface RoleFiltrableAdmin {
  nom: string;
  code: string;
  systeme: boolean;
  salle: { code: string; nom: string } | null;
}

export function roleCorrespondFiltresAdmin(
  r: RoleFiltrableAdmin,
  filtres: FiltresRolesAdmin,
  rechercheRapide = ""
): boolean {
  const q = rechercheRapide.trim().toLowerCase();
  if (q) {
    const haystack = `${r.nom} ${r.code} ${r.salle?.nom ?? ""}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  const nom = filtres.nom.trim().toLowerCase();
  if (nom && !r.nom.toLowerCase().includes(nom)) return false;
  const code = filtres.code.trim().toLowerCase();
  if (code && !r.code.toLowerCase().includes(code)) return false;
  if (filtres.salleCode && r.salle?.code !== filtres.salleCode) return false;
  if (filtres.type === "systeme" && !r.systeme) return false;
  if (filtres.type === "metier" && r.systeme) return false;
  return true;
}

const CLASSE_CHAMP =
  "w-full rounded-lg border border-gris-bordure bg-white px-3 py-2.5 text-sm text-texte-principal placeholder:text-texte-secondaire/70 focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15";
const CLASSE_LABEL =
  "mb-1 block text-[10px] font-bold uppercase tracking-wider text-texte-secondaire";

interface Props {
  valeurs: FiltresRolesAdmin;
  onChange: (valeurs: FiltresRolesAdmin) => void;
  onRechercher: () => void;
  onReinitialiser: () => void;
  salles: { code: string; nom: string }[];
}

export function FormulaireFiltresRolesAdmin({
  valeurs,
  onChange,
  onRechercher,
  onReinitialiser,
  salles,
}: Props) {
  const { t } = useTranslation();
  const maj = <K extends keyof FiltresRolesAdmin>(
    cle: K,
    valeur: FiltresRolesAdmin[K]
  ) => onChange({ ...valeurs, [cle]: valeur });

  return (
    <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-role-nom">
            {t("admin.roles.colonnes.role")}
          </label>
          <input
            id="filtre-role-nom"
            value={valeurs.nom}
            onChange={(e) => maj("nom", e.target.value)}
            className={CLASSE_CHAMP}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-role-code">
            {t("admin.roles.champs.code")}
          </label>
          <input
            id="filtre-role-code"
            value={valeurs.code}
            onChange={(e) => maj("code", e.target.value)}
            className={CLASSE_CHAMP}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-role-salle">
            {t("admin.roles.colonnes.service")}
          </label>
          <select
            id="filtre-role-salle"
            value={valeurs.salleCode}
            onChange={(e) => maj("salleCode", e.target.value)}
            className={CLASSE_CHAMP}
          >
            <option value="">{t("admin.roles.toutesSalles")}</option>
            {salles.map((s) => (
              <option key={s.code} value={s.code}>
                {s.nom}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-role-type">
            {t("admin.roles.colonnes.type")}
          </label>
          <select
            id="filtre-role-type"
            value={valeurs.type}
            onChange={(e) =>
              maj("type", e.target.value as FiltresRolesAdmin["type"])
            }
            className={CLASSE_CHAMP}
          >
            <option value="">{t("admin.roles.tousTypes")}</option>
            <option value="systeme">{t("admin.roles.systeme")}</option>
            <option value="metier">{t("admin.roles.metier")}</option>
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
