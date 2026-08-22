import "server-only";

import { existsSync, readFileSync } from "fs";
import {
  calculerDimensionsAffichageAnnexe,
  lireDimensionsImageBuffer,
} from "@/lib/laboratoire/pdf-resultats/dimensions-affichage-annexe-pdf";
import {
  estImageAffichablePdf,
  estPdfPieceJointe,
  resoudreCheminAbsoluFichierPdf,
  resoudreCheminFichierPdf,
} from "@/lib/laboratoire/pdf-resultats/resoudre-chemin-fichier-pdf";
import type { PageAnnexePieceJointePdf } from "@/lib/laboratoire/pdf-resultats/types";
import type { PieceJointeExamenPersistee } from "@/constants/laboratoire-notes-examen";

const MAX_PAGES_PDF = 5;
const ECHELLE_CONVERSION_PDF = 2.5;

function bufferVersDataUrlPng(buffer: Buffer): string {
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

function dimensionsDepuisBufferImage(
  buffer: Buffer,
  mimeType: string
): { largeurAffichage: number; hauteurAffichage: number } {
  const intrinseque = lireDimensionsImageBuffer(buffer, mimeType);
  if (!intrinseque) {
    return calculerDimensionsAffichageAnnexe(1, 1.414);
  }
  return calculerDimensionsAffichageAnnexe(intrinseque.width, intrinseque.height);
}

/** Lit le fichier joint depuis le disque local ou une URL HTTP(S) (MinIO, etc.). */
async function chargerBufferPieceJointe(url: string): Promise<Buffer | null> {
  const absolu = resoudreCheminAbsoluFichierPdf(url);
  if (absolu && existsSync(absolu)) {
    return readFileSync(absolu);
  }

  const brut = url.trim();
  if (/^https?:\/\//i.test(brut)) {
    try {
      const res = await fetch(brut);
      if (res.ok) return Buffer.from(await res.arrayBuffer());
      console.error(
        "[preparerPagesAnnexePiecesJointes] HTTP",
        brut,
        res.status,
        res.statusText
      );
    } catch (e) {
      console.error("[preparerPagesAnnexePiecesJointes] fetch", brut, e);
    }
  }

  return null;
}

type PageImageAnnexe = {
  cheminImage: string;
  largeurAffichage: number;
  hauteurAffichage: number;
};

/** Convertit un buffer PDF en images PNG (data URLs) pour react-pdf. */
async function convertirPdfBufferEnImages(
  buffer: Buffer,
  maxPages = MAX_PAGES_PDF
): Promise<PageImageAnnexe[]> {
  try {
    const { pdf } = await import("pdf-to-img");
    const document = await pdf(buffer, { scale: ECHELLE_CONVERSION_PDF });
    const pages: PageImageAnnexe[] = [];
    for await (const page of document) {
      if (pages.length >= maxPages) break;
      const png = Buffer.from(page);
      const { largeurAffichage, hauteurAffichage } = dimensionsDepuisBufferImage(
        png,
        "image/png"
      );
      pages.push({
        cheminImage: bufferVersDataUrlPng(png),
        largeurAffichage,
        hauteurAffichage,
      });
    }
    await document.destroy?.();
    return pages;
  } catch (e) {
    console.error("[preparerPagesAnnexePiecesJointes] conversion PDF", e);
    return [];
  }
}

function libellePage(nom: string, page?: number, totalPages?: number): string {
  if (page != null && totalPages != null && totalPages > 1) {
    return `${nom} (page ${page}/${totalPages})`;
  }
  return nom;
}

/**
 * Prépare les pages annexe affichables (images directes + pages PDF converties).
 * Les pièces non supportées restent listées avec `integrable: false`.
 */
export async function preparerPagesAnnexePiecesJointes(
  pieces: PieceJointeExamenPersistee[]
): Promise<PageAnnexePieceJointePdf[]> {
  const pages: PageAnnexePieceJointePdf[] = [];

  for (const pj of pieces) {
    const cheminAffichable = resoudreCheminFichierPdf(pj.url);

    if (estImageAffichablePdf(pj.mimeType) && cheminAffichable) {
      const buffer = await chargerBufferPieceJointe(pj.url);
      const { largeurAffichage, hauteurAffichage } = buffer
        ? dimensionsDepuisBufferImage(buffer, pj.mimeType)
        : calculerDimensionsAffichageAnnexe(1, 1.414);

      pages.push({
        nomFichier: pj.nom,
        libelle: pj.nom,
        cheminImage: cheminAffichable,
        integrable: true,
        mimeType: pj.mimeType,
        largeurAffichage,
        hauteurAffichage,
      });
      continue;
    }

    if (estPdfPieceJointe(pj.mimeType, pj.nom)) {
      const buffer = await chargerBufferPieceJointe(pj.url);
      if (!buffer) {
        pages.push({
          nomFichier: pj.nom,
          libelle: pj.nom,
          cheminImage: null,
          integrable: false,
          mimeType: pj.mimeType,
          messageErreur: "Fichier joint introuvable sur le serveur.",
        });
        continue;
      }

      const images = await convertirPdfBufferEnImages(buffer);
      if (images.length === 0) {
        pages.push({
          nomFichier: pj.nom,
          libelle: pj.nom,
          cheminImage: null,
          integrable: false,
          mimeType: pj.mimeType,
          messageErreur: "Impossible de convertir le PDF joint pour l'affichage.",
        });
        continue;
      }

      const total = images.length;
      images.forEach((img, index) => {
        const pageNum = index + 1;
        pages.push({
          nomFichier: pj.nom,
          libelle: libellePage(pj.nom, pageNum, total),
          cheminImage: img.cheminImage,
          integrable: true,
          mimeType: pj.mimeType,
          page: total > 1 ? pageNum : undefined,
          totalPages: total > 1 ? total : undefined,
          largeurAffichage: img.largeurAffichage,
          hauteurAffichage: img.hauteurAffichage,
        });
      });
      continue;
    }

    pages.push({
      nomFichier: pj.nom,
      libelle: pj.nom,
      cheminImage: null,
      integrable: false,
      mimeType: pj.mimeType,
      messageErreur: `Format non intégrable au PDF (${pj.mimeType})`,
    });
  }

  return pages;
}
