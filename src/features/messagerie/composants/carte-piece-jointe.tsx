"use client";

import { Download, FileText, Image as ImageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  estImageMime,
  estPdfMime,
  formaterTailleFichier,
} from "@/features/messagerie/utilitaires-messagerie";
import { cn } from "@/lib/utils";

interface PieceJointe {
  id: string;
  nom: string;
  url: string;
  mimeType: string;
  taille: number;
}

interface PropsCartePieceJointe {
  piece: PieceJointe;
  estMoi?: boolean;
}

export function CartePieceJointe({ piece, estMoi = false }: PropsCartePieceJointe) {
  const { t } = useTranslation();
  const estImage = estImageMime(piece.mimeType);
  const estPdf = estPdfMime(piece.mimeType);

  if (estImage) {
    return (
      <a
        href={piece.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block overflow-hidden rounded-xl border border-gris-bordure/80"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={piece.url}
          alt={piece.nom}
          className="max-h-48 w-full object-cover"
        />
      </a>
    );
  }

  return (
    <a
      href={piece.url}
      target="_blank"
      rel="noopener noreferrer"
      download
      className={cn(
        "mt-2 flex items-center gap-3 rounded-xl border px-3 py-2.5 transition hover:opacity-90",
        estMoi
          ? "border-white/20 bg-white/10 text-white"
          : "border-gris-bordure bg-gris-tres-clair text-texte-principal"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          estPdf ? "bg-red-100 text-red-600" : "bg-bleu-medical-clair text-bleu-medical"
        )}
      >
        {estPdf ? <FileText className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{piece.nom}</p>
        <p
          className={cn(
            "text-[11px]",
            estMoi ? "text-white/70" : "text-texte-secondaire"
          )}
        >
          {estPdf ? "PDF" : piece.mimeType.split("/").pop()?.toUpperCase()} ·{" "}
          {formaterTailleFichier(piece.taille)}
        </p>
      </div>
      <Download className="h-4 w-4 shrink-0 opacity-60" aria-label={t("reception.messagerie.pro.telecharger")} />
    </a>
  );
}
