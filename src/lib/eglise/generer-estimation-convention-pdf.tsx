import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Image,
} from "@react-pdf/renderer";
import { INFOS_LEGALES_TICKET } from "@/constants/ticket-thermique";
import {
  cheminsAssetsPdfServeur,
  enregistrerPolicesPdfServeur,
} from "@/lib/pdf/assets-pdf-serveur";

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

const NOIR = "#111111";
const GRIS = "#555555";
const GRIS_CLAIR = "#f3f8fc";
const BLEU_CONTOUR = "#7eb6e0";
const BLEU_ENTETE = "#1a4d7c";
const ROUGE = "#c0162d";
const VERT = "#0d6e3f";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 11,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 52,
    color: NOIR,
    backgroundColor: "#ffffff",
  },
  enTete: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 0,
  },
  enTeteGauche: { flexDirection: "row", width: "58%", alignItems: "flex-start" },
  logo: { width: 48, height: 48, objectFit: "contain" },
  enTeteInfos: { flex: 1, paddingLeft: 8 },
  nomLabo: { fontSize: 12, fontWeight: "bold", color: NOIR, marginBottom: 1 },
  sousNom: { fontSize: 8, color: GRIS, lineHeight: 1.2 },
  contact: { fontSize: 8, color: GRIS, lineHeight: 1.2 },
  enTeteDroite: { width: "40%", alignItems: "flex-end" },
  badgeTitre: {
    borderWidth: 1.5,
    borderColor: BLEU_ENTETE,
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginBottom: 2,
  },
  badgeTitreTexte: {
    color: BLEU_ENTETE,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  metaBloc: { textAlign: "right" },
  metaLigneTexte: { fontSize: 9, color: NOIR, lineHeight: 1.15, textAlign: "right" },
  metaLigneNumero: {
    fontSize: 10,
    fontWeight: "bold",
    color: ROUGE,
    lineHeight: 1.15,
    textAlign: "right",
  },
  separateurEnTete: {
    borderBottomWidth: 1.5,
    borderBottomColor: BLEU_CONTOUR,
    marginTop: 2,
    marginBottom: 8,
  },
  cartes: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  carte: {
    width: "48.5%",
    borderWidth: 1,
    borderColor: BLEU_CONTOUR,
    borderRadius: 4,
    padding: 8,
  },
  carteTitre: {
    fontSize: 10,
    fontWeight: "bold",
    color: BLEU_ENTETE,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  carteLigne: { fontSize: 11, marginBottom: 2, color: NOIR },
  carteLabel: { color: GRIS, fontSize: 10 },
  table: { borderWidth: 1, borderColor: BLEU_CONTOUR, marginBottom: 8 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BLEU_ENTETE,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  headerCell: { color: "#ffffff", fontWeight: "bold", fontSize: 10 },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: BLEU_CONTOUR,
  },
  tableRowAlt: { backgroundColor: GRIS_CLAIR },
  colN: { width: "8%", fontSize: 10 },
  colDesc: { width: "48%", fontSize: 10 },
  colCode: { width: "18%", fontSize: 10, fontWeight: "bold" },
  colPrix: { width: "26%", fontSize: 10, textAlign: "right", fontWeight: "bold" },
  basTable: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  conditions: {
    width: "52%",
    borderWidth: 1,
    borderColor: BLEU_CONTOUR,
    borderRadius: 4,
    padding: 6,
  },
  conditionsTitre: {
    fontSize: 10,
    fontWeight: "bold",
    color: BLEU_ENTETE,
    marginBottom: 3,
  },
  conditionsLigne: { fontSize: 9, color: GRIS, marginBottom: 1, lineHeight: 1.25 },
  totaux: { width: "44%" },
  totalLigne: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: BLEU_CONTOUR,
    fontSize: 10,
  },
  totalHonoraire: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: BLEU_CONTOUR,
    fontSize: 10,
    color: VERT,
  },
  totalFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 6,
    marginTop: 2,
    borderWidth: 1.5,
    borderColor: ROUGE,
  },
  totalFinalLabel: { fontSize: 11, fontWeight: "bold", color: ROUGE },
  totalFinalValeur: { fontSize: 12, fontWeight: "bold", color: ROUGE },
  signatures: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 4,
    marginBottom: 8,
  },
  signatureBloc: { width: "42%" },
  signatureTitre: { fontSize: 9, color: GRIS, marginBottom: 2 },
  signatureImage: { width: 120, height: 48, objectFit: "contain" },
  signatureLigne: {
    borderBottomWidth: 1,
    borderBottomColor: BLEU_CONTOUR,
    marginTop: 4,
    marginBottom: 2,
  },
  signatureNom: { fontSize: 10, color: NOIR },
  pied: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BLEU_ENTETE,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  piedLigne: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  piedTexte: { color: "#ffffff", fontSize: 9 },
  piedAdresse: { color: "#ffffff", fontSize: 8, lineHeight: 1.3, textAlign: "center" },
});

function fmtUsd(n: number) {
  return `$ ${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function DocumentEstimationConvention({ data }: { data: DonneesEstimationConventionPdf }) {
  const L = INFOS_LEGALES_TICKET;
  const assets = cheminsAssetsPdfServeur();
  const tel = data.telephone?.trim() || "—";
  const nbExamens = data.lignes.length;

  return (
    <Document
      title={`Estimation — ${data.patient}`}
      author="HAM Laboratoire"
      subject="Estimation conventionnée prénuptiale"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.enTete}>
          <View style={styles.enTeteGauche}>
            <Image src={assets.logo} style={styles.logo} />
            <View style={styles.enTeteInfos}>
              <Text style={styles.nomLabo}>HAM LABORATOIRE</Text>
              <Text style={styles.sousNom}>
                Centre de Diagnostic et d&apos;Analyses Médicales
              </Text>
              <Text style={styles.sousNom}>{L.rccm}</Text>
              <Text style={styles.contact}>Tél. {L.telephones}</Text>
              <Text style={styles.contact}>{L.email}</Text>
            </View>
          </View>
          <View style={styles.enTeteDroite}>
            <View style={styles.badgeTitre}>
              <Text style={styles.badgeTitreTexte}>ESTIMATION</Text>
            </View>
            <Text style={styles.metaBloc}>
              <Text style={styles.metaLigneNumero}>{`N°  ${data.numeroDossier}\n`}</Text>
              <Text style={styles.metaLigneTexte}>{`Date : ${data.dateEmission}\n`}</Text>
              <Text style={styles.metaLigneTexte}>{`Valable pour : 15 jours\n`}</Text>
              <Text style={styles.metaLigneTexte}>Devise : examens USD ($)</Text>
            </Text>
          </View>
        </View>

        <View style={styles.separateurEnTete} />

        <View style={styles.cartes}>
          <View style={styles.carte}>
            <Text style={styles.carteTitre}>Informations du patient</Text>
            <Text style={styles.carteLigne}>
              <Text style={styles.carteLabel}>Nom : </Text>
              {data.patient}
            </Text>
            <Text style={styles.carteLigne}>
              <Text style={styles.carteLabel}>Téléphone : </Text>
              {tel}
            </Text>
            <Text style={styles.carteLigne}>
              <Text style={styles.carteLabel}>Dossier N° : </Text>
              {data.numeroDossier}
            </Text>
            {data.nomConvention ? (
              <Text style={styles.carteLigne}>
                <Text style={styles.carteLabel}>Convention : </Text>
                {data.nomConvention}
              </Text>
            ) : null}
          </View>

          <View style={styles.carte}>
            <Text style={styles.carteTitre}>Émis pour</Text>
            <Text style={styles.carteLigne}>
              <Text style={styles.carteLabel}>Patient : </Text>
              {data.patient}
            </Text>
            <Text style={styles.carteLigne}>
              <Text style={styles.carteLabel}>Médecin / Prescripteur : </Text>
              {data.medecinResponsable || "—"}
            </Text>
            <Text style={styles.carteLigne}>
              <Text style={styles.carteLabel}>Émis par : </Text>
              {data.agentNom}
            </Text>
            <Text style={styles.carteLigne}>
              <Text style={styles.carteLabel}>Service : </Text>
              {data.service}
            </Text>
            <Text style={styles.carteLigne}>
              <Text style={styles.carteLabel}>Examens : </Text>
              {nbExamens} sélectionné{nbExamens > 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colN, styles.headerCell]}>N°</Text>
            <Text style={[styles.colDesc, styles.headerCell]}>Examens demandés</Text>
            <Text style={[styles.colCode, styles.headerCell]}>Code</Text>
            <Text style={[styles.colPrix, styles.headerCell]}>Montant ($)</Text>
          </View>
          {data.lignes.map((l, index) => (
            <View
              key={`${l.code}-${index}`}
              style={
                index % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow
              }
              wrap={false}
            >
              <Text style={styles.colN}>{index + 1}</Text>
              <Text style={styles.colDesc}>{l.libelle}</Text>
              <Text style={styles.colCode}>{l.code}</Text>
              <Text style={styles.colPrix}>{fmtUsd(l.prixUnitaire)}</Text>
            </View>
          ))}
          <View style={[styles.tableRow, styles.tableRowAlt]} wrap={false}>
            <Text style={styles.colN}> </Text>
            <Text style={[styles.colDesc, { fontWeight: "bold" }]}>Sous-total examens</Text>
            <Text style={styles.colCode}> </Text>
            <Text style={[styles.colPrix, { fontWeight: "bold" }]}>
              {fmtUsd(data.sousTotalUsd)}
            </Text>
          </View>
        </View>

        <View style={styles.basTable}>
          <View style={styles.conditions}>
            <Text style={styles.conditionsTitre}>Conditions</Text>
            <Text style={styles.conditionsLigne}>
              • Document estimatif, non contractuel.
            </Text>
            <Text style={styles.conditionsLigne}>
              • Facturation après validation et envoi à la caisse.
            </Text>
            <Text style={styles.conditionsLigne}>
              • Service conventionné — honoraires de {data.honorairePct}% dus à
              l&apos;organisme.
            </Text>
            <Text style={styles.conditionsLigne}>
              • Examens en USD ($).
            </Text>
            <Text style={styles.conditionsLigne}>
              • Devis valable 15 jours à compter de la date.
            </Text>
          </View>

          <View style={styles.totaux}>
            <View style={styles.totalLigne}>
              <Text>Sous-total examens</Text>
              <Text>{fmtUsd(data.sousTotalUsd)}</Text>
            </View>
            <View style={styles.totalLigne}>
              <Text>Total patient</Text>
              <Text>{fmtUsd(data.totalPatientUsd)}</Text>
            </View>
            <View style={styles.totalHonoraire}>
              <Text>Honoraires ({data.honorairePct}%)</Text>
              <Text>{fmtUsd(data.honoraireUsd)}</Text>
            </View>
            <View style={styles.totalFinal}>
              <Text style={styles.totalFinalLabel}>À RÉGLER</Text>
              <Text style={styles.totalFinalValeur}>{fmtUsd(data.totalPatientUsd)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.signatures}>
          <View style={styles.signatureBloc}>
            <Text style={styles.signatureTitre}>Préparé par</Text>
            <View style={styles.signatureLigne} />
            <Text style={styles.signatureNom}>{data.agentNom}</Text>
          </View>
          <View style={[styles.signatureBloc, { alignItems: "flex-end" }]}>
            <Text style={styles.signatureTitre}>Signature / Cachet</Text>
            <Image src={assets.signature} style={styles.signatureImage} />
          </View>
        </View>

        <View style={styles.pied} fixed>
          <View style={styles.piedLigne}>
            <Text style={styles.piedTexte}>Merci de votre confiance !</Text>
            <Text style={styles.piedTexte}>HAM LABORATOIRE — Kinshasa, RDC</Text>
          </View>
          <Text style={styles.piedAdresse}>{L.adresseComplete}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function genererPdfEstimationConvention(
  data: DonneesEstimationConventionPdf
): Promise<Buffer> {
  enregistrerPolicesPdfServeur();
  const instance = pdf(<DocumentEstimationConvention data={data} />);
  const blob = await instance.toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
