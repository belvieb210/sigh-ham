"use client";

import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";

export const TYPES_AUDIT = [
  "CONNEXION",
  "DECONNEXION",
  "CREATION",
  "MODIFICATION",
  "SUPPRESSION",
  "EXPORT",
  "CONSULTATION",
  "TRANSFERT",
] as const;

export interface FiltresAuditAdmin {
  acteur: string;
  type: string;
  entite: string;
}

export const FILTRES_AUDIT_ADMIN_VIDES: FiltresAuditAdmin = {
  acteur: "",
  type: "",
  entite: "",
};

export function compterFiltresAuditAdmin(f: FiltresAuditAdmin): number {
  let n = 0;
  if (f.acteur.trim()) n += 1;
  if (f.type) n += 1;
  if (f.entite.trim()) n += 1;
  return n;
}

export interface EntreeAuditFiltrable {
  type: string;
  entite: string;
  action: string;
  module: string | null;
  utilisateur: { prenom: string; nom: string; identifiant: string } | null;
}

export function auditCorrespondFiltresAdmin(
  e: EntreeAuditFiltrable,
  filtres: FiltresAuditAdmin,
  rechercheRapide = ""
): boolean {
  const q = rechercheRapide.trim().toLowerCase();
  if (q) {
    const acteur = e.utilisateur
      ? `${e.utilisateur.prenom} ${e.utilisateur.nom} ${e.utilisateur.identifiant}`
      : "";
    const haystack = `${e.action} ${e.entite} ${e.type} ${e.module ?? ""} ${acteur}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  if (filtres.type && e.type !== filtres.type) return false;
  const entite = filtres.entite.trim().toLowerCase();
  if (entite && !e.entite.toLowerCase().includes(entite)) return false;
  const acteurFiltre = filtres.acteur.trim().toLowerCase();
  if (acteurFiltre) {
    const acteur = e.utilisateur
      ? `${e.utilisateur.prenom} ${e.utilisateur.nom} ${e.utilisateur.identifiant}`.toLowerCase()
      : "";
    if (!acteur.includes(acteurFiltre)) return false;
  }
  return true;
}

const CLASSE_CHAMP =
  "w-full rounded-lg border border-gris-bordure bg-white px-3 py-2.5 text-sm text-texte-principal placeholder:text-texte-secondaire/70 focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15";
const CLASSE_LABEL =
  "mb-1 block text-[10px] font-bold uppercase tracking-wider text-texte-secondaire";

interface Props {
  valeurs: FiltresAuditAdmin;
  onChange: (valeurs: FiltresAuditAdmin) => void;
  onRechercher: () => void;
  onReinitialiser: () => void;
}

export function FormulaireFiltresAuditAdmin({
  valeurs,
  onChange,
  onRechercher,
  onReinitialiser,
}: Props) {
  const { t } = useTranslation();
  const maj = <K extends keyof FiltresAuditAdmin>(
    cle: K,
    valeur: FiltresAuditAdmin[K]
  ) => onChange({ ...valeurs, [cle]: valeur });

  return (
    <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-audit-acteur">
            {t("admin.audit.colonnes.acteur")}
          </label>
          <input
            id="filtre-audit-acteur"
            value={valeurs.acteur}
            onChange={(e) => maj("acteur", e.target.value)}
            className={CLASSE_CHAMP}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-audit-type">
            {t("admin.audit.colonnes.type")}
          </label>
          <select
            id="filtre-audit-type"
            value={valeurs.type}
            onChange={(e) => maj("type", e.target.value)}
            className={CLASSE_CHAMP}
          >
            <option value="">{t("admin.audit.tousTypes")}</option>
            {TYPES_AUDIT.map((ty) => (
              <option key={ty} value={ty}>
                {t(`admin.audit.types.${ty}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-audit-entite">
            {t("admin.audit.colonnes.entite")}
          </label>
          <input
            id="filtre-audit-entite"
            value={valeurs.entite}
            onChange={(e) => maj("entite", e.target.value)}
            className={CLASSE_CHAMP}
            autoComplete="off"
          />
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
