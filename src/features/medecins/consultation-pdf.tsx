import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { INFOS_LEGALES_TICKET } from "@/constants/ticket-thermique";

export interface DonneesCrConsultation {
  hopital: string;
  medecin: string;
  patient: string;
  numeroDossier: string;
  motif: string;
  anamnese?: string | null;
  examenClinique?: string | null;
  conclusion?: string | null;
  diagnostics: { libelle: string; codeCim?: string | null; principal?: boolean }[];
  actes?: { libelle: string; typeActe: string; quantite: number }[];
  lignesOrdonnance?: {
    medicament: string;
    quantite: number;
    posologie?: string | null;
  }[];
  debutLe: string;
  finLe?: string | null;
}

let policesEnregistrees = false;

export function enregistrerPolicesPdfConsultation() {
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

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 11,
    paddingTop: 28,
    paddingHorizontal: 36,
    paddingBottom: 40,
    color: "#111111",
  },
  titre: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  sousTitre: { fontSize: 10, color: "#555555", marginBottom: 16 },
  section: { marginTop: 12, marginBottom: 4 },
  sectionTitre: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1a4d7c",
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#cfe0ef",
    paddingBottom: 2,
  },
  ligne: { marginBottom: 3, lineHeight: 1.35 },
  label: { fontWeight: "bold" },
  pied: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    fontSize: 8,
    color: "#777777",
    textAlign: "center",
  },
});

function formaterDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("fr-FR");
  } catch {
    return iso;
  }
}

export function DocumentCrConsultation({
  donnees,
}: {
  donnees: DonneesCrConsultation;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.titre}>{donnees.hopital}</Text>
        <Text style={styles.sousTitre}>
          {INFOS_LEGALES_TICKET.adresseComplete}
        </Text>
        <Text style={styles.titre}>Compte rendu de consultation</Text>

        <View style={styles.section}>
          <Text style={styles.ligne}>
            <Text style={styles.label}>Patient : </Text>
            {donnees.patient}
          </Text>
          <Text style={styles.ligne}>
            <Text style={styles.label}>N° dossier : </Text>
            {donnees.numeroDossier}
          </Text>
          <Text style={styles.ligne}>
            <Text style={styles.label}>Médecin : </Text>
            {donnees.medecin}
          </Text>
          <Text style={styles.ligne}>
            <Text style={styles.label}>Début : </Text>
            {formaterDate(donnees.debutLe)}
            {donnees.finLe ? ` — Fin : ${formaterDate(donnees.finLe)}` : ""}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Motif</Text>
          <Text style={styles.ligne}>{donnees.motif || "—"}</Text>
        </View>

        {donnees.anamnese ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitre}>Anamnèse</Text>
            <Text style={styles.ligne}>{donnees.anamnese}</Text>
          </View>
        ) : null}

        {donnees.examenClinique ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitre}>Examen clinique</Text>
            <Text style={styles.ligne}>{donnees.examenClinique}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Diagnostics</Text>
          {donnees.diagnostics.length === 0 ? (
            <Text style={styles.ligne}>Aucun diagnostic</Text>
          ) : (
            donnees.diagnostics.map((d, i) => (
              <Text key={`${d.libelle}-${i}`} style={styles.ligne}>
                {d.principal ? "★ " : "• "}
                {d.libelle}
                {d.codeCim ? ` (${d.codeCim})` : ""}
              </Text>
            ))
          )}
        </View>

        {donnees.actes && donnees.actes.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitre}>Actes</Text>
            {donnees.actes.map((a, i) => (
              <Text key={`${a.libelle}-${i}`} style={styles.ligne}>
                • {a.libelle} ({a.typeActe}) ×{a.quantite}
              </Text>
            ))}
          </View>
        ) : null}

        {donnees.lignesOrdonnance && donnees.lignesOrdonnance.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitre}>Ordonnance</Text>
            {donnees.lignesOrdonnance.map((l, i) => (
              <Text key={`${l.medicament}-${i}`} style={styles.ligne}>
                • {l.medicament} ×{l.quantite}
                {l.posologie ? ` — ${l.posologie}` : ""}
              </Text>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Conclusion</Text>
          <Text style={styles.ligne}>{donnees.conclusion || "—"}</Text>
        </View>

        <Text style={styles.pied}>
          {INFOS_LEGALES_TICKET.sloganPied} — {INFOS_LEGALES_TICKET.telephones}
        </Text>
      </Page>
    </Document>
  );
}
