"use client";

import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import type { PatientEnregistre } from "@/constants/reception";
import { FILTRES_ORIENTATION_PATIENT, FILTRES_STATUT_PATIENT } from "@/constants/reception";
import { useTraductionsReception } from "@/hooks/use-traductions-reception";
import { cn } from "@/lib/utils";

export interface FiltresRecentsReception {
  dateDu: string;
  dateAu: string;
  nom: string;
  prenom: string;
  telephone: string;
  numeroPatient: string;
  orientation: (typeof FILTRES_ORIENTATION_PATIENT)[number];
  statut: (typeof FILTRES_STATUT_PATIENT)[number];
}

export const FILTRES_RECENTS_VIDES: FiltresRecentsReception = {
  dateDu: "",
  dateAu: "",
  nom: "",
  prenom: "",
  telephone: "",
  numeroPatient: "",
  orientation: "Toutes",
  statut: "Tous",
};

/** Statuts pour la file « non confirmés » (sans « Transféré »). */
export const STATUTS_SANS_TRANSFERE = FILTRES_STATUT_PATIENT.filter((s) => s !== "Transféré");

export function compterFiltresRecents(
  filtres: FiltresRecentsReception,
  options?: { ignorerStatut?: boolean }
): number {
  let n = 0;
  if (filtres.dateDu) n += 1;
  if (filtres.dateAu) n += 1;
  if (filtres.nom.trim()) n += 1;
  if (filtres.prenom.trim()) n += 1;
  if (filtres.telephone.trim()) n += 1;
  if (filtres.numeroPatient.trim()) n += 1;
  if (filtres.orientation !== "Toutes") n += 1;
  if (!options?.ignorerStatut && filtres.statut !== "Tous") n += 1;
  return n;
}

function debutJourIso(dateIso: string): number {
  return new Date(`${dateIso}T00:00:00`).getTime();
}

function finJourIso(dateIso: string): number {
  return new Date(`${dateIso}T23:59:59.999`).getTime();
}

export function patientCorrespondFiltresListe(
  patient: PatientEnregistre,
  f: FiltresRecentsReception,
  options?: { ignorerStatut?: boolean }
): boolean {
  if (f.dateDu || f.dateAu) {
    const ts = patient.dateActivite
      ? new Date(patient.dateActivite).getTime()
      : Number.NaN;
    if (Number.isNaN(ts)) return false;
    if (f.dateDu && ts < debutJourIso(f.dateDu)) return false;
    if (f.dateAu && ts > finJourIso(f.dateAu)) return false;
  }

  const nomComplet = patient.nom.toLowerCase();
  const nom = f.nom.trim().toLowerCase();
  const prenom = f.prenom.trim().toLowerCase();
  if (nom && !nomComplet.includes(nom)) return false;
  if (prenom && !nomComplet.includes(prenom)) return false;

  if (f.telephone.trim()) {
    const tel = patient.telephone.replace(/\s+/g, "");
    if (!tel.includes(f.telephone.trim().replace(/\s+/g, ""))) return false;
  }

  if (f.numeroPatient.trim()) {
    if (!patient.id.toLowerCase().includes(f.numeroPatient.trim().toLowerCase())) {
      return false;
    }
  }

  if (f.orientation !== "Toutes" && patient.orientation !== f.orientation) {
    return false;
  }

  if (!options?.ignorerStatut && f.statut !== "Tous" && patient.statut !== f.statut) {
    return false;
  }

  return true;
}

const CLASSE_CHAMP =
  "w-full rounded-lg border border-gris-bordure bg-white px-3 py-2.5 text-sm text-texte-principal placeholder:text-texte-secondaire/70 focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15";

const CLASSE_LABEL =
  "mb-1 block text-[10px] font-bold uppercase tracking-wider text-texte-secondaire";

interface Props {
  valeurs: FiltresRecentsReception;
  onChange: (valeurs: FiltresRecentsReception) => void;
  onRechercher: () => void;
  onReinitialiser: () => void;
  className?: string;
  idPrefix?: string;
  /** Masque le filtre statut (ex. page transferts). */
  masquerStatut?: boolean;
  /** Liste des statuts proposés (défaut : tous). */
  statutsOptions?: readonly (typeof FILTRES_STATUT_PATIENT)[number][];
}

export function FormulaireFiltresRecentsReception({
  valeurs,
  onChange,
  onRechercher,
  onReinitialiser,
  className,
  idPrefix = "filtre-reception",
  masquerStatut = false,
  statutsOptions = FILTRES_STATUT_PATIENT,
}: Props) {
  const { t } = useTranslation();
  const { traduireStatut, traduireOrientation } = useTraductionsReception();

  const maj = <K extends keyof FiltresRecentsReception>(
    cle: K,
    valeur: FiltresRecentsReception[K]
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
            {t("reception.tableau.filtres.dateDu")}
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
            {t("reception.tableau.filtres.dateAu")}
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
          <label className={CLASSE_LABEL} htmlFor={id("nom")}>
            {t("reception.tableau.filtres.nom")}
          </label>
          <input
            id={id("nom")}
            type="text"
            value={valeurs.nom}
            onChange={(e) => maj("nom", e.target.value)}
            className={CLASSE_CHAMP}
            placeholder={t("reception.tableau.filtres.placeholderNom")}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("prenom")}>
            {t("reception.tableau.filtres.prenom")}
          </label>
          <input
            id={id("prenom")}
            type="text"
            value={valeurs.prenom}
            onChange={(e) => maj("prenom", e.target.value)}
            className={CLASSE_CHAMP}
            placeholder={t("reception.tableau.filtres.placeholderPrenom")}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("tel")}>
            {t("reception.tableau.filtres.telephone")}
          </label>
          <input
            id={id("tel")}
            type="tel"
            value={valeurs.telephone}
            onChange={(e) => maj("telephone", e.target.value)}
            className={CLASSE_CHAMP}
            placeholder={t("reception.tableau.filtres.placeholderTelephone")}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("id")}>
            {t("reception.tableau.filtres.numeroPatient")}
          </label>
          <input
            id={id("id")}
            type="text"
            value={valeurs.numeroPatient}
            onChange={(e) => maj("numeroPatient", e.target.value)}
            className={CLASSE_CHAMP}
            placeholder={t("reception.tableau.filtres.placeholderNumero")}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("orientation")}>
            {t("reception.liste.serviceDestination")}
          </label>
          <select
            id={id("orientation")}
            value={valeurs.orientation}
            onChange={(e) =>
              maj("orientation", e.target.value as FiltresRecentsReception["orientation"])
            }
            className={CLASSE_CHAMP}
          >
            {FILTRES_ORIENTATION_PATIENT.map((o) => (
              <option key={o} value={o}>
                {traduireOrientation(o)}
              </option>
            ))}
          </select>
        </div>
        {!masquerStatut && (
          <div>
            <label className={CLASSE_LABEL} htmlFor={id("statut")}>
              {t("reception.liste.statut")}
            </label>
            <select
              id={id("statut")}
              value={valeurs.statut}
              onChange={(e) =>
                maj("statut", e.target.value as FiltresRecentsReception["statut"])
              }
              className={CLASSE_CHAMP}
            >
              {statutsOptions.map((s) => (
                <option key={s} value={s}>
                  {traduireStatut(s)}
                </option>
              ))}
            </select>
          </div>
        )}
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
