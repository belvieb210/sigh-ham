import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { LigneParametrePdf } from "@/lib/laboratoire/pdf-resultats/types";
import { COULEURS_RESULTAT_PDF } from "@/lib/laboratoire/pdf-resultats/composants/styles-resultat-pdf";

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: COULEURS_RESULTAT_PDF.bordureTableau,
    marginBottom: 6,
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COULEURS_RESULTAT_PDF.bordureTableau,
  },
  body: {
    flexDirection: "row",
  },
  colGauche: {
    width: "75%",
  },
  colHomo: {
    width: "25%",
    borderLeftWidth: 1,
    borderLeftColor: COULEURS_RESULTAT_PDF.bordureTableau,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COULEURS_RESULTAT_PDF.bordureTableau,
  },
  rowLast: { borderBottomWidth: 0 },
  cellHeader: {
    paddingVertical: 4,
    paddingHorizontal: 3,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: COULEURS_RESULTAT_PDF.bordureTableau,
  },
  cell: {
    paddingVertical: 3,
    paddingHorizontal: 3,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: COULEURS_RESULTAT_PDF.bordureTableau,
  },
  cellLastColGauche: { borderRightWidth: 0 },
  cellLast: { borderRightWidth: 0 },
  homoText: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
});

function parserElectrophorese(lignes: LigneParametrePdf[]) {
  let header4 = "Variante HOMOZYGOTE";
  let homoValue = "";
  const rows: LigneParametrePdf[] = [];

  for (const l of lignes) {
    const name = l.name.trim();
    if (/^NOM VARIANTE$/i.test(name)) {
      const val = (l.value ?? "").trim();
      const oth = (l.other ?? "").trim();
      if (val && val.toUpperCase() !== "AUTRES") header4 = `Variante ${val}`;
      else if (oth) header4 = `Variante ${oth}`;
      else if (val) header4 = `Variante ${val}`;
      continue;
    }
    if (/^VARIANTE VALEUR$/i.test(name)) {
      const val = (l.value ?? "").trim();
      const oth = (l.other ?? "").trim();
      if (val && val.toUpperCase() !== "AUTRES") homoValue = val;
      else if (oth) homoValue = oth;
      else if (val) homoValue = val;
      continue;
    }
    rows.push(l);
  }

  return { header4, homoValue, rows };
}

function afficherVariante(l: LigneParametrePdf): string {
  const val = (l.value ?? "").trim();
  const oth = (l.other ?? "").trim();
  if (val.toUpperCase() === "AUTRES" && oth) return oth;
  return l.name;
}

function afficherValeur(l: LigneParametrePdf): string {
  const val = (l.value ?? "").trim();
  const oth = (l.other ?? "").trim();
  if (val.toUpperCase() === "AUTRES" && oth) return oth;
  return val;
}

/** Port renderElectrophoreseParametres() — 4 colonnes + cellule homozygote fusionnée. */
export function ElectrophoreseResultatPdf({
  lignes,
}: {
  lignes: LigneParametrePdf[];
}) {
  const { header4, homoValue, rows } = parserElectrophorese(lignes);
  const count = rows.length;

  return (
    <View style={styles.table}>
      <View style={styles.headerRow}>
        <Text style={[styles.cellHeader, { width: "35%" }]}>
          VARIANTE DE L&apos;HÉMOGLOBINE
        </Text>
        <Text style={[styles.cellHeader, { width: "20%" }]}>RÉSULTAT %</Text>
        <Text style={[styles.cellHeader, { width: "20%" }]}>% NORMAL</Text>
        <Text style={[styles.cellHeader, styles.cellLast, { width: "25%" }]}>
          {header4.toUpperCase()}
        </Text>
      </View>

      <View style={styles.body}>
        <View style={styles.colGauche}>
          {rows.map((l, index) => (
            <View
              key={`${l.name}-${index}`}
              style={[
                styles.row,
                ...(index === count - 1 ? [styles.rowLast] : []),
              ]}
            >
              <Text style={[styles.cell, { width: "46.666%" }]}>
                {afficherVariante(l)}
              </Text>
              <Text style={[styles.cell, { width: "26.667%", textAlign: "center" }]}>
                {afficherValeur(l)}
              </Text>
              <Text
                style={[
                  styles.cell,
                  styles.cellLastColGauche,
                  { width: "26.667%", textAlign: "center" },
                ]}
              >
                {(l.range ?? "").trim()}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.colHomo}>
          {homoValue ? <Text style={styles.homoText}>{homoValue}</Text> : null}
        </View>
      </View>
    </View>
  );
}
