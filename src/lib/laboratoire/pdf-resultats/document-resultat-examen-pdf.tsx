import { Document, Page } from "@react-pdf/renderer";
import {
  EnTeteResultatPdfServeur,
  PiedResultatPdfServeur,
} from "@/lib/laboratoire/pdf-resultats/composants/en-tete-resultat-pdf-serveur";
import { ContenuExamenResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/contenu-examen-resultat-pdf";
import { stylesResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/styles-resultat-pdf";
import type { DonneesResultatExamenPdf } from "@/lib/laboratoire/pdf-resultats/types";

export function DocumentResultatExamenPdf({
  donnees,
  logoPath,
  signaturePath,
}: {
  donnees: DonneesResultatExamenPdf;
  logoPath: string;
  signaturePath?: string;
}) {
  return (
    <Document>
      <Page size="A4" style={stylesResultatPdf.page}>
        <EnTeteResultatPdfServeur
          logoPath={logoPath}
          lignesBadge={["RAPPORT DE", "RÉSULTATS"]}
        />
        <ContenuExamenResultatPdf donnees={donnees} signaturePath={signaturePath} />
        <PiedResultatPdfServeur />
      </Page>
    </Document>
  );
}

/** PDF multi-examens (port generateMultiExamPDF) — une page par examen. */
export function DocumentResultatsMultiExamensPdf({
  pages,
  logoPath,
  signaturePath,
}: {
  pages: DonneesResultatExamenPdf[];
  logoPath: string;
  signaturePath?: string;
}) {
  return (
    <Document>
      {pages.map((donnees) => (
        <Page key={donnees.examen.examenId} size="A4" style={stylesResultatPdf.page}>
          <EnTeteResultatPdfServeur
            logoPath={logoPath}
            lignesBadge={["RAPPORT DE", "RÉSULTATS"]}
          />
          <ContenuExamenResultatPdf
            donnees={donnees}
            signaturePath={signaturePath}
          />
          <PiedResultatPdfServeur />
        </Page>
      ))}
    </Document>
  );
}
