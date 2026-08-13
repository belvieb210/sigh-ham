import { Image, Text, View } from "@react-pdf/renderer";
import { stylesResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/styles-resultat-pdf";

export function DescriptionExamenPdf({ texte }: { texte?: string | null }) {
  if (!texte?.trim()) return null;
  return (
    <View>
      <Text style={stylesResultatPdf.sectionTitre}>DESCRIPTION DE L&apos;EXAMEN</Text>
      <Text style={stylesResultatPdf.sectionTexte}>{texte}</Text>
    </View>
  );
}

export function CommentaireGlobalPdf({ texte }: { texte?: string | null }) {
  if (!texte?.trim()) return null;
  return (
    <View>
      <Text style={stylesResultatPdf.sectionTitre}>COMMENTAIRES</Text>
      <Text style={stylesResultatPdf.sectionTexte}>{texte}</Text>
    </View>
  );
}

export function SignatureValidationPdf({
  signaturePath,
  dateValidation,
}: {
  signaturePath?: string;
  dateValidation?: string;
}) {
  const date =
    dateValidation ??
    new Date().toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <View>
      <Text style={stylesResultatPdf.validationTitre}>VALIDATION</Text>
      <View style={stylesResultatPdf.validationLigne}>
        <Text style={{ width: "50%" }}>Biologiste responsable:</Text>
        <Text style={{ width: "50%" }}>Date: {date}</Text>
      </View>
      {signaturePath ? (
        <Image src={signaturePath} style={stylesResultatPdf.signatureImage} />
      ) : null}
      <View style={stylesResultatPdf.validationFin}>
        <Text style={{ width: "40%", textAlign: "center" }}>
          ________________________________________
        </Text>
        <Text style={{ width: "10%", textAlign: "center" }}>FIN</Text>
        <Text style={{ width: "40%", textAlign: "center" }}>
          ________________________________________
        </Text>
      </View>
    </View>
  );
}
