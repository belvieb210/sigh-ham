"use client";

import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import type { PatientFileLaboratoire } from "@/lib/laboratoire/types";
import { cn } from "@/lib/utils";

export interface FiltresLaboratoireUi {
  dateDu: string;
  dateAu: string;
  nom: string;
  prenom: string;
  telephone: string;
  numeroDossier: string;
  service: string;
  examen: string;
}

export const FILTRES_LABORATOIRE_VIDES: FiltresLaboratoireUi = {
  dateDu: "",
  dateAu: "",
  nom: "",
  prenom: "",
  telephone: "",
  numeroDossier: "",
  service: "",
  examen: "",
};

export function compterFiltresLaboratoire(f: FiltresLaboratoireUi): number {
  let n = 0;
  if (f.dateDu) n += 1;
  if (f.dateAu) n += 1;
  if (f.nom.trim()) n += 1;
  if (f.prenom.trim()) n += 1;
  if (f.telephone.trim()) n += 1;
  if (f.numeroDossier.trim()) n += 1;
  if (f.service.trim()) n += 1;
  if (f.examen.trim()) n += 1;
  return n;
}

function debutJour(dateIso: string): number {
  return new Date(`${dateIso}T00:00:00`).getTime();
}

function finJour(dateIso: string): number {
  return new Date(`${dateIso}T23:59:59.999`).getTime();
}

export function patientCorrespondFiltresLabo(
  p: PatientFileLaboratoire,
  f: FiltresLaboratoireUi
): boolean {
  if (f.dateDu || f.dateAu) {
    const ts = new Date(p.arriveeLe).getTime();
    if (Number.isNaN(ts)) return false;
    if (f.dateDu && ts < debutJour(f.dateDu)) return false;
    if (f.dateAu && ts > finJour(f.dateAu)) return false;
  }

  const nom = f.nom.trim().toLowerCase();
  const prenom = f.prenom.trim().toLowerCase();
  if (nom && !p.nom.toLowerCase().includes(nom)) return false;
  if (prenom && !p.prenom.toLowerCase().includes(prenom)) return false;

  if (f.telephone.trim()) {
    const tel = (p.telephone ?? "").replace(/\s+/g, "");
    if (!tel.includes(f.telephone.trim().replace(/\s+/g, ""))) return false;
  }

  if (f.numeroDossier.trim()) {
    const q = f.numeroDossier.trim().toLowerCase();
    const blob = [
      p.numeroDossier,
      p.numeroEnregistrement,
      p.numeroPatient,
      p.numeroTransfert,
      p.numeroFacture ?? "",
    ]
      .join(" ")
      .toLowerCase();
    if (!blob.includes(q)) return false;
  }

  if (f.service.trim()) {
    if (
      !(p.provenance ?? "")
        .toLowerCase()
        .includes(f.service.trim().toLowerCase())
    ) {
      return false;
    }
  }

  if (f.examen.trim()) {
    const q = f.examen.trim().toLowerCase();
    const ok = p.examens.some((e) => e.libelle.toLowerCase().includes(q));
    if (!ok) return false;
  }

  return true;
}

const CLASSE_CHAMP =
  "w-full rounded-lg border border-gris-bordure bg-white px-3 py-2.5 text-sm text-texte-principal placeholder:text-texte-secondaire/70 focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15";

const CLASSE_LABEL =
  "mb-1 block text-[10px] font-bold uppercase tracking-wider text-texte-secondaire";

interface PropsFormulaireFiltresLaboratoire {
  valeurs: FiltresLaboratoireUi;
  onChange: (valeurs: FiltresLaboratoireUi) => void;
  onRechercher: () => void;
  onReinitialiser: () => void;
  className?: string;
  idPrefix?: string;
}

export function FormulaireFiltresLaboratoire({
  valeurs,
  onChange,
  onRechercher,
  onReinitialiser,
  className,
  idPrefix = "filtre-labo",
}: PropsFormulaireFiltresLaboratoire) {
  const { t } = useTranslation();

  const maj = <K extends keyof FiltresLaboratoireUi>(
    cle: K,
    valeur: FiltresLaboratoireUi[K]
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
            {t("laboratoire.filtres.dateDu")}
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
            {t("laboratoire.filtres.dateAu")}
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
            {t("laboratoire.filtres.nom")}
          </label>
          <input
            id={id("nom")}
            type="text"
            value={valeurs.nom}
            onChange={(e) => maj("nom", e.target.value)}
            placeholder={t("laboratoire.filtres.placeholderNom")}
            className={CLASSE_CHAMP}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("prenom")}>
            {t("laboratoire.filtres.prenom")}
          </label>
          <input
            id={id("prenom")}
            type="text"
            value={valeurs.prenom}
            onChange={(e) => maj("prenom", e.target.value)}
            placeholder={t("laboratoire.filtres.placeholderPrenom")}
            className={CLASSE_CHAMP}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("tel")}>
            {t("laboratoire.filtres.telephone")}
          </label>
          <input
            id={id("tel")}
            type="tel"
            value={valeurs.telephone}
            onChange={(e) => maj("telephone", e.target.value)}
            placeholder={t("laboratoire.filtres.placeholderTelephone")}
            className={CLASSE_CHAMP}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("dossier")}>
            {t("laboratoire.filtres.numeroDossier")}
          </label>
          <input
            id={id("dossier")}
            type="text"
            value={valeurs.numeroDossier}
            onChange={(e) => maj("numeroDossier", e.target.value)}
            placeholder={t("laboratoire.filtres.placeholderDossier")}
            className={CLASSE_CHAMP}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("service")}>
            {t("laboratoire.filtres.service")}
          </label>
          <input
            id={id("service")}
            type="text"
            value={valeurs.service}
            onChange={(e) => maj("service", e.target.value)}
            placeholder={t("laboratoire.filtres.placeholderService")}
            className={CLASSE_CHAMP}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor={id("examen")}>
            {t("laboratoire.filtres.examen")}
          </label>
          <input
            id={id("examen")}
            type="text"
            value={valeurs.examen}
            onChange={(e) => maj("examen", e.target.value)}
            placeholder={t("laboratoire.filtres.placeholderExamen")}
            className={CLASSE_CHAMP}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <Bouton
          type="button"
          variante="contour"
          taille="moyen"
          onClick={onReinitialiser}
        >
          {t("laboratoire.filtres.reinitialiser")}
        </Bouton>
        <Bouton
          type="button"
          variante="primaire"
          taille="moyen"
          onClick={onRechercher}
        >
          <Search className="h-4 w-4" />
          {t("laboratoire.filtres.rechercher")}
        </Bouton>
      </div>
    </section>
  );
}
