"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Save, X } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import {
  PaginationListe,
  paginerListe,
} from "@/components/ui/pagination-liste";
import { ZonePhotoPatient } from "@/features/reception/zone-photo-patient";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import { cn } from "@/lib/utils";

export type TypePersonneAdmin = "PATIENT" | "CLIENT";

export interface FormPatientAdmin {
  prenom: string;
  nom: string;
  dateNaissance: string;
  sexe: "" | "MASCULIN" | "FEMININ" | "AUTRE";
  telephone: string;
  email: string;
  adresse: string;
  ville: string;
  province: string;
  pays: string;
  groupeSanguin: string;
  allergies: string;
  contactUrgence: string;
  telephoneUrgence: string;
}

export const FORM_PATIENT_ADMIN_VIDE: FormPatientAdmin = {
  prenom: "",
  nom: "",
  dateNaissance: "",
  sexe: "",
  telephone: "",
  email: "",
  adresse: "",
  ville: "",
  province: "",
  pays: "RD Congo",
  groupeSanguin: "",
  allergies: "",
  contactUrgence: "",
  telephoneUrgence: "",
};

export type DossierPatientAdmin = {
  id: string;
  numeroDossier: string;
  statut: string;
  ouvertLe: string;
  salleEnregistrement: string;
};

type ModePanneau = "consultation" | "edition";

const PREFIXE_TEL = "+243";

function numeroLocal(tel: string) {
  return tel.replace(/^\+243\s*/i, "").replace(/^243\s*/, "");
}

function numeroInternational(local: string) {
  const n = local.trim();
  if (!n) return "";
  if (n.startsWith("+")) return n;
  return `${PREFIXE_TEL} ${n}`;
}

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
  form: FormPatientAdmin;
  onChange: (form: FormPatientAdmin) => void;
  modePanneau: ModePanneau | null;
  typePersonne: TypePersonneAdmin | null;
  numeroPatient: string | null;
  dossiers: DossierPatientAdmin[];
  lectureSeule: boolean;
  enCours: boolean;
  photo: File | null;
  photoUrlExistante?: string | null;
  onPhoto: (fichier: File | null) => void;
  onSoumettre: () => void;
  onFermer: () => void;
}

export function FormulairePatientAdmin({
  form,
  onChange,
  modePanneau,
  typePersonne,
  numeroPatient,
  dossiers,
  lectureSeule,
  enCours,
  photo,
  photoUrlExistante,
  onPhoto,
  onSoumettre,
  onFermer,
}: Props) {
  const { t, i18n } = useTranslation();
  const [pageDossiers, setPageDossiers] = useState(1);
  const pageDossiersData = useMemo(
    () => paginerListe(dossiers, pageDossiers, 4),
    [dossiers, pageDossiers]
  );
  useEffect(() => {
    setPageDossiers(1);
  }, [numeroPatient, dossiers.length]);

  const classeChamp = cn(
    CLASSE_CHAMP_RECEPTION,
    lectureSeule && "cursor-not-allowed bg-slate-50"
  );

  const maj = <K extends keyof FormPatientAdmin>(
    cle: K,
    valeur: FormPatientAdmin[K]
  ) => onChange({ ...form, [cle]: valeur });

  if (!modePanneau || !typePersonne) {
    return (
      <div className="flex min-h-[22rem] flex-col items-center justify-center rounded-xl border border-dashed border-gris-bordure bg-white px-6 py-10 text-center shadow-sm">
        <p className="text-sm font-medium text-texte-principal">
          {t("admin.patients.aideSelection")}
        </p>
        <p className="mt-1 text-xs text-texte-secondaire">
          {t("admin.patients.aideSelectionDetail")}
        </p>
      </div>
    );
  }

  const titre =
    modePanneau === "consultation"
      ? t("admin.patients.formConsultation")
      : t("admin.patients.formEdition");
  const sousTitre =
    modePanneau === "consultation"
      ? t("admin.patients.formConsultationAide")
      : t("admin.patients.formEditionAide");

  return (
    <div className="flex max-h-[calc(100vh-8rem)] flex-col rounded-xl border border-gris-bordure bg-white shadow-sm lg:sticky lg:top-4">
      <div className="flex items-start justify-between gap-3 border-b border-gris-bordure px-4 py-3">
        <div>
          <h3 className="text-base font-bold text-bleu-medical">{titre}</h3>
          <p className="mt-0.5 text-xs text-texte-secondaire">{sousTitre}</p>
        </div>
        <button
          type="button"
          onClick={onFermer}
          aria-label={t("admin.patients.fermerFormulaire")}
          className="rounded-lg p-1 text-texte-secondaire hover:bg-gris-tres-clair hover:text-texte-principal"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <section className="space-y-3">
          <TitreSection>{t("admin.patients.sections.identite")}</TitreSection>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className={CLASSE_LABEL_RECEPTION}>
                {t("admin.patients.champs.numero")}
              </p>
              <p className="rounded-lg border border-gris-bordure bg-slate-50 px-3 py-2 text-sm font-medium text-texte-principal">
                {numeroPatient ?? "—"}
              </p>
            </div>
            <div>
              <p className={CLASSE_LABEL_RECEPTION}>
                {t("admin.patients.champs.type")}
              </p>
              <p className="rounded-lg border border-gris-bordure bg-slate-50 px-3 py-2 text-sm font-medium text-texte-principal">
                {t(`admin.patients.types.${typePersonne}`)}
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <LabelChamp htmlFor="admin-pat-prenom" requis>
                {t("admin.patients.champs.prenom")}
              </LabelChamp>
              <input
                id="admin-pat-prenom"
                className={classeChamp}
                value={form.prenom}
                disabled={lectureSeule}
                placeholder={t("admin.patients.placeholders.prenom")}
                onChange={(e) => maj("prenom", e.target.value)}
              />
            </div>
            <div>
              <LabelChamp htmlFor="admin-pat-nom" requis>
                {t("admin.patients.champs.nom")}
              </LabelChamp>
              <input
                id="admin-pat-nom"
                className={classeChamp}
                value={form.nom}
                disabled={lectureSeule}
                placeholder={t("admin.patients.placeholders.nom")}
                onChange={(e) => maj("nom", e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <LabelChamp htmlFor="admin-pat-sexe">
                {t("admin.patients.champs.sexe")}
              </LabelChamp>
              <select
                id="admin-pat-sexe"
                className={classeChamp}
                value={form.sexe}
                disabled={lectureSeule}
                onChange={(e) =>
                  maj("sexe", e.target.value as FormPatientAdmin["sexe"])
                }
              >
                <option value="">{t("admin.patients.placeholders.sexe")}</option>
                <option value="MASCULIN">{t("admin.patients.sexes.MASCULIN")}</option>
                <option value="FEMININ">{t("admin.patients.sexes.FEMININ")}</option>
                <option value="AUTRE">{t("admin.patients.sexes.AUTRE")}</option>
              </select>
            </div>
            <div>
              <LabelChamp htmlFor="admin-pat-naissance">
                {t("admin.patients.champs.dateNaissance")}
              </LabelChamp>
              <input
                id="admin-pat-naissance"
                type="date"
                className={classeChamp}
                value={form.dateNaissance}
                disabled={lectureSeule}
                onChange={(e) => maj("dateNaissance", e.target.value)}
              />
            </div>
          </div>
          <div>
            <LabelChamp htmlFor="admin-pat-email">
              {t("admin.patients.champs.email")}
            </LabelChamp>
            <input
              id="admin-pat-email"
              type="email"
              className={classeChamp}
              value={form.email}
              disabled={lectureSeule}
              placeholder={t("admin.patients.placeholders.email")}
              onChange={(e) => maj("email", e.target.value)}
            />
          </div>
          <div>
            <LabelChamp htmlFor="admin-pat-tel">
              {t("admin.patients.champs.telephone")}
            </LabelChamp>
            <div className="flex">
              <span className="inline-flex items-center gap-1.5 rounded-l-lg border border-r-0 border-gris-bordure bg-gris-tres-clair px-2.5 text-sm text-texte-principal">
                <span aria-hidden>🇨🇩</span>
                {PREFIXE_TEL}
              </span>
              <input
                id="admin-pat-tel"
                className={cn(classeChamp, "rounded-l-none")}
                value={numeroLocal(form.telephone)}
                disabled={lectureSeule}
                placeholder={t("admin.patients.placeholders.telephone")}
                onChange={(e) => maj("telephone", numeroInternational(e.target.value))}
              />
            </div>
          </div>
          <div>
            <LabelChamp>{t("admin.patients.champs.photo")}</LabelChamp>
            {lectureSeule ? (
              photoUrlExistante ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrlExistante}
                  alt=""
                  className="h-28 w-28 rounded-xl border border-gris-bordure object-cover"
                />
              ) : (
                <p className="text-sm text-texte-secondaire">—</p>
              )
            ) : (
              <ZonePhotoPatient
                value={photo}
                onChange={onPhoto}
                urlExistante={photoUrlExistante}
              />
            )}
          </div>
        </section>

        <section className="space-y-3">
          <TitreSection>{t("admin.patients.sections.adresse")}</TitreSection>
          <div>
            <LabelChamp htmlFor="admin-pat-adresse">
              {t("admin.patients.champs.adresse")}
            </LabelChamp>
            <input
              id="admin-pat-adresse"
              className={classeChamp}
              value={form.adresse}
              disabled={lectureSeule}
              placeholder={t("admin.patients.placeholders.adresse")}
              onChange={(e) => maj("adresse", e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <LabelChamp htmlFor="admin-pat-ville">
                {t("admin.patients.champs.ville")}
              </LabelChamp>
              <input
                id="admin-pat-ville"
                className={classeChamp}
                value={form.ville}
                disabled={lectureSeule}
                onChange={(e) => maj("ville", e.target.value)}
              />
            </div>
            <div>
              <LabelChamp htmlFor="admin-pat-province">
                {t("admin.patients.champs.province")}
              </LabelChamp>
              <input
                id="admin-pat-province"
                className={classeChamp}
                value={form.province}
                disabled={lectureSeule}
                onChange={(e) => maj("province", e.target.value)}
              />
            </div>
          </div>
          <div>
            <LabelChamp htmlFor="admin-pat-pays">
              {t("admin.patients.champs.pays")}
            </LabelChamp>
            <input
              id="admin-pat-pays"
              className={classeChamp}
              value={form.pays}
              disabled={lectureSeule}
              onChange={(e) => maj("pays", e.target.value)}
            />
          </div>
        </section>

        <section className="space-y-3">
          <TitreSection>{t("admin.patients.sections.medical")}</TitreSection>
          <div>
            <LabelChamp htmlFor="admin-pat-sang">
              {t("admin.patients.champs.groupeSanguin")}
            </LabelChamp>
            <input
              id="admin-pat-sang"
              className={classeChamp}
              value={form.groupeSanguin}
              disabled={lectureSeule}
              placeholder={t("admin.patients.placeholders.groupeSanguin")}
              onChange={(e) => maj("groupeSanguin", e.target.value)}
            />
          </div>
          <div>
            <LabelChamp htmlFor="admin-pat-allergies">
              {t("admin.patients.champs.allergies")}
            </LabelChamp>
            <textarea
              id="admin-pat-allergies"
              className={classeChamp}
              rows={2}
              value={form.allergies}
              disabled={lectureSeule}
              placeholder={t("admin.patients.placeholders.allergies")}
              onChange={(e) => maj("allergies", e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <LabelChamp htmlFor="admin-pat-urgence-nom">
                {t("admin.patients.champs.contactUrgence")}
              </LabelChamp>
              <input
                id="admin-pat-urgence-nom"
                className={classeChamp}
                value={form.contactUrgence}
                disabled={lectureSeule}
                onChange={(e) => maj("contactUrgence", e.target.value)}
              />
            </div>
            <div>
              <LabelChamp htmlFor="admin-pat-urgence-tel">
                {t("admin.patients.champs.telephoneUrgence")}
              </LabelChamp>
              <input
                id="admin-pat-urgence-tel"
                className={classeChamp}
                value={form.telephoneUrgence}
                disabled={lectureSeule}
                onChange={(e) => maj("telephoneUrgence", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <TitreSection>{t("admin.patients.sections.dossiers")}</TitreSection>
          {dossiers.length === 0 ? (
            <p className="text-sm text-texte-secondaire">
              {t("admin.patients.aucunDossier")}
            </p>
          ) : (
            <>
              <ul className="space-y-2">
                {pageDossiersData.itemsPage.map((d) => (
                  <li
                    key={d.id}
                    className="rounded-lg border border-gris-bordure bg-slate-50 px-3 py-2 text-sm"
                  >
                    <p className="font-medium text-texte-principal">
                      {d.numeroDossier}
                    </p>
                    <p className="text-xs text-texte-secondaire">
                      {t(`admin.patients.statutsDossier.${d.statut}`, {
                        defaultValue: d.statut,
                      })}
                      {" · "}
                      {new Date(d.ouvertLe).toLocaleDateString(i18n.language, {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  </li>
                ))}
              </ul>
              <PaginationListe
                page={pageDossiersData.pageCourante}
                totalPages={pageDossiersData.totalPages}
                totalItems={dossiers.length}
                parPage={4}
                onChange={setPageDossiers}
                compact
                labelPrec={t("reception.liste.prec")}
                labelSuiv={t("reception.liste.suiv")}
              />
            </>
          )}
        </section>
      </div>

      {!lectureSeule ? (
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gris-bordure px-4 py-3">
          <Bouton
            type="button"
            variante="contour"
            taille="moyen"
            onClick={onFermer}
            disabled={enCours}
          >
            {t("admin.patients.annuler")}
          </Bouton>
          <Bouton
            type="button"
            taille="moyen"
            onClick={onSoumettre}
            disabled={enCours}
          >
            {enCours ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t("admin.patients.enregistrer")}
          </Bouton>
        </div>
      ) : null}
    </div>
  );
}
