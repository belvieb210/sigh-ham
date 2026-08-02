import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
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

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 40,
    color: "#0f172a",
  },
  centre: { textAlign: "center" },
  entete: { marginBottom: 12 },
  ligneEntete: { fontSize: 10, marginBottom: 2 },
  ligneEntetePetite: { fontSize: 8, marginBottom: 1, color: "#334155" },
  slogan: { fontSize: 9, marginTop: 4, fontWeight: "bold" },
  separateur: {
    borderBottomWidth: 1,
    borderBottomColor: "#94a3b8",
    marginVertical: 10,
  },
  titre: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 6,
    letterSpacing: 1,
  },
  meta: { marginTop: 8, marginBottom: 14 },
  metaLigne: { fontSize: 10, marginBottom: 3 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#cbd5e1",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
  },
  colCode: { width: "14%" },
  colNom: { width: "46%" },
  colCat: { width: "22%" },
  colPrix: { width: "18%", textAlign: "right" },
  headerCell: { fontWeight: "bold", fontSize: 9 },
  totalRow: {
    flexDirection: "row",
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: "#f1f5f9",
    borderTopWidth: 1.5,
    borderTopColor: "#64748b",
  },
  totalLabel: { width: "82%", fontWeight: "bold", textAlign: "right", paddingRight: 12 },
  totalValeur: { width: "18%", fontWeight: "bold", textAlign: "right" },
  pied: {
    position: "absolute",
    bottom: 28,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    paddingTop: 8,
  },
  piedLigne: { fontSize: 8, textAlign: "center", color: "#475569", marginBottom: 1 },
  mention: {
    marginTop: 16,
    fontSize: 8,
    color: "#64748b",
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

  return (
    <Document
      title={`${donnees.labels.titreTicket} — ${patient}`}
      author="HAM Laboratoire"
      subject="Devis d'estimation d'examens"
    >
      <Page size="A4" style={styles.page}>
        <View style={[styles.entete, styles.centre]}>
          <Text style={styles.ligneEntete}>{L.ligne1}</Text>
          <Text style={[styles.ligneEntete, { fontWeight: "bold" }]}>{L.ligne2}</Text>
          <Text style={styles.ligneEntetePetite}>{L.rccm}</Text>
          <Text style={styles.ligneEntetePetite}>{L.idNat}</Text>
          <Text style={styles.ligneEntetePetite}>{L.nImpot}</Text>
          <Text style={styles.ligneEntetePetite}>{L.minSante}</Text>
          <Text style={styles.slogan}>{L.sloganLigne1}</Text>
          <Text style={styles.slogan}>{L.sloganLigne2}</Text>
        </View>

        <View style={styles.separateur} />
        <Text style={styles.titre}>{donnees.labels.titreTicket}</Text>
        <View style={styles.separateur} />

        <View style={styles.meta}>
          <Text style={styles.metaLigne}>
            {donnees.labels.numero} : {donnees.numeroEnregistrement}
          </Text>
          <Text style={styles.metaLigne}>
            {donnees.labels.date} : {donnees.dateEnregistrement}
          </Text>
          <Text style={styles.metaLigne}>
            {donnees.labels.patient} : {patient}
          </Text>
          <Text style={styles.metaLigne}>
            {donnees.labels.telephone} : {tel}
          </Text>
          <Text style={styles.metaLigne}>
            {donnees.labels.medecin} : {donnees.medecinResponsable}
          </Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.colCode, styles.headerCell]}>Code</Text>
          <Text style={[styles.colNom, styles.headerCell]}>{donnees.labels.description}</Text>
          <Text style={[styles.colCat, styles.headerCell]}>Catégorie</Text>
          <Text style={[styles.colPrix, styles.headerCell]}>{donnees.labels.prix}</Text>
        </View>

        {donnees.examens.map((examen) => (
          <View key={examen.id} style={styles.tableRow} wrap={false}>
            <Text style={styles.colCode}>{examen.code}</Text>
            <Text style={styles.colNom}>{examen.libelle}</Text>
            <Text style={styles.colCat}>{examen.categorie}</Text>
            <Text style={styles.colPrix}>{formaterPrix(examen.prix)}</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{donnees.labels.total}</Text>
          <Text style={styles.totalValeur}>{formaterPrix(montantTotal)}</Text>
        </View>

        <Text style={styles.mention}>
          Ce document est un devis estimatif. Les examens ne sont facturés qu&apos;après
          validation et envoi à la caisse.
        </Text>

        <View style={styles.pied} fixed>
          <Text style={styles.piedLigne}>{L.sloganPied}</Text>
          <Text style={styles.piedLigne}>
            {L.adresseLigne1} — {L.adresseLigne2}
          </Text>
          <Text style={styles.piedLigne}>{L.ville}</Text>
          <Text style={styles.piedLigne}>
            {L.telephones} · {L.email}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
