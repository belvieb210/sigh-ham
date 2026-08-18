"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Save, X } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import {
  CATEGORIES_MEDICAMENT,
  FORMES_MEDICAMENT,
  VALEUR_AUTRES_PRECISER,
  VOIES_ADMINISTRATION_MEDICAMENT,
} from "@/constants/catalogue-medicaments";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import { cn } from "@/lib/utils";

export interface FormMedicamentAdmin {
  code: string;
  nom: string;
  categorieChoix: string;
  categorieAutre: string;
  formeChoix: string;
  formeAutre: string;
  dosage: string;
  voieAdministration: string;
  firme: string;
  telephoneFirme: string;
  classeMedicamenteuse: string;
  prixAchat: string;
  prixUnitaire: string;
  stockMinimum: string;
  stockMaximum: string;
  emplacement: string;
  expirationLe: string;
  recuPar: string;
  autresInformations: string;
  description: string;
  actif: boolean;
}

export const FORM_MEDICAMENT_ADMIN_VIDE: FormMedicamentAdmin = {
  code: "",
  nom: "",
  categorieChoix: "",
  categorieAutre: "",
  formeChoix: "",
  formeAutre: "",
  dosage: "",
  voieAdministration: "",
  firme: "",
  telephoneFirme: "",
  classeMedicamenteuse: "",
  prixAchat: "",
  prixUnitaire: "0",
  stockMinimum: "10",
  stockMaximum: "",
  emplacement: "",
  expirationLe: "",
  recuPar: "",
  autresInformations: "",
  description: "",
  actif: true,
};

type ModePanneau = "creation" | "consultation" | "edition";

function LabelChamp({
  htmlFor,
  requis,
  children,
}: {
  htmlFor?: string;
  requis?: boolean;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className={CLASSE_LABEL_RECEPTION}>
      {children}
      {requis ? <span className="ml-0.5 text-red-500">*</span> : null}
    </label>
  );
}

function TitreSection({ children }: { children: ReactNode }) {
  return (
    <h4 className="border-b border-gris-bordure pb-2 text-sm font-bold text-bleu-medical">
      {children}
    </h4>
  );
}

function SelectListeOuAutre({
  id,
  label,
  options,
  choix,
  autre,
  lectureSeule,
  classeChamp,
  placeholderAutre,
  labelChoisir,
  labelAutres,
  onChoix,
  onAutre,
}: {
  id: string;
  label: string;
  options: readonly string[];
  choix: string;
  autre: string;
  lectureSeule: boolean;
  classeChamp: string;
  placeholderAutre: string;
  labelChoisir: string;
  labelAutres: string;
  onChoix: (v: string) => void;
  onAutre: (v: string) => void;
}) {
  const estAutre = choix === VALEUR_AUTRES_PRECISER;
  return (
    <div>
      <LabelChamp htmlFor={id}>{label}</LabelChamp>
      <select
        id={id}
        className={classeChamp}
        value={choix}
        disabled={lectureSeule}
        onChange={(e) => onChoix(e.target.value)}
      >
        <option value="">{labelChoisir}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
        <option value={VALEUR_AUTRES_PRECISER}>{labelAutres}</option>
      </select>
      {estAutre ? (
        <input
          id={`${id}-autre`}
          className={cn(classeChamp, "mt-2")}
          value={autre}
          disabled={lectureSeule}
          placeholder={placeholderAutre}
          onChange={(e) => onAutre(e.target.value)}
        />
      ) : null}
    </div>
  );
}

interface Props {
  form: FormMedicamentAdmin;
  onChange: (form: FormMedicamentAdmin) => void;
  modePanneau: ModePanneau;
  lectureSeule: boolean;
  enCours: boolean;
  onSoumettre: () => void;
  onAnnuler: () => void;
}

export function FormulaireMedicamentAdmin({
  form,
  onChange,
  modePanneau,
  lectureSeule,
  enCours,
  onSoumettre,
  onAnnuler,
}: Props) {
  const { t } = useTranslation();
  const modeCreation = modePanneau === "creation";
  const classeChamp = cn(
    CLASSE_CHAMP_RECEPTION,
    lectureSeule && "cursor-not-allowed bg-slate-50"
  );

  const maj = <K extends keyof FormMedicamentAdmin>(
    cle: K,
    valeur: FormMedicamentAdmin[K]
  ) => onChange({ ...form, [cle]: valeur });

  const titre =
    modePanneau === "creation"
      ? t("admin.medicaments.formCreation")
      : modePanneau === "consultation"
        ? t("admin.medicaments.formConsultation")
        : t("admin.medicaments.formEdition");
  const sousTitre =
    modePanneau === "creation"
      ? t("admin.medicaments.formCreationAide")
      : modePanneau === "consultation"
        ? t("admin.medicaments.formConsultationAide")
        : t("admin.medicaments.formEditionAide");

  const labelChoisir = t("admin.medicaments.choisir");
  const labelAutres = t("admin.medicaments.autresPreciser");

  return (
    <div className="flex max-h-[calc(100vh-8rem)] flex-col rounded-xl border border-gris-bordure bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-gris-bordure px-4 py-3">
        <div>
          <h3 className="text-base font-bold text-bleu-medical">{titre}</h3>
          <p className="mt-0.5 text-xs text-texte-secondaire">{sousTitre}</p>
        </div>
        <button
          type="button"
          onClick={onAnnuler}
          aria-label={t("admin.medicaments.fermerFormulaire")}
          className="rounded-lg p-1 text-texte-secondaire hover:bg-gris-tres-clair hover:text-texte-principal"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <section className="space-y-3">
          <TitreSection>{t("admin.medicaments.sections.identite")}</TitreSection>
          <div>
            <LabelChamp htmlFor="admin-med-code" requis>
              {t("admin.medicaments.code")}
            </LabelChamp>
            <input
              id="admin-med-code"
              className={cn(classeChamp, "uppercase")}
              value={form.code}
              disabled={lectureSeule}
              placeholder={t("admin.medicaments.placeholders.code")}
              autoComplete="off"
              onChange={(e) => maj("code", e.target.value.toUpperCase())}
            />
            <p className="mt-1 text-[11px] text-texte-secondaire">
              {t("admin.medicaments.aideCode")}
            </p>
          </div>
          <div>
            <LabelChamp htmlFor="admin-med-nom" requis>
              {t("admin.medicaments.nom")}
            </LabelChamp>
            <input
              id="admin-med-nom"
              className={classeChamp}
              value={form.nom}
              disabled={lectureSeule}
              placeholder={t("admin.medicaments.placeholders.nom")}
              onChange={(e) => maj("nom", e.target.value)}
            />
          </div>
          <SelectListeOuAutre
            id="admin-med-categorie"
            label={t("admin.medicaments.categorie")}
            options={CATEGORIES_MEDICAMENT}
            choix={form.categorieChoix}
            autre={form.categorieAutre}
            lectureSeule={lectureSeule}
            classeChamp={classeChamp}
            placeholderAutre={t("admin.medicaments.placeholders.categorieAutre")}
            labelChoisir={labelChoisir}
            labelAutres={labelAutres}
            onChoix={(v) => maj("categorieChoix", v)}
            onAutre={(v) => maj("categorieAutre", v)}
          />
        </section>

        <section className="space-y-3">
          <TitreSection>{t("admin.medicaments.sections.firme")}</TitreSection>
          <div>
            <LabelChamp htmlFor="admin-med-firme">
              {t("admin.medicaments.firme")}
            </LabelChamp>
            <input
              id="admin-med-firme"
              className={classeChamp}
              value={form.firme}
              disabled={lectureSeule}
              placeholder={t("admin.medicaments.placeholders.firme")}
              onChange={(e) => maj("firme", e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <LabelChamp htmlFor="admin-med-tel-firme">
                {t("admin.medicaments.telephoneFirme")}
              </LabelChamp>
              <input
                id="admin-med-tel-firme"
                type="tel"
                className={classeChamp}
                value={form.telephoneFirme}
                disabled={lectureSeule}
                placeholder={t("admin.medicaments.placeholders.telephoneFirme")}
                onChange={(e) => maj("telephoneFirme", e.target.value)}
              />
            </div>
            <div>
              <LabelChamp htmlFor="admin-med-classe">
                {t("admin.medicaments.classeMedicamenteuse")}
              </LabelChamp>
              <input
                id="admin-med-classe"
                className={classeChamp}
                value={form.classeMedicamenteuse}
                disabled={lectureSeule}
                placeholder={t("admin.medicaments.placeholders.classeMedicamenteuse")}
                onChange={(e) => maj("classeMedicamenteuse", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <TitreSection>{t("admin.medicaments.sections.presentation")}</TitreSection>
          <SelectListeOuAutre
            id="admin-med-forme"
            label={t("admin.medicaments.forme")}
            options={FORMES_MEDICAMENT}
            choix={form.formeChoix}
            autre={form.formeAutre}
            lectureSeule={lectureSeule}
            classeChamp={classeChamp}
            placeholderAutre={t("admin.medicaments.placeholders.formeAutre")}
            labelChoisir={labelChoisir}
            labelAutres={labelAutres}
            onChoix={(v) => maj("formeChoix", v)}
            onAutre={(v) => maj("formeAutre", v)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <LabelChamp htmlFor="admin-med-dosage">
                {t("admin.medicaments.dosage")}
              </LabelChamp>
              <input
                id="admin-med-dosage"
                className={classeChamp}
                value={form.dosage}
                disabled={lectureSeule}
                placeholder={t("admin.medicaments.placeholders.dosage")}
                onChange={(e) => maj("dosage", e.target.value)}
              />
            </div>
            <div>
              <LabelChamp htmlFor="admin-med-voie">
                {t("admin.medicaments.voieAdministration")}
              </LabelChamp>
              <select
                id="admin-med-voie"
                className={classeChamp}
                value={form.voieAdministration}
                disabled={lectureSeule}
                onChange={(e) => maj("voieAdministration", e.target.value)}
              >
                <option value="">{labelChoisir}</option>
                {VOIES_ADMINISTRATION_MEDICAMENT.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
                {form.voieAdministration &&
                !(VOIES_ADMINISTRATION_MEDICAMENT as readonly string[]).includes(
                  form.voieAdministration
                ) ? (
                  <option value={form.voieAdministration}>
                    {form.voieAdministration}
                  </option>
                ) : null}
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <TitreSection>{t("admin.medicaments.sections.tarification")}</TitreSection>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <LabelChamp htmlFor="admin-med-prix-achat">
                {t("admin.medicaments.prixAchat")}
              </LabelChamp>
              <div className="relative">
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-texte-secondaire">
                  FC
                </span>
                <input
                  id="admin-med-prix-achat"
                  type="number"
                  min={0}
                  step="0.01"
                  className={cn(classeChamp, "pr-10")}
                  value={form.prixAchat}
                  disabled={lectureSeule}
                  placeholder="0"
                  onChange={(e) => maj("prixAchat", e.target.value)}
                />
              </div>
            </div>
            <div>
              <LabelChamp htmlFor="admin-med-prix-vente" requis>
                {t("admin.medicaments.prixUnitaire")}
              </LabelChamp>
              <div className="relative">
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-texte-secondaire">
                  FC
                </span>
                <input
                  id="admin-med-prix-vente"
                  type="number"
                  min={0}
                  step="0.01"
                  className={cn(classeChamp, "pr-10")}
                  value={form.prixUnitaire}
                  disabled={lectureSeule}
                  placeholder="0"
                  onChange={(e) => maj("prixUnitaire", e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <TitreSection>{t("admin.medicaments.sections.stock")}</TitreSection>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <LabelChamp htmlFor="admin-med-stock">
                {t("admin.medicaments.stockMinimum")}
              </LabelChamp>
              <input
                id="admin-med-stock"
                type="number"
                min={0}
                className={classeChamp}
                value={form.stockMinimum}
                disabled={lectureSeule}
                onChange={(e) => maj("stockMinimum", e.target.value)}
              />
            </div>
            <div>
              <LabelChamp htmlFor="admin-med-stock-max">
                {t("admin.medicaments.stockMaximum")}
              </LabelChamp>
              <input
                id="admin-med-stock-max"
                type="number"
                min={0}
                className={classeChamp}
                value={form.stockMaximum}
                disabled={lectureSeule}
                onChange={(e) => maj("stockMaximum", e.target.value)}
              />
            </div>
            <div>
              <LabelChamp htmlFor="admin-med-emp">
                {t("admin.medicaments.emplacement")}
              </LabelChamp>
              <input
                id="admin-med-emp"
                className={classeChamp}
                value={form.emplacement}
                disabled={lectureSeule}
                placeholder={t("admin.medicaments.placeholders.emplacement")}
                onChange={(e) => maj("emplacement", e.target.value)}
              />
            </div>
            <div>
              <LabelChamp htmlFor="admin-med-expiration">
                {t("admin.medicaments.expirationLe")}
              </LabelChamp>
              <input
                id="admin-med-expiration"
                type="date"
                className={classeChamp}
                value={form.expirationLe}
                disabled={lectureSeule}
                onChange={(e) => maj("expirationLe", e.target.value)}
              />
            </div>
          </div>
          <div>
            <LabelChamp htmlFor="admin-med-recu">
              {t("admin.medicaments.recuPar")}
            </LabelChamp>
            <input
              id="admin-med-recu"
              className={classeChamp}
              value={form.recuPar}
              disabled={lectureSeule}
              placeholder={t("admin.medicaments.placeholders.recuPar")}
              onChange={(e) => maj("recuPar", e.target.value)}
            />
          </div>
        </section>

        <section className="space-y-3">
          <TitreSection>{t("admin.medicaments.sections.informations")}</TitreSection>
          <div>
            <LabelChamp htmlFor="admin-med-description">
              {t("admin.medicaments.descriptionChamp")}
            </LabelChamp>
            <textarea
              id="admin-med-description"
              rows={3}
              className={cn(classeChamp, "resize-y")}
              value={form.description}
              disabled={lectureSeule}
              placeholder={t("admin.medicaments.placeholders.description")}
              onChange={(e) => maj("description", e.target.value)}
            />
          </div>
          <div>
            <LabelChamp htmlFor="admin-med-autres">
              {t("admin.medicaments.autresInformations")}
            </LabelChamp>
            <textarea
              id="admin-med-autres"
              rows={3}
              className={cn(classeChamp, "resize-y")}
              value={form.autresInformations}
              disabled={lectureSeule}
              placeholder={t("admin.medicaments.placeholders.autresInformations")}
              onChange={(e) => maj("autresInformations", e.target.value)}
            />
          </div>
        </section>

        <section className="space-y-3">
          <TitreSection>{t("admin.medicaments.sections.disponibilite")}</TitreSection>
          <div>
            <p className={CLASSE_LABEL_RECEPTION}>
              {t("admin.medicaments.colonnes.statut")}
              <span className="ml-0.5 text-red-500">*</span>
            </p>
            <p className="mb-2 text-[11px] text-texte-secondaire">
              {t("admin.medicaments.aideStatut")}
            </p>
            <div className="flex flex-wrap gap-4 pt-1">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="admin-med-statut"
                  checked={form.actif}
                  disabled={lectureSeule}
                  onChange={() => maj("actif", true)}
                  className="accent-bleu-medical"
                />
                {t("admin.medicaments.actif")}
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="admin-med-statut"
                  checked={!form.actif}
                  disabled={lectureSeule}
                  onChange={() => maj("actif", false)}
                  className="accent-bleu-medical"
                />
                {t("admin.medicaments.inactif")}
              </label>
            </div>
          </div>
        </section>
      </div>

      {!lectureSeule ? (
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gris-bordure px-4 py-3">
          <Bouton
            type="button"
            variante="contour"
            taille="moyen"
            onClick={onAnnuler}
            disabled={enCours}
          >
            {t("admin.medicaments.annuler")}
          </Bouton>
          <Bouton type="button" onClick={onSoumettre} disabled={enCours}>
            {enCours ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {modeCreation
              ? t("admin.medicaments.enregistrerMedicament")
              : t("admin.common.enregistrer")}
          </Bouton>
        </div>
      ) : null}
    </div>
  );
}
