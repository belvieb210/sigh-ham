import { Document, Page, View } from "@react-pdf/renderer";
import { EnteteFixePageResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/entete-fixe-resultat-pdf";
import {
  PiedResultatPdfServeur,
} from "@/lib/laboratoire/pdf-resultats/composants/en-tete-resultat-pdf-serveur";
import { PagesAnnexeResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/annexe-resultat-pdf";
import { ContenuExamenResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/contenu-examen-resultat-pdf";
import { SignatureValidationPdf } from "@/lib/laboratoire/pdf-resultats/composants/sections-fin-resultat-pdf";
import { stylesResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/styles-resultat-pdf";
import type { DonneesResultatExamenPdf } from "@/lib/laboratoire/pdf-resultats/types";

type PropsAssetsPdf = {
  logoPath: string;
  signaturePath?: string;
  avatarHomme: string;
  avatarFemme: string;
};

export function DocumentResultatExamenPdf({
  donnees,
  logoPath,
  signaturePath,
  avatarHomme,
  avatarFemme,
}: PropsAssetsPdf & {
  donnees: DonneesResultatExamenPdf;
}) {
  const annexes = donnees.examen.piecesJointes ?? [];

  return (
    <Document>
      <Page size="A4" style={stylesResultatPdf.page} wrap>
        <EnteteFixePageResultatPdf
          logoPath={logoPath}
          patient={donnees.patient}
          examen={donnees.examen}
          avatarHomme={avatarHomme}
          avatarFemme={avatarFemme}
        />
        <ContenuExamenResultatPdf
          donnees={donnees}
          signaturePath={signaturePath}
          afficherSignature
          afficherBandeau={false}
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

/** PDF multi-examens — examens à la suite, signature + légende en fin de document. */
export function DocumentResultatsMultiExamensPdf({
  pages,
  logoPath,
  signaturePath,
  avatarHomme,
  avatarFemme,
}: PropsAssetsPdf & {
  pages: DonneesResultatExamenPdf[];
}) {
  if (!pages.length) return null;

  const premier = pages[0]!;

  return (
    <Document>
      <Page size="A4" style={stylesResultatPdf.page} wrap>
        <EnteteFixePageResultatPdf
          logoPath={logoPath}
          patient={premier.patient}
          examen={premier.examen}
          avatarHomme={avatarHomme}
          avatarFemme={avatarFemme}
        />
        <ContenuExamenResultatPdf
          donnees={premier}
          afficherSignature={false}
          afficherBandeau={false}
        />
        {pages.slice(1).map((donnees) => (
          <View key={donnees.examen.examenId} style={stylesResultatPdf.blocExamen}>
            <ContenuExamenResultatPdf
              donnees={donnees}
              afficherSignature={false}
              afficherBandeau={false}
            />
          </View>
        ))}
        <SignatureValidationPdf signaturePath={signaturePath} afficherLegende />
        <PiedResultatPdfServeur />
      </Page>
      {pages.flatMap((donnees) => {
        const annexes = donnees.examen.piecesJointes ?? [];
        if (!annexes.length) return [];
        return (
          <PagesAnnexeResultatPdf
            key={`ann-${donnees.examen.examenId}`}
            piecesJointes={annexes}
            libelleExamen={donnees.examen.libelle}
            logoPath={logoPath}
          />
        );
      })}
    </Document>
  );
}
