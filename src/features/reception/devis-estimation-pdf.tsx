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
  /** Utilisateur connecté (réception) qui émet le devis */
  agentNom?: string;
  /** Remise commerciale en USD (≥ 0) */
  remise?: number;
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
    agent?: string;
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

const NOIR = "#111111";
const GRIS = "#555555";
const GRIS_CLAIR = "#f5f5f5";
const BORDURE = "#cccccc";
/** Rouge proforma (N° document + montant total) */
const ROUGE = "#c0162d";

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
    paddingBottom: 0,
  },
  enTeteGauche: {
    flexDirection: "row",
    width: "58%",
    alignItems: "flex-start",
  },
  logo: {
    width: 48,
    height: 48,
    objectFit: "contain",
  },
  enTeteInfos: {
    flex: 1,
    paddingLeft: 8,
  },
  nomLabo: {
    fontSize: 12,
    fontWeight: "bold",
    color: NOIR,
    marginBottom: 1,
  },
  sousNom: {
    fontSize: 8,
    color: GRIS,
    marginBottom: 0,
    lineHeight: 1.2,
  },
  contact: {
    fontSize: 8,
    color: GRIS,
    marginTop: 0,
    lineHeight: 1.2,
  },
  enTeteDroite: {
    width: "40%",
    alignItems: "flex-end",
  },
  badgeTitre: {
    borderWidth: 1.5,
    borderColor: NOIR,
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginBottom: 2,
  },
  badgeTitreTexte: {
    color: NOIR,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 1,
  },
  /** Bloc meta compact, aligné sous le badge ESTIMATION (à droite) */
  metaBloc: {
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    textAlign: "right",
  },
  metaLigneTexte: {
    fontSize: 9,
    color: NOIR,
    lineHeight: 1.15,
    marginBottom: 0,
    textAlign: "right",
  },
  metaLigneNumero: {
    fontSize: 10,
    fontWeight: "bold",
    color: ROUGE,
    lineHeight: 1.15,
    marginBottom: 0,
    textAlign: "right",
  },
  separateurEnTete: {
    borderBottomWidth: 1.5,
    borderBottomColor: NOIR,
    marginTop: 2,
    marginBottom: 8,
  },
  cartes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  carte: {
    width: "48.5%",
    borderWidth: 1,
    borderColor: BORDURE,
    borderRadius: 4,
    padding: 8,
  },
  carteTitre: {
    fontSize: 10,
    fontWeight: "bold",
    color: NOIR,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  carteLigne: {
    fontSize: 11,
    marginBottom: 2,
    color: NOIR,
  },
  carteLabel: {
    color: GRIS,
    fontSize: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: BORDURE,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: NOIR,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  headerCell: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 10,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: BORDURE,
  },
  tableRowAlt: {
    backgroundColor: GRIS_CLAIR,
  },
  colN: { width: "8%", fontSize: 10 },
  colDesc: { width: "48%", fontSize: 10 },
  colCode: { width: "18%", fontSize: 10, fontWeight: "bold" },
  colPrix: { width: "26%", fontSize: 10, textAlign: "right", fontWeight: "bold" },
  basTable: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  conditions: {
    width: "52%",
    borderWidth: 1,
    borderColor: BORDURE,
    borderRadius: 4,
    padding: 6,
  },
  conditionsTitre: {
    fontSize: 10,
    fontWeight: "bold",
    color: NOIR,
    marginBottom: 3,
  },
  conditionsLigne: {
    fontSize: 9,
    color: GRIS,
    marginBottom: 1,
    lineHeight: 1.25,
  },
  totaux: {
    width: "44%",
  },
  totalLigne: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: BORDURE,
    fontSize: 10,
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
  totalFinalLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: ROUGE,
  },
  totalFinalValeur: {
    fontSize: 12,
    fontWeight: "bold",
    color: ROUGE,
  },
  signatures: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 4,
    marginBottom: 8,
  },
  signatureBloc: {
    width: "42%",
  },
  signatureTitre: {
    fontSize: 9,
    color: GRIS,
    marginBottom: 2,
  },
  signatureImage: {
    width: 120,
    height: 48,
    objectFit: "contain",
  },
  signatureLigne: {
    borderBottomWidth: 1,
    borderBottomColor: "#999999",
    marginTop: 4,
    marginBottom: 2,
  },
  signatureNom: {
    fontSize: 10,
    color: NOIR,
  },
  pied: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: NOIR,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  piedLigne: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 3,
  },
  piedTexte: {
    color: "#ffffff",
    fontSize: 9,
  },
  piedAdresse: {
    color: "#ffffff",
    fontSize: 8,
    lineHeight: 1.3,
    textAlign: "center",
  },
});

interface PropsDocumentDevisEstimation {
  donnees: DonneesDevisEstimation;
}

export function DocumentDevisEstimation({ donnees }: PropsDocumentDevisEstimation) {
  const L = INFOS_LEGALES_TICKET;
  const sousTotal = donnees.examens.reduce((t, e) => t + e.prix, 0);
  const remise = Math.min(Math.max(0, Number(donnees.remise) || 0), sousTotal);
  const montantTotal = Math.max(0, sousTotal - remise);
  const patient = `${donnees.prenomPatient} ${donnees.nomPatient}`.trim();
  const tel = donnees.telephonePatient?.trim() || "—";
  const agent = donnees.agentNom?.trim() || "—";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const logoSrc = `${origin}/images/logo-ham-laboratoire.png`;
  const signatureSrc = `${origin}/images/signature-ham.png`;

  return (
    <Document
      title={`${donnees.labels.titreTicket} — ${patient}`}
      author="HAM Laboratoire"
      subject="Devis d'estimation d'examens"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.enTete}>
          <View style={styles.enTeteGauche}>
            <Image src={logoSrc} style={styles.logo} />
            <View style={styles.enTeteInfos}>
              <Text style={styles.nomLabo}>HAM LABORATOIRE</Text>
              <Text style={styles.sousNom}>
                {"Centre de Diagnostic et d'Analyses Médicales"}
              </Text>
              <Text style={styles.sousNom}>{L.rccm}</Text>
              <Text style={styles.contact}>Tél. {L.telephones}</Text>
              <Text style={styles.contact}>{L.email}</Text>
            </View>
          </View>

          <View style={styles.enTeteDroite}>
            <View style={styles.badgeTitre}>
              <Text style={styles.badgeTitreTexte}>{donnees.labels.titreTicket}</Text>
            </View>
            {/*
              Une seule Text par ligne (pas de View flex row) :
              react-pdf ajoute sinon une hauteur min. trop grande entre les lignes.
            */}
            <Text style={styles.metaBloc}>
              <Text style={styles.metaLigneNumero}>
                {`N°  ${donnees.numeroEnregistrement || "—"}\n`}
              </Text>
              <Text style={styles.metaLigneTexte}>
                {`Date : ${donnees.dateEnregistrement || "—"}\n`}
              </Text>
              <Text style={styles.metaLigneTexte}>{`Valable pour : 15 jours\n`}</Text>
              <Text style={styles.metaLigneTexte}>Devise : USD ($)</Text>
            </Text>
          </View>
        </View>

        <View style={styles.separateurEnTete} />

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
              <Text style={styles.carteLabel}>
                {donnees.labels.agent ?? "Émis par"} :{" "}
              </Text>
              {agent}
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
              {"• Tarifs susceptibles d'évoluer selon protocoles."}
            </Text>
            <Text style={styles.conditionsLigne}>
              • Devis valable 15 jours à compter de la date.
            </Text>
          </View>

          <View style={styles.totaux}>
            <View style={styles.totalLigne}>
              <Text>Sous-total</Text>
              <Text>{formaterPrix(sousTotal)}</Text>
            </View>
            <View style={styles.totalLigne}>
              <Text>Remise</Text>
              <Text>{formaterPrix(remise)}</Text>
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
            <Text style={styles.signatureNom}>{agent}</Text>
          </View>

          <View style={[styles.signatureBloc, { alignItems: "flex-end" }]}>
            <Text style={styles.signatureTitre}>Signature / Cachet</Text>
            <Image src={signatureSrc} style={styles.signatureImage} />
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
