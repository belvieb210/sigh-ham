"use client";

import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import type { ModePaiement } from "@/generated/prisma/client";
import type { OptionCaissierRapport } from "@/lib/caisse/types";
import { cn } from "@/lib/utils";

export interface FiltresHistoriqueCaisseUi {
  dateDu: string;
  dateAu: string;
  mode: ModePaiement | "";
  caissierId: string;
  q: string;
}

export function filtresHistoriqueVides(dateDu = "", dateAu = ""): FiltresHistoriqueCaisseUi {
  return { dateDu, dateAu, mode: "", caissierId: "", q: "" };
}

export function compterFiltresHistorique(
  f: FiltresHistoriqueCaisseUi,
  defaut: { dateDu: string; dateAu: string }
): number {
  let n = 0;
  if (f.dateDu && f.dateDu !== defaut.dateDu) n += 1;
  if (f.dateAu && f.dateAu !== defaut.dateAu) n += 1;
  if (f.mode) n += 1;
  if (f.caissierId) n += 1;
  if (f.q.trim()) n += 1;
  return n;
}

const CLASSE_CHAMP =
  "w-full rounded-lg border border-gris-bordure bg-white px-3 py-2.5 text-sm text-texte-principal placeholder:text-texte-secondaire/70 focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15";

const CLASSE_LABEL =
  "mb-1 block text-[10px] font-bold uppercase tracking-wider text-texte-secondaire";

const MODES: ModePaiement[] = ["ESPECES", "MOBILE_MONEY", "CARTE", "VIREMENT", "CHEQUE"];

interface Props {
  valeurs: FiltresHistoriqueCaisseUi;
  onChange: (v: FiltresHistoriqueCaisseUi) => void;
  onRechercher: () => void;
  onReinitialiser: () => void;
  optionsCaissiers: OptionCaissierRapport[];
  className?: string;
}

export function FormulaireFiltresHistoriqueCaisse({
  valeurs,
  onChange,
  onRechercher,
  onReinitialiser,
  optionsCaissiers,
  className,
}: Props) {
  const { t } = useTranslation();
  const maj = <K extends keyof FiltresHistoriqueCaisseUi>(
    cle: K,
    valeur: FiltresHistoriqueCaisseUi[K]
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
          <label className={CLASSE_LABEL} htmlFor="filtre-hist-du">
            {t("caisse.historique.filtres.dateDu")}
          </label>
          <input
            id="filtre-hist-du"
            type="date"
            value={valeurs.dateDu}
            onChange={(e) => maj("dateDu", e.target.value)}
            className={CLASSE_CHAMP}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-hist-au">
            {t("caisse.historique.filtres.dateAu")}
          </label>
          <input
            id="filtre-hist-au"
            type="date"
            value={valeurs.dateAu}
            onChange={(e) => maj("dateAu", e.target.value)}
            className={CLASSE_CHAMP}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-hist-mode">
            {t("caisse.historique.filtres.mode")}
          </label>
          <select
            id="filtre-hist-mode"
            value={valeurs.mode}
            onChange={(e) => maj("mode", e.target.value as ModePaiement | "")}
            className={CLASSE_CHAMP}
          >
            <option value="">{t("caisse.historique.filtres.modeTous")}</option>
            {MODES.map((m) => (
              <option key={m} value={m}>
                {t(`caisse.modesPaiement.${m}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-hist-caissier">
            {t("caisse.historique.filtres.caissier")}
          </label>
          <select
            id="filtre-hist-caissier"
            value={valeurs.caissierId}
            onChange={(e) => maj("caissierId", e.target.value)}
            className={CLASSE_CHAMP}
          >
            <option value="">{t("caisse.historique.filtres.caissierTous")}</option>
            {optionsCaissiers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-hist-q">
            {t("caisse.historique.filtres.recherche")}
          </label>
          <input
            id="filtre-hist-q"
            type="search"
            value={valeurs.q}
            onChange={(e) => maj("q", e.target.value)}
            placeholder={t("caisse.historique.filtres.placeholderRecherche")}
            className={CLASSE_CHAMP}
            autoComplete="off"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <Bouton type="button" variante="contour" onClick={onReinitialiser}>
          {t("caisse.historique.filtres.reinitialiser")}
        </Bouton>
        <Bouton type="button" onClick={onRechercher}>
          <Search className="h-4 w-4" />
          {t("caisse.historique.filtres.rechercher")}
        </Bouton>
      </div>
    </section>
  );
}
