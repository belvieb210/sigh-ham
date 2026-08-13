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
  cellHomo: {
    paddingVertical: 3,
    paddingHorizontal: 3,
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: COULEURS_RESULTAT_PDF.bordureTableau,
    justifyContent: "center",
  },
  cellLast: { borderRightWidth: 0 },
});

function parserElectrophorese(lignes: LigneParametrePdf[]) {
  let header4 = "Variante homozygote";
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
  const rowMinH = 18;

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

      {rows.map((l, index) => (
        <View
          key={`${l.name}-${index}`}
          style={[styles.row, ...(index === count - 1 ? [styles.rowLast] : [])]}
        >
          <Text style={[styles.cell, { width: "35%" }]}>{afficherVariante(l)}</Text>
          <Text style={[styles.cell, { width: "20%", textAlign: "center" }]}>
            {afficherValeur(l)}
          </Text>
          <Text style={[styles.cell, { width: "20%", textAlign: "center" }]}>
            {(l.range ?? "").trim()}
          </Text>
          {index === 0 && homoValue ? (
            <View
              style={[
                styles.cellHomo,
                styles.cellLast,
                {
                  width: "25%",
                  minHeight: rowMinH * count,
                  borderBottomWidth: 0,
                },
              ]}
            >
              <Text>{homoValue}</Text>
            </View>
          ) : homoValue ? (
            <View style={[styles.cell, styles.cellLast, { width: "25%", minHeight: rowMinH, borderRightWidth: 0 }]} />
          ) : (
            <Text style={[styles.cell, styles.cellLast, { width: "25%", textAlign: "center" }]}>
              {/^VARIANTE VALEUR$/i.test(l.name.trim()) ? afficherValeur(l) : ""}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}
