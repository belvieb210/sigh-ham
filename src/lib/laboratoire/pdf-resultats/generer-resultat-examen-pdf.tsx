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
import {
  cheminsAssetsPdfServeur,
  enregistrerPolicesPdfServeur,
} from "@/lib/pdf/assets-pdf-serveur";

export async function genererBufferPdfResultatExamen(
  dossierId: string,
  examenId: string,
  request?: Request
): Promise<Buffer | null> {
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
  return Buffer.from(arrayBuffer);
}

export async function genererBufferPdfResultatsMultiExamens(
  dossierId: string,
  examenIds: string[],
  request?: Request
): Promise<Buffer | null> {
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
  return Buffer.from(arrayBuffer);
}
