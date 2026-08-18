"use client";

import { useTranslation } from "react-i18next";
import { Bouton } from "@/components/ui/bouton";

export interface FiltresPatientsAdmin {
  nom: string;
  prenom: string;
  numero: string;
  telephone: string;
  statut: string;
  salle: string;
}

export const FILTRES_PATIENTS_ADMIN_VIDES: FiltresPatientsAdmin = {
  nom: "",
  prenom: "",
  numero: "",
  telephone: "",
  statut: "",
  salle: "",
};

export function compterFiltresPatientsAdmin(f: FiltresPatientsAdmin): number {
  return Object.values(f).filter((v) => v.trim()).length;
}

export function personneCorrespondFiltresAdmin(
  p: {
    prenom: string;
    nom: string;
    numeroPatient: string;
    telephone: string | null;
    dernierDossier: {
      numeroDossier: string;
      statut: string;
      salleEnregistrement: string;
    } | null;
  },
  filtres: FiltresPatientsAdmin,
  rechercheRapide = ""
): boolean {
  const q = rechercheRapide.trim().toLowerCase();
  if (q) {
    const hay = [
      p.prenom,
      p.nom,
      p.numeroPatient,
      p.telephone ?? "",
      p.dernierDossier?.numeroDossier ?? "",
    ]
      .join(" ")
      .toLowerCase();
    if (!hay.includes(q)) return false;
  }
  const nom = filtres.nom.trim().toLowerCase();
  if (nom && !p.nom.toLowerCase().includes(nom)) return false;
  const prenom = filtres.prenom.trim().toLowerCase();
  if (prenom && !p.prenom.toLowerCase().includes(prenom)) return false;
  const numero = filtres.numero.trim().toLowerCase();
  if (
    numero &&
    !p.numeroPatient.toLowerCase().includes(numero) &&
    !(p.dernierDossier?.numeroDossier ?? "").toLowerCase().includes(numero)
  ) {
    return false;
  }
  const tel = filtres.telephone.trim().toLowerCase();
  if (tel && !(p.telephone ?? "").toLowerCase().includes(tel)) return false;
  if (filtres.statut && p.dernierDossier?.statut !== filtres.statut) return false;
  if (filtres.salle && p.dernierDossier?.salleEnregistrement !== filtres.salle) {
    return false;
  }
  return true;
}

const CLASSE_CHAMP =
  "w-full rounded-lg border border-gris-bordure bg-white px-3 py-2.5 text-sm text-texte-principal placeholder:text-texte-secondaire/70 focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15";
const CLASSE_LABEL =
  "mb-1 block text-[10px] font-bold uppercase tracking-wider text-texte-secondaire";

const STATUTS = ["OUVERT", "EN_COURS", "CLOTURE", "ARCHIVE"] as const;

export function FormulaireFiltresPatientsAdmin({
  valeurs,
  onChange,
  onRechercher,
  onReinitialiser,
  salles,
}: {
  valeurs: FiltresPatientsAdmin;
  onChange: (valeurs: FiltresPatientsAdmin) => void;
  onRechercher: () => void;
  onReinitialiser: () => void;
  salles: { code: string; nom: string }[];
}) {
  const { t } = useTranslation();
  const maj = <K extends keyof FiltresPatientsAdmin>(
    cle: K,
    valeur: FiltresPatientsAdmin[K]
  ) => onChange({ ...valeurs, [cle]: valeur });

  return (
    <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-pat-nom">
            {t("admin.patients.champs.nom")}
          </label>
          <input
            id="filtre-pat-nom"
            className={CLASSE_CHAMP}
            value={valeurs.nom}
            autoComplete="off"
            onChange={(e) => maj("nom", e.target.value)}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-pat-prenom">
            {t("admin.patients.champs.prenom")}
          </label>
          <input
            id="filtre-pat-prenom"
            className={CLASSE_CHAMP}
            value={valeurs.prenom}
            autoComplete="off"
            onChange={(e) => maj("prenom", e.target.value)}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-pat-numero">
            {t("admin.patients.champs.numero")}
          </label>
          <input
            id="filtre-pat-numero"
            className={CLASSE_CHAMP}
            value={valeurs.numero}
            autoComplete="off"
            placeholder={t("admin.patients.filtres.placeholderNumero")}
            onChange={(e) => maj("numero", e.target.value)}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-pat-tel">
            {t("admin.patients.champs.telephone")}
          </label>
          <input
            id="filtre-pat-tel"
            className={CLASSE_CHAMP}
            value={valeurs.telephone}
            autoComplete="off"
            onChange={(e) => maj("telephone", e.target.value)}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-pat-statut">
            {t("admin.patients.colonnes.statut")}
          </label>
          <select
            id="filtre-pat-statut"
            className={CLASSE_CHAMP}
            value={valeurs.statut}
            onChange={(e) => maj("statut", e.target.value)}
          >
            <option value="">{t("admin.patients.filtres.tousStatuts")}</option>
            {STATUTS.map((s) => (
              <option key={s} value={s}>
                {t(`admin.patients.statutsDossier.${s}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-pat-salle">
            {t("admin.patients.filtres.salle")}
          </label>
          <select
            id="filtre-pat-salle"
            className={CLASSE_CHAMP}
            value={valeurs.salle}
            onChange={(e) => maj("salle", e.target.value)}
          >
            <option value="">{t("admin.patients.filtres.toutesSalles")}</option>
            {salles.map((s) => (
              <option key={s.code} value={s.code}>
                {s.nom}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Bouton type="button" variante="contour" taille="petit" onClick={onReinitialiser}>
          {t("admin.patients.filtres.reinitialiser")}
        </Bouton>
        <Bouton type="button" taille="petit" onClick={onRechercher}>
          {t("admin.patients.filtres.appliquer")}
        </Bouton>
      </div>
    </section>
  );
}

export interface FiltresVisitesAdmin {
  numero: string;
  statut: string;
  salle: string;
}

export const FILTRES_VISITES_ADMIN_VIDES: FiltresVisitesAdmin = {
  numero: "",
  statut: "",
  salle: "",
};

export function compterFiltresVisitesAdmin(f: FiltresVisitesAdmin): number {
  return Object.values(f).filter((v) => v.trim()).length;
}

export function visiteCorrespondFiltresAdmin(
  v: {
    numeroDossier: string;
    statut: string;
    salleEnregistrement?: string;
    salles?: string[];
    texte?: string;
  },
  filtres: FiltresVisitesAdmin,
  rechercheRapide = ""
): boolean {
  const q = rechercheRapide.trim().toLowerCase();
  if (q) {
    const hay = [v.numeroDossier, v.statut, v.texte ?? "", ...(v.salles ?? [])]
      .join(" ")
      .toLowerCase();
    if (!hay.includes(q)) return false;
  }
  const numero = filtres.numero.trim().toLowerCase();
  if (numero && !v.numeroDossier.toLowerCase().includes(numero)) return false;
  if (filtres.statut && v.statut !== filtres.statut) return false;
  if (filtres.salle) {
    const salles = [
      v.salleEnregistrement ?? "",
      ...(v.salles ?? []),
    ].map((s) => s.toLowerCase());
    if (!salles.includes(filtres.salle.toLowerCase())) return false;
  }
  return true;
}

export function FormulaireFiltresVisitesAdmin({
  valeurs,
  onChange,
  onRechercher,
  onReinitialiser,
  salles,
}: {
  valeurs: FiltresVisitesAdmin;
  onChange: (valeurs: FiltresVisitesAdmin) => void;
  onRechercher: () => void;
  onReinitialiser: () => void;
  salles: { code: string; nom: string }[];
}) {
  const { t } = useTranslation();
  const maj = <K extends keyof FiltresVisitesAdmin>(
    cle: K,
    valeur: FiltresVisitesAdmin[K]
  ) => onChange({ ...valeurs, [cle]: valeur });

  return (
    <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-vis-numero">
            {t("admin.patients.actions.visite")}
          </label>
          <input
            id="filtre-vis-numero"
            className={CLASSE_CHAMP}
            value={valeurs.numero}
            autoComplete="off"
            placeholder={t("admin.patients.filtres.placeholderDossier")}
            onChange={(e) => maj("numero", e.target.value)}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-vis-statut">
            {t("admin.patients.colonnes.statut")}
          </label>
          <select
            id="filtre-vis-statut"
            className={CLASSE_CHAMP}
            value={valeurs.statut}
            onChange={(e) => maj("statut", e.target.value)}
          >
            <option value="">{t("admin.patients.filtres.tousStatuts")}</option>
            {STATUTS.map((s) => (
              <option key={s} value={s}>
                {t(`admin.patients.statutsDossier.${s}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={CLASSE_LABEL} htmlFor="filtre-vis-salle">
            {t("admin.patients.filtres.salle")}
          </label>
          <select
            id="filtre-vis-salle"
            className={CLASSE_CHAMP}
            value={valeurs.salle}
            onChange={(e) => maj("salle", e.target.value)}
          >
            <option value="">{t("admin.patients.filtres.toutesSalles")}</option>
            {salles.map((s) => (
              <option key={s.code} value={s.code}>
                {s.nom}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Bouton type="button" variante="contour" taille="petit" onClick={onReinitialiser}>
          {t("admin.patients.filtres.reinitialiser")}
        </Bouton>
        <Bouton type="button" taille="petit" onClick={onRechercher}>
          {t("admin.patients.filtres.appliquer")}
        </Bouton>
      </div>
    </section>
  );
}
