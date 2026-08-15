import "server-only";

import { pdf } from "@react-pdf/renderer";
import {
  DocumentResultatExamenPdf,
  DocumentResultatsMultiExamensPdf,
} from "@/lib/laboratoire/pdf-resultats/document-resultat-examen-pdf";
import {
  chargerDonneesResultatExamenPdf,
  chargerDonneesResultatsMultiExamensPdf,
} from "@/lib/laboratoire/pdf-resultats/charger-donnees-resultat-pdf";
import { nomFichierResultatPdf } from "@/lib/laboratoire/pdf-resultats/nom-fichier-resultat-pdf";
import {
  cheminsAssetsPdfServeur,
  enregistrerPolicesPdfServeur,
} from "@/lib/pdf/assets-pdf-serveur";

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

  enregistrerPolicesPdfServeur();
  const { logo, signature, avatarHomme, avatarFemme } = cheminsAssetsPdfServeur();

  const instance = pdf(
    <DocumentResultatExamenPdf
      donnees={donnees}
      logoPath={logo}
      signaturePath={signature}
      avatarHomme={avatarHomme}
      avatarFemme={avatarFemme}
    />
  );

  const blob = await instance.toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
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

  enregistrerPolicesPdfServeur();
  const { logo, signature, avatarHomme, avatarFemme } = cheminsAssetsPdfServeur();

  const instance = pdf(
    <DocumentResultatsMultiExamensPdf
      pages={pages}
      logoPath={logo}
      signaturePath={signature}
      avatarHomme={avatarHomme}
      avatarFemme={avatarFemme}
    />
  );

  const blob = await instance.toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    nomFichier: nomFichierResultatPdf({
      numeroPatient: pages[0]!.patient.numeroPatient,
      nbExamens: pages.length,
      nom: pages[0]!.patient.nom,
      prenom: pages[0]!.patient.prenom,
    }),
  };
}
