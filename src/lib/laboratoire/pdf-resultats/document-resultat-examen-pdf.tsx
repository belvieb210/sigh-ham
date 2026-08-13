import { Document, Page } from "@react-pdf/renderer";
import {
  EnTeteResultatPdfServeur,
  PiedResultatPdfServeur,
} from "@/lib/laboratoire/pdf-resultats/composants/en-tete-resultat-pdf-serveur";
import { PagesAnnexeResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/annexe-resultat-pdf";
import { ContenuExamenResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/contenu-examen-resultat-pdf";
import { SignatureValidationPdf } from "@/lib/laboratoire/pdf-resultats/composants/sections-fin-resultat-pdf";
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
  const annexes = donnees.examen.piecesJointes ?? [];

  return (
    <Document>
      <Page size="A4" style={stylesResultatPdf.page}>
        <EnTeteResultatPdfServeur
          logoPath={logoPath}
          lignesBadge={["RAPPORT DE", "RÉSULTATS"]}
        />
        <ContenuExamenResultatPdf
          donnees={donnees}
          signaturePath={signaturePath}
          afficherSignature
        />
        <PiedResultatPdfServeur />
      </Page>
      <PagesAnnexeResultatPdf
        piecesJointes={annexes}
        libelleExamen={donnees.examen.libelle}
        logoPath={logoPath}
      />
    </Document>
  );
}

/** PDF multi-examens — signature unique en fin de document (port generateMultiExamPDF). */
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
      {pages.map((donnees) => {
        const annexes = donnees.examen.piecesJointes ?? [];
        const examenId = donnees.examen.examenId;
        return [
          <Page key={`${examenId}-corps`} size="A4" style={stylesResultatPdf.page}>
            <EnTeteResultatPdfServeur
              logoPath={logoPath}
              lignesBadge={["RAPPORT DE", "RÉSULTATS"]}
            />
            <ContenuExamenResultatPdf donnees={donnees} afficherSignature={false} />
            <PiedResultatPdfServeur />
          </Page>,
          <PagesAnnexeResultatPdf
            key={`${examenId}-annexes`}
            piecesJointes={annexes}
            libelleExamen={donnees.examen.libelle}
            logoPath={logoPath}
          />,
        ];
      })}
      <Page key="signature-finale" size="A4" style={stylesResultatPdf.page}>
        <EnTeteResultatPdfServeur
          logoPath={logoPath}
          lignesBadge={["RAPPORT DE", "RÉSULTATS"]}
        />
        <SignatureValidationPdf signaturePath={signaturePath} />
        <PiedResultatPdfServeur />
      </Page>
    </Document>
  );
}
