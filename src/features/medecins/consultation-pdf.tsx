import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import {
  CartePatientPdf,
  EnTetePdfLabo,
  PiedPdfLabo,
  type BrandingPdfLabo,
} from "@/features/medecins/en-tete-pdf-labo";

export interface SignesVitauxPdf {
  temperature?: number | null;
  tensionSystolique?: number | null;
  tensionDiastolique?: number | null;
  frequenceCardiaque?: number | null;
  frequenceRespiratoire?: number | null;
  poidsKg?: number | null;
  tailleCm?: number | null;
  saturationO2?: number | null;
  glycemie?: number | null;
}

export interface DonneesCrConsultation {
  hopital: string;
  medecin: string;
  patient: string;
  numeroDossier: string;
  telephone?: string | null;
  age?: number | null;
  sexe?: string | null;
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
  signesVitaux?: SignesVitauxPdf | null;
  debutLe: string;
  finLe?: string | null;
  branding?: BrandingPdfLabo | null;
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

const BLEU = "#1a4d7c";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 42,
    color: "#111111",
  },
  ligne: { marginBottom: 1, lineHeight: 1.2, fontSize: 10 },
  section: { marginTop: 4, marginBottom: 1 },
  sectionTitre: {
    fontSize: 10,
    fontWeight: "bold",
    color: BLEU,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#cfe0ef",
    paddingBottom: 1,
  },
  grilleVitaux: { flexDirection: "row", flexWrap: "wrap" },
  vital: { width: "33%", marginBottom: 1, fontSize: 9, lineHeight: 1.15 },
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

export function DocumentCrConsultation({
  donnees,
}: {
  donnees: DonneesCrConsultation;
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
      title={`CR Consultation — ${donnees.patient}`}
      author={donnees.branding?.nom ?? "HAM Laboratoire"}
    >
      <Page size="A4" style={styles.page}>
        <EnTetePdfLabo
          branding={donnees.branding}
          lignesBadge={["COMPTE RENDU", "CONSULTATION"]}
        />

        <CartePatientPdf
          titre="Informations patient"
          lignes={[
            { label: "Patient", valeur: donnees.patient || "—" },
            {
              label: "N° dossier",
              valeur: [
                donnees.numeroDossier || "—",
                donnees.telephone ? `Tél. : ${donnees.telephone}` : null,
              ]
                .filter(Boolean)
                .join("  ·  "),
            },
            {
              label: "Âge / Sexe",
              valeur: [
                donnees.age != null ? `${donnees.age} ans` : "—",
                donnees.sexe || null,
              ]
                .filter(Boolean)
                .join(" / "),
            },
            { label: "Médecin", valeur: donnees.medecin || "—" },
            {
              label: "Date",
              valeur:
                formaterDate(donnees.debutLe) +
                (donnees.finLe
                  ? ` — Clôturée : ${formaterDate(donnees.finLe)}`
                  : ""),
            },
          ]}
        />

        {vitaux.length > 0 ? (
          <View style={styles.section}>
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
            <Text style={styles.sectionTitre}>Ordonnance liée</Text>
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

        <PiedPdfLabo branding={donnees.branding} />
      </Page>
    </Document>
  );
}
