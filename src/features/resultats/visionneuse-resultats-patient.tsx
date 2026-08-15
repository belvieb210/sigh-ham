"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  Printer,
  ShieldCheck,
} from "lucide-react";
import type { ResultatPatientPublic } from "@/lib/resultats-public/types";
import { formaterMontantCaisse } from "@/features/caisse/utils-format";
import { useContenuResultats } from "@/hooks/use-contenu-resultats";

function formaterDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function VisionneuseResultatsPatient({
  resultat,
  onFermer,
}: {
  resultat: ResultatPatientPublic;
  onFermer: () => void;
}) {
  const { visionneuse } = useContenuResultats();
  const [chargement, setChargement] = useState(true);
  const [erreurPdf, setErreurPdf] = useState(false);

  const urlPdf = `/api/public/resultats/${encodeURIComponent(resultat.token)}/pdf`;
  const nomComplet = `${resultat.patient.prenom} ${resultat.patient.nom}`.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-texte-principal">
            {visionneuse.titre}
          </h2>
          <p className="mt-1 text-sm text-texte-secondaire">
            {resultat.nomFichier}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={urlPdf}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-gris-bordure bg-white px-3 py-2 text-xs font-semibold text-bleu-medical hover:bg-bleu-medical-clair/30"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {visionneuse.ouvrir}
          </a>
          <a
            href={urlPdf}
            download={resultat.nomFichier}
            className="inline-flex items-center gap-2 rounded-lg bg-bleu-medical px-3 py-2 text-xs font-semibold text-white hover:bg-bleu-medical/90"
          >
            <FileText className="h-3.5 w-3.5" />
            {visionneuse.telecharger}
          </a>
          <button
            type="button"
            onClick={onFermer}
            className="inline-flex items-center gap-2 rounded-lg border border-gris-bordure px-3 py-2 text-xs font-semibold text-texte-secondaire hover:bg-gris-tres-clair"
          >
            {visionneuse.fermer}
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-stretch">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gris-bordure px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="h-4 w-4 shrink-0 text-bleu-medical" />
              <span className="truncate text-xs font-bold uppercase tracking-widest text-texte-secondaire">
                {resultat.nomFichier}
              </span>
            </div>
          </div>
          <div className="relative min-h-[480px] flex-1 bg-slate-100">
            {chargement && !erreurPdf && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/80">
                <Loader2 className="h-6 w-6 animate-spin text-bleu-medical" />
                <p className="text-xs text-texte-secondaire">
                  {visionneuse.chargement}
                </p>
              </div>
            )}
            {erreurPdf ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
                <p className="text-xs text-red-600">{visionneuse.erreurPdf}</p>
                <a
                  href={urlPdf}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-bleu-medical px-3 py-2 text-xs font-semibold text-white"
                >
                  {visionneuse.ouvrirOnglet}
                </a>
              </div>
            ) : (
              <iframe
                key={urlPdf}
                title={resultat.nomFichier}
                src={urlPdf}
                className="absolute inset-0 h-full w-full border-0 bg-white"
                onLoad={() => setChargement(false)}
                onError={() => {
                  setChargement(false);
                  setErreurPdf(true);
                }}
              />
            )}
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
              {visionneuse.details}
            </h3>
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-texte-secondaire">{visionneuse.patient}</dt>
                <dd className="text-right font-semibold text-texte-principal">
                  {nomComplet}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-texte-secondaire">{visionneuse.numeroPatient}</dt>
                <dd className="font-mono font-medium text-bleu-medical">
                  {resultat.patient.numeroPatient}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-texte-secondaire">{visionneuse.facture}</dt>
                <dd className="font-mono font-medium text-texte-principal">
                  {resultat.facture.numeroFacture}
                </dd>
              </div>
              {resultat.prescripteur ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-texte-secondaire">{visionneuse.prescripteur}</dt>
                  <dd className="text-right font-medium text-texte-principal">
                    {resultat.prescripteur}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3">
                <dt className="text-texte-secondaire">{visionneuse.dateAnalyse}</dt>
                <dd className="font-medium text-texte-principal">
                  {formaterDate(resultat.dateAnalyse)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-texte-secondaire">{visionneuse.montant}</dt>
                <dd className="font-semibold text-texte-principal">
                  {formaterMontantCaisse(
                    resultat.facture.montantTotal,
                    resultat.facture.devise === "USD" ? "USD" : "CDF"
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-gris-bordure pt-2">
                <dt className="text-texte-secondaire">{visionneuse.statut}</dt>
                <dd>
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                    <ShieldCheck className="h-3 w-3" />
                    {visionneuse.statutApprouve}
                  </span>
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
              {visionneuse.examens}
            </h3>
            <ul className="space-y-2">
              {resultat.examens.map((ex) => (
                <li
                  key={ex.id}
                  className="flex items-start justify-between gap-2 rounded-lg bg-emerald-50/80 px-3 py-2 text-xs"
                >
                  <span className="font-medium text-texte-principal">
                    {ex.libelle}
                  </span>
                  <span className="shrink-0 text-texte-secondaire">
                    {formaterDate(ex.resultatLe)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {resultat.examensExclus.length > 0 ? (
            <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
              <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-amber-800">
                {visionneuse.examensExclus}
              </h3>
              <p className="mb-3 text-[11px] leading-relaxed text-amber-900/80">
                {visionneuse.examensExclusInfo}
              </p>
              <ul className="space-y-2">
                {resultat.examensExclus.map((ex) => (
                  <li
                    key={ex.libelle}
                    className="flex items-center gap-2 rounded-lg border border-amber-200/60 bg-white/80 px-3 py-2 text-xs text-amber-950"
                  >
                    <Clock className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                    <span className="font-medium">{ex.libelle}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
              {visionneuse.actions}
            </h3>
            <div className="space-y-2">
              <a
                href={urlPdf}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-between rounded-lg border border-gris-bordure px-3 py-2.5 text-xs font-medium text-texte-principal hover:bg-gris-tres-clair"
              >
                {visionneuse.ouvrirOnglet}
                <ExternalLink className="h-4 w-4 text-bleu-medical" />
              </a>
              <a
                href={urlPdf}
                download={resultat.nomFichier}
                className="flex w-full items-center justify-between rounded-lg border border-gris-bordure px-3 py-2.5 text-xs font-medium text-texte-principal hover:bg-gris-tres-clair"
              >
                {visionneuse.telecharger}
                <FileText className="h-4 w-4 text-bleu-medical" />
              </a>
              <button
                type="button"
                onClick={() => {
                  const f = document.querySelector<HTMLIFrameElement>(
                    `iframe[title="${resultat.nomFichier}"]`
                  );
                  f?.contentWindow?.print();
                }}
                className="flex w-full items-center justify-between rounded-lg border border-gris-bordure px-3 py-2.5 text-xs font-medium text-texte-principal hover:bg-gris-tres-clair"
              >
                {visionneuse.imprimer}
                <Printer className="h-4 w-4 text-bleu-medical" />
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-sky-200 bg-sky-50/80 p-4 text-xs leading-relaxed text-sky-900">
            {visionneuse.informations}
          </section>
        </aside>
      </div>
    </motion.div>
  );
}
