"use client";

import { useEffect, useState } from "react";
import { File, FileText, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  estImageFichier,
  estPdfFichier,
  formaterTailleFichier,
  mimeTypeFichier,
} from "@/features/messagerie/utilitaires-messagerie";
import { cn } from "@/lib/utils";

interface PropsApercuPiecesJointesBrouillon {
  fichiers: File[];
  onRetirer: (index: number) => void;
}

export function ApercuPiecesJointesBrouillon({
  fichiers,
  onRetirer,
}: PropsApercuPiecesJointesBrouillon) {
  const { t } = useTranslation();
  const [urlsApercu, setUrlsApercu] = useState<(string | null)[]>([]);

  useEffect(() => {
    const urls = fichiers.map((f) =>
      estImageFichier(f) ? URL.createObjectURL(f) : null
    );
    setUrlsApercu(urls);
    return () => {
      urls.forEach((u) => {
        if (u) URL.revokeObjectURL(u);
      });
    };
  }, [fichiers]);

  if (fichiers.length === 0) return null;

  return (
    <div className="mb-2 rounded-xl border border-gris-bordure bg-[#f1f5f9] p-2">
      <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-texte-secondaire">
        {t("reception.messagerie.piecesJointes.compteur", { count: fichiers.length })}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {fichiers.map((fichier, index) => {
          const estImage = estImageFichier(fichier);
          const estPdf = estPdfFichier(fichier);
          const url = urlsApercu[index];
          const libelleRetirer = t("reception.messagerie.piecesJointes.retirer", {
            nom: fichier.name,
          });

          return (
            <div
              key={`${fichier.name}-${fichier.size}-${index}`}
              className="relative shrink-0"
            >
              {estImage && url ? (
                <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={fichier.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-20 w-36 flex-col justify-between rounded-xl border border-gris-bordure bg-white p-2 shadow-sm">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      estPdf
                        ? "bg-red-100 text-red-600"
                        : "bg-bleu-medical-clair text-bleu-medical"
                    )}
                  >
                    {estPdf ? (
                      <FileText className="h-4 w-4" />
                    ) : (
                      <File className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-texte-principal">
                      {fichier.name}
                    </p>
                    <p className="text-[10px] text-texte-secondaire">
                      {estPdf ? "PDF" : mimeTypeFichier(fichier).split("/").pop()?.toUpperCase()} ·{" "}
                      {formaterTailleFichier(fichier.size)}
                    </p>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => onRetirer(index)}
                aria-label={libelleRetirer}
                title={libelleRetirer}
                className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-white bg-slate-700 text-white shadow-md transition hover:bg-slate-900"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
