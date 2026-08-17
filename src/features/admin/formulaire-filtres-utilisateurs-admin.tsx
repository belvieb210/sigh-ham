"use client";

import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";

export interface RoleFiltreAdmin {
  id: string;
  nom: string;
}

export interface SalleFiltreAdmin {
  code: string;
  nom: string;
}

export interface FiltresUtilisateursAdmin {
  nom: string;
  prenom: string;
  identifiant: string;
  roleId: string;
  salleCode: string;
  statut: string;
}

export const FILTRES_UTILISATEURS_ADMIN_VIDES: FiltresUtilisateursAdmin = {
  nom: "",
  prenom: "",
  identifiant: "",
  roleId: "",
  salleCode: "",
  statut: "",
};

export function compterFiltresUtilisateursAdmin(f: FiltresUtilisateursAdmin): number {
  let n = 0;
  if (f.nom.trim()) n += 1;
  if (f.prenom.trim()) n += 1;
  if (f.identifiant.trim()) n += 1;
  if (f.roleId) n += 1;
  if (f.salleCode) n += 1;
  if (f.statut) n += 1;
  return n;
}

export interface UtilisateurFiltrableAdmin {
  prenom: string;
  nom: string;
  identifiant: string;
  email: string | null;
  statut: string;
  role: { id: string; salle: { code: string } | null };
}

export function utilisateurCorrespondFiltresAdmin(
  u: UtilisateurFiltrableAdmin,
  filtres: FiltresUtilisateursAdmin,
  rechercheRapide = ""
): boolean {
  const q = rechercheRapide.trim().toLowerCase();
  if (q) {
    const haystack = `${u.prenom} ${u.nom} ${u.identifiant} ${u.email ?? ""}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  const nom = filtres.nom.trim().toLowerCase();
  if (nom && !u.nom.toLowerCase().includes(nom)) return false;

  const prenom = filtres.prenom.trim().toLowerCase();
  if (prenom && !u.prenom.toLowerCase().includes(prenom)) return false;

  const identifiant = filtres.identifiant.trim().toLowerCase();
  if (
    identifiant &&
    !u.identifiant.toLowerCase().includes(identifiant) &&
    !(u.email ?? "").toLowerCase().includes(identifiant)
  ) {
    return false;
  }

  if (filtres.roleId && u.role.id !== filtres.roleId) return false;
  if (filtres.salleCode && u.role.salle?.code !== filtres.salleCode) return false;
  if (filtres.statut && u.statut !== filtres.statut) return false;

  return true;
}

const CLASSE_CHAMP =
  "w-full rounded-lg border border-gris-bordure bg-white px-3 py-2.5 text-sm text-texte-principal placeholder:text-texte-secondaire/70 focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15";

const CLASSE_LABEL =
  "mb-1 block text-[10px] font-bold uppercase tracking-wider text-texte-secondaire";

interface Props {
  valeurs: FiltresUtilisateursAdmin;
  onChange: (valeurs: FiltresUtilisateursAdmin) => void;
  onRechercher: () => void;
  onReinitialiser: () => void;
  roles: RoleFiltreAdmin[];
  salles: SalleFiltreAdmin[];
  statuts: readonly string[];
  idPrefix?: string;
}

export function FormulaireFiltresUtilisateursAdmin({
  valeurs,
  onChange,
  onRechercher,
  onReinitialiser,
  roles,
  salles,
  statuts,
  idPrefix = "filtre-utilisateurs-admin",
}: Props) {
  const { t } = useTranslation();

  const maj = <K extends keyof FiltresUtilisateursAdmin>(
    cle: K,
    valeur: FiltresUtilisateursAdmin[K]
  ) => onChange({ ...valeurs, [cle]: valeur });

  const id = (suffixe: string) => `${idPrefix}-${suffixe}`;

  return (
    <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("nom")}>
            {t("admin.utilisateurs.champs.nom")}
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
          <label className={CLASSE_LABEL} htmlFor={id("prenom")}>
            {t("admin.utilisateurs.champs.prenom")}
          </label>
          <input
            id={id("prenom")}
            value={valeurs.prenom}
            onChange={(e) => maj("prenom", e.target.value)}
            className={CLASSE_CHAMP}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("identifiant")}>
            {t("admin.utilisateurs.champs.identifiant")}
          </label>
          <input
            id={id("identifiant")}
            value={valeurs.identifiant}
            onChange={(e) => maj("identifiant", e.target.value)}
            className={CLASSE_CHAMP}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("role")}>
            {t("admin.utilisateurs.champs.role")}
          </label>
          <select
            id={id("role")}
            value={valeurs.roleId}
            onChange={(e) => maj("roleId", e.target.value)}
            className={CLASSE_CHAMP}
          >
            <option value="">{t("admin.utilisateurs.tousRoles")}</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nom}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("salle")}>
            {t("admin.utilisateurs.colonnes.salle")}
          </label>
          <select
            id={id("salle")}
            value={valeurs.salleCode}
            onChange={(e) => maj("salleCode", e.target.value)}
            className={CLASSE_CHAMP}
          >
            <option value="">{t("admin.utilisateurs.toutesSalles")}</option>
            {salles.map((s) => (
              <option key={s.code} value={s.code}>
                {s.nom}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("statut")}>
            {t("admin.utilisateurs.champs.statut")}
          </label>
          <select
            id={id("statut")}
            value={valeurs.statut}
            onChange={(e) => maj("statut", e.target.value)}
            className={CLASSE_CHAMP}
          >
            <option value="">{t("admin.utilisateurs.tousStatuts")}</option>
            {statuts.map((s) => (
              <option key={s} value={s}>
                {t(`admin.utilisateurs.statuts.${s}`)}
              </option>
            ))}
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
