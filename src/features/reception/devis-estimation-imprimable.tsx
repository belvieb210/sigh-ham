"use client";

import { useTranslation } from "react-i18next";
import type { TypeExamenReception } from "@/lib/reception/types";

function formaterPrix(prix: number): string {
  return `$ ${prix.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

interface PropsDevisEstimationImprimable {
  examens: TypeExamenReception[];
  medecinResponsable: string;
  nomPatient: string;
  prenomPatient: string;
  numeroEnregistrement: string;
  dateEnregistrement: string;
  montantTotal: number;
}

export function DevisEstimationImprimable({
  examens,
  medecinResponsable,
  nomPatient,
  prenomPatient,
  numeroEnregistrement,
  dateEnregistrement,
  montantTotal,
}: PropsDevisEstimationImprimable) {
  const { t } = useTranslation();

  return (
    <div
      id="devis-estimation-imprimable"
      className="pointer-events-none fixed left-[-9999px] top-0 z-[-1] w-[210mm] bg-white p-10 text-black print:pointer-events-auto print:fixed print:inset-0 print:left-0 print:z-[9999] print:block print:overflow-visible"
      aria-hidden
    >
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #devis-estimation-imprimable,
          #devis-estimation-imprimable * { visibility: visible !important; }
          #devis-estimation-imprimable {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 2rem !important;
            background: white !important;
          }
        }
      `}</style>

      <header className="border-b-2 border-slate-800 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          HAM LABORATOIRE
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {t("reception.estimations.devisTitre")} — {t("reception.estimations.etapes.estimation")}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{dateEnregistrement}</p>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("reception.estimations.patient")}
          </p>
          <p className="mt-1 font-semibold text-slate-900">
            {prenomPatient} {nomPatient}
          </p>
          <p className="text-slate-600">{numeroEnregistrement}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("reception.formulaire.champs.medecinResponsable")}
          </p>
          <p className="mt-1 font-semibold text-slate-900">{medecinResponsable}</p>
        </div>
      </section>

      <table className="mt-8 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-300 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-4">{t("reception.examens.colonnes.code")}</th>
            <th className="py-2 pr-4">{t("reception.examens.colonnes.nom")}</th>
            <th className="py-2 pr-4">{t("reception.examens.colonnes.categorie")}</th>
            <th className="py-2 text-right">{t("reception.examens.colonnes.prix")}</th>
          </tr>
        </thead>
        <tbody>
          {examens.map((examen) => (
            <tr key={examen.id} className="border-b border-slate-200">
              <td className="py-2.5 pr-4 font-mono text-xs font-bold">{examen.code}</td>
              <td className="py-2.5 pr-4">{examen.libelle}</td>
              <td className="py-2.5 pr-4 text-slate-600">{examen.categorie}</td>
              <td className="py-2.5 text-right font-semibold">{formaterPrix(examen.prix)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="pt-4 text-right font-semibold text-slate-700">
              {t("reception.estimations.montantTotal")}
            </td>
            <td className="pt-4 text-right text-lg font-bold text-slate-900">
              {formaterPrix(montantTotal)}
            </td>
          </tr>
        </tfoot>
      </table>

      <p className="mt-10 border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-500">
        {t("reception.estimations.mentionLegale")}
      </p>
    </div>
  );
}
