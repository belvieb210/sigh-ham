"use client";

import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";

export interface FiltresPaquetsBilansAdmin {
  code: string;
  libelle: string;
  statut: "" | "actif" | "inactif";
}

export const FILTRES_PAQUETS_BILANS_ADMIN_VIDES: FiltresPaquetsBilansAdmin = {
  code: "",
  libelle: "",
  statut: "",
};

export function compterFiltresPaquetsBilansAdmin(
  f: FiltresPaquetsBilansAdmin
): number {
  let n = 0;
  if (f.code.trim()) n += 1;
  if (f.libelle.trim()) n += 1;
  if (f.statut) n += 1;
  return n;
}

export interface PaquetFiltrableAdmin {
  code: string;
  libelle: string;
  description: string | null;
  actif: boolean;
}

export function paquetCorrespondFiltresAdmin(
  p: PaquetFiltrableAdmin,
  filtres: FiltresPaquetsBilansAdmin,
  rechercheRapide = ""
): boolean {
  const q = rechercheRapide.trim().toLowerCase();
  if (q) {
    const haystack = `${p.code} ${p.libelle} ${p.description ?? ""}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  const code = filtres.code.trim().toLowerCase();
  if (code && !p.code.toLowerCase().includes(code)) return false;

  const libelle = filtres.libelle.trim().toLowerCase();
  if (libelle && !p.libelle.toLowerCase().includes(libelle)) return false;

  if (filtres.statut === "actif" && !p.actif) return false;
  if (filtres.statut === "inactif" && p.actif) return false;

  return true;
}

const CLASSE_CHAMP =
  "w-full rounded-lg border border-gris-bordure bg-white px-3 py-2.5 text-sm text-texte-principal placeholder:text-texte-secondaire/70 focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15";

const CLASSE_LABEL =
  "mb-1 block text-[10px] font-bold uppercase tracking-wider text-texte-secondaire";

interface Props {
  valeurs: FiltresPaquetsBilansAdmin;
  onChange: (valeurs: FiltresPaquetsBilansAdmin) => void;
  onRechercher: () => void;
  onReinitialiser: () => void;
  idPrefix?: string;
}

export function FormulaireFiltresPaquetsBilansAdmin({
  valeurs,
  onChange,
  onRechercher,
  onReinitialiser,
  idPrefix = "filtre-paquets-admin",
}: Props) {
  const { t } = useTranslation();

  const maj = <K extends keyof FiltresPaquetsBilansAdmin>(
    cle: K,
    valeur: FiltresPaquetsBilansAdmin[K]
  ) => onChange({ ...valeurs, [cle]: valeur });

  const id = (suffixe: string) => `${idPrefix}-${suffixe}`;

  return (
    <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("code")}>
            {t("admin.paquetsBilans.code")}
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
            {t("admin.paquetsBilans.libelle")}
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
          <label className={CLASSE_LABEL} htmlFor={id("statut")}>
            {t("admin.paquetsBilans.colStatut")}
          </label>
          <select
            id={id("statut")}
            value={valeurs.statut}
            onChange={(e) =>
              maj("statut", e.target.value as FiltresPaquetsBilansAdmin["statut"])
            }
            className={CLASSE_CHAMP}
          >
            <option value="">{t("admin.paquetsBilans.tousStatuts")}</option>
            <option value="actif">{t("admin.paquetsBilans.actifs")}</option>
            <option value="inactif">{t("admin.paquetsBilans.inactifs")}</option>
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
