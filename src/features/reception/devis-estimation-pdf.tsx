import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import type { TypeExamenReception } from "@/lib/reception/types";
import { INFOS_LEGALES_TICKET } from "@/constants/ticket-thermique";

export interface DonneesDevisEstimation {
  examens: TypeExamenReception[];
  medecinResponsable: string;
  nomPatient: string;
  prenomPatient: string;
  telephonePatient?: string;
  numeroEnregistrement: string;
  dateEnregistrement: string;
  labels: {
    titreTicket: string;
    numero: string;
    date: string;
    patient: string;
    telephone: string;
    medecin: string;
    description: string;
    prix: string;
    total: string;
    genereLe: string;
  };
}

let policesEnregistrees = false;

export function enregistrerPolicesPdf() {
  if (policesEnregistrees || typeof window === "undefined") return;
  const base = `${window.location.origin}/fonts`;
  Font.register({
    family: "Roboto",
    fonts: [
      { src: `${base}/Roboto-Regular.ttf`, fontWeight: "normal" },
      { src: `${base}/Roboto-Bold.ttf`, fontWeight: "bold" },
    ],
  });
  policesEnregistrees = true;
}

function formaterPrix(prix: number): string {
  return `$ ${prix.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

const BLEU = "#003366";
const BLEU_CLAIR = "#e8f1f8";
const ROUGE = "#c62828";
const GRIS = "#475569";
const GRIS_CLAIR = "#f8fafc";
const BORDURE = "#93c5e8";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 11,
    paddingTop: 28,
    paddingHorizontal: 28,
    paddingBottom: 48,
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },
  enTete: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  enTeteGauche: {
    flexDirection: "row",
    width: "58%",
    gap: 10,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: BLEU,
    alignItems: "center",
    justifyContent: "center",
  },
  logoBadgeTexte: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  enTeteInfos: {
    flex: 1,
    paddingLeft: 8,
  },
  nomLabo: {
    fontSize: 13,
    fontWeight: "bold",
    color: BLEU,
    marginBottom: 2,
  },
  sousNom: {
    fontSize: 10,
    color: GRIS,
    marginBottom: 1,
  },
  contact: {
    fontSize: 9,
    color: GRIS,
    marginTop: 4,
  },
  enTeteDroite: {
    width: "40%",
    alignItems: "flex-end",
  },
  badgeTitre: {
    backgroundColor: BLEU,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  badgeTitreTexte: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  numeroDoc: {
    color: ROUGE,
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 4,
  },
  metaDroite: {
    fontSize: 10,
    color: "#0f172a",
    marginBottom: 2,
    textAlign: "right",
  },
  cartes: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  carte: {
    width: "48.5%",
    borderWidth: 1.5,
    borderColor: BORDURE,
    borderRadius: 6,
    padding: 12,
    backgroundColor: "#ffffff",
  },
  carteTitre: {
    fontSize: 10,
    fontWeight: "bold",
    color: BLEU,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  carteLigne: {
    fontSize: 11,
    marginBottom: 4,
    color: "#0f172a",
  },
  carteLabel: {
    color: GRIS,
    fontSize: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 14,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BLEU,
    paddingVertical: 9,
    paddingHorizontal: 8,
  },
  headerCell: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 10,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRowAlt: {
    backgroundColor: GRIS_CLAIR,
  },
  colN: { width: "8%", fontSize: 11 },
  colDesc: { width: "48%", fontSize: 11 },
  colCode: { width: "18%", fontSize: 11, fontWeight: "bold", color: BLEU },
  colPrix: { width: "26%", fontSize: 11, textAlign: "right", fontWeight: "bold" },
  basTable: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 10,
  },
  conditions: {
    width: "52%",
    borderWidth: 1,
    borderColor: BORDURE,
    borderRadius: 6,
    padding: 10,
  },
  conditionsTitre: {
    fontSize: 10,
    fontWeight: "bold",
    color: BLEU,
    marginBottom: 6,
  },
  conditionsLigne: {
    fontSize: 9,
    color: GRIS,
    marginBottom: 3,
    lineHeight: 1.35,
  },
  totaux: {
    width: "44%",
  },
  totalLigne: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  totalFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginTop: 4,
    backgroundColor: BLEU_CLAIR,
    borderRadius: 4,
  },
  totalFinalLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: ROUGE,
  },
  totalFinalValeur: {
    fontSize: 14,
    fontWeight: "bold",
    color: ROUGE,
  },
  signatures: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 8,
    marginBottom: 18,
  },
  signatureBloc: {
    width: "42%",
  },
  signatureTitre: {
    fontSize: 10,
    color: GRIS,
    marginBottom: 4,
  },
  signatureImage: {
    width: 160,
    height: 70,
    objectFit: "contain",
  },
  signatureLigne: {
    borderBottomWidth: 1,
    borderBottomColor: "#94a3b8",
    marginTop: 28,
    marginBottom: 4,
  },
  signatureNom: {
    fontSize: 10,
    color: "#0f172a",
  },
  pied: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BLEU,
    paddingVertical: 10,
    paddingHorizontal: 28,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  piedTexte: {
    color: "#ffffff",
    fontSize: 9,
  },
});

interface PropsDocumentDevisEstimation {
  donnees: DonneesDevisEstimation;
}

export function DocumentDevisEstimation({ donnees }: PropsDocumentDevisEstimation) {
  const L = INFOS_LEGALES_TICKET;
  const montantTotal = donnees.examens.reduce((t, e) => t + e.prix, 0);
  const patient = `${donnees.prenomPatient} ${donnees.nomPatient}`.trim();
  const tel = donnees.telephonePatient?.trim() || "—";
  const signatureSrc =
    typeof window !== "undefined"
      ? `${window.location.origin}/images/signature-ham.png`
      : "/images/signature-ham.png";

  return (
    <Document
      title={`${donnees.labels.titreTicket} — ${patient}`}
      author="HAM Laboratoire"
      subject="Devis d'estimation d'examens"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.enTete}>
          <View style={styles.enTeteGauche}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeTexte}>HAM</Text>
            </View>
            <View style={styles.enTeteInfos}>
              <Text style={styles.nomLabo}>HAM LABORATOIRE</Text>
              <Text style={styles.sousNom}>Centre de Diagnostic et d&apos;Analyses Médicales</Text>
              <Text style={styles.sousNom}>{L.rccm}</Text>
              <Text style={styles.contact}>
                Tél. {L.telephones}
              </Text>
              <Text style={styles.contact}>{L.email}</Text>
            </View>
          </View>

          <View style={styles.enTeteDroite}>
            <View style={styles.badgeTitre}>
              <Text style={styles.badgeTitreTexte}>{donnees.labels.titreTicket}</Text>
            </View>
            <Text style={styles.numeroDoc}>
              N° {donnees.numeroEnregistrement || "—"}
            </Text>
            <Text style={styles.metaDroite}>
              Date : {donnees.dateEnregistrement || "—"}
            </Text>
            <Text style={styles.metaDroite}>Valable pour : 15 jours</Text>
            <Text style={styles.metaDroite}>Devise : USD ($)</Text>
          </View>
        </View>

        <View style={styles.cartes}>
          <View style={styles.carte}>
            <Text style={styles.carteTitre}>Informations du patient</Text>
            <Text style={styles.carteLigne}>
              <Text style={styles.carteLabel}>Nom : </Text>
              {patient || "—"}
            </Text>
            <Text style={styles.carteLigne}>
              <Text style={styles.carteLabel}>Téléphone : </Text>
              {tel}
            </Text>
            <Text style={styles.carteLigne}>
              <Text style={styles.carteLabel}>Dossier N° : </Text>
              {donnees.numeroEnregistrement || "—"}
            </Text>
          </View>

          <View style={styles.carte}>
            <Text style={styles.carteTitre}>Émis pour</Text>
            <Text style={styles.carteLigne}>
              <Text style={styles.carteLabel}>Patient : </Text>
              {patient || "—"}
            </Text>
            <Text style={styles.carteLigne}>
              <Text style={styles.carteLabel}>Médecin / Prescripteur : </Text>
              {donnees.medecinResponsable || "—"}
            </Text>
            <Text style={styles.carteLigne}>
              <Text style={styles.carteLabel}>Examens : </Text>
              {donnees.examens.length} sélectionné
              {donnees.examens.length > 1 ? "s" : ""}
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

          {donnees.examens.map((examen, index) => (
            <View
              key={examen.id}
              style={
                index % 2 === 1
                  ? [styles.tableRow, styles.tableRowAlt]
                  : styles.tableRow
              }
              wrap={false}
            >
              <Text style={styles.colN}>{index + 1}</Text>
              <Text style={styles.colDesc}>{examen.libelle}</Text>
              <Text style={styles.colCode}>{examen.code}</Text>
              <Text style={styles.colPrix}>{formaterPrix(examen.prix)}</Text>
            </View>
          ))}
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
              • Tarifs susceptibles d&apos;évoluer selon protocoles.
            </Text>
            <Text style={styles.conditionsLigne}>
              • Devis valable 15 jours à compter de la date.
            </Text>
          </View>

          <View style={styles.totaux}>
            <View style={styles.totalLigne}>
              <Text>Sous-total</Text>
              <Text>{formaterPrix(montantTotal)}</Text>
            </View>
            <View style={styles.totalLigne}>
              <Text>Remise</Text>
              <Text>$ 0</Text>
            </View>
            <View style={styles.totalFinal}>
              <Text style={styles.totalFinalLabel}>MONTANT TOTAL</Text>
              <Text style={styles.totalFinalValeur}>
                {formaterPrix(montantTotal)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.signatures}>
          <View style={styles.signatureBloc}>
            <Text style={styles.signatureTitre}>Préparé par</Text>
            <View style={styles.signatureLigne} />
            <Text style={styles.signatureNom}>Réception — HAM Laboratoire</Text>
          </View>

          <View style={[styles.signatureBloc, { alignItems: "flex-end" }]}>
            <Text style={styles.signatureTitre}>Signature / Cachet</Text>
            <Image src={signatureSrc} style={styles.signatureImage} />
          </View>
        </View>

        <View style={styles.pied} fixed>
          <Text style={styles.piedTexte}>Merci de votre confiance !</Text>
          <Text style={styles.piedTexte}>HAM LABORATOIRE — Kinshasa, RDC</Text>
        </View>
      </Page>
    </Document>
  );
}
