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
    alignSelf: "flex-start",
  },
  badgeTexte: { color: BLEU, fontSize: 9, fontWeight: "bold" },
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
  section: { marginTop: 8, marginBottom: 2 },
  sectionTitre: {
    fontSize: 11,
    fontWeight: "bold",
    color: BLEU,
    marginBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#cfe0ef",
    paddingBottom: 2,
  },
  grilleVitaux: { flexDirection: "row", flexWrap: "wrap" },
  vital: { width: "33%", marginBottom: 3 },
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

function ligneVital(label: string, valeur: string | number | null | undefined) {
  if (valeur === null || valeur === undefined || valeur === "") return null;
  return `${label} : ${valeur}`;
}

export function DocumentCrConsultation({
  donnees,
}: {
  donnees: DonneesCrConsultation;
}) {
  const L = INFOS_LEGALES_TICKET;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const logoSrc = `${origin}/images/logo-ham-laboratoire.png`;
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
      author="HAM Laboratoire"
    >
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
            <Text style={styles.badgeTexte}>COMPTE RENDU</Text>
            <Text style={styles.badgeTexte}>CONSULTATION</Text>
          </View>
        </View>
        <View style={styles.separateur} />

        <View style={styles.carte}>
          <Text style={styles.carteTitre}>Informations patient</Text>
          <Text style={styles.ligne}>
            <Text style={styles.label}>Nom : </Text>
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
            <Text style={styles.label}>Date : </Text>
            {formaterDate(donnees.debutLe)}
            {donnees.finLe ? ` — Clôturée : ${formaterDate(donnees.finLe)}` : ""}
          </Text>
        </View>

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

        <View style={styles.pied} fixed>
          <Text style={styles.piedTexte}>
            {L.sloganPied} — {L.telephones} — {L.adresseComplete}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
