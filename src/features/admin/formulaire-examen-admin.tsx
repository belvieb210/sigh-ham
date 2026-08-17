"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Save, X } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import { cn } from "@/lib/utils";

export interface FormExamenAdmin {
  code: string;
  libelle: string;
  categorie: string;
  prix: string;
  delaiHeures: string;
  actif: boolean;
  packPrenuptial: boolean;
}

export const FORM_EXAMEN_ADMIN_VIDE: FormExamenAdmin = {
  code: "",
  libelle: "",
  categorie: "",
  prix: "0",
  delaiHeures: "24",
  actif: true,
  packPrenuptial: false,
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
  form: FormExamenAdmin;
  onChange: (form: FormExamenAdmin) => void;
  categories: string[];
  modePanneau: ModePanneau;
  lectureSeule: boolean;
  enCours: boolean;
  onSoumettre: () => void;
  onAnnuler: () => void;
}

export function FormulaireExamenAdmin({
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

  const maj = <K extends keyof FormExamenAdmin>(
    cle: K,
    valeur: FormExamenAdmin[K]
  ) => onChange({ ...form, [cle]: valeur });

  const titre =
    modePanneau === "creation"
      ? t("admin.examens.formCreation")
      : modePanneau === "consultation"
        ? t("admin.examens.formConsultation")
        : t("admin.examens.formEdition");
  const sousTitre =
    modePanneau === "creation"
      ? t("admin.examens.formCreationAide")
      : modePanneau === "consultation"
        ? t("admin.examens.formConsultationAide")
        : t("admin.examens.formEditionAide");

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
          aria-label={t("admin.examens.fermerFormulaire")}
          className="rounded-lg p-1 text-texte-secondaire hover:bg-gris-tres-clair hover:text-texte-principal"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <section className="space-y-3">
          <TitreSection>{t("admin.examens.sections.identite")}</TitreSection>
          <div>
            <LabelChamp htmlFor="admin-examen-code" requis>
              {t("admin.examens.code")}
            </LabelChamp>
            <input
              id="admin-examen-code"
              className={cn(classeChamp, "uppercase")}
              value={form.code}
              disabled={lectureSeule}
              placeholder={t("admin.examens.placeholders.code")}
              autoComplete="off"
              onChange={(e) => maj("code", e.target.value.toUpperCase())}
            />
            <p className="mt-1 text-[11px] text-texte-secondaire">
              {t("admin.examens.aideCode")}
            </p>
          </div>
          <div>
            <LabelChamp htmlFor="admin-examen-libelle" requis>
              {t("admin.examens.libelle")}
            </LabelChamp>
            <input
              id="admin-examen-libelle"
              className={classeChamp}
              value={form.libelle}
              disabled={lectureSeule}
              placeholder={t("admin.examens.placeholders.libelle")}
              onChange={(e) => maj("libelle", e.target.value)}
            />
          </div>
          <div>
            <LabelChamp htmlFor="admin-examen-categorie" requis>
              {t("admin.examens.categorie")}
            </LabelChamp>
            <input
              id="admin-examen-categorie"
              className={classeChamp}
              list="admin-examen-categories"
              value={form.categorie}
              disabled={lectureSeule}
              placeholder={t("admin.examens.placeholders.categorie")}
              onChange={(e) => maj("categorie", e.target.value)}
            />
            <datalist id="admin-examen-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        </section>

        <section className="space-y-3">
          <TitreSection>{t("admin.examens.sections.tarification")}</TitreSection>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <LabelChamp htmlFor="admin-examen-prix" requis>
                {t("admin.examens.prix")}
              </LabelChamp>
              <input
                id="admin-examen-prix"
                type="number"
                min={0}
                step="0.01"
                className={classeChamp}
                value={form.prix}
                disabled={lectureSeule}
                placeholder={t("admin.examens.placeholders.prix")}
                onChange={(e) => maj("prix", e.target.value)}
              />
            </div>
            <div>
              <LabelChamp htmlFor="admin-examen-delai" requis>
                {t("admin.examens.delai")}
              </LabelChamp>
              <input
                id="admin-examen-delai"
                type="number"
                min={1}
                className={classeChamp}
                value={form.delaiHeures}
                disabled={lectureSeule}
                placeholder={t("admin.examens.placeholders.delai")}
                onChange={(e) => maj("delaiHeures", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <TitreSection>{t("admin.examens.sections.disponibilite")}</TitreSection>
          <div>
            <p className={CLASSE_LABEL_RECEPTION}>
              {t("admin.examens.colonnes.statut")}
              <span className="ml-0.5 text-red-500">*</span>
            </p>
            <p className="mb-2 text-[11px] text-texte-secondaire">
              {t("admin.examens.aideStatut")}
            </p>
            <div className="flex flex-wrap gap-4 pt-1">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="admin-examen-statut"
                  checked={form.actif}
                  disabled={lectureSeule}
                  onChange={() => maj("actif", true)}
                  className="accent-bleu-medical"
                />
                {t("admin.examens.actif")}
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="admin-examen-statut"
                  checked={!form.actif}
                  disabled={lectureSeule}
                  onChange={() => maj("actif", false)}
                  className="accent-bleu-medical"
                />
                {t("admin.examens.inactif")}
              </label>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <TitreSection>{t("admin.examens.sections.options")}</TitreSection>
          <label className="flex items-start gap-2.5 text-sm text-texte-principal">
            <input
              type="checkbox"
              className="mt-0.5 accent-bleu-medical"
              checked={form.packPrenuptial}
              disabled={lectureSeule}
              onChange={(e) => maj("packPrenuptial", e.target.checked)}
            />
            <span>
              <span className="font-medium">{t("admin.examens.packPrenuptial")}</span>
              <span className="mt-0.5 block text-[11px] text-texte-secondaire">
                {t("admin.examens.aidePack")}
              </span>
            </span>
          </label>
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
            {t("admin.examens.annuler")}
          </Bouton>
          <Bouton type="button" onClick={onSoumettre} disabled={enCours}>
            {enCours ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {modeCreation
              ? t("admin.examens.enregistrerExamen")
              : t("admin.common.enregistrer")}
          </Bouton>
        </div>
      ) : null}
    </div>
  );
}
