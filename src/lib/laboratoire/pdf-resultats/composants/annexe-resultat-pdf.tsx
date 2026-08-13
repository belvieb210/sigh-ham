import { Image, Page, Text, View } from "@react-pdf/renderer";
import {
  EnTeteResultatPdfServeur,
  PiedResultatPdfServeur,
} from "@/lib/laboratoire/pdf-resultats/composants/en-tete-resultat-pdf-serveur";
import { stylesResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/styles-resultat-pdf";
import type { PieceJointeResultatPdf } from "@/lib/laboratoire/pdf-resultats/types";

/** Pages annexe (port renderFichiers PHP) — une image par page. */
export function PagesAnnexeResultatPdf({
  piecesJointes,
  libelleExamen,
  logoPath,
}: {
  piecesJointes: PieceJointeResultatPdf[];
  libelleExamen: string;
  logoPath: string;
}) {
  if (!piecesJointes.length) return null;

  const images = piecesJointes.filter((p) => p.cheminAffichable);
  const nonImages = piecesJointes.filter((p) => !p.cheminAffichable);

  return (
    <>
      {images.map((pj, idx) => (
        <Page key={`annexe-img-${pj.url}-${idx}`} size="A4" style={stylesResultatPdf.page}>
          <EnTeteResultatPdfServeur
            logoPath={logoPath}
            lignesBadge={["ANNEXE", "RÉSULTATS"]}
          />
          <View>
            <Text style={stylesResultatPdf.sectionTitre}>
              PIÈCES JOINTES — {libelleExamen.toUpperCase()}
            </Text>
            <Text style={stylesResultatPdf.annexeNomFichier}>{pj.nom}</Text>
            <View style={stylesResultatPdf.annexeImageWrap}>
              <Image src={pj.cheminAffichable!} style={stylesResultatPdf.annexeImage} />
            </View>
          </View>
          <PiedResultatPdfServeur />
        </Page>
      ))}
      {nonImages.length > 0 ? (
        <Page size="A4" style={stylesResultatPdf.page}>
          <EnTeteResultatPdfServeur
            logoPath={logoPath}
            lignesBadge={["ANNEXE", "RÉSULTATS"]}
          />
          <View>
            <Text style={stylesResultatPdf.sectionTitre}>
              PIÈCES JOINTES — {libelleExamen.toUpperCase()}
            </Text>
            {nonImages.map((pj, i) => (
              <Text key={i} style={stylesResultatPdf.annexeNomFichier}>
                {pj.nom} — format non intégrable au PDF ({pj.mimeType})
              </Text>
            ))}
          </View>
          <PiedResultatPdfServeur />
        </Page>
      ) : null}
    </>
  );
}
