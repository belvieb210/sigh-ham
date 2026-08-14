import { Image, Text, View } from "@react-pdf/renderer";
import { LegendeInterpretationPdf } from "@/lib/laboratoire/pdf-resultats/composants/legende-interpretation-pdf";
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
  afficherLegende = true,
}: {
  signaturePath?: string;
  dateValidation?: string;
  afficherLegende?: boolean;
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
    <View style={stylesResultatPdf.validationBloc}>
      <View style={stylesResultatPdf.validationGauche}>
        <Text style={stylesResultatPdf.validationTitre}>VALIDATION</Text>
        <View style={stylesResultatPdf.validationLigne}>
          <Text style={{ width: "50%" }}>Biologiste responsable:</Text>
          <Text style={{ width: "50%" }}>Date: {date}</Text>
        </View>
        {signaturePath ? (
          <Image src={signaturePath} style={stylesResultatPdf.signatureImage} />
        ) : null}
        <View style={stylesResultatPdf.validationFin}>
          <Text style={stylesResultatPdf.validationFinLigne}>
            ________________________________________
          </Text>
          <Text style={stylesResultatPdf.validationFinCentre}>FIN</Text>
          <Text style={stylesResultatPdf.validationFinLigne}>
            ________________________________________
          </Text>
        </View>
      </View>
      {afficherLegende ? (
        <View style={stylesResultatPdf.validationLegende}>
          <LegendeInterpretationPdf />
        </View>
      ) : null}
    </View>
  );
}
