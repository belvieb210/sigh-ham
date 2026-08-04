import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

export interface DonneesRapportPharmaciePdf {
  hopital: string;
  titre: string;
  periode: string;
  chiffreAffaires: number;
  nombreVentes: number;
  topProduits: { nom: string; quantite: number; montant: number }[];
  ventes: { numero: string; client: string; statut: string; montant: number }[];
}

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    paddingTop: 28,
    paddingHorizontal: 36,
    paddingBottom: 40,
    color: "#111111",
  },
  titre: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  sousTitre: { fontSize: 10, color: "#555555", marginBottom: 14 },
  kpi: { marginBottom: 4 },
  sectionTitre: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
    paddingVertical: 3,
  },
  col: { flex: 1 },
  colSm: { width: 70 },
});

function DocumentRapportPharmacie({ data }: { data: DonneesRapportPharmaciePdf }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.titre}>{data.titre}</Text>
        <Text style={styles.sousTitre}>
          {data.hopital} — {data.periode}
        </Text>
        <Text style={styles.kpi}>
          Ventes : {data.nombreVentes} — CA :{" "}
          {Math.round(data.chiffreAffaires).toLocaleString("fr-FR")} CDF
        </Text>

        <Text style={styles.sectionTitre}>Top produits</Text>
        {data.topProduits.slice(0, 15).map((p, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.col}>{p.nom}</Text>
            <Text style={styles.colSm}>×{p.quantite}</Text>
            <Text style={styles.colSm}>
              {Math.round(p.montant).toLocaleString("fr-FR")}
            </Text>
          </View>
        ))}

        <Text style={styles.sectionTitre}>Ventes</Text>
        {data.ventes.slice(0, 40).map((v, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.col}>{v.numero}</Text>
            <Text style={styles.col}>{v.client}</Text>
            <Text style={styles.colSm}>{v.statut}</Text>
            <Text style={styles.colSm}>
              {Math.round(v.montant).toLocaleString("fr-FR")}
            </Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function genererPdfRapportVentes(
  data: DonneesRapportPharmaciePdf
): Promise<Buffer> {
  const instance = pdf(<DocumentRapportPharmacie data={data} />);
  const result = await instance.toBuffer();
  if (Buffer.isBuffer(result)) return result;
  // @react-pdf v4 peut renvoyer un ReadableStream Node
  const chunks: Buffer[] = [];
  for await (const chunk of result as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
