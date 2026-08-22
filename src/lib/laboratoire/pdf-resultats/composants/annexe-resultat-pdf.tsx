import { Image, Page, Text, View } from "@react-pdf/renderer";
import {
  EnTeteResultatPdfServeur,
  PiedResultatPdfServeur,
} from "@/lib/laboratoire/pdf-resultats/composants/en-tete-resultat-pdf-serveur";
import { stylesResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/styles-resultat-pdf";
import {
  HAUTEUR_MAX_IMAGE_ANNEXE_PDF,
  LARGEUR_CONTENU_ANNEXE_PDF,
} from "@/lib/laboratoire/pdf-resultats/dimensions-affichage-annexe-pdf";
import type { PageAnnexePieceJointePdf } from "@/lib/laboratoire/pdf-resultats/types";

/** Pages annexe — document séparé (évite le chevauchement avec l'en-tête fixed du rapport). */
export function PagesAnnexeResultatPdf({
  pagesAnnexe,
  libelleExamen,
  logoPath,
}: {
  pagesAnnexe: PageAnnexePieceJointePdf[];
  libelleExamen: string;
  logoPath: string;
}) {
  if (!pagesAnnexe.length) return null;

  return (
    <>
      {pagesAnnexe.map((page, idx) => (
        <Page
          key={`annexe-${page.nomFichier}-${page.page ?? idx}`}
          size="A4"
          wrap={false}
          style={stylesResultatPdf.pageAnnexe}
        >
          <EnTeteResultatPdfServeur
            logoPath={logoPath}
            lignesBadge={["ANNEXE", "RÉSULTATS"]}
          />
          <Text style={stylesResultatPdf.annexeTitreSection}>
            PIÈCES JOINTES — {libelleExamen.toUpperCase()}
          </Text>
          <Text style={stylesResultatPdf.annexeNomFichier}>{page.libelle}</Text>

          {page.integrable && page.cheminImage ? (
            <View style={stylesResultatPdf.annexeImageWrap} wrap={false}>
              <Image
                src={page.cheminImage}
                style={{
                  width: page.largeurAffichage ?? LARGEUR_CONTENU_ANNEXE_PDF,
                  height: page.hauteurAffichage ?? HAUTEUR_MAX_IMAGE_ANNEXE_PDF,
                }}
              />
            </View>
          ) : (
            <Text style={stylesResultatPdf.annexeErreur}>
              {page.messageErreur ??
                `${page.nomFichier} — format non intégrable au PDF (${page.mimeType})`}
            </Text>
          )}

          <PiedResultatPdfServeur margesHorizontales={20} />
        </Page>
      ))}
    </>
  );
}
