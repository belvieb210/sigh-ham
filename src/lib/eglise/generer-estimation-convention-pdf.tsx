import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

export interface LigneEstimationConventionPdf {
  code: string;
  libelle: string;
  prixUnitaire: number;
}

export interface DonneesEstimationConventionPdf {
  hopital: string;
  service: string;
  numeroDossier: string;
  patient: string;
  telephone?: string | null;
  nomConvention?: string | null;
  medecinResponsable: string;
  agentNom: string;
  dateEmission: string;
  lignes: LigneEstimationConventionPdf[];
  sousTotalUsd: number;
  remiseUsd: number;
  totalPatientUsd: number;
  honorairePct: number;
  honoraireUsd: number;
}

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    paddingTop: 32,
    paddingHorizontal: 40,
    paddingBottom: 48,
    color: "#111111",
  },
  titre: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  sousTitre: { fontSize: 10, color: "#555555", marginBottom: 16 },
  section: { fontSize: 11, fontWeight: "bold", marginTop: 12, marginBottom: 6 },
  ligne: { marginBottom: 3 },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#dddddd",
    paddingVertical: 4,
  },
  colCode: { width: 60 },
  colLib: { flex: 1 },
  colPrix: { width: 70, textAlign: "right" },
  header: { fontWeight: "bold", backgroundColor: "#f5f5f5" },
  totaux: { marginTop: 12, alignSelf: "flex-end", width: 220 },
  totRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  totLabel: { color: "#444444" },
  totVal: { fontWeight: "bold" },
  honoraire: { color: "#0d6e3f", marginTop: 4 },
  note: {
    marginTop: 20,
    fontSize: 8,
    color: "#666666",
    fontStyle: "italic",
  },
});

function fmtUsd(n: number) {
  return `$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function DocumentEstimationConvention({ data }: { data: DonneesEstimationConventionPdf }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.titre}>{data.hopital}</Text>
        <Text style={styles.sousTitre}>
          {data.service} — Estimation d&apos;examens prénuptiaux
        </Text>

        <Text style={styles.section}>Patient</Text>
        <Text style={styles.ligne}>Dossier : {data.numeroDossier}</Text>
        <Text style={styles.ligne}>Nom : {data.patient}</Text>
        {data.telephone ? (
          <Text style={styles.ligne}>Téléphone : {data.telephone}</Text>
        ) : null}
        {data.nomConvention ? (
          <Text style={styles.ligne}>Convention : {data.nomConvention}</Text>
        ) : null}
        <Text style={styles.ligne}>Médecin responsable : {data.medecinResponsable}</Text>
        <Text style={styles.ligne}>Émis le : {data.dateEmission}</Text>
        <Text style={styles.ligne}>Agent : {data.agentNom}</Text>

        <Text style={styles.section}>Examens</Text>
        <View style={[styles.row, styles.header]}>
          <Text style={styles.colCode}>Code</Text>
          <Text style={styles.colLib}>Libellé</Text>
          <Text style={styles.colPrix}>Prix</Text>
        </View>
        {data.lignes.map((l, i) => (
          <View key={`${l.code}-${i}`} style={styles.row}>
            <Text style={styles.colCode}>{l.code}</Text>
            <Text style={styles.colLib}>{l.libelle}</Text>
            <Text style={styles.colPrix}>{fmtUsd(l.prixUnitaire)}</Text>
          </View>
        ))}

        <View style={styles.totaux}>
          <View style={styles.totRow}>
            <Text style={styles.totLabel}>Sous-total</Text>
            <Text style={styles.totVal}>{fmtUsd(data.sousTotalUsd)}</Text>
          </View>
          {data.remiseUsd > 0 ? (
            <View style={styles.totRow}>
              <Text style={styles.totLabel}>Remise</Text>
              <Text style={styles.totVal}>- {fmtUsd(data.remiseUsd)}</Text>
            </View>
          ) : null}
          <View style={styles.totRow}>
            <Text style={styles.totLabel}>Total patient</Text>
            <Text style={styles.totVal}>{fmtUsd(data.totalPatientUsd)}</Text>
          </View>
          <View style={[styles.totRow, styles.honoraire]}>
            <Text>Honoraires ({data.honorairePct}%)</Text>
            <Text style={styles.totVal}>{fmtUsd(data.honoraireUsd)}</Text>
          </View>
        </View>

        <Text style={styles.note}>
          Document estimatif — les montants seront confirmés à la caisse. Honoraires
          conventionnés : {data.honorairePct}% du total patient.
        </Text>
      </Page>
    </Document>
  );
}

export async function genererPdfEstimationConvention(
  data: DonneesEstimationConventionPdf
): Promise<Buffer> {
  const instance = pdf(<DocumentEstimationConvention data={data} />);
  const blob = await instance.toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
