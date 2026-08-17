"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Save, X } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { ChampMotDePasse } from "@/components/ui/champ-mot-de-passe";
import { ZonePhotoPatient } from "@/features/reception/zone-photo-patient";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import { estRoleGereParServiceClient } from "@/constants/admin-utilisateurs";
import { cn } from "@/lib/utils";

export interface RoleFormulaireAdmin {
  id: string;
  code: string;
  nom: string;
  salle: { code: string; nom: string } | null;
}

export interface SalleFormulaireAdmin {
  code: string;
  nom: string;
}

export interface FormUtilisateurAdmin {
  identifiant: string;
  email: string;
  prenom: string;
  nom: string;
  telephone: string;
  roleId: string;
  salleCode: string;
  motDePasse: string;
  confirmationMotDePasse: string;
  statut: "ACTIF" | "INACTIF" | "SUSPENDU";
  messagerieBloquee: boolean;
  notesAdmin: string;
}

export const FORM_UTILISATEUR_ADMIN_VIDE: FormUtilisateurAdmin = {
  identifiant: "",
  email: "",
  prenom: "",
  nom: "",
  telephone: "",
  roleId: "",
  salleCode: "",
  motDePasse: "",
  confirmationMotDePasse: "",
  statut: "ACTIF",
  messagerieBloquee: false,
  notesAdmin: "",
};

type ModePanneau = "creation" | "consultation" | "edition";

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
  form: FormUtilisateurAdmin;
  onChange: (form: FormUtilisateurAdmin) => void;
  roles: RoleFormulaireAdmin[];
  salles: SalleFormulaireAdmin[];
  modePanneau: ModePanneau;
  lectureSeule: boolean;
  enCours: boolean;
  photo: File | null;
  photoUrlExistante?: string | null;
  onPhoto: (fichier: File | null) => void;
  onSoumettre: () => void;
  onAnnuler: () => void;
}

export function FormulaireUtilisateurAdmin({
  form,
  onChange,
  roles,
  salles,
  modePanneau,
  lectureSeule,
  enCours,
  photo,
  photoUrlExistante,
  onPhoto,
  onSoumettre,
  onAnnuler,
}: Props) {
  const { t } = useTranslation();
  const modeCreation = modePanneau === "creation";
  const classeChamp = cn(
    CLASSE_CHAMP_RECEPTION,
    lectureSeule && "cursor-not-allowed bg-slate-50"
  );

  const maj = <K extends keyof FormUtilisateurAdmin>(
    cle: K,
    valeur: FormUtilisateurAdmin[K]
  ) => onChange({ ...form, [cle]: valeur });

  const rolesAssignables = roles.filter(
    (r) =>
      !estRoleGereParServiceClient(r.code) &&
      (modeCreation ? r.code !== "SUPER_ADMIN" : true)
  );
  const rolesFiltres = form.salleCode
    ? rolesAssignables.filter(
        (r) => !r.salle || r.salle.code === form.salleCode
      )
    : rolesAssignables;

  const titre =
    modePanneau === "creation"
      ? t("admin.utilisateurs.formCreation")
      : modePanneau === "consultation"
        ? t("admin.utilisateurs.formConsultation")
        : t("admin.utilisateurs.formEdition");
  const sousTitre =
    modePanneau === "creation"
      ? t("admin.utilisateurs.formCreationAide")
      : modePanneau === "consultation"
        ? t("admin.utilisateurs.formConsultationAide")
        : t("admin.utilisateurs.formEditionAide");

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
          aria-label={t("admin.utilisateurs.fermerFormulaire")}
          className="rounded-lg p-1 text-texte-secondaire hover:bg-gris-tres-clair hover:text-texte-principal"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <section className="space-y-3">
          <TitreSection>{t("admin.utilisateurs.sections.personnel")}</TitreSection>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <LabelChamp htmlFor="admin-user-prenom" requis>
                {t("admin.utilisateurs.champs.prenom")}
              </LabelChamp>
              <input
                id="admin-user-prenom"
                className={classeChamp}
                value={form.prenom}
                disabled={lectureSeule}
                placeholder={t("admin.utilisateurs.placeholders.prenom")}
                onChange={(e) => maj("prenom", e.target.value)}
              />
            </div>
            <div>
              <LabelChamp htmlFor="admin-user-nom" requis>
                {t("admin.utilisateurs.champs.nom")}
              </LabelChamp>
              <input
                id="admin-user-nom"
                className={classeChamp}
                value={form.nom}
                disabled={lectureSeule}
                placeholder={t("admin.utilisateurs.placeholders.nom")}
                onChange={(e) => maj("nom", e.target.value)}
              />
            </div>
          </div>
          <div>
            <LabelChamp htmlFor="admin-user-email" requis>
              {t("admin.utilisateurs.champs.email")}
            </LabelChamp>
            <input
              id="admin-user-email"
              type="email"
              className={classeChamp}
              value={form.email}
              disabled={lectureSeule}
              placeholder={t("admin.utilisateurs.placeholders.email")}
              onChange={(e) => maj("email", e.target.value)}
            />
          </div>
          <div>
            <LabelChamp htmlFor="admin-user-tel">
              {t("admin.utilisateurs.champs.telephone")}
            </LabelChamp>
            <div className="flex">
              <span className="inline-flex items-center gap-1.5 rounded-l-lg border border-r-0 border-gris-bordure bg-gris-tres-clair px-2.5 text-sm text-texte-principal">
                <span aria-hidden>🇨🇩</span>
                {PREFIXE_TEL}
              </span>
              <input
                id="admin-user-tel"
                className={cn(classeChamp, "rounded-l-none")}
                value={numeroLocal(form.telephone)}
                disabled={lectureSeule}
                placeholder={t("admin.utilisateurs.placeholders.telephone")}
                onChange={(e) => maj("telephone", numeroInternational(e.target.value))}
              />
            </div>
          </div>
          <div>
            <LabelChamp>{t("admin.utilisateurs.champs.photo")}</LabelChamp>
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
          <TitreSection>{t("admin.utilisateurs.sections.compte")}</TitreSection>
          <div>
            <LabelChamp htmlFor="admin-user-identifiant" requis>
              {t("admin.utilisateurs.champs.identifiant")}
            </LabelChamp>
            <input
              id="admin-user-identifiant"
              className={classeChamp}
              value={form.identifiant}
              disabled={lectureSeule || !modeCreation}
              placeholder={t("admin.utilisateurs.placeholders.identifiant")}
              autoComplete="off"
              onChange={(e) => maj("identifiant", e.target.value)}
            />
            <p className="mt-1 text-[11px] text-texte-secondaire">
              {t("admin.utilisateurs.aideIdentifiant")}
            </p>
          </div>
          {!lectureSeule ? (
            <>
              <ChampMotDePasse
                id="admin-user-mdp"
                variant="reception"
                label={`${t(
                  modeCreation
                    ? "admin.utilisateurs.champs.motDePasse"
                    : "admin.utilisateurs.champs.nouveauMotDePasse"
                )}${modeCreation ? " *" : ""}`}
                value={form.motDePasse}
                autoComplete="new-password"
                placeholder={
                  modeCreation
                    ? t("admin.utilisateurs.placeholders.motDePasse")
                    : t("admin.utilisateurs.mdpOptionnel")
                }
                onChange={(e) => maj("motDePasse", e.target.value)}
              />
              {(modeCreation || form.motDePasse) && (
                <ChampMotDePasse
                  id="admin-user-mdp-confirm"
                  variant="reception"
                  label={`${t("admin.utilisateurs.champs.confirmerMotDePasse")}${modeCreation ? " *" : ""}`}
                  value={form.confirmationMotDePasse}
                  autoComplete="new-password"
                  placeholder={t("admin.utilisateurs.placeholders.confirmerMotDePasse")}
                  onChange={(e) => maj("confirmationMotDePasse", e.target.value)}
                />
              )}
            </>
          ) : null}
        </section>

        <section className="space-y-3">
          <TitreSection>{t("admin.utilisateurs.sections.affectation")}</TitreSection>
          <div>
            <LabelChamp htmlFor="admin-user-role" requis>
              {t("admin.utilisateurs.champs.role")}
            </LabelChamp>
            <select
              id="admin-user-role"
              className={classeChamp}
              value={form.roleId}
              disabled={lectureSeule}
              onChange={(e) => {
                const roleId = e.target.value;
                const role = roles.find((r) => r.id === roleId);
                onChange({
                  ...form,
                  roleId,
                  salleCode: role?.salle?.code ?? form.salleCode,
                });
              }}
            >
              <option value="">{t("admin.utilisateurs.placeholders.role")}</option>
              {rolesFiltres.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <LabelChamp htmlFor="admin-user-salle" requis>
              {t("admin.utilisateurs.champs.salle")}
            </LabelChamp>
            <select
              id="admin-user-salle"
              className={classeChamp}
              value={form.salleCode}
              disabled={lectureSeule}
              onChange={(e) => {
                const salleCode = e.target.value;
                const role = roles.find((r) => r.id === form.roleId);
                const roleOk = role && (!role.salle || role.salle.code === salleCode);
                onChange({
                  ...form,
                  salleCode,
                  roleId: roleOk ? form.roleId : "",
                });
              }}
            >
              <option value="">{t("admin.utilisateurs.placeholders.salle")}</option>
              {salles.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className={CLASSE_LABEL_RECEPTION}>
              {t("admin.utilisateurs.champs.statut")}
              <span className="ml-0.5 text-red-500">*</span>
            </p>
            <div className="flex flex-wrap gap-4 pt-1">
              {(["ACTIF", "INACTIF"] as const).map((s) => (
                <label key={s} className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="admin-user-statut"
                    checked={form.statut === s || (s === "INACTIF" && form.statut === "SUSPENDU")}
                    disabled={lectureSeule}
                    onChange={() => maj("statut", s)}
                    className="accent-bleu-medical"
                  />
                  {t(`admin.utilisateurs.statuts.${s}`)}
                </label>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <TitreSection>{t("admin.utilisateurs.sections.extra")}</TitreSection>
          <div>
            <LabelChamp htmlFor="admin-user-notes">
              {t("admin.utilisateurs.champs.notesAdmin")}
            </LabelChamp>
            <textarea
              id="admin-user-notes"
              className={classeChamp}
              rows={3}
              maxLength={250}
              value={form.notesAdmin}
              disabled={lectureSeule}
              placeholder={t("admin.utilisateurs.placeholders.notes")}
              onChange={(e) => maj("notesAdmin", e.target.value)}
            />
            <p className="mt-0.5 text-right text-[10px] text-texte-secondaire">
              {form.notesAdmin.length} / 250
            </p>
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
            {t("admin.utilisateurs.annuler")}
          </Bouton>
          <Bouton type="button" onClick={onSoumettre} disabled={enCours}>
            {enCours ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t("admin.utilisateurs.enregistrerUtilisateur")}
          </Bouton>
        </div>
      ) : null}
    </div>
  );
}
