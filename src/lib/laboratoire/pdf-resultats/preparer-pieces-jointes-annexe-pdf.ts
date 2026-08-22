import "server-only";

import { existsSync } from "fs";
import { pdf } from "pdf-to-img";
import {
  estImageAffichablePdf,
  estPdfPieceJointe,
  resoudreCheminAbsoluFichierPdf,
  resoudreCheminFichierPdf,
} from "@/lib/laboratoire/pdf-resultats/resoudre-chemin-fichier-pdf";
import type { PageAnnexePieceJointePdf } from "@/lib/laboratoire/pdf-resultats/types";
import type { PieceJointeExamenPersistee } from "@/constants/laboratoire-notes-examen";

const MAX_PAGES_PDF = 5;

function bufferVersDataUrlPng(buffer: Buffer): string {
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

/** Convertit un PDF local en images PNG (data URLs) pour react-pdf. */
async function convertirPdfLocalEnImages(
  cheminAbsolu: string,
  maxPages = MAX_PAGES_PDF
): Promise<string[]> {
  if (!existsSync(cheminAbsolu)) return [];

  try {
    const document = await pdf(cheminAbsolu, { scale: 2 });
    const images: string[] = [];
    for await (const page of document) {
      if (images.length >= maxPages) break;
      images.push(bufferVersDataUrlPng(Buffer.from(page)));
    }
    return images;
  } catch (e) {
    console.error("[preparerPagesAnnexePiecesJointes] PDF", cheminAbsolu, e);
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
    const cheminAbsolu = resoudreCheminAbsoluFichierPdf(pj.url);
    const cheminAffichable = resoudreCheminFichierPdf(pj.url);

    if (estImageAffichablePdf(pj.mimeType) && cheminAffichable) {
      pages.push({
        nomFichier: pj.nom,
        libelle: pj.nom,
        cheminImage: cheminAffichable,
        integrable: true,
        mimeType: pj.mimeType,
      });
      continue;
    }

    if (estPdfPieceJointe(pj.mimeType, pj.nom) && cheminAbsolu) {
      const images = await convertirPdfLocalEnImages(cheminAbsolu);
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
      images.forEach((dataUrl, index) => {
        const pageNum = index + 1;
        pages.push({
          nomFichier: pj.nom,
          libelle: libellePage(pj.nom, pageNum, total),
          cheminImage: dataUrl,
          integrable: true,
          mimeType: pj.mimeType,
          page: total > 1 ? pageNum : undefined,
          totalPages: total > 1 ? total : undefined,
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
      messageErreur: cheminAbsolu
        ? `Format non intégrable au PDF (${pj.mimeType})`
        : "Fichier joint introuvable sur le serveur.",
    });
  }

  return pages;
}
