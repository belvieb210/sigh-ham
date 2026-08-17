"use client";

import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";

export interface FiltresServicesAdmin {
  nom: string;
  code: string;
  statut: "" | "actif" | "inactif";
}

export const FILTRES_SERVICES_ADMIN_VIDES: FiltresServicesAdmin = {
  nom: "",
  code: "",
  statut: "",
};

export function compterFiltresServicesAdmin(f: FiltresServicesAdmin): number {
  let n = 0;
  if (f.nom.trim()) n += 1;
  if (f.code.trim()) n += 1;
  if (f.statut) n += 1;
  return n;
}

export interface ServiceFiltrableAdmin {
  nom: string;
  code: string;
  description: string | null;
  actif: boolean;
}

export function serviceCorrespondFiltresAdmin(
  s: ServiceFiltrableAdmin,
  filtres: FiltresServicesAdmin,
  rechercheRapide = ""
): boolean {
  const q = rechercheRapide.trim().toLowerCase();
  if (q) {
    const haystack = `${s.nom} ${s.code} ${s.description ?? ""}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  const nom = filtres.nom.trim().toLowerCase();
  if (nom && !s.nom.toLowerCase().includes(nom)) return false;
  const code = filtres.code.trim().toLowerCase();
  if (code && !s.code.toLowerCase().includes(code)) return false;
  if (filtres.statut === "actif" && !s.actif) return false;
  if (filtres.statut === "inactif" && s.actif) return false;
  return true;
}

const CLASSE_CHAMP =
  "w-full rounded-lg border border-gris-bordure bg-white px-3 py-2.5 text-sm text-texte-principal placeholder:text-texte-secondaire/70 focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15";
const CLASSE_LABEL =
  "mb-1 block text-[10px] font-bold uppercase tracking-wider text-texte-secondaire";

interface Props {
  valeurs: FiltresServicesAdmin;
  onChange: (valeurs: FiltresServicesAdmin) => void;
  onRechercher: () => void;
  onReinitialiser: () => void;
}

export function FormulaireFiltresServicesAdmin({
  valeurs,
  onChange,
  onRechercher,
  onReinitialiser,
}: Props) {
  const { t } = useTranslation();
  const maj = <K extends keyof FiltresServicesAdmin>(
    cle: K,
    valeur: FiltresServicesAdmin[K]
  ) => onChange({ ...valeurs, [cle]: valeur });

  return (
    <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-svc-nom">
            {t("admin.services.colonnes.service")}
          </label>
          <input
            id="filtre-svc-nom"
            value={valeurs.nom}
            onChange={(e) => maj("nom", e.target.value)}
            className={CLASSE_CHAMP}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-svc-code">
            {t("admin.services.champs.code")}
          </label>
          <input
            id="filtre-svc-code"
            value={valeurs.code}
            onChange={(e) => maj("code", e.target.value)}
            className={CLASSE_CHAMP}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-svc-statut">
            {t("admin.services.colonnes.statut")}
          </label>
          <select
            id="filtre-svc-statut"
            value={valeurs.statut}
            onChange={(e) =>
              maj("statut", e.target.value as FiltresServicesAdmin["statut"])
            }
            className={CLASSE_CHAMP}
          >
            <option value="">{t("admin.services.tousStatuts")}</option>
            <option value="actif">{t("admin.services.actifs")}</option>
            <option value="inactif">{t("admin.services.inactifs")}</option>
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
