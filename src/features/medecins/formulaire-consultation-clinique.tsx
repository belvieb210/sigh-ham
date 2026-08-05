"use client";

import {
  CLASSE_CHAMP_RECEPTION,
  CLASSE_LABEL_RECEPTION,
} from "@/constants/reception";
import type {
  ConstanteVitaleResume,
  FormulaireCliniqueMedecins,
  SilhouettePhysique,
} from "@/lib/medecins/types";

export const FORMULAIRE_VIDE: FormulaireCliniqueMedecins = {
  silhouette: null,
  antecedents: "",
  histoireMaladie: "",
  complementAnamnese: "",
  mensurations: "",
  etatGeneral: "",
  thoraxCoeur: "",
  thoraxPoumons: "",
  abdomen: "",
  membresInferieurs: "",
  autresPrecisions: "",
  diagnosticPresomption: "",
  diagnosticCertitude: "",
  drRef: "",
  telDr: "",
  cliniqueHopital: "",
  numeroRecu: "",
  signesVitaux: {},
};

const SILHOUETTES: { value: SilhouettePhysique; label: string }[] = [
  { value: "mince", label: "mince" },
  { value: "maigre", label: "maigre" },
  { value: "robuste", label: "robuste" },
  { value: "gros", label: "gros(se)" },
  { value: "athletique", label: "athlétique" },
];

const labelCls = CLASSE_LABEL_RECEPTION;
const inputCls = CLASSE_CHAMP_RECEPTION;
const areaCls = `${CLASSE_CHAMP_RECEPTION} min-h-[4.5rem] resize-y leading-relaxed`;
/** Trois espaces entre sections majeures */
const sectionGap = "space-y-12";

interface PropsIdentite {
  nom: string;
  age: string;
  sexe: string;
  date: string;
  telPat: string;
  numeroEnreg: string;
  lectureSeuleIdentite?: boolean;
  onChangeIdentite?: (champ: "nom" | "age" | "sexe" | "date" | "telPat" | "numeroEnreg", v: string) => void;
}

interface PropsFormulaire {
  formulaire: FormulaireCliniqueMedecins;
  onChange: (next: FormulaireCliniqueMedecins) => void;
  motif: string;
  onMotifChange: (v: string) => void;
  identite: PropsIdentite;
  desactive?: boolean;
}

function champ(
  form: FormulaireCliniqueMedecins,
  cle: keyof FormulaireCliniqueMedecins,
  valeur: string | SilhouettePhysique | null | undefined
): FormulaireCliniqueMedecins {
  return { ...form, [cle]: valeur };
}

export function FormulaireConsultationClinique({
  formulaire,
  onChange,
  motif,
  onMotifChange,
  identite,
  desactive,
}: PropsFormulaire) {
  const sv = formulaire.signesVitaux ?? {};

  const setSv = (patch: NonNullable<FormulaireCliniqueMedecins["signesVitaux"]>) => {
    onChange({
      ...formulaire,
      signesVitaux: { ...sv, ...patch },
    });
  };

  return (
    <div
      className={`${sectionGap} rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-6`}
    >
      <section className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-12">
          <div className="sm:col-span-5">
            <label className={labelCls}>NOM</label>
            <input
              className={inputCls}
              value={identite.nom}
              disabled={identite.lectureSeuleIdentite || desactive}
              onChange={(e) => identite.onChangeIdentite?.("nom", e.target.value)}
              readOnly={identite.lectureSeuleIdentite}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>AGE</label>
            <input
              className={inputCls}
              value={identite.age}
              disabled={identite.lectureSeuleIdentite || desactive}
              onChange={(e) => identite.onChangeIdentite?.("age", e.target.value)}
              readOnly={identite.lectureSeuleIdentite}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>SEX</label>
            <select
              className={inputCls}
              value={identite.sexe}
              disabled={identite.lectureSeuleIdentite || desactive}
              onChange={(e) => identite.onChangeIdentite?.("sexe", e.target.value)}
            >
              <option value="">--</option>
              <option value="M">M</option>
              <option value="F">F</option>
            </select>
          </div>
          <div className="sm:col-span-3">
            <label className={labelCls}>DATE</label>
            <input
              type="date"
              className={inputCls}
              value={identite.date}
              disabled={desactive}
              onChange={(e) => identite.onChangeIdentite?.("date", e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-12">
          <div className="sm:col-span-3">
            <label className={labelCls}>Dr Ref</label>
            <input
              className={inputCls}
              value={formulaire.drRef ?? ""}
              disabled={desactive}
              onChange={(e) => onChange(champ(formulaire, "drRef", e.target.value))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>TEL Dr</label>
            <input
              className={inputCls}
              value={formulaire.telDr ?? ""}
              disabled={desactive}
              onChange={(e) => onChange(champ(formulaire, "telDr", e.target.value))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>TEL Pat</label>
            <input
              className={inputCls}
              value={identite.telPat}
              disabled={identite.lectureSeuleIdentite || desactive}
              onChange={(e) =>
                identite.onChangeIdentite?.("telPat", e.target.value)
              }
              readOnly={identite.lectureSeuleIdentite}
            />
          </div>
          <div className="sm:col-span-3">
            <label className={labelCls}>Clinique/Hôpital</label>
            <input
              className={inputCls}
              value={formulaire.cliniqueHopital ?? ""}
              disabled={desactive}
              onChange={(e) =>
                onChange(champ(formulaire, "cliniqueHopital", e.target.value))
              }
            />
          </div>
          <div className="sm:col-span-1">
            <label className={labelCls}>N° REÇU</label>
            <input
              className={inputCls}
              value={formulaire.numeroRecu ?? ""}
              disabled={desactive}
              onChange={(e) =>
                onChange(champ(formulaire, "numeroRecu", e.target.value))
              }
            />
          </div>
          <div className="sm:col-span-1">
            <label className={labelCls}>N° ENREG</label>
            <input
              className={inputCls}
              value={identite.numeroEnreg}
              disabled={identite.lectureSeuleIdentite || desactive}
              readOnly={identite.lectureSeuleIdentite}
              onChange={(e) =>
                identite.onChangeIdentite?.("numeroEnreg", e.target.value)
              }
            />
          </div>
        </div>

        <div>
          <p className={`${labelCls} mb-2`}>Aspects physiques — silhouette</p>
          <div className="flex flex-wrap gap-3">
            {SILHOUETTES.map((s) => (
              <label
                key={s.value}
                className="inline-flex items-center gap-1.5 text-sm text-texte-principal"
              >
                <input
                  type="radio"
                  name="silhouette"
                  disabled={desactive}
                  checked={formulaire.silhouette === s.value}
                  onChange={() =>
                    onChange(champ(formulaire, "silhouette", s.value))
                  }
                />
                {s.label}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {(
            [
              ["tailleCm", "TAILLE (cm)"],
              ["poidsKg", "POIDS (kg)"],
              ["temperature", "TEMPERATURE (°C)"],
              ["frequenceCardiaque", "FC (bpm)"],
              ["tension", "TA (mmHg)"],
              ["saturationO2", "SAT (%)"],
            ] as const
          ).map(([key, label]) => {
            if (key === "tension") {
              return (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <div className="flex items-center gap-1">
                    <input
                      className={inputCls}
                      inputMode="numeric"
                      disabled={desactive}
                      placeholder="sys"
                      value={sv.tensionSystolique ?? ""}
                      onChange={(e) =>
                        setSv({
                          tensionSystolique: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                    />
                    <span className="text-texte-secondaire">/</span>
                    <input
                      className={inputCls}
                      inputMode="numeric"
                      disabled={desactive}
                      placeholder="dia"
                      value={sv.tensionDiastolique ?? ""}
                      onChange={(e) =>
                        setSv({
                          tensionDiastolique: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                    />
                  </div>
                </div>
              );
            }
            const val =
              key === "tailleCm"
                ? sv.tailleCm
                : key === "poidsKg"
                  ? sv.poidsKg
                  : key === "temperature"
                    ? sv.temperature
                    : key === "frequenceCardiaque"
                      ? sv.frequenceCardiaque
                      : sv.saturationO2;
            return (
              <div key={key}>
                <label className={labelCls}>{label}</label>
                <input
                  className={inputCls}
                  inputMode="decimal"
                  disabled={desactive}
                  value={val ?? ""}
                  onChange={(e) =>
                    setSv({
                      [key]: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-12">
        <div>
          <label className={labelCls}>Motif de votre consultation :</label>
          <textarea
            className={areaCls}
            disabled={desactive}
            value={motif}
            onChange={(e) => onMotifChange(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Antécédents :</label>
          <textarea
            className={areaCls}
            disabled={desactive}
            value={formulaire.antecedents ?? ""}
            onChange={(e) =>
              onChange(champ(formulaire, "antecedents", e.target.value))
            }
          />
        </div>
        <div>
          <label className={labelCls}>Histoire de la maladie :</label>
          <textarea
            className={areaCls}
            disabled={desactive}
            value={formulaire.histoireMaladie ?? ""}
            onChange={(e) =>
              onChange(champ(formulaire, "histoireMaladie", e.target.value))
            }
          />
        </div>
        <div>
          <label className={labelCls}>Complément d&apos;anamnèse :</label>
          <textarea
            className={areaCls}
            disabled={desactive}
            value={formulaire.complementAnamnese ?? ""}
            onChange={(e) =>
              onChange(champ(formulaire, "complementAnamnese", e.target.value))
            }
          />
        </div>
      </section>

      <section className="space-y-12">
        <h3 className="text-base font-bold uppercase tracking-wide text-texte-principal">
          Examens physique
        </h3>
        {(
          [
            ["mensurations", "Mensurations"],
            ["etatGeneral", "Etat général"],
            ["thoraxCoeur", "Thorax — cœur"],
            ["thoraxPoumons", "Thorax — poumons"],
            ["abdomen", "Abdomen"],
            ["membresInferieurs", "Membres Inferieur"],
            ["autresPrecisions", "Autres précisions"],
            ["diagnosticPresomption", "Diagnostic de présomption"],
            ["diagnosticCertitude", "Diagnostic de certitude"],
          ] as const
        ).map(([cle, label]) => (
          <div key={cle}>
            <label className={labelCls}>{label}</label>
            <textarea
              className={areaCls}
              disabled={desactive}
              value={(formulaire[cle] as string) ?? ""}
              onChange={(e) => onChange(champ(formulaire, cle, e.target.value))}
            />
          </div>
        ))}
      </section>

      <p className="border-t border-dotted border-gris-bordure pt-3 text-sm text-texte-principal">
        N&apos;oubliez pas d&apos;apporter tous documents médicaux que vous jugerez
        utiles pour le médecin.
      </p>
    </div>
  );
}

export function signesDepuisConstantes(
  c: ConstanteVitaleResume | null
): FormulaireCliniqueMedecins["signesVitaux"] {
  if (!c) return {};
  return {
    tailleCm: c.tailleCm,
    poidsKg: c.poidsKg,
    temperature: c.temperature,
    frequenceCardiaque: c.frequenceCardiaque,
    tensionSystolique: c.tensionSystolique,
    tensionDiastolique: c.tensionDiastolique,
    saturationO2: c.saturationO2,
  };
}

export function synthetiserChampsTexte(form: FormulaireCliniqueMedecins) {
  const anamnese = [
    form.antecedents && `Antécédents :\n${form.antecedents}`,
    form.histoireMaladie && `Histoire de la maladie :\n${form.histoireMaladie}`,
    form.complementAnamnese &&
      `Complément d'anamnèse :\n${form.complementAnamnese}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const examenClinique = [
    form.mensurations && `Mensurations : ${form.mensurations}`,
    form.etatGeneral && `État général : ${form.etatGeneral}`,
    form.thoraxCoeur && `Thorax — cœur : ${form.thoraxCoeur}`,
    form.thoraxPoumons && `Thorax — poumons : ${form.thoraxPoumons}`,
    form.abdomen && `Abdomen : ${form.abdomen}`,
    form.membresInferieurs && `Membres inférieurs : ${form.membresInferieurs}`,
    form.autresPrecisions && `Autres précisions : ${form.autresPrecisions}`,
    form.silhouette && `Silhouette : ${form.silhouette}`,
  ]
    .filter(Boolean)
    .join("\n");

  const conclusion = [
    form.diagnosticPresomption &&
      `Diagnostic de présomption : ${form.diagnosticPresomption}`,
    form.diagnosticCertitude &&
      `Diagnostic de certitude : ${form.diagnosticCertitude}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { anamnese, examenClinique, conclusion };
}
