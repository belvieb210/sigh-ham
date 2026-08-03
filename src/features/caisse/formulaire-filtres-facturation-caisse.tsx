"use client";

import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { cn } from "@/lib/utils";

export interface FiltresFacturationCaisse {
  dateDu: string;
  dateAu: string;
  typeEntite: "TOUS" | "PATIENT";
  nom: string;
  prenom: string;
  numeroFacture: string;
  numeroEnreg: string;
  idEntite: string;
  telephone: string;
}

export const FILTRES_FACTURATION_VIDES: FiltresFacturationCaisse = {
  dateDu: "",
  dateAu: "",
  typeEntite: "TOUS",
  nom: "",
  prenom: "",
  numeroFacture: "",
  numeroEnreg: "",
  idEntite: "",
  telephone: "",
};

export function compterFiltresActifs(
  filtres: FiltresFacturationCaisse,
  options?: { ignorerNumeroFacture?: boolean }
): number {
  let n = 0;
  if (filtres.dateDu) n += 1;
  if (filtres.dateAu) n += 1;
  if (filtres.typeEntite !== "TOUS") n += 1;
  if (filtres.nom.trim()) n += 1;
  if (filtres.prenom.trim()) n += 1;
  if (!options?.ignorerNumeroFacture && filtres.numeroFacture.trim()) n += 1;
  if (filtres.numeroEnreg.trim()) n += 1;
  if (filtres.idEntite.trim()) n += 1;
  if (filtres.telephone.trim()) n += 1;
  return n;
}

const CLASSE_CHAMP =
  "w-full rounded-lg border border-gris-bordure bg-white px-3 py-2.5 text-sm text-texte-principal placeholder:text-texte-secondaire/70 focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15";

const CLASSE_LABEL =
  "mb-1 block text-[10px] font-bold uppercase tracking-wider text-texte-secondaire";

interface PropsFormulaireFiltresFacturationCaisse {
  valeurs: FiltresFacturationCaisse;
  onChange: (valeurs: FiltresFacturationCaisse) => void;
  onRechercher: () => void;
  onReinitialiser: () => void;
  className?: string;
  /** Préfixe pour les id HTML (évite les doublons si plusieurs formulaires). */
  idPrefix?: string;
  /** Masque le champ N° facture (ex. page transferts). */
  masquerNumeroFacture?: boolean;
}

export function FormulaireFiltresFacturationCaisse({
  valeurs,
  onChange,
  onRechercher,
  onReinitialiser,
  className,
  idPrefix = "filtre-caisse",
  masquerNumeroFacture = false,
}: PropsFormulaireFiltresFacturationCaisse) {
  const { t } = useTranslation();

  const maj = <K extends keyof FiltresFacturationCaisse>(
    cle: K,
    valeur: FiltresFacturationCaisse[K]
  ) => onChange({ ...valeurs, [cle]: valeur });

  const id = (suffixe: string) => `${idPrefix}-${suffixe}`;

  return (
    <section
      className={cn(
        "rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5",
        className
      )}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("du")}>
            {t("caisse.facturation.filtres.dateDu")}
          </label>
          <input
            id={id("du")}
            type="date"
            value={valeurs.dateDu}
            onChange={(e) => maj("dateDu", e.target.value)}
            className={CLASSE_CHAMP}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("au")}>
            {t("caisse.facturation.filtres.dateAu")}
          </label>
          <input
            id={id("au")}
            type="date"
            value={valeurs.dateAu}
            onChange={(e) => maj("dateAu", e.target.value)}
            className={CLASSE_CHAMP}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("type")}>
            {t("caisse.facturation.filtres.typeEntite")}
          </label>
          <select
            id={id("type")}
            value={valeurs.typeEntite}
            onChange={(e) =>
              maj("typeEntite", e.target.value as FiltresFacturationCaisse["typeEntite"])
            }
            className={CLASSE_CHAMP}
          >
            <option value="TOUS">{t("caisse.facturation.filtres.typeTous")}</option>
            <option value="PATIENT">{t("caisse.facturation.filtres.typePatient")}</option>
          </select>
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("nom")}>
            {t("caisse.facturation.filtres.nom")}
          </label>
          <input
            id={id("nom")}
            type="text"
            value={valeurs.nom}
            onChange={(e) => maj("nom", e.target.value)}
            placeholder={t("caisse.facturation.filtres.placeholderNom")}
            className={CLASSE_CHAMP}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("prenom")}>
            {t("caisse.facturation.filtres.prenom")}
          </label>
          <input
            id={id("prenom")}
            type="text"
            value={valeurs.prenom}
            onChange={(e) => maj("prenom", e.target.value)}
            placeholder={t("caisse.facturation.filtres.placeholderPrenom")}
            className={CLASSE_CHAMP}
            autoComplete="off"
          />
        </div>
        {!masquerNumeroFacture && (
          <div>
            <label className={CLASSE_LABEL} htmlFor={id("facture")}>
              {t("caisse.facturation.filtres.numeroFacture")}
            </label>
            <input
              id={id("facture")}
              type="text"
              value={valeurs.numeroFacture}
              onChange={(e) => maj("numeroFacture", e.target.value)}
              placeholder={t("caisse.facturation.filtres.placeholderFacture")}
              className={CLASSE_CHAMP}
              autoComplete="off"
            />
          </div>
        )}
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("enreg")}>
            {t("caisse.facturation.filtres.numeroEnreg")}
          </label>
          <input
            id={id("enreg")}
            type="text"
            value={valeurs.numeroEnreg}
            onChange={(e) => maj("numeroEnreg", e.target.value)}
            placeholder={t("caisse.facturation.filtres.placeholderEnreg")}
            className={CLASSE_CHAMP}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("id")}>
            {t("caisse.facturation.filtres.idEntite")}
          </label>
          <input
            id={id("id")}
            type="text"
            value={valeurs.idEntite}
            onChange={(e) => maj("idEntite", e.target.value)}
            placeholder={t("caisse.facturation.filtres.placeholderId")}
            className={CLASSE_CHAMP}
            autoComplete="off"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <label className={CLASSE_LABEL} htmlFor={id("tel")}>
            {t("caisse.facturation.filtres.telephone")}
          </label>
          <input
            id={id("tel")}
            type="tel"
            value={valeurs.telephone}
            onChange={(e) => maj("telephone", e.target.value)}
            placeholder={t("caisse.facturation.filtres.placeholderTel")}
            className={CLASSE_CHAMP}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <Bouton type="button" variante="contour" onClick={onReinitialiser}>
          {t("caisse.facturation.filtres.reinitialiser")}
        </Bouton>
        <Bouton type="button" onClick={onRechercher}>
          <Search className="h-4 w-4" />
          {t("caisse.facturation.filtres.rechercher")}
        </Bouton>
      </div>
    </section>
  );
}
