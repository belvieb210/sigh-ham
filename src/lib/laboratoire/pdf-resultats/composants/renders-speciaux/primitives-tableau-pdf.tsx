import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { COULEURS_RESULTAT_PDF } from "@/lib/laboratoire/pdf-resultats/composants/styles-resultat-pdf";

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: COULEURS_RESULTAT_PDF.bordureTableau,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COULEURS_RESULTAT_PDF.bordureTableau,
  },
  rowLast: { borderBottomWidth: 0 },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COULEURS_RESULTAT_PDF.bordureTableau,
    backgroundColor: "#ffffff",
  },
  cell: {
    paddingVertical: 3,
    paddingHorizontal: 4,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: COULEURS_RESULTAT_PDF.bordureTableau,
  },
  cellHeader: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: COULEURS_RESULTAT_PDF.bordureTableau,
  },
  cellLast: { borderRightWidth: 0 },
  cellBold: { fontWeight: "bold" },
  cellCenter: { textAlign: "center" },
  cellLeft: { textAlign: "left" },
});

function Cell({
  width,
  children,
  header,
  last,
  bold,
  center,
  left,
}: {
  width: string;
  children: string;
  header?: boolean;
  last?: boolean;
  bold?: boolean;
  center?: boolean;
  left?: boolean;
}) {
  const base = header ? styles.cellHeader : styles.cell;
  return (
    <Text
      style={[
        base,
        { width },
        ...(last ? [styles.cellLast] : []),
        ...(bold ? [styles.cellBold] : []),
        ...(center ? [styles.cellCenter] : []),
        ...(left ? [styles.cellLeft] : []),
      ]}
    >
      {children}
    </Text>
  );
}

/** Tableau 2 colonnes label / valeur (SPECIMEN, MÉTHODE…). */
export function TableauLabelValeurPdf({
  lignes,
  colLabel = "40%",
}: {
  lignes: { label: string; valeur: string }[];
  colLabel?: string;
}) {
  if (!lignes.length) return null;
  const labelPct = parseInt(colLabel, 10);
  const colVal = Number.isFinite(labelPct) ? `${100 - labelPct}%` : "60%";
  return (
    <View style={styles.table}>
      {lignes.map((l, i) => (
        <View
          key={`${l.label}-${i}`}
          style={[styles.row, ...(i === lignes.length - 1 ? [styles.rowLast] : [])]}
        >
          <Cell width={colLabel} bold left>
            {l.label}
          </Cell>
          <Cell width={colVal} last left>
            {l.valeur}
          </Cell>
        </View>
      ))}
    </View>
  );
}

/** Tableau N colonnes avec en-tête. */
export function TableauColonnesPdf({
  headers,
  rows,
  widths,
  alignRow = "center",
}: {
  headers: string[];
  rows: string[][];
  widths: string[];
  alignRow?: "left" | "center";
}) {
  if (!headers.length) return null;
  return (
    <View style={styles.table}>
      <View style={styles.headerRow}>
        {headers.map((h, i) => (
          <Cell key={h} width={widths[i] ?? "auto"} header last={i === headers.length - 1}>
            {h}
          </Cell>
        ))}
      </View>
      {rows.map((row, ri) => (
        <View
          key={ri}
          style={[styles.row, ...(ri === rows.length - 1 ? [styles.rowLast] : [])]}
        >
          {row.map((cell, ci) => (
            <Cell
              key={ci}
              width={widths[ci] ?? "auto"}
              last={ci === row.length - 1}
              left={alignRow === "left"}
              center={alignRow === "center"}
            >
              {cell}
            </Cell>
          ))}
        </View>
      ))}
    </View>
  );
}
