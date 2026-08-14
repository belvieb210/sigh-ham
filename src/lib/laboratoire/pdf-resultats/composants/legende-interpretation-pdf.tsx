import { Text, View } from "@react-pdf/renderer";
import { stylesResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/styles-resultat-pdf";

const ITEMS = [
  { lettre: "B", desc: "Valeur en dessous de la normale" },
  { lettre: "N", desc: "Valeur dans la plage normale" },
  { lettre: "E", desc: "Valeur au dessus de la normale" },
] as const;

export function LegendeInterpretationPdf() {
  return (
    <View style={stylesResultatPdf.legendeBox}>
      <Text style={stylesResultatPdf.legendeTitre}>Aide &amp; Interprétation</Text>
      {ITEMS.map((item) => (
        <Text key={item.lettre} style={stylesResultatPdf.legendeTexte}>
          <Text style={stylesResultatPdf.legendeLabel}>{item.lettre}</Text>
          {" : "}
          {item.desc}
        </Text>
      ))}
    </View>
  );
}
