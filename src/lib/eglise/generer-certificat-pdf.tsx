import {
  Document,
  Page,
  Text,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

export interface DonneesCertificatPrenuptialPdf {
  hopital: string;
  patient: string;
  sexe: string;
  paroisse: string | null;
  conjointNom: string | null;
  dateMariage: string | null;
  dateEmission: string;
  numeroDossier: string;
}

const styles = StyleSheet.create({
  page: {
    fontSize: 11,
    paddingTop: 48,
    paddingHorizontal: 48,
    paddingBottom: 48,
    color: "#111111",
  },
  titre: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  sousTitre: {
    fontSize: 11,
    textAlign: "center",
    color: "#555555",
    marginBottom: 28,
  },
  corps: { marginBottom: 10, lineHeight: 1.5 },
  signature: { marginTop: 36 },
});

function DocumentCertificatPrenuptial({
  data,
}: {
  data: DonneesCertificatPrenuptialPdf;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.titre}>Certificat d&apos;examens prénuptiaux</Text>
        <Text style={styles.sousTitre}>{data.hopital}</Text>

        <Text style={styles.corps}>
          Le service Église de {data.hopital} certifie que le (la) patient(e){" "}
          {data.patient} ({data.sexe}), dossier {data.numeroDossier}
          {data.paroisse ? `, paroisse ${data.paroisse}` : ""}
          {data.conjointNom ? `, conjoint(e) ${data.conjointNom}` : ""}
          {data.dateMariage ? `, mariage prévu le ${data.dateMariage}` : ""}, a
          effectué le bilan d&apos;examens prénuptiaux et que le rapport de
          laboratoire associé est disponible.
        </Text>

        <Text style={styles.corps}>
          Document émis le {data.dateEmission}.
        </Text>

        <Text style={styles.signature}>Service Église — {data.hopital}</Text>
      </Page>
    </Document>
  );
}

export async function genererPdfCertificatPrenuptial(
  data: DonneesCertificatPrenuptialPdf
): Promise<Buffer> {
  const instance = pdf(<DocumentCertificatPrenuptial data={data} />);
  const result = await instance.toBuffer();
  if (Buffer.isBuffer(result)) return result;
  const chunks: Buffer[] = [];
  for await (const chunk of result as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
