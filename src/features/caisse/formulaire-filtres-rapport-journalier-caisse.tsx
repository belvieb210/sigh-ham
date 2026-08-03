"use client";

import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import type { ModePaiement } from "@/generated/prisma/client";
import type { OptionCaissierRapport } from "@/lib/caisse/types";
import { cn } from "@/lib/utils";

export interface FiltresRapportJournalierUi {
  date: string;
  mode: ModePaiement | "";
  caissierId: string;
  q: string;
}

export function filtresJournalierVides(date = ""): FiltresRapportJournalierUi {
  return { date, mode: "", caissierId: "", q: "" };
}

export function compterFiltresJournalier(f: FiltresRapportJournalierUi, dateDefaut: string): number {
  let n = 0;
  if (f.date && f.date !== dateDefaut) n += 1;
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
  valeurs: FiltresRapportJournalierUi;
  onChange: (v: FiltresRapportJournalierUi) => void;
  onRechercher: () => void;
  onReinitialiser: () => void;
  optionsCaissiers: OptionCaissierRapport[];
  className?: string;
}

export function FormulaireFiltresRapportJournalierCaisse({
  valeurs,
  onChange,
  onRechercher,
  onReinitialiser,
  optionsCaissiers,
  className,
}: Props) {
  const { t } = useTranslation();
  const maj = <K extends keyof FiltresRapportJournalierUi>(
    cle: K,
    valeur: FiltresRapportJournalierUi[K]
  ) => onChange({ ...valeurs, [cle]: valeur });

  return (
    <section
      className={cn(
        "rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5 print:hidden",
        className
      )}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-rapport-j-date">
            {t("caisse.rapports.filtres.date")}
          </label>
          <input
            id="filtre-rapport-j-date"
            type="date"
            value={valeurs.date}
            onChange={(e) => maj("date", e.target.value)}
            className={CLASSE_CHAMP}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-rapport-j-mode">
            {t("caisse.rapports.filtres.mode")}
          </label>
          <select
            id="filtre-rapport-j-mode"
            value={valeurs.mode}
            onChange={(e) => maj("mode", e.target.value as ModePaiement | "")}
            className={CLASSE_CHAMP}
          >
            <option value="">{t("caisse.rapports.filtres.modeTous")}</option>
            {MODES.map((m) => (
              <option key={m} value={m}>
                {t(`caisse.modesPaiement.${m}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-rapport-j-caissier">
            {t("caisse.rapports.filtres.caissier")}
          </label>
          <select
            id="filtre-rapport-j-caissier"
            value={valeurs.caissierId}
            onChange={(e) => maj("caissierId", e.target.value)}
            className={CLASSE_CHAMP}
          >
            <option value="">{t("caisse.rapports.filtres.caissierTous")}</option>
            {optionsCaissiers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-rapport-j-q">
            {t("caisse.rapports.filtres.recherche")}
          </label>
          <input
            id="filtre-rapport-j-q"
            type="search"
            value={valeurs.q}
            onChange={(e) => maj("q", e.target.value)}
            placeholder={t("caisse.rapports.filtres.placeholderRecherche")}
            className={CLASSE_CHAMP}
            autoComplete="off"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <Bouton type="button" variante="contour" onClick={onReinitialiser}>
          {t("caisse.rapports.filtres.reinitialiser")}
        </Bouton>
        <Bouton type="button" onClick={onRechercher}>
          <Search className="h-4 w-4" />
          {t("caisse.rapports.filtres.rechercher")}
        </Bouton>
      </div>
    </section>
  );
}
