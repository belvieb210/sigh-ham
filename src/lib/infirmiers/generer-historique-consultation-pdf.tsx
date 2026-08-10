import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import {
  CartePatientPdfInfirmiers,
  EnTetePdfInfirmiersServeur,
  PiedPdfInfirmiersServeur,
} from "@/lib/infirmiers/en-tete-pdf-infirmiers-serveur";
import {
  cheminsAssetsPdfServeur,
  enregistrerPolicesPdfServeur,
} from "@/lib/pdf/assets-pdf-serveur";
import type { ConstanteVitaleResume } from "@/lib/infirmiers/types";
import type { FormulaireCliniqueMedecins } from "@/lib/medecins/types";

export interface DonneesHistoriqueConsultationPdf {
  hopital: string;
  numeroDossier: string;
  numeroPatient: string;
  nomComplet: string;
  telephone: string;
  age: number | null;
  sexe: string | null;
  constantes: ConstanteVitaleResume[];
  dateEmission: string;
}

const NOIR = "#111111";
const GRIS = "#555555";
const BLEU = "#1a4d7c";
const BLEU_CONTOUR = "#7eb6e0";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 52,
    color: NOIR,
  },
  sectionTitre: {
    fontSize: 10,
    fontWeight: "bold",
    color: BLEU,
    marginBottom: 4,
    marginTop: 6,
    textTransform: "uppercase",
  },
  mesureBloc: {
    borderWidth: 1,
    borderColor: BLEU_CONTOUR,
    borderRadius: 3,
    padding: 6,
    marginBottom: 6,
  },
  mesureEntete: {
    fontSize: 10,
    fontWeight: "bold",
    color: BLEU,
    marginBottom: 3,
  },
  ligne: { fontSize: 9, marginBottom: 1, lineHeight: 1.25 },
  label: { color: GRIS },
  delta: { color: "#0d6e3f", fontSize: 8 },
  deltaNeg: { color: "#c0162d", fontSize: 8 },
  table: { borderWidth: 1, borderColor: BLEU_CONTOUR, marginTop: 4 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#eef6fc",
    borderBottomWidth: 1,
    borderBottomColor: BLEU_CONTOUR,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BLEU_CONTOUR,
  },
  cell: { padding: 4, fontSize: 8, flex: 1 },
  cellHeader: { fontWeight: "bold", color: BLEU },
});

function formaterDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function deltaTexte(
  actuel: number | null | undefined,
  precedent: number | null | undefined,
  unite = ""
): string {
  if (actuel == null) return "—";
  if (precedent == null) return `${actuel}${unite}`;
  const d = actuel - precedent;
  if (d === 0) return `${actuel}${unite} (=)`;
  const signe = d > 0 ? "+" : "";
  return `${actuel}${unite} (${signe}${Number(d.toFixed(1))}${unite})`;
}

function ligneSigne(
  label: string,
  actuel: number | null | undefined,
  precedent: number | null | undefined,
  unite = ""
) {
  const texte = deltaTexte(actuel, precedent, unite);
  const d =
    actuel != null && precedent != null ? actuel - precedent : null;
  const styleDelta =
    d != null && d < 0 ? styles.deltaNeg : d != null && d > 0 ? styles.delta : styles.ligne;
  return (
    <Text style={styles.ligne} key={label}>
      <Text style={styles.label}>{label} : </Text>
      <Text style={styleDelta}>{texte}</Text>
    </Text>
  );
}

function DocumentHistoriqueConsultation({
  data,
  logoPath,
}: {
  data: DonneesHistoriqueConsultationPdf;
  logoPath: string;
}) {
  const constantes = [...data.constantes].sort(
    (a, b) => new Date(b.mesureLe).getTime() - new Date(a.mesureLe).getTime()
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <EnTetePdfInfirmiersServeur
          logoPath={logoPath}
          hopital={data.hopital}
          lignesBadge={["HISTORIQUE", "CONSULTATION INFIRMIÈRE"]}
        />

        <CartePatientPdfInfirmiers
          titre="Patient"
          lignes={[
            `Nom : ${data.nomComplet}`,
            `N° dossier : ${data.numeroDossier} — ${data.numeroPatient}`,
            `Téléphone : ${data.telephone}`,
            `Âge : ${data.age ?? "—"} ans — Sexe : ${data.sexe ?? "—"}`,
            `Date d'édition : ${data.dateEmission}`,
          ]}
        />

        <Text style={styles.sectionTitre}>
          Consultations enregistrées ({constantes.length})
        </Text>

        {constantes.map((c, index) => {
          const prec = constantes[index + 1] ?? null;
          const fc = c.formulaireClinique as FormulaireCliniqueMedecins | null | undefined;
          return (
            <View key={c.id} style={styles.mesureBloc} wrap={false}>
              <Text style={styles.mesureEntete}>
                {formaterDate(c.mesureLe)}
                {c.infirmier ? ` — ${c.infirmier}` : ""}
              </Text>
              {ligneSigne("Température", c.temperature, prec?.temperature, " °C")}
              {ligneSigne("Poids", c.poidsKg, prec?.poidsKg, " kg")}
              {ligneSigne("Taille", c.tailleCm, prec?.tailleCm, " cm")}
              {ligneSigne("TA syst.", c.tensionSystolique, prec?.tensionSystolique, " mmHg")}
              {ligneSigne("TA diast.", c.tensionDiastolique, prec?.tensionDiastolique, " mmHg")}
              {ligneSigne("FC", c.frequenceCardiaque, prec?.frequenceCardiaque, " bpm")}
              {ligneSigne("SpO₂", c.saturationO2, prec?.saturationO2, " %")}
              {fc?.silhouette ? (
                <Text style={styles.ligne}>
                  <Text style={styles.label}>Silhouette : </Text>
                  {fc.silhouette}
                  {prec?.formulaireClinique?.silhouette &&
                  prec.formulaireClinique.silhouette !== fc.silhouette
                    ? ` (avant : ${prec.formulaireClinique.silhouette})`
                    : ""}
                </Text>
              ) : null}
              {fc?.drRef ? (
                <Text style={styles.ligne}>
                  <Text style={styles.label}>Dr ref. : </Text>
                  {fc.drRef}
                </Text>
              ) : null}
              {c.observations ? (
                <Text style={styles.ligne}>
                  <Text style={styles.label}>Observations : </Text>
                  {c.observations}
                </Text>
              ) : null}
            </View>
          );
        })}

        {constantes.length >= 2 ? (
          <>
            <Text style={styles.sectionTitre}>Tableau comparatif</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.cell, styles.cellHeader, { flex: 1.2 }]}>Date</Text>
                <Text style={[styles.cell, styles.cellHeader]}>T°</Text>
                <Text style={[styles.cell, styles.cellHeader]}>Poids</Text>
                <Text style={[styles.cell, styles.cellHeader]}>TA</Text>
                <Text style={[styles.cell, styles.cellHeader]}>FC</Text>
                <Text style={[styles.cell, styles.cellHeader]}>SpO₂</Text>
              </View>
              {constantes.map((c) => (
                <View key={`t-${c.id}`} style={styles.tableRow}>
                  <Text style={[styles.cell, { flex: 1.2 }]}>
                    {formaterDate(c.mesureLe)}
                  </Text>
                  <Text style={styles.cell}>{c.temperature ?? "—"}</Text>
                  <Text style={styles.cell}>{c.poidsKg ?? "—"}</Text>
                  <Text style={styles.cell}>
                    {c.tensionSystolique ?? "—"}/{c.tensionDiastolique ?? "—"}
                  </Text>
                  <Text style={styles.cell}>{c.frequenceCardiaque ?? "—"}</Text>
                  <Text style={styles.cell}>{c.saturationO2 ?? "—"}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        <PiedPdfInfirmiersServeur />
      </Page>
    </Document>
  );
}

export async function genererPdfHistoriqueConsultationInfirmiers(
  data: DonneesHistoriqueConsultationPdf
): Promise<Buffer> {
  enregistrerPolicesPdfServeur();
  const { logo } = cheminsAssetsPdfServeur();
  const instance = pdf(
    <DocumentHistoriqueConsultation data={data} logoPath={logo} />
  );
  const blob = await instance.toBlob();
  return Buffer.from(await blob.arrayBuffer());
}
