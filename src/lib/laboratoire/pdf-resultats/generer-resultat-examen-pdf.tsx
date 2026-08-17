import "server-only";

import {
  DocumentResultatExamenPdf,
  DocumentResultatsMultiExamensPdf,
} from "@/lib/laboratoire/pdf-resultats/document-resultat-examen-pdf";
import {
  chargerDonneesResultatExamenPdf,
  chargerDonneesResultatsMultiExamensPdf,
} from "@/lib/laboratoire/pdf-resultats/charger-donnees-resultat-pdf";
import { nomFichierResultatPdf } from "@/lib/laboratoire/pdf-resultats/nom-fichier-resultat-pdf";
import { cheminsAssetsPdfServeur } from "@/lib/pdf/assets-pdf-serveur";
import { bufferDepuisDocumentPdf } from "@/lib/pdf/rendre-pdf-serveur";

export type PdfResultatExamenGenere = {
  buffer: Buffer;
  nomFichier: string;
};

export async function genererBufferPdfResultatExamen(
  dossierId: string,
  examenId: string,
  request?: Request
): Promise<PdfResultatExamenGenere | null> {
  const donnees = await chargerDonneesResultatExamenPdf(dossierId, examenId, request);
  if (!donnees) return null;

  const { logo, signature, avatarHomme, avatarFemme } = cheminsAssetsPdfServeur();

  const buffer = await bufferDepuisDocumentPdf(
    <DocumentResultatExamenPdf
      donnees={donnees}
      logoPath={logo}
      signaturePath={signature || undefined}
      avatarHomme={avatarHomme}
      avatarFemme={avatarFemme}
    />
  );

  return {
    buffer,
    nomFichier: nomFichierResultatPdf({
      numeroPatient: donnees.patient.numeroPatient,
      nbExamens: 1,
      nom: donnees.patient.nom,
      prenom: donnees.patient.prenom,
    }),
  };
}

export async function genererBufferPdfResultatsMultiExamens(
  dossierId: string,
  examenIds: string[],
  request?: Request
): Promise<PdfResultatExamenGenere | null> {
  const pages = await chargerDonneesResultatsMultiExamensPdf(
    dossierId,
    examenIds,
    request
  );
  if (!pages.length) return null;

  const { logo, signature, avatarHomme, avatarFemme } = cheminsAssetsPdfServeur();

  const buffer = await bufferDepuisDocumentPdf(
    <DocumentResultatsMultiExamensPdf
      pages={pages}
      logoPath={logo}
      signaturePath={signature || undefined}
      avatarHomme={avatarHomme}
      avatarFemme={avatarFemme}
    />
  );

  return {
    buffer,
    nomFichier: nomFichierResultatPdf({
      numeroPatient: pages[0]!.patient.numeroPatient,
      nbExamens: pages.length,
      nom: pages[0]!.patient.nom,
      prenom: pages[0]!.patient.prenom,
    }),
  };
}
