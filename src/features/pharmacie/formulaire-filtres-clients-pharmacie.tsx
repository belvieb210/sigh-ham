"use client";

import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";

export interface FiltresClientsPharmacie {
  dateDu: string;
  dateAu: string;
  nom: string;
  prenom: string;
  numeroEnreg: string;
  idEntite: string;
  telephone: string;
  sexe: "" | "MASCULIN" | "FEMININ";
}

export const FILTRES_CLIENTS_PHARMACIE_VIDES: FiltresClientsPharmacie = {
  dateDu: "",
  dateAu: "",
  nom: "",
  prenom: "",
  numeroEnreg: "",
  idEntite: "",
  telephone: "",
  sexe: "",
};

export function compterFiltresClientsPharmacie(filtres: FiltresClientsPharmacie): number {
  let n = 0;
  if (filtres.dateDu) n += 1;
  if (filtres.dateAu) n += 1;
  if (filtres.nom.trim()) n += 1;
  if (filtres.prenom.trim()) n += 1;
  if (filtres.numeroEnreg.trim()) n += 1;
  if (filtres.idEntite.trim()) n += 1;
  if (filtres.telephone.trim()) n += 1;
  if (filtres.sexe) n += 1;
  return n;
}

const CLASSE_CHAMP =
  "w-full rounded-lg border border-gris-bordure bg-white px-3 py-2.5 text-sm text-texte-principal placeholder:text-texte-secondaire/70 focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15";

const CLASSE_LABEL =
  "mb-1 block text-[10px] font-bold uppercase tracking-wider text-texte-secondaire";

interface Props {
  valeurs: FiltresClientsPharmacie;
  onChange: (valeurs: FiltresClientsPharmacie) => void;
  onRechercher: () => void;
  onReinitialiser: () => void;
  idPrefix?: string;
}

export function FormulaireFiltresClientsPharmacie({
  valeurs,
  onChange,
  onRechercher,
  onReinitialiser,
  idPrefix = "filtre-clients-pharmacie",
}: Props) {
  const { t } = useTranslation();

  const maj = <K extends keyof FiltresClientsPharmacie>(
    cle: K,
    valeur: FiltresClientsPharmacie[K]
  ) => onChange({ ...valeurs, [cle]: valeur });

  const id = (suffixe: string) => `${idPrefix}-${suffixe}`;

  return (
    <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
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
          <label className={CLASSE_LABEL} htmlFor={id("sexe")}>
            {t("pharmacie.nouveauClient.sexe")}
          </label>
          <select
            id={id("sexe")}
            value={valeurs.sexe}
            onChange={(e) =>
              maj("sexe", e.target.value as FiltresClientsPharmacie["sexe"])
            }
            className={CLASSE_CHAMP}
          >
            <option value="">{t("caisse.facturation.filtres.typeTous")}</option>
            <option value="MASCULIN">{t("pharmacie.nouveauClient.sexeM")}</option>
            <option value="FEMININ">{t("pharmacie.nouveauClient.sexeF")}</option>
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
            className={CLASSE_CHAMP}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("tel")}>
            {t("caisse.facturation.filtres.telephone")}
          </label>
          <input
            id={id("tel")}
            type="tel"
            value={valeurs.telephone}
            onChange={(e) => maj("telephone", e.target.value)}
            className={CLASSE_CHAMP}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("enreg")}>
            {t("caisse.facturation.filtres.numeroEnreg")}
          </label>
          <input
            id={id("enreg")}
            type="text"
            value={valeurs.numeroEnreg}
            onChange={(e) => maj("numeroEnreg", e.target.value)}
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
            className={CLASSE_CHAMP}
            autoComplete="off"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Bouton type="button" onClick={onRechercher} className="gap-2">
          <Search className="h-4 w-4" />
          {t("caisse.facturation.filtres.rechercher")}
        </Bouton>
        <Bouton type="button" variante="secondaire" onClick={onReinitialiser}>
          {t("caisse.facturation.filtres.reinitialiser")}
        </Bouton>
      </div>
    </section>
  );
}

export function clientEnregistreCorrespondFiltres(
  c: {
    nom: string;
    prenom: string;
    nomComplet: string;
    telephone: string;
    numeroDossier: string;
    numeroPatient: string;
    dossierId: string;
    sexe: string | null;
    enregistreLe: string;
  },
  f: FiltresClientsPharmacie
): boolean {
  const nom = f.nom.trim().toLowerCase();
  const prenom = f.prenom.trim().toLowerCase();
  const tel = f.telephone.trim().replace(/\s+/g, "");
  const enreg = f.numeroEnreg.trim().toLowerCase();
  const idEntite = f.idEntite.trim().toLowerCase();

  if (nom && !`${c.nom} ${c.nomComplet}`.toLowerCase().includes(nom)) return false;
  if (prenom && !`${c.prenom} ${c.nomComplet}`.toLowerCase().includes(prenom))
    return false;
  if (tel && !(c.telephone || "").replace(/\s+/g, "").includes(tel)) return false;
  if (
    enreg &&
    !(c.numeroDossier || "").toLowerCase().includes(enreg) &&
    !(c.numeroPatient || "").toLowerCase().includes(enreg)
  ) {
    return false;
  }
  if (
    idEntite &&
    !(c.numeroPatient || "").toLowerCase().includes(idEntite) &&
    !(c.dossierId || "").toLowerCase().includes(idEntite)
  ) {
    return false;
  }
  if (f.sexe && c.sexe !== f.sexe) return false;
  if (f.dateDu || f.dateAu) {
    const jour = c.enregistreLe.slice(0, 10);
    if (f.dateDu && jour < f.dateDu) return false;
    if (f.dateAu && jour > f.dateAu) return false;
  }
  return true;
}
