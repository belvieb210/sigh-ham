import { Text, View } from "@react-pdf/renderer";
import type { LigneParametrePdf } from "@/lib/laboratoire/pdf-resultats/types";
import { stylesResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/styles-resultat-pdf";
import { valeurAffichageParametre, flagAffichagePdf } from "@/lib/laboratoire/pdf-resultats/utilitaires-parametres";

/** Port renderBioCliaHorm() — Paramètres 45 % · Flag 12 % · Résultat 23 % · Range reste. */
export function BioCliaHormResultatPdf({ lignes }: { lignes: LigneParametrePdf[] }) {
  const visibles = lignes.filter((l) => !l.nonRequis);
  const cols = [
    { key: "param", label: "Paramètres", width: "45%" },
    { key: "flag", label: "Flag", width: "12%" },
    { key: "result", label: "Résultat", width: "23%" },
    { key: "range", label: "Range usuelle", width: "20%" },
  ];

  return (
    <View style={stylesResultatPdf.table}>
      <View style={stylesResultatPdf.tableHeader}>
        {cols.map((c, i) => (
          <Text
            key={c.key}
            style={[
              stylesResultatPdf.cellHeader,
              { width: c.width },
              ...(i === cols.length - 1 ? [stylesResultatPdf.cellLast] : []),
            ]}
          >
            {c.label.toUpperCase()}
          </Text>
        ))}
      </View>
      {visibles.map((l, idx) => {
        const val = valeurAffichageParametre(l);
        const valUnite =
          l.unit?.trim() && !val.includes(l.unit.trim())
            ? `${val} ${l.unit.trim()}`
            : val;
        return (
          <View key={`${l.name}-${idx}`} style={stylesResultatPdf.tableRow}>
            <Text style={[stylesResultatPdf.cell, { width: cols[0]!.width }]}>
              {l.name}
            </Text>
            <Text
              style={[
                stylesResultatPdf.cell,
                stylesResultatPdf.cellCenter,
                { width: cols[1]!.width },
              ]}
            >
              {flagAffichagePdf(l.flag)}
            </Text>
            <Text
              style={[
                stylesResultatPdf.cell,
                stylesResultatPdf.cellCenter,
                { width: cols[2]!.width },
              ]}
            >
              {valUnite}
            </Text>
            <Text
              style={[
                stylesResultatPdf.cell,
                stylesResultatPdf.cellCenter,
                stylesResultatPdf.cellLast,
                { width: cols[3]!.width },
              ]}
            >
              {l.range ?? ""}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
