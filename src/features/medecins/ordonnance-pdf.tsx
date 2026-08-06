import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { SignesVitauxPdf } from "@/features/medecins/consultation-pdf";
import {
  EnTetePdfLabo,
  PiedPdfLabo,
  type BrandingPdfLabo,
} from "@/features/medecins/en-tete-pdf-labo";

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
  signesVitaux?: SignesVitauxPdf | null;
  branding?: BrandingPdfLabo | null;
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

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    paddingTop: 20,
    paddingHorizontal: 28,
    paddingBottom: 48,
    color: "#111111",
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
  grilleVitaux: { flexDirection: "row", flexWrap: "wrap" },
  vital: { width: "33%", marginBottom: 3 },
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
});

function formaterDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("fr-FR");
  } catch {
    return iso;
  }
}

function ligneVital(label: string, valeur: string | number | null | undefined) {
  if (valeur === null || valeur === undefined || valeur === "") return null;
  return `${label} : ${valeur}`;
}

export function DocumentOrdonnancePdf({
  donnees,
}: {
  donnees: DonneesOrdonnancePdf;
}) {
  const sv = donnees.signesVitaux;
  const vitaux = [
    ligneVital("Température (°C)", sv?.temperature),
    ligneVital(
      "TA (mmHg)",
      sv?.tensionSystolique != null && sv?.tensionDiastolique != null
        ? `${sv.tensionSystolique}/${sv.tensionDiastolique}`
        : null
    ),
    ligneVital("FC (bpm)", sv?.frequenceCardiaque),
    ligneVital("FR", sv?.frequenceRespiratoire),
    ligneVital("Poids (kg)", sv?.poidsKg),
    ligneVital("Taille (cm)", sv?.tailleCm),
    ligneVital("SpO₂ (%)", sv?.saturationO2),
    ligneVital("Glycémie", sv?.glycemie),
  ].filter(Boolean) as string[];

  return (
    <Document
      title={`Ordonnance — ${donnees.patient}`}
      author={donnees.branding?.nom ?? "HAM Laboratoire"}
    >
      <Page size="A4" style={styles.page}>
        <EnTetePdfLabo
          branding={donnees.branding}
          lignesBadge={["ORDONNANCE", "MÉDICALE"]}
        />

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

        {vitaux.length > 0 ? (
          <View>
            <Text style={styles.sectionTitre}>Signes vitaux</Text>
            <View style={styles.grilleVitaux}>
              {vitaux.map((v) => (
                <Text key={v} style={styles.vital}>
                  {v}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

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

        <PiedPdfLabo branding={donnees.branding} />
      </Page>
    </Document>
  );
}
