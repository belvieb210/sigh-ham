import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { enregistrerPolicesPdfServeur } from "@/lib/pdf/assets-pdf-serveur";
import { formaterDateAffichage } from "@/lib/infirmiers/fiche-traitement-utils";
import type { FicheTraitementResume } from "@/lib/infirmiers/types-fiche-traitement";

export interface DonneesFicheTraitementPdf {
  hopital: string;
  fiche: FicheTraitementResume;
  historique?: FicheTraitementResume[];
}

const NOIR = "#111111";
const GRIS = "#555555";
const BLEU_ENTETE = "#1a4d7c";
const BLEU_CONTOUR = "#7eb6e0";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    paddingTop: 24,
    paddingHorizontal: 28,
    paddingBottom: 40,
    color: NOIR,
  },
  titre: {
    fontSize: 16,
    fontWeight: "bold",
    color: BLEU_ENTETE,
    textAlign: "center",
    marginBottom: 4,
  },
  sousTitre: {
    fontSize: 9,
    color: GRIS,
    textAlign: "center",
    marginBottom: 14,
  },
  section: { marginBottom: 10 },
  sectionTitre: {
    fontSize: 10,
    fontWeight: "bold",
    color: BLEU_ENTETE,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  ligneInfo: { fontSize: 10, marginBottom: 2 },
  label: { color: GRIS },
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
  cellDate: { width: "22%", padding: 4, fontSize: 9 },
  cellMed: { width: "28%", padding: 4, fontSize: 9 },
  cellDose: { width: "18%", padding: 4, fontSize: 9 },
  cellTraiteur: { width: "32%", padding: 4, fontSize: 9 },
  cellHeader: { fontWeight: "bold", color: BLEU_ENTETE },
  commentaire: { fontSize: 9, marginBottom: 3, paddingLeft: 4 },
  historiqueBloc: {
    marginTop: 6,
    padding: 6,
    borderWidth: 1,
    borderColor: BLEU_CONTOUR,
    borderRadius: 2,
  },
  historiqueTitre: { fontSize: 9, fontWeight: "bold", marginBottom: 2 },
  historiqueLigne: { fontSize: 8, color: GRIS, marginBottom: 1 },
});

function DocumentFicheTraitement({ data }: { data: DonneesFicheTraitementPdf }) {
  const { fiche, historique = [] } = data;
  const autresFiches = historique.filter((h) => h.id !== fiche.id);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.titre}>Fiche de traitement</Text>
        <Text style={styles.sousTitre}>{data.hopital}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Patient</Text>
          <Text style={styles.ligneInfo}>
            <Text style={styles.label}>Nom : </Text>
            {fiche.nomComplet}
          </Text>
          <Text style={styles.ligneInfo}>
            <Text style={styles.label}>N° dossier : </Text>
            {fiche.numeroDossier} — {fiche.numeroPatient}
          </Text>
          <Text style={styles.ligneInfo}>
            <Text style={styles.label}>Téléphone : </Text>
            {fiche.telephone ?? "—"}
          </Text>
          <Text style={styles.ligneInfo}>
            <Text style={styles.label}>Sexe : </Text>
            {fiche.sexe ?? "—"}
            {"  |  "}
            <Text style={styles.label}>Poids : </Text>
            {fiche.poidsKg != null ? `${fiche.poidsKg} kg` : "—"}
          </Text>
          <Text style={styles.ligneInfo}>
            <Text style={styles.label}>N° reçu : </Text>
            {fiche.numeroRecu ?? "—"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Prescription</Text>
          <Text style={styles.ligneInfo}>
            <Text style={styles.label}>Médecin prescripteur : </Text>
            {fiche.medecinPrescripteur ?? "—"}
            {fiche.telPrescripteur ? ` — ${fiche.telPrescripteur}` : ""}
          </Text>
          <Text style={styles.ligneInfo}>
            <Text style={styles.label}>Début : </Text>
            {formaterDateAffichage(fiche.debutTraitementLe)}
            {"  |  "}
            <Text style={styles.label}>Fin : </Text>
            {formaterDateAffichage(fiche.finTraitementLe)}
            {fiche.joursProlongation > 0
              ? ` (+${fiche.joursProlongation} j prolongation)`
              : ""}
          </Text>
          <Text style={styles.ligneInfo}>
            <Text style={styles.label}>Infirmier(ère) : </Text>
            {fiche.infirmierNom}
          </Text>
          <Text style={styles.ligneInfo}>
            <Text style={styles.label}>Statut : </Text>
            {fiche.statut}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Lignes de traitement</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.cellDate, styles.cellHeader]}>Date/heure</Text>
              <Text style={[styles.cellMed, styles.cellHeader]}>Médicament</Text>
              <Text style={[styles.cellDose, styles.cellHeader]}>Dose</Text>
              <Text style={[styles.cellTraiteur, styles.cellHeader]}>Traiteur</Text>
            </View>
            {fiche.lignes.map((l, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.cellDate}>
                  {l.effectueLe
                    ? new Date(l.effectueLe).toLocaleString("fr-FR")
                    : "—"}
                </Text>
                <Text style={styles.cellMed}>{l.medicament}</Text>
                <Text style={styles.cellDose}>{l.doseQuantite ?? "—"}</Text>
                <Text style={styles.cellTraiteur}>{l.nomTraiteur ?? "—"}</Text>
              </View>
            ))}
          </View>
        </View>

        {fiche.commentaires.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitre}>Commentaires</Text>
            {fiche.commentaires.map((c, i) => (
              <Text key={i} style={styles.commentaire}>
                • {c.texte}
              </Text>
            ))}
          </View>
        ) : null}

        {autresFiches.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitre}>Historique du dossier</Text>
            {autresFiches.map((h) => (
              <View key={h.id} style={styles.historiqueBloc}>
                <Text style={styles.historiqueTitre}>
                  {formaterDateAffichage(h.debutTraitementLe)} →{" "}
                  {formaterDateAffichage(h.finEffectiveLe)} — {h.statut}
                </Text>
                <Text style={styles.historiqueLigne}>
                  {h.lignes.length} ligne(s) — Infirmier : {h.infirmierNom}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

export async function genererPdfFicheTraitement(
  data: DonneesFicheTraitementPdf
): Promise<Buffer> {
  enregistrerPolicesPdfServeur();
  const instance = pdf(<DocumentFicheTraitement data={data} />);
  const blob = await instance.toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
