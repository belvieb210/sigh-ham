"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ExternalLink, FileText, Loader2 } from "lucide-react";

export function ApercuFacturePharmaciePanneau({
  venteId,
}: {
  venteId: string | null;
}) {
  const { t } = useTranslation();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(false);

  const urlPdf = venteId
    ? `/api/pharmacie/ventes/${encodeURIComponent(venteId)}/facture-pdf`
    : null;

  useEffect(() => {
    if (!urlPdf) {
      setChargement(false);
      setErreur(false);
      return;
    }
    setChargement(true);
    setErreur(false);
  }, [urlPdf]);

  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-gris-bordure px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-bleu-medical" />
          <h2 className="truncate text-xs font-bold uppercase tracking-widest text-texte-secondaire">
            {t("pharmacie.paiementsValides.apercuFacture")}
          </h2>
        </div>
        {urlPdf && (
          <a
            href={urlPdf}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-gris-bordure px-2 py-1 text-[10px] font-semibold text-bleu-medical hover:bg-bleu-medical-clair/30"
          >
            <ExternalLink className="h-3 w-3" />
            {t("pharmacie.paiementsValides.ouvrirFacture")}
          </a>
        )}
      </div>

      {!urlPdf ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center gap-2 px-4 py-10 text-center">
          <FileText className="h-10 w-10 text-slate-300" />
          <p className="text-xs text-texte-secondaire">
            {t("pharmacie.paiementsValides.selectionnerListe")}
          </p>
        </div>
      ) : (
        <div className="relative min-h-[420px] flex-1 bg-slate-100">
          {chargement && !erreur && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/80">
              <Loader2 className="h-6 w-6 animate-spin text-bleu-medical" />
              <p className="text-xs text-texte-secondaire">
                {t("pharmacie.paiementsValides.chargementFacture")}
              </p>
            </div>
          )}
          {erreur ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 px-4 text-center">
              <p className="text-xs text-red-600">
                {t("pharmacie.paiementsValides.erreurFacture")}
              </p>
              <a
                href={urlPdf}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-bleu-medical px-3 py-2 text-xs font-semibold text-white"
              >
                {t("pharmacie.paiementsValides.ouvrirFacture")}
              </a>
            </div>
          ) : (
            <iframe
              key={urlPdf}
              title={t("pharmacie.paiementsValides.apercuFacture")}
              src={urlPdf}
              className="h-[min(72vh,640px)] w-full border-0 bg-white"
              onLoad={() => setChargement(false)}
              onError={() => {
                setChargement(false);
                setErreur(true);
              }}
            />
          )}
        </div>
      )}
    </section>
  );
}
