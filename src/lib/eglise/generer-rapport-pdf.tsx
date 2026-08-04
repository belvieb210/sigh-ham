import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

export interface LigneExamenRapportPrenuptial {
  code: string;
  libelle: string;
  statut: string;
  resultats: { parametre: string; valeur: string; unite?: string | null }[];
}

export interface DonneesRapportPrenuptialPdf {
  hopital: string;
  numeroDossier: string;
  patient: string;
  sexe: string;
  dateNaissance: string | null;
  paroisse: string | null;
  conjointNom: string | null;
  dateMariage: string | null;
  dateRapport: string;
  examens: LigneExamenRapportPrenuptial[];
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
  section: { fontSize: 12, fontWeight: "bold", marginTop: 12, marginBottom: 6 },
  ligne: { marginBottom: 3 },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#dddddd",
    paddingVertical: 3,
  },
  col: { flex: 1 },
  colSm: { width: 80 },
  examenTitre: { fontSize: 11, fontWeight: "bold", marginTop: 8, marginBottom: 2 },
});

function DocumentRapportPrenuptial({ data }: { data: DonneesRapportPrenuptialPdf }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.titre}>Rapport d&apos;examens prénuptiaux</Text>
        <Text style={styles.sousTitre}>
          {data.hopital} — {data.dateRapport}
        </Text>

        <Text style={styles.section}>Patient</Text>
        <Text style={styles.ligne}>Nom : {data.patient}</Text>
        <Text style={styles.ligne}>Sexe : {data.sexe}</Text>
        {data.dateNaissance ? (
          <Text style={styles.ligne}>Date de naissance : {data.dateNaissance}</Text>
        ) : null}
        <Text style={styles.ligne}>Dossier : {data.numeroDossier}</Text>
        {data.paroisse ? <Text style={styles.ligne}>Paroisse : {data.paroisse}</Text> : null}
        {data.conjointNom ? (
          <Text style={styles.ligne}>Conjoint : {data.conjointNom}</Text>
        ) : null}
        {data.dateMariage ? (
          <Text style={styles.ligne}>Date du mariage : {data.dateMariage}</Text>
        ) : null}

        <Text style={styles.section}>Examens</Text>
        {data.examens.map((ex, i) => (
          <View key={i}>
            <Text style={styles.examenTitre}>
              {ex.code} — {ex.libelle} ({ex.statut})
            </Text>
            {ex.resultats.length === 0 ? (
              <Text style={styles.ligne}>Aucun résultat saisi</Text>
            ) : (
              ex.resultats.map((r, j) => (
                <View key={j} style={styles.row}>
                  <Text style={styles.col}>{r.parametre}</Text>
                  <Text style={styles.col}>
                    {r.valeur}
                    {r.unite ? ` ${r.unite}` : ""}
                  </Text>
                </View>
              ))
            )}
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function genererPdfRapportPrenuptial(
  data: DonneesRapportPrenuptialPdf
): Promise<Buffer> {
  const instance = pdf(<DocumentRapportPrenuptial data={data} />);
  const result = await instance.toBuffer();
  if (Buffer.isBuffer(result)) return result;
  const chunks: Buffer[] = [];
  for await (const chunk of result as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
