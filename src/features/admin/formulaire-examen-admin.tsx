"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import { cn } from "@/lib/utils";

export interface FormParametreExamenAdmin {
  cle: string;
  id?: string;
  nom: string;
  unite: string;
  rangeUsuelle: string;
  obligatoire: boolean;
  /** Position d'affichage (1 = premier paramètre). */
  ordre: number;
}

export interface FormExamenAdmin {
  code: string;
  libelle: string;
  categorie: string;
  prix: string;
  delaiHeures: string;
  actif: boolean;
  packPrenuptial: boolean;
  description: string;
  specimen: string;
  serviceLabo: string;
  formulaire: string;
  uniteDefaut: string;
  rangeUsuelle: string;
  parametres: FormParametreExamenAdmin[];
}

export function nouveauParametreExamen(ordre = 1): FormParametreExamenAdmin {
  return {
    cle:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    nom: "",
    unite: "",
    rangeUsuelle: "",
    obligatoire: true,
    ordre,
  };
}

function trierParametresFormulaire(parametres: FormParametreExamenAdmin[]) {
  return [...parametres].sort((a, b) => a.ordre - b.ordre);
}

export const FORM_EXAMEN_ADMIN_VIDE: FormExamenAdmin = {
  code: "",
  libelle: "",
  categorie: "",
  prix: "0",
  delaiHeures: "24",
  actif: true,
  packPrenuptial: false,
  description: "",
  specimen: "",
  serviceLabo: "",
  formulaire: "",
  uniteDefaut: "",
  rangeUsuelle: "",
  parametres: [],
};

const SPECIMENS = [
  "Sang",
  "Sérum",
  "Plasma",
  "Sang total EDTA",
  "Urine",
  "Selles",
  "LCR",
  "Frottis",
  "Expectoration",
  "Liquide de ponction",
];

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

  const majParametre = (
    cle: string,
    patch: Partial<FormParametreExamenAdmin>
  ) => {
    maj(
      "parametres",
      form.parametres.map((p) => (p.cle === cle ? { ...p, ...patch } : p))
    );
  };

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
          <div>
            <LabelChamp htmlFor="admin-examen-description">
              {t("admin.examens.descriptionChamp")}
            </LabelChamp>
            <textarea
              id="admin-examen-description"
              rows={3}
              className={cn(classeChamp, "resize-y")}
              value={form.description}
              disabled={lectureSeule}
              placeholder={t("admin.examens.placeholders.description")}
              onChange={(e) => maj("description", e.target.value)}
            />
          </div>
        </section>

        <section className="space-y-3">
          <TitreSection>{t("admin.examens.sections.prelevement")}</TitreSection>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <LabelChamp htmlFor="admin-examen-specimen">
                {t("admin.examens.specimen")}
              </LabelChamp>
              <input
                id="admin-examen-specimen"
                className={classeChamp}
                list="admin-examen-specimens"
                value={form.specimen}
                disabled={lectureSeule}
                placeholder={t("admin.examens.placeholders.specimen")}
                onChange={(e) => maj("specimen", e.target.value)}
              />
              <datalist id="admin-examen-specimens">
                {SPECIMENS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div>
              <LabelChamp htmlFor="admin-examen-service">
                {t("admin.examens.serviceLabo")}
              </LabelChamp>
              <input
                id="admin-examen-service"
                className={classeChamp}
                list="admin-examen-categories"
                value={form.serviceLabo}
                disabled={lectureSeule}
                placeholder={t("admin.examens.placeholders.serviceLabo")}
                onChange={(e) => maj("serviceLabo", e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <LabelChamp htmlFor="admin-examen-unite">
                {t("admin.examens.uniteDefaut")}
              </LabelChamp>
              <input
                id="admin-examen-unite"
                className={classeChamp}
                value={form.uniteDefaut}
                disabled={lectureSeule}
                placeholder={t("admin.examens.placeholders.unite")}
                onChange={(e) => maj("uniteDefaut", e.target.value)}
              />
            </div>
            <div>
              <LabelChamp htmlFor="admin-examen-range">
                {t("admin.examens.rangeUsuelle")}
              </LabelChamp>
              <input
                id="admin-examen-range"
                className={classeChamp}
                value={form.rangeUsuelle}
                disabled={lectureSeule}
                placeholder={t("admin.examens.placeholders.range")}
                onChange={(e) => maj("rangeUsuelle", e.target.value)}
              />
            </div>
          </div>
          <div>
            <LabelChamp htmlFor="admin-examen-formulaire">
              {t("admin.examens.formulaireLabo")}
            </LabelChamp>
            <input
              id="admin-examen-formulaire"
              className={classeChamp}
              value={form.formulaire}
              disabled={lectureSeule}
              placeholder={t("admin.examens.placeholders.formulaire")}
              onChange={(e) => maj("formulaire", e.target.value)}
            />
          </div>
        </section>

        <section className="space-y-3">
          <TitreSection>{t("admin.examens.sections.tarification")}</TitreSection>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <LabelChamp htmlFor="admin-examen-prix" requis>
                {t("admin.examens.prix")}
              </LabelChamp>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-texte-secondaire">
                  $
                </span>
                <input
                  id="admin-examen-prix"
                  type="number"
                  min={0}
                  step="0.01"
                  className={cn(classeChamp, "pl-7")}
                  value={form.prix}
                  disabled={lectureSeule}
                  placeholder={t("admin.examens.placeholders.prix")}
                  onChange={(e) => maj("prix", e.target.value)}
                />
              </div>
              <p className="mt-1 text-[11px] text-texte-secondaire">
                {t("admin.examens.aidePrix")}
              </p>
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
          <div className="flex items-end justify-between gap-2 border-b border-gris-bordure pb-2">
            <h4 className="text-sm font-bold text-bleu-medical">
              {t("admin.examens.sections.parametres")}
            </h4>
            {!lectureSeule ? (
              <button
                type="button"
                onClick={() => {
                  const prochainOrdre = form.parametres.length
                    ? Math.max(...form.parametres.map((p) => p.ordre)) + 1
                    : 1;
                  maj("parametres", [
                    ...form.parametres,
                    nouveauParametreExamen(prochainOrdre),
                  ]);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-bleu-medical hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                {t("admin.examens.ajouterParametre")}
              </button>
            ) : null}
          </div>
          <p className="text-[11px] text-texte-secondaire">
            {t("admin.examens.aideParametres")}
          </p>
          {form.parametres.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gris-bordure px-3 py-4 text-center text-xs text-texte-secondaire">
              {t("admin.examens.aucunParametre")}
            </p>
          ) : (
            <ul className="space-y-3">
              {trierParametresFormulaire(form.parametres).map((p, index) => (
                <li
                  key={p.cle}
                  className="rounded-lg border border-gris-bordure bg-slate-50/70 p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-texte-secondaire">
                      {t("admin.examens.parametreN", { n: index + 1 })}
                    </span>
                    {!lectureSeule ? (
                      <button
                        type="button"
                        onClick={() =>
                          maj(
                            "parametres",
                            form.parametres.filter((x) => x.cle !== p.cle)
                          )
                        }
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-700"
                        aria-label={t("admin.examens.supprimerParametre")}
                        title={t("admin.examens.supprimerParametre")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <LabelChamp htmlFor={`param-nom-${p.cle}`} requis>
                        {t("admin.examens.parametreNom")}
                      </LabelChamp>
                      <input
                        id={`param-nom-${p.cle}`}
                        className={classeChamp}
                        value={p.nom}
                        disabled={lectureSeule}
                        placeholder={t("admin.examens.placeholders.parametreNom")}
                        onChange={(e) => majParametre(p.cle, { nom: e.target.value })}
                      />
                    </div>
                    <div>
                      <LabelChamp htmlFor={`param-unite-${p.cle}`}>
                        {t("admin.examens.parametreUnite")}
                      </LabelChamp>
                      <input
                        id={`param-unite-${p.cle}`}
                        className={classeChamp}
                        value={p.unite}
                        disabled={lectureSeule}
                        placeholder={t("admin.examens.placeholders.unite")}
                        onChange={(e) => majParametre(p.cle, { unite: e.target.value })}
                      />
                    </div>
                    <div>
                      <LabelChamp htmlFor={`param-range-${p.cle}`}>
                        {t("admin.examens.parametreRange")}
                      </LabelChamp>
                      <input
                        id={`param-range-${p.cle}`}
                        className={classeChamp}
                        value={p.rangeUsuelle}
                        disabled={lectureSeule}
                        placeholder={t("admin.examens.placeholders.range")}
                        onChange={(e) =>
                          majParametre(p.cle, { rangeUsuelle: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <label className="inline-flex items-center gap-2 text-xs text-texte-principal">
                      <input
                        type="checkbox"
                        className="accent-bleu-medical"
                        checked={p.obligatoire}
                        disabled={lectureSeule}
                        onChange={(e) =>
                          majParametre(p.cle, { obligatoire: e.target.checked })
                        }
                      />
                      {t("admin.examens.parametreObligatoire")}
                    </label>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`param-ordre-${p.cle}`}
                        className="text-xs font-medium text-texte-secondaire"
                      >
                        {t("admin.examens.parametreOrdre")}
                      </label>
                      <input
                        id={`param-ordre-${p.cle}`}
                        type="number"
                        min={1}
                        className={cn(classeChamp, "h-8 w-16 text-center")}
                        value={p.ordre}
                        disabled={lectureSeule}
                        onChange={(e) =>
                          majParametre(p.cle, {
                            ordre: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
