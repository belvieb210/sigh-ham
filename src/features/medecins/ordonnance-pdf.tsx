import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import { INFOS_LEGALES_TICKET } from "@/constants/ticket-thermique";

export interface DonneesOrdonnancePdf {
  medecin: string;
  patient: string;
  numeroDossier: string;
  telephone?: string | null;
  age?: number | null;
  sexe?: string | null;
  prescritLe: string;
  notes?: string | null;
  lignes: {
    medicament: string;
    dosage?: string | null;
    quantite: number;
    posologie?: string | null;
    dureeJours?: number | null;
  }[];
  imagerie?: {
    categories?: string[];
    typeExamen?: string;
    but?: string;
    conduiteATenir?: string;
  } | null;
}

let polices = false;

export function enregistrerPolicesPdfOrdonnance() {
  if (polices || typeof window === "undefined") return;
  const base = `${window.location.origin}/fonts`;
  Font.register({
    family: "Roboto",
    fonts: [
      { src: `${base}/Roboto-Regular.ttf`, fontWeight: "normal" },
      { src: `${base}/Roboto-Bold.ttf`, fontWeight: "bold" },
    ],
  });
  polices = true;
}

const BLEU = "#1a4d7c";
const BLEU_CONTOUR = "#7eb6e0";
const GRIS = "#555555";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    paddingTop: 20,
    paddingHorizontal: 28,
    paddingBottom: 48,
    color: "#111111",
  },
  enTete: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  enTeteGauche: { flexDirection: "row", width: "62%" },
  logo: { width: 44, height: 44, objectFit: "contain" },
  infos: { paddingLeft: 8, flex: 1 },
  nomLabo: { fontSize: 12, fontWeight: "bold", marginBottom: 1 },
  sousNom: { fontSize: 8, color: GRIS, lineHeight: 1.2 },
  badge: {
    borderWidth: 1.5,
    borderColor: BLEU,
    borderRadius: 3,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  badgeTexte: { color: BLEU, fontSize: 9, fontWeight: "bold", textAlign: "center" },
  separateur: {
    borderBottomWidth: 1.5,
    borderBottomColor: BLEU_CONTOUR,
    marginVertical: 8,
  },
  carte: {
    borderWidth: 1,
    borderColor: BLEU_CONTOUR,
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  carteTitre: {
    fontSize: 10,
    fontWeight: "bold",
    color: BLEU,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  ligne: { marginBottom: 2, lineHeight: 1.35 },
  label: { fontWeight: "bold" },
  sectionTitre: {
    fontSize: 11,
    fontWeight: "bold",
    color: BLEU,
    marginBottom: 4,
    marginTop: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#cfe0ef",
    paddingBottom: 2,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BLEU,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  headerCell: { color: "#fff", fontWeight: "bold", fontSize: 9 },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: BLEU_CONTOUR,
  },
  colMed: { width: "42%", fontSize: 9 },
  colPos: { width: "28%", fontSize: 9 },
  colQte: { width: "12%", fontSize: 9 },
  colDur: { width: "18%", fontSize: 9 },
  pied: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BLEU,
    paddingVertical: 7,
    paddingHorizontal: 20,
  },
  piedTexte: { color: "#ffffff", fontSize: 8, textAlign: "center" },
});

function formaterDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("fr-FR");
  } catch {
    return iso;
  }
}

export function DocumentOrdonnancePdf({
  donnees,
}: {
  donnees: DonneesOrdonnancePdf;
}) {
  const L = INFOS_LEGALES_TICKET;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const logoSrc = `${origin}/images/logo-ham-laboratoire.png`;

  return (
    <Document title={`Ordonnance — ${donnees.patient}`} author="HAM Laboratoire">
      <Page size="A4" style={styles.page}>
        <View style={styles.enTete}>
          <View style={styles.enTeteGauche}>
            <Image src={logoSrc} style={styles.logo} />
            <View style={styles.infos}>
              <Text style={styles.nomLabo}>HAM LABORATOIRE</Text>
              <Text style={styles.sousNom}>
                Centre de Diagnostic et d&apos;Analyses Médicales
              </Text>
              <Text style={styles.sousNom}>{L.rccm}</Text>
              <Text style={styles.sousNom}>Tél. {L.telephones}</Text>
              <Text style={styles.sousNom}>{L.email}</Text>
            </View>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeTexte}>ORDONNANCE</Text>
            <Text style={styles.badgeTexte}>MÉDICALE</Text>
          </View>
        </View>
        <View style={styles.separateur} />

        <View style={styles.carte}>
          <Text style={styles.carteTitre}>Patient &amp; prescritteur</Text>
          <Text style={styles.ligne}>
            <Text style={styles.label}>Patient : </Text>
            {donnees.patient}
          </Text>
          <Text style={styles.ligne}>
            <Text style={styles.label}>N° dossier : </Text>
            {donnees.numeroDossier}
            {donnees.telephone ? `  ·  Tél. : ${donnees.telephone}` : ""}
          </Text>
          <Text style={styles.ligne}>
            <Text style={styles.label}>Âge / Sexe : </Text>
            {donnees.age != null ? `${donnees.age} ans` : "—"}
            {donnees.sexe ? ` / ${donnees.sexe}` : ""}
          </Text>
          <Text style={styles.ligne}>
            <Text style={styles.label}>Médecin : </Text>
            {donnees.medecin}
          </Text>
          <Text style={styles.ligne}>
            <Text style={styles.label}>Prescrit le : </Text>
            {formaterDate(donnees.prescritLe)}
          </Text>
        </View>

        <Text style={styles.sectionTitre}>Médicaments prescrits</Text>
        {donnees.lignes.length === 0 ? (
          <Text style={styles.ligne}>Aucun médicament.</Text>
        ) : (
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.colMed, styles.headerCell]}>Médicament</Text>
              <Text style={[styles.colPos, styles.headerCell]}>Posologie</Text>
              <Text style={[styles.colQte, styles.headerCell]}>Qté</Text>
              <Text style={[styles.colDur, styles.headerCell]}>Durée</Text>
            </View>
            {donnees.lignes.map((l, i) => (
              <View key={`${l.medicament}-${i}`} style={styles.tableRow} wrap={false}>
                <Text style={styles.colMed}>
                  {l.medicament}
                  {l.dosage ? ` (${l.dosage})` : ""}
                </Text>
                <Text style={styles.colPos}>{l.posologie || "—"}</Text>
                <Text style={styles.colQte}>{l.quantite}</Text>
                <Text style={styles.colDur}>
                  {l.dureeJours != null ? `${l.dureeJours} j` : "—"}
                </Text>
              </View>
            ))}
          </View>
        )}

        {donnees.imagerie &&
        (donnees.imagerie.categories?.length ||
          donnees.imagerie.typeExamen ||
          donnees.imagerie.but) ? (
          <View>
            <Text style={styles.sectionTitre}>Imagerie / examens</Text>
            {donnees.imagerie.categories && donnees.imagerie.categories.length > 0 ? (
              <Text style={styles.ligne}>
                Catégories : {donnees.imagerie.categories.join(", ")}
              </Text>
            ) : null}
            {donnees.imagerie.typeExamen ? (
              <Text style={styles.ligne}>
                Type : {donnees.imagerie.typeExamen}
              </Text>
            ) : null}
            {donnees.imagerie.but ? (
              <Text style={styles.ligne}>But : {donnees.imagerie.but}</Text>
            ) : null}
            {donnees.imagerie.conduiteATenir ? (
              <Text style={styles.ligne}>
                Conduite à tenir : {donnees.imagerie.conduiteATenir}
              </Text>
            ) : null}
          </View>
        ) : null}

        {donnees.notes ? (
          <View>
            <Text style={styles.sectionTitre}>Notes</Text>
            <Text style={styles.ligne}>{donnees.notes}</Text>
          </View>
        ) : null}

        <View style={styles.pied} fixed>
          <Text style={styles.piedTexte}>
            {L.sloganPied} — {L.telephones} — {L.adresseComplete}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
