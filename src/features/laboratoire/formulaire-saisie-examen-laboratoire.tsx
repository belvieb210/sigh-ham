"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Activity,
  CloudUpload,
  Eye,
  Info,
  LineChart,
  Plus,
  TestTube2,
  Wand2,
  X,
} from "lucide-react";
import type { SaisieResultatsDto } from "@/lib/laboratoire/saisie-resultats-types";
import {
  COULEURS_INDICATEUR,
  evaluerIndicateur,
  formaterParametre,
} from "@/features/laboratoire/utils-saisie-resultats";
import { cn } from "@/lib/utils";

const MAX_REMARQUE = 500;
const MAX_FICHIER_OCTETS = 5 * 1024 * 1024;

export type ParametreEtat = {
  id: string;
  nom: string;
  unite: string | null;
  rangeUsuelle: string | null;
  obligatoire: boolean;
  ordre: number;
  valeur: string;
  nonRequis: boolean;
  personnalise?: boolean;
};

export type EtatExamenForm = {
  id: string;
  code: string;
  libelle: string;
  categorie: string;
  prix: number;
  remarque: string;
  parametres: ParametreEtat[];
};

type FichierJoint = {
  id: string;
  nom: string;
  file: File;
};

interface PropsFormulaireSaisieExamenLaboratoire {
  examen: EtatExamenForm;
  patient: Omit<SaisieResultatsDto, "examens">;
  fichiers: FichierJoint[];
  sauvegardeEnCours: boolean;
  onParametreChange: (
    parametreId: string,
    patch: Partial<Pick<ParametreEtat, "valeur" | "nonRequis" | "nom">>
  ) => void;
  onRemarqueChange: (remarque: string) => void;
  onAjouterParametre: () => void;
  onSupprimerParametre: (parametreId: string) => void;
  onFichiersAjoutes: (files: File[]) => void;
  onFichierRetire: (fichierId: string) => void;
  onAnnuler: () => void;
  onBrouillon: () => void;
  onValider: () => void;
}

function genererIdFichier() {
  return `f-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function IndicateurDot({ statut }: { statut: ReturnType<typeof evaluerIndicateur> }) {
  const styles = COULEURS_INDICATEUR[statut];
  return (
    <span
      className={cn(
        "inline-block h-2.5 w-2.5 shrink-0 rounded-full",
        styles.dot,
        statut === "vide" && "h-2.5 w-2.5"
      )}
      title={statut}
    />
  );
}

function LegendeItem({
  couleur,
  label,
}: {
  couleur: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
      <span className={cn("h-2 w-2 rounded-full", couleur)} />
      {label}
    </span>
  );
}

export function FormulaireSaisieExamenLaboratoire({
  examen,
  patient,
  fichiers,
  sauvegardeEnCours,
  onParametreChange,
  onRemarqueChange,
  onAjouterParametre,
  onSupprimerParametre,
  onFichiersAjoutes,
  onFichierRetire,
  onAnnuler,
  onBrouillon,
  onValider,
}: PropsFormulaireSaisieExamenLaboratoire) {
  const { t } = useTranslation();
  const router = useRouter();
  const inputFichierRef = useRef<HTMLInputElement>(null);
  const [glisserActif, setGlisserActif] = useState(false);

  const traiterFichiers = (liste: FileList | File[]) => {
    const valides = Array.from(liste).filter((f) => f.size <= MAX_FICHIER_OCTETS);
    if (valides.length > 0) onFichiersAjoutes(valides);
  };

  const apercuLignes = examen.parametres.map((p) => {
    const { acronyme } = formaterParametre(p.nom);
    const afficher =
      p.nonRequis ? "NR" : p.valeur.trim() ? p.valeur.trim() : "—";
    return { id: p.id, acronyme, afficher, nonRequis: p.nonRequis };
  });

  return (
    <div className="grid min-h-[560px] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px]">
      {/* Colonne principale — formulaire */}
      <div className="min-w-0 bg-white p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
              <TestTube2 className="h-5 w-5" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {t("laboratoire.saisieResultats.parametresDe", {
                examen: examen.libelle,
              })}
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <LegendeItem couleur="bg-sky-500" label={t("laboratoire.saisieResultats.legendeBas")} />
            <LegendeItem couleur="bg-emerald-500" label={t("laboratoire.saisieResultats.legendeNormal")} />
            <LegendeItem couleur="bg-rose-500" label={t("laboratoire.saisieResultats.legendeEleve")} />
            <LegendeItem couleur="bg-slate-300" label={t("laboratoire.saisieResultats.legendeNonRequis")} />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">{t("laboratoire.saisieResultats.colParametre")}</th>
                <th className="px-3 py-3">{t("laboratoire.saisieResultats.colResultat")}</th>
                <th className="px-3 py-3">{t("laboratoire.saisieResultats.colUnite")}</th>
                <th className="px-3 py-3">{t("laboratoire.saisieResultats.colValeursReference")}</th>
                <th className="px-3 py-3 text-center">{t("laboratoire.saisieResultats.colIndicateur")}</th>
                <th className="px-3 py-3 text-center">NR</th>
                <th className="w-10 px-2 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {examen.parametres.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    {t("laboratoire.saisieResultats.aucunParametre")}
                  </td>
                </tr>
              ) : (
                examen.parametres.map((p) => {
                  const { acronyme, libelle } = formaterParametre(p.nom);
                  const statut = evaluerIndicateur(p.valeur, p.rangeUsuelle, p.nonRequis);
                  const styles = COULEURS_INDICATEUR[statut];

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900">{acronyme}</p>
                        {libelle && libelle !== acronyme && (
                          <p className="text-xs text-slate-500">{libelle}</p>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={p.valeur}
                          disabled={p.nonRequis}
                          placeholder={t("laboratoire.saisieResultats.placeholderResultat")}
                          onChange={(e) =>
                            onParametreChange(p.id, { valeur: e.target.value })
                          }
                          className={cn(
                            "w-full min-w-[120px] rounded-lg border px-3 py-2 text-sm outline-none ring-0 transition-colors focus:ring-2",
                            styles.input
                          )}
                        />
                      </td>
                      <td className="px-3 py-3 text-slate-600">{p.unite ?? "—"}</td>
                      <td className="px-3 py-3 text-slate-600">{p.rangeUsuelle ?? "—"}</td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex justify-center">
                          <IndicateurDot statut={statut} />
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={p.nonRequis}
                          onChange={(e) =>
                            onParametreChange(p.id, { nonRequis: e.target.checked })
                          }
                          className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                          title={t("laboratoire.saisieResultats.nonRequis")}
                        />
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => onParametreChange(p.id, { valeur: "" })}
                            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            aria-label={t("laboratoire.saisieResultats.effacerValeur")}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            className="rounded p-1 text-slate-400 hover:bg-violet-50 hover:text-violet-600"
                            aria-label={t("laboratoire.saisieResultats.historique")}
                          >
                            <LineChart className="h-3.5 w-3.5" />
                          </button>
                          {p.personnalise && (
                            <button
                              type="button"
                              onClick={() => onSupprimerParametre(p.id)}
                              className="rounded p-1 text-slate-400 hover:text-red-600"
                              aria-label={t("laboratoire.saisieResultats.supprimerParametre")}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={onAjouterParametre}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-200 py-3 text-sm font-medium text-violet-700 transition-colors hover:border-violet-300 hover:bg-violet-50/50"
        >
          <Plus className="h-4 w-4" />
          {t("laboratoire.saisieResultats.ajouterParametrePerso")}
        </button>

        <div className="mt-6">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Info className="h-4 w-4 text-violet-600" />
            {t("laboratoire.saisieResultats.observations")}
          </label>
          <textarea
            value={examen.remarque}
            maxLength={MAX_REMARQUE}
            onChange={(e) => onRemarqueChange(e.target.value.slice(0, MAX_REMARQUE))}
            rows={4}
            placeholder={t("laboratoire.saisieResultats.observationsPlaceholder")}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
          <p className="mt-1 text-right text-xs text-slate-400">
            {examen.remarque.length} / {MAX_REMARQUE}
          </p>
        </div>

        <div className="mt-6">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <CloudUpload className="h-4 w-4 text-violet-600" />
            {t("laboratoire.saisieResultats.piecesJointes")}
          </label>
          <input
            ref={inputFichierRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf,image/*,application/pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) traiterFichiers(e.target.files);
              e.target.value = "";
            }}
          />
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputFichierRef.current?.click();
            }}
            onClick={() => inputFichierRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setGlisserActif(true);
            }}
            onDragLeave={() => setGlisserActif(false)}
            onDrop={(e) => {
              e.preventDefault();
              setGlisserActif(false);
              if (e.dataTransfer.files.length) traiterFichiers(e.dataTransfer.files);
            }}
            className={cn(
              "cursor-pointer rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
              glisserActif
                ? "border-violet-400 bg-violet-50"
                : "border-slate-200 bg-slate-50/50 hover:border-violet-300 hover:bg-violet-50/30"
            )}
          >
            <CloudUpload className="mx-auto mb-2 h-8 w-8 text-violet-400" />
            <p className="text-sm font-medium text-slate-700">
              {t("laboratoire.saisieResultats.glisserDeposer")}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {t("laboratoire.saisieResultats.formatsAcceptes")}
            </p>
          </div>
          {fichiers.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {fichiers.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                >
                  <span className="min-w-0 truncate text-slate-700">{f.nom}</span>
                  <button
                    type="button"
                    onClick={() => onFichierRetire(f.id)}
                    className="ml-2 shrink-0 text-red-600 hover:underline"
                  >
                    {t("laboratoire.saisieResultats.supprimerFichier")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={onAnnuler}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {t("laboratoire.saisieResultats.annuler")}
          </button>
          <button
            type="button"
            disabled={sauvegardeEnCours}
            onClick={onBrouillon}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-300 px-5 py-2.5 text-sm font-medium text-violet-700 hover:bg-violet-50 disabled:opacity-50"
          >
            <Wand2 className="h-4 w-4" />
            {t("laboratoire.saisieResultats.enregistrerBrouillon")}
          </button>
          <button
            type="button"
            disabled={sauvegardeEnCours}
            onClick={onValider}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50"
          >
            <Activity className="h-4 w-4" />
            {t("laboratoire.saisieResultats.validerResultats")}
          </button>
        </div>
      </div>

      {/* Colonne droite — patient + aide + aperçu */}
      <aside className="min-w-0 space-y-4 border-t border-slate-200 bg-slate-50/80 p-4 xl:border-l xl:border-t-0">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
            {t("laboratoire.saisieResultats.infosPatient")}
          </h4>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-xs text-slate-500">{t("laboratoire.saisieResultats.nomComplet")}</dt>
              <dd className="font-semibold text-slate-900">
                {patient.nom.toUpperCase()} {patient.prenom}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{t("laboratoire.saisieResultats.ageSexe")}</dt>
              <dd className="text-slate-800">
                {patient.age != null ? `${patient.age} ans` : "—"}
                {patient.sexe ? ` / ${patient.sexe}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{t("laboratoire.saisieResultats.numeroDossier")}</dt>
              <dd className="font-mono text-slate-800">{patient.numeroEnregistrement}</dd>
            </div>
            {patient.numeroTransfert && (
              <div>
                <dt className="text-xs text-slate-500">{t("laboratoire.saisieResultats.numeroDemande")}</dt>
                <dd className="font-mono text-slate-800">{patient.numeroTransfert}</dd>
              </div>
            )}
          </dl>
          <button
            type="button"
            onClick={() => router.push(`/sigh/laboratoire/patients?dossier=${patient.dossierId}`)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Eye className="h-3.5 w-3.5" />
            {t("laboratoire.saisieResultats.voirDossierComplet")}
          </button>
        </section>

        <section className="rounded-xl border border-violet-100 bg-violet-50/60 p-4">
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-violet-800">
            <Info className="h-3.5 w-3.5" />
            {t("laboratoire.saisieResultats.aideInterpretation")}
          </h4>
          <ul className="space-y-1.5 text-xs text-violet-900/80">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              {t("laboratoire.saisieResultats.aideBas")}
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t("laboratoire.saisieResultats.aideNormal")}
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              {t("laboratoire.saisieResultats.aideEleve")}
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              {t("laboratoire.saisieResultats.aideNr")}
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
            {t("laboratoire.saisieResultats.apercuResultats")}
          </h4>
          <p className="mb-3 border-b border-slate-100 pb-2 text-sm font-bold uppercase text-slate-800">
            {examen.libelle}
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            {apercuLignes.map((l) => (
              <div key={l.id} className="contents">
                <span className="font-semibold text-slate-700">{l.acronyme}</span>
                <span
                  className={cn(
                    "text-right font-medium",
                    l.nonRequis ? "text-slate-400" : "text-slate-900"
                  )}
                >
                  : {l.afficher}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="text-xs font-bold uppercase text-slate-500">
              {t("laboratoire.saisieResultats.remarque")}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {examen.remarque.trim() ||
                t("laboratoire.saisieResultats.aucuneRemarque")}
            </p>
          </div>
        </section>
      </aside>
    </div>
  );
}

export { genererIdFichier };
