"use client";

import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import type { ModePaiement } from "@/generated/prisma/client";
import type { OptionCaissierRapport } from "@/lib/caisse/types";
import { cn } from "@/lib/utils";

export interface FiltresRapportMensuelUi {
  mois: string;
  mode: ModePaiement | "";
  caissierId: string;
  q: string;
}

export function filtresMensuelVides(mois = ""): FiltresRapportMensuelUi {
  return { mois, mode: "", caissierId: "", q: "" };
}

export function compterFiltresMensuel(f: FiltresRapportMensuelUi, moisDefaut: string): number {
  let n = 0;
  if (f.mois && f.mois !== moisDefaut) n += 1;
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
  valeurs: FiltresRapportMensuelUi;
  onChange: (v: FiltresRapportMensuelUi) => void;
  onRechercher: () => void;
  onReinitialiser: () => void;
  optionsCaissiers: OptionCaissierRapport[];
  className?: string;
}

export function FormulaireFiltresRapportMensuelCaisse({
  valeurs,
  onChange,
  onRechercher,
  onReinitialiser,
  optionsCaissiers,
  className,
}: Props) {
  const { t } = useTranslation();
  const maj = <K extends keyof FiltresRapportMensuelUi>(
    cle: K,
    valeur: FiltresRapportMensuelUi[K]
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
          <label className={CLASSE_LABEL} htmlFor="filtre-rapport-m-mois">
            {t("caisse.rapports.filtres.mois")}
          </label>
          <input
            id="filtre-rapport-m-mois"
            type="month"
            value={valeurs.mois}
            onChange={(e) => maj("mois", e.target.value)}
            className={CLASSE_CHAMP}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-rapport-m-mode">
            {t("caisse.rapports.filtres.mode")}
          </label>
          <select
            id="filtre-rapport-m-mode"
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
          <label className={CLASSE_LABEL} htmlFor="filtre-rapport-m-caissier">
            {t("caisse.rapports.filtres.caissier")}
          </label>
          <select
            id="filtre-rapport-m-caissier"
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
          <label className={CLASSE_LABEL} htmlFor="filtre-rapport-m-q">
            {t("caisse.rapports.filtres.recherche")}
          </label>
          <input
            id="filtre-rapport-m-q"
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
