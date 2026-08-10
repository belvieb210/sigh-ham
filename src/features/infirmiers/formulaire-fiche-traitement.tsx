"use client";

import { Plus, Trash2, Upload } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  CLASSE_CHAMP_RECEPTION,
  CLASSE_LABEL_RECEPTION,
} from "@/constants/reception";
import {
  datetimeLocalVersIso,
  isoVersDatetimeLocal,
} from "@/lib/infirmiers/fiche-traitement-utils";
import type {
  CommentaireTraitementResume,
  FichierTraitementResume,
  FormulaireFicheTraitementState,
  LigneTraitementResume,
} from "@/lib/infirmiers/types-fiche-traitement";
import { cn } from "@/lib/utils";

interface IdentitePatient {
  nom: string;
  age: string;
  sexe: string;
  poidsKg: string;
  numeroRecu: string;
  lectureSeuleNom?: boolean;
}

interface Props {
  formulaire: FormulaireFicheTraitementState;
  onChange: (f: FormulaireFicheTraitementState) => void;
  identite: IdentitePatient;
  onChangeIdentite: (champ: keyof IdentitePatient, valeur: string) => void;
  fichiersEnAttente: File[];
  onFichiersEnAttenteChange: (fichiers: File[]) => void;
  desactive?: boolean;
}

function majLigne(
  lignes: LigneTraitementResume[],
  index: number,
  champ: keyof LigneTraitementResume,
  valeur: string
): LigneTraitementResume[] {
  return lignes.map((l, i) => {
    if (i !== index) return l;
    if (champ === "effectueLe") {
      return { ...l, effectueLe: valeur ? datetimeLocalVersIso(valeur) : null };
    }
    return { ...l, [champ]: valeur };
  });
}

function majCommentaire(
  commentaires: CommentaireTraitementResume[],
  index: number,
  texte: string
): CommentaireTraitementResume[] {
  return commentaires.map((c, i) => (i === index ? { ...c, texte } : c));
}

export function formulaireVersPayload(
  formulaire: FormulaireFicheTraitementState,
  identite: IdentitePatient
) {
  return {
    medecinPrescripteur: formulaire.medecinPrescripteur,
    telPrescripteur: formulaire.telPrescripteur,
    numeroRecu: identite.numeroRecu || formulaire.numeroRecu,
    poidsKg: identite.poidsKg || formulaire.poidsKg || null,
    sexe: identite.sexe || formulaire.sexe,
    debutTraitementLe: datetimeLocalVersIso(formulaire.debutTraitementLe),
    finTraitementLe: datetimeLocalVersIso(formulaire.finTraitementLe),
    lignes: formulaire.lignes.filter((l) => l.medicament.trim()),
    commentaires: formulaire.commentaires.filter((c) => c.texte.trim()),
    fichiers: formulaire.fichiers,
  };
}

export function formulaireDepuisFiche(
  fiche: import("@/lib/infirmiers/types-fiche-traitement").FicheTraitementResume
): FormulaireFicheTraitementState {
  return {
    medecinPrescripteur: fiche.medecinPrescripteur ?? "",
    telPrescripteur: fiche.telPrescripteur ?? "",
    numeroRecu: fiche.numeroRecu ?? "",
    poidsKg: fiche.poidsKg != null ? String(fiche.poidsKg) : "",
    sexe: fiche.sexe ?? "",
    debutTraitementLe: isoVersDatetimeLocal(fiche.debutTraitementLe),
    finTraitementLe: isoVersDatetimeLocal(fiche.finTraitementLe),
    lignes:
      fiche.lignes.length > 0
        ? fiche.lignes.map((l) => ({
            id: l.id,
            effectueLe: l.effectueLe,
            medicament: l.medicament,
            doseQuantite: l.doseQuantite ?? "",
            nomTraiteur: l.nomTraiteur ?? "",
          }))
        : [{ effectueLe: null, medicament: "", doseQuantite: "", nomTraiteur: "" }],
    commentaires:
      fiche.commentaires.length > 0
        ? fiche.commentaires.map((c) => ({ id: c.id, texte: c.texte }))
        : [{ texte: "" }],
    fichiers: fiche.fichiers ?? [],
  };
}

export function FormulaireFicheTraitement({
  formulaire,
  onChange,
  identite,
  onChangeIdentite,
  fichiersEnAttente,
  onFichiersEnAttenteChange,
  desactive = false,
}: Props) {
  const { t } = useTranslation();
  const inputFichierRef = useRef<HTMLInputElement>(null);

  function ajouterLigne() {
    onChange({
      ...formulaire,
      lignes: [
        ...formulaire.lignes,
        { effectueLe: null, medicament: "", doseQuantite: "", nomTraiteur: "" },
      ],
    });
  }

  function supprimerLigne(index: number) {
    if (formulaire.lignes.length <= 1) return;
    onChange({
      ...formulaire,
      lignes: formulaire.lignes.filter((_, i) => i !== index),
    });
  }

  function ajouterCommentaire() {
    onChange({
      ...formulaire,
      commentaires: [...formulaire.commentaires, { texte: "" }],
    });
  }

  function supprimerCommentaire(index: number) {
    if (formulaire.commentaires.length <= 1) return;
    onChange({
      ...formulaire,
      commentaires: formulaire.commentaires.filter((_, i) => i !== index),
    });
  }

  function supprimerFichierExistant(index: number) {
    onChange({
      ...formulaire,
      fichiers: formulaire.fichiers.filter((_, i) => i !== index),
    });
  }

  function supprimerFichierEnAttente(index: number) {
    onFichiersEnAttenteChange(fichiersEnAttente.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className={CLASSE_LABEL_RECEPTION}>
            {t("infirmiers.ficheTraitement.champs.nom")}
          </label>
          <input
            type="text"
            value={identite.nom}
            readOnly={identite.lectureSeuleNom}
            onChange={(e) => onChangeIdentite("nom", e.target.value)}
            className={cn(CLASSE_CHAMP_RECEPTION, identite.lectureSeuleNom && "bg-gris-tres-clair")}
            disabled={desactive}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL_RECEPTION}>
            {t("infirmiers.ficheTraitement.champs.age")}
          </label>
          <input
            type="text"
            value={identite.age}
            onChange={(e) => onChangeIdentite("age", e.target.value)}
            className={CLASSE_CHAMP_RECEPTION}
            disabled={desactive}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL_RECEPTION}>
            {t("infirmiers.ficheTraitement.champs.sexe")}
          </label>
          <input
            type="text"
            value={identite.sexe}
            onChange={(e) => onChangeIdentite("sexe", e.target.value)}
            className={CLASSE_CHAMP_RECEPTION}
            disabled={desactive}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL_RECEPTION}>
            {t("infirmiers.ficheTraitement.champs.poids")}
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={identite.poidsKg}
            onChange={(e) => onChangeIdentite("poidsKg", e.target.value)}
            className={CLASSE_CHAMP_RECEPTION}
            disabled={desactive}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL_RECEPTION}>
            {t("infirmiers.ficheTraitement.champs.numeroRecu")}
          </label>
          <input
            type="text"
            value={identite.numeroRecu}
            onChange={(e) => onChangeIdentite("numeroRecu", e.target.value)}
            className={CLASSE_CHAMP_RECEPTION}
            disabled={desactive}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={CLASSE_LABEL_RECEPTION}>
            {t("infirmiers.ficheTraitement.champs.debutTraitement")}
          </label>
          <input
            type="datetime-local"
            value={formulaire.debutTraitementLe}
            onChange={(e) =>
              onChange({ ...formulaire, debutTraitementLe: e.target.value })
            }
            className={CLASSE_CHAMP_RECEPTION}
            disabled={desactive}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL_RECEPTION}>
            {t("infirmiers.ficheTraitement.champs.finTraitement")}
          </label>
          <input
            type="datetime-local"
            value={formulaire.finTraitementLe}
            onChange={(e) =>
              onChange({ ...formulaire, finTraitementLe: e.target.value })
            }
            className={CLASSE_CHAMP_RECEPTION}
            disabled={desactive}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={CLASSE_LABEL_RECEPTION}>
            {t("infirmiers.ficheTraitement.champs.medecinPrescripteur")}
          </label>
          <input
            type="text"
            value={formulaire.medecinPrescripteur}
            onChange={(e) =>
              onChange({ ...formulaire, medecinPrescripteur: e.target.value })
            }
            className={CLASSE_CHAMP_RECEPTION}
            disabled={desactive}
          />
        </div>
        <div>
          <label className={CLASSE_LABEL_RECEPTION}>
            {t("infirmiers.ficheTraitement.champs.telPrescripteur")}
          </label>
          <input
            type="tel"
            value={formulaire.telPrescripteur}
            onChange={(e) =>
              onChange({ ...formulaire, telPrescripteur: e.target.value })
            }
            className={CLASSE_CHAMP_RECEPTION}
            disabled={desactive}
          />
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-texte-principal">
            {t("infirmiers.ficheTraitement.lignesTitre")}
          </h3>
          <button
            type="button"
            onClick={ajouterLigne}
            disabled={desactive}
            className="inline-flex items-center gap-1 rounded-lg border border-gris-bordure px-2.5 py-1.5 text-xs font-medium hover:bg-gris-tres-clair disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("infirmiers.ficheTraitement.ajouterLigne")}
          </button>
        </div>

        <div className="space-y-3">
          {formulaire.lignes.map((ligne, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-lg border border-gris-bordure/80 bg-gris-tres-clair/30 p-3 sm:grid-cols-12"
            >
              <div className="sm:col-span-3">
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("infirmiers.ficheTraitement.champs.dateHeure")}
                </label>
                <input
                  type="datetime-local"
                  value={isoVersDatetimeLocal(ligne.effectueLe)}
                  onChange={(e) =>
                    onChange({
                      ...formulaire,
                      lignes: majLigne(
                        formulaire.lignes,
                        index,
                        "effectueLe",
                        e.target.value
                      ),
                    })
                  }
                  className={CLASSE_CHAMP_RECEPTION}
                  disabled={desactive}
                />
              </div>
              <div className="sm:col-span-3">
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("infirmiers.ficheTraitement.champs.medicament")}
                </label>
                <input
                  type="text"
                  value={ligne.medicament}
                  onChange={(e) =>
                    onChange({
                      ...formulaire,
                      lignes: majLigne(
                        formulaire.lignes,
                        index,
                        "medicament",
                        e.target.value
                      ),
                    })
                  }
                  className={CLASSE_CHAMP_RECEPTION}
                  disabled={desactive}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("infirmiers.ficheTraitement.champs.dose")}
                </label>
                <input
                  type="text"
                  value={ligne.doseQuantite ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...formulaire,
                      lignes: majLigne(
                        formulaire.lignes,
                        index,
                        "doseQuantite",
                        e.target.value
                      ),
                    })
                  }
                  className={CLASSE_CHAMP_RECEPTION}
                  disabled={desactive}
                />
              </div>
              <div className="sm:col-span-3">
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("infirmiers.ficheTraitement.champs.nomTraiteur")}
                </label>
                <input
                  type="text"
                  value={ligne.nomTraiteur ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...formulaire,
                      lignes: majLigne(
                        formulaire.lignes,
                        index,
                        "nomTraiteur",
                        e.target.value
                      ),
                    })
                  }
                  className={CLASSE_CHAMP_RECEPTION}
                  disabled={desactive}
                />
              </div>
              <div className="flex items-end sm:col-span-1">
                <button
                  type="button"
                  onClick={() => supprimerLigne(index)}
                  disabled={desactive || formulaire.lignes.length <= 1}
                  className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40"
                  aria-label={t("infirmiers.ficheTraitement.supprimerLigne")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-texte-principal">
            {t("infirmiers.ficheTraitement.commentairesTitre")}
          </h3>
          <button
            type="button"
            onClick={ajouterCommentaire}
            disabled={desactive}
            className="inline-flex items-center gap-1 rounded-lg border border-gris-bordure px-2.5 py-1.5 text-xs font-medium hover:bg-gris-tres-clair disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("infirmiers.ficheTraitement.ajouterCommentaire")}
          </button>
        </div>
        <div className="space-y-2">
          {formulaire.commentaires.map((com, index) => (
            <div key={index} className="flex gap-2">
              <textarea
                value={com.texte}
                onChange={(e) =>
                  onChange({
                    ...formulaire,
                    commentaires: majCommentaire(
                      formulaire.commentaires,
                      index,
                      e.target.value
                    ),
                  })
                }
                rows={2}
                className={cn(CLASSE_CHAMP_RECEPTION, "min-h-[2.5rem] flex-1 resize-y")}
                disabled={desactive}
                placeholder={t("infirmiers.ficheTraitement.commentairePlaceholder")}
              />
              <button
                type="button"
                onClick={() => supprimerCommentaire(index)}
                disabled={desactive || formulaire.commentaires.length <= 1}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-texte-principal">
            {t("infirmiers.ficheTraitement.fichiersTitre")}
          </h3>
          <button
            type="button"
            onClick={() => inputFichierRef.current?.click()}
            disabled={desactive}
            className="inline-flex items-center gap-1 rounded-lg border border-gris-bordure px-2.5 py-1.5 text-xs font-medium hover:bg-gris-tres-clair disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
            {t("infirmiers.ficheTraitement.ajouterFichier")}
          </button>
          <input
            ref={inputFichierRef}
            type="file"
            className="hidden"
            multiple
            onChange={(e) => {
              const list = e.target.files ? [...e.target.files] : [];
              if (list.length) {
                onFichiersEnAttenteChange([...fichiersEnAttente, ...list]);
              }
              e.target.value = "";
            }}
          />
        </div>

        {formulaire.fichiers.length > 0 || fichiersEnAttente.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {formulaire.fichiers.map((f, i) => (
              <li
                key={`ex-${i}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-gris-bordure px-3 py-2"
              >
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-bleu-medical hover:underline"
                >
                  {f.nom}
                </a>
                <button
                  type="button"
                  onClick={() => supprimerFichierExistant(i)}
                  disabled={desactive}
                  className="text-red-600 hover:text-red-700 disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
            {fichiersEnAttente.map((f, i) => (
              <li
                key={`att-${i}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-gris-bordure px-3 py-2 text-texte-secondaire"
              >
                <span className="truncate">{f.name} ({t("infirmiers.ficheTraitement.enAttente")})</span>
                <button
                  type="button"
                  onClick={() => supprimerFichierEnAttente(i)}
                  disabled={desactive}
                  className="text-red-600 hover:text-red-700 disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-texte-secondaire">
            {t("infirmiers.ficheTraitement.aucunFichier")}
          </p>
        )}
      </section>
    </div>
  );
}
