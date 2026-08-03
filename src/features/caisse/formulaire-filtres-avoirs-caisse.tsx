"use client";

import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import type { OptionCaissierRapport, TypeMouvementAvoir } from "@/lib/caisse/types";
import { cn } from "@/lib/utils";

export interface FiltresAvoirsCaisseUi {
  dateDu: string;
  dateAu: string;
  type: TypeMouvementAvoir | "";
  caissierId: string;
  q: string;
}

export function filtresAvoirsVides(dateDu = "", dateAu = ""): FiltresAvoirsCaisseUi {
  return { dateDu, dateAu, type: "", caissierId: "", q: "" };
}

export function compterFiltresAvoirs(
  f: FiltresAvoirsCaisseUi,
  defaut: { dateDu: string; dateAu: string }
): number {
  let n = 0;
  if (f.dateDu && f.dateDu !== defaut.dateDu) n += 1;
  if (f.dateAu && f.dateAu !== defaut.dateAu) n += 1;
  if (f.type) n += 1;
  if (f.caissierId) n += 1;
  if (f.q.trim()) n += 1;
  return n;
}

const CLASSE_CHAMP =
  "w-full rounded-lg border border-gris-bordure bg-white px-3 py-2.5 text-sm text-texte-principal placeholder:text-texte-secondaire/70 focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15";

const CLASSE_LABEL =
  "mb-1 block text-[10px] font-bold uppercase tracking-wider text-texte-secondaire";

interface Props {
  valeurs: FiltresAvoirsCaisseUi;
  onChange: (v: FiltresAvoirsCaisseUi) => void;
  onRechercher: () => void;
  onReinitialiser: () => void;
  optionsCaissiers: OptionCaissierRapport[];
  className?: string;
}

export function FormulaireFiltresAvoirsCaisse({
  valeurs,
  onChange,
  onRechercher,
  onReinitialiser,
  optionsCaissiers,
  className,
}: Props) {
  const { t } = useTranslation();
  const maj = <K extends keyof FiltresAvoirsCaisseUi>(
    cle: K,
    valeur: FiltresAvoirsCaisseUi[K]
  ) => onChange({ ...valeurs, [cle]: valeur });

  return (
    <section
      className={cn(
        "rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5 print:hidden",
        className
      )}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-avoir-du">
            {t("caisse.avoirs.filtres.dateDu")}
          </label>
          <input
            id="filtre-avoir-du"
            type="date"
            value={valeurs.dateDu}
            onChange={(e) => maj("dateDu", e.target.value)}
            className={CLASSE_CHAMP}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-avoir-au">
            {t("caisse.avoirs.filtres.dateAu")}
          </label>
          <input
            id="filtre-avoir-au"
            type="date"
            value={valeurs.dateAu}
            onChange={(e) => maj("dateAu", e.target.value)}
            className={CLASSE_CHAMP}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-avoir-type">
            {t("caisse.avoirs.filtres.type")}
          </label>
          <select
            id="filtre-avoir-type"
            value={valeurs.type}
            onChange={(e) => maj("type", e.target.value as TypeMouvementAvoir | "")}
            className={CLASSE_CHAMP}
          >
            <option value="">{t("caisse.avoirs.filtres.typeTous")}</option>
            <option value="AVANCE">{t("caisse.avoirs.types.AVANCE")}</option>
            <option value="SOLDE">{t("caisse.avoirs.types.SOLDE")}</option>
            <option value="OUVERT">{t("caisse.avoirs.types.OUVERT")}</option>
          </select>
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-avoir-caissier">
            {t("caisse.avoirs.filtres.caissier")}
          </label>
          <select
            id="filtre-avoir-caissier"
            value={valeurs.caissierId}
            onChange={(e) => maj("caissierId", e.target.value)}
            className={CLASSE_CHAMP}
          >
            <option value="">{t("caisse.avoirs.filtres.caissierTous")}</option>
            {optionsCaissiers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-avoir-q">
            {t("caisse.avoirs.filtres.recherche")}
          </label>
          <input
            id="filtre-avoir-q"
            type="search"
            value={valeurs.q}
            onChange={(e) => maj("q", e.target.value)}
            placeholder={t("caisse.avoirs.filtres.placeholderRecherche")}
            className={CLASSE_CHAMP}
            autoComplete="off"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <Bouton type="button" variante="contour" onClick={onReinitialiser}>
          {t("caisse.avoirs.filtres.reinitialiser")}
        </Bouton>
        <Bouton type="button" onClick={onRechercher}>
          <Search className="h-4 w-4" />
          {t("caisse.avoirs.filtres.rechercher")}
        </Bouton>
      </div>
    </section>
  );
}
