"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Save, X } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import { cn } from "@/lib/utils";

export interface FormServiceAdmin {
  code: string;
  nom: string;
  description: string;
  ordre: string;
  actif: boolean;
}

export const FORM_SERVICE_ADMIN_VIDE: FormServiceAdmin = {
  code: "",
  nom: "",
  description: "",
  ordre: "0",
  actif: true,
};

type ModePanneau = "vide" | "consultation" | "edition";

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
  form: FormServiceAdmin;
  onChange: (form: FormServiceAdmin) => void;
  modePanneau: ModePanneau;
  lectureSeule: boolean;
  enCours: boolean;
  onSoumettre: () => void;
  onAnnuler: () => void;
}

export function FormulaireServiceAdmin({
  form,
  onChange,
  modePanneau,
  lectureSeule,
  enCours,
  onSoumettre,
  onAnnuler,
}: Props) {
  const { t } = useTranslation();
  const classeChamp = cn(
    CLASSE_CHAMP_RECEPTION,
    lectureSeule && "cursor-not-allowed bg-slate-50"
  );
  const maj = <K extends keyof FormServiceAdmin>(
    cle: K,
    valeur: FormServiceAdmin[K]
  ) => onChange({ ...form, [cle]: valeur });

  const vide = modePanneau === "vide";

  return (
    <div className="flex max-h-[calc(100vh-8rem)] flex-col rounded-xl border border-gris-bordure bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-gris-bordure px-4 py-3">
        <div>
          <h3 className="text-base font-bold text-bleu-medical">
            {vide
              ? t("admin.services.formVide")
              : lectureSeule
                ? t("admin.services.formConsultation")
                : t("admin.services.formEdition")}
          </h3>
          <p className="mt-0.5 text-xs text-texte-secondaire">
            {vide
              ? t("admin.services.formVideAide")
              : lectureSeule
                ? t("admin.services.formConsultationAide")
                : t("admin.services.formEditionAide")}
          </p>
        </div>
        {!vide ? (
          <button
            type="button"
            onClick={onAnnuler}
            aria-label={t("admin.services.fermerFormulaire")}
            className="rounded-lg p-1 text-texte-secondaire hover:bg-gris-tres-clair hover:text-texte-principal"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {vide ? (
        <p className="px-4 py-10 text-center text-sm text-texte-secondaire">
          {t("admin.services.formVideAide")}
        </p>
      ) : (
        <>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
            <section className="space-y-3">
              <TitreSection>{t("admin.services.sections.identite")}</TitreSection>
              <div>
                <LabelChamp htmlFor="admin-svc-code">
                  {t("admin.services.champs.code")}
                </LabelChamp>
                <input
                  id="admin-svc-code"
                  className={cn(classeChamp, "cursor-not-allowed bg-slate-50")}
                  value={form.code}
                  disabled
                />
                <p className="mt-1 text-[11px] text-texte-secondaire">
                  {t("admin.services.aideCode")}
                </p>
              </div>
              <div>
                <LabelChamp htmlFor="admin-svc-nom" requis>
                  {t("admin.services.champs.nom")}
                </LabelChamp>
                <input
                  id="admin-svc-nom"
                  className={classeChamp}
                  value={form.nom}
                  disabled={lectureSeule}
                  onChange={(e) => maj("nom", e.target.value)}
                />
              </div>
              <div>
                <LabelChamp htmlFor="admin-svc-desc">
                  {t("admin.services.champs.description")}
                </LabelChamp>
                <textarea
                  id="admin-svc-desc"
                  rows={3}
                  className={classeChamp}
                  value={form.description}
                  disabled={lectureSeule}
                  placeholder={t("admin.services.placeholders.description")}
                  onChange={(e) => maj("description", e.target.value)}
                />
              </div>
            </section>

            <section className="space-y-3">
              <TitreSection>{t("admin.services.sections.affichage")}</TitreSection>
              <div>
                <LabelChamp htmlFor="admin-svc-ordre">
                  {t("admin.services.ordre")}
                </LabelChamp>
                <input
                  id="admin-svc-ordre"
                  type="number"
                  min={0}
                  className={classeChamp}
                  value={form.ordre}
                  disabled={lectureSeule}
                  onChange={(e) => maj("ordre", e.target.value)}
                />
              </div>
              <div>
                <p className={CLASSE_LABEL_RECEPTION}>
                  {t("admin.services.colonnes.statut")}
                  <span className="ml-0.5 text-red-500">*</span>
                </p>
                <p className="mb-2 text-[11px] text-texte-secondaire">
                  {t("admin.services.aideStatut")}
                </p>
                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="admin-svc-statut"
                      checked={form.actif}
                      disabled={lectureSeule}
                      onChange={() => maj("actif", true)}
                      className="accent-bleu-medical"
                    />
                    {t("admin.services.actif")}
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="admin-svc-statut"
                      checked={!form.actif}
                      disabled={lectureSeule || form.code === "ADMIN"}
                      onChange={() => maj("actif", false)}
                      className="accent-bleu-medical"
                    />
                    {t("admin.services.inactif")}
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
                {t("admin.services.annuler")}
              </Bouton>
              <Bouton type="button" onClick={onSoumettre} disabled={enCours}>
                {enCours ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {t("admin.common.enregistrer")}
              </Bouton>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
