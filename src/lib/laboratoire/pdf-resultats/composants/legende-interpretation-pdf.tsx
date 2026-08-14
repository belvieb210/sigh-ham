import { Text, View } from "@react-pdf/renderer";
import { stylesResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/styles-resultat-pdf";

const ITEMS = [
  { couleur: "#0ea5e9", label: "Bas", desc: "Valeur en dessous de la normale" },
  { couleur: "#22c55e", label: "Normal", desc: "Valeur dans la plage normale" },
  { couleur: "#ef4444", label: "Élevé", desc: "Valeur au dessus de la normale" },
  { couleur: "#94a3b8", label: "NR", desc: "Non requis" },
] as const;

export function LegendeInterpretationPdf() {
  return (
    <View style={stylesResultatPdf.legendeBox}>
      <Text style={stylesResultatPdf.legendeTitre}>Aide &amp; Interprétation</Text>
      {ITEMS.map((item) => (
        <View key={item.label} style={stylesResultatPdf.legendeLigne}>
          <View
            style={[
              stylesResultatPdf.legendePastille,
              { backgroundColor: item.couleur },
            ]}
          />
          <Text style={stylesResultatPdf.legendeTexte}>
            <Text style={stylesResultatPdf.legendeLabel}>{item.label}</Text>
            {" : "}
            {item.desc}
          </Text>
        </View>
      ))}
    </View>
  );
}
