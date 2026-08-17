"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Save, X } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import { cn } from "@/lib/utils";

export interface FormMedicamentAdmin {
  code: string;
  nom: string;
  categorie: string;
  forme: string;
  dosage: string;
  prixAchat: string;
  prixUnitaire: string;
  stockMinimum: string;
  emplacement: string;
  actif: boolean;
}

export const FORM_MEDICAMENT_ADMIN_VIDE: FormMedicamentAdmin = {
  code: "",
  nom: "",
  categorie: "",
  forme: "",
  dosage: "",
  prixAchat: "",
  prixUnitaire: "0",
  stockMinimum: "10",
  emplacement: "",
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

interface Props {
  form: FormMedicamentAdmin;
  onChange: (form: FormMedicamentAdmin) => void;
  categories: string[];
  modePanneau: ModePanneau;
  lectureSeule: boolean;
  enCours: boolean;
  onSoumettre: () => void;
  onAnnuler: () => void;
}

export function FormulaireMedicamentAdmin({
  form,
  onChange,
  categories,
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
          <div>
            <LabelChamp htmlFor="admin-med-categorie">
              {t("admin.medicaments.categorie")}
            </LabelChamp>
            <input
              id="admin-med-categorie"
              className={classeChamp}
              list="admin-med-categories"
              value={form.categorie}
              disabled={lectureSeule}
              placeholder={t("admin.medicaments.placeholders.categorie")}
              onChange={(e) => maj("categorie", e.target.value)}
            />
            <datalist id="admin-med-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        </section>

        <section className="space-y-3">
          <TitreSection>{t("admin.medicaments.sections.presentation")}</TitreSection>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <LabelChamp htmlFor="admin-med-forme">
                {t("admin.medicaments.forme")}
              </LabelChamp>
              <input
                id="admin-med-forme"
                className={classeChamp}
                value={form.forme}
                disabled={lectureSeule}
                placeholder={t("admin.medicaments.placeholders.forme")}
                onChange={(e) => maj("forme", e.target.value)}
              />
            </div>
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
          </div>
        </section>

        <section className="space-y-3">
          <TitreSection>{t("admin.medicaments.sections.tarification")}</TitreSection>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <LabelChamp htmlFor="admin-med-prix-achat">
                {t("admin.medicaments.prixAchat")}
              </LabelChamp>
              <input
                id="admin-med-prix-achat"
                type="number"
                min={0}
                step="0.01"
                className={classeChamp}
                value={form.prixAchat}
                disabled={lectureSeule}
                placeholder="0"
                onChange={(e) => maj("prixAchat", e.target.value)}
              />
            </div>
            <div>
              <LabelChamp htmlFor="admin-med-prix-vente" requis>
                {t("admin.medicaments.prixUnitaire")}
              </LabelChamp>
              <input
                id="admin-med-prix-vente"
                type="number"
                min={0}
                step="0.01"
                className={classeChamp}
                value={form.prixUnitaire}
                disabled={lectureSeule}
                placeholder="0"
                onChange={(e) => maj("prixUnitaire", e.target.value)}
              />
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
