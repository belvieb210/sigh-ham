import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import {
  CartePatientPdfInfirmiers,
  EnTetePdfInfirmiersServeur,
  PiedPdfInfirmiersServeur,
} from "@/lib/infirmiers/en-tete-pdf-infirmiers-serveur";
import { formaterDateAffichage } from "@/lib/infirmiers/fiche-traitement-utils";
import {
  cheminsAssetsPdfServeur,
  enregistrerPolicesPdfServeur,
} from "@/lib/pdf/assets-pdf-serveur";
import type { FicheTraitementResume } from "@/lib/infirmiers/types-fiche-traitement";

export interface DonneesFicheTraitementPdf {
  hopital: string;
  fiche: FicheTraitementResume;
  historique?: FicheTraitementResume[];
}

const NOIR = "#111111";
const GRIS = "#555555";
const BLEU = "#1a4d7c";
const BLEU_CONTOUR = "#7eb6e0";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 52,
    color: NOIR,
  },
  sectionTitre: {
    fontSize: 10,
    fontWeight: "bold",
    color: BLEU,
    marginBottom: 4,
    marginTop: 6,
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
  cellHeader: { fontWeight: "bold", color: BLEU },
  commentaire: { fontSize: 9, marginBottom: 3, paddingLeft: 4 },
  historiqueBloc: {
    marginTop: 4,
    padding: 6,
    borderWidth: 1,
    borderColor: BLEU_CONTOUR,
    borderRadius: 2,
  },
  historiqueTitre: { fontSize: 9, fontWeight: "bold", marginBottom: 2 },
  historiqueLigne: { fontSize: 8, color: GRIS, marginBottom: 1 },
});

function DocumentFicheTraitement({
  data,
  logoPath,
}: {
  data: DonneesFicheTraitementPdf;
  logoPath: string;
}) {
  const { fiche, historique = [] } = data;
  const autresFiches = historique.filter((h) => h.id !== fiche.id);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <EnTetePdfInfirmiersServeur
          logoPath={logoPath}
          hopital={data.hopital}
          lignesBadge={["FICHE DE", "TRAITEMENT"]}
        />

        <CartePatientPdfInfirmiers
          titre="Patient"
          lignes={[
            `Nom : ${fiche.nomComplet}`,
            `N° dossier : ${fiche.numeroDossier} — ${fiche.numeroPatient}`,
            `Téléphone : ${fiche.telephone ?? "—"}`,
            `Sexe : ${fiche.sexe ?? "—"} — Poids : ${fiche.poidsKg != null ? `${fiche.poidsKg} kg` : "—"}`,
            `N° reçu : ${fiche.numeroRecu ?? "—"}`,
          ]}
        />

        <Text style={styles.sectionTitre}>Prescription</Text>
        <Text style={styles.ligneInfo}>
          <Text style={styles.label}>Médecin prescripteur : </Text>
          {fiche.medecinPrescripteur ?? "—"}
          {fiche.telPrescripteur ? ` — ${fiche.telPrescripteur}` : ""}
        </Text>
        <Text style={styles.ligneInfo}>
          <Text style={styles.label}>Période : </Text>
          {formaterDateAffichage(fiche.debutTraitementLe)} →{" "}
          {formaterDateAffichage(fiche.finEffectiveLe)}
          {fiche.joursProlongation > 0
            ? ` (+${fiche.joursProlongation} j prolongation)`
            : ""}
        </Text>
        <Text style={styles.ligneInfo}>
          <Text style={styles.label}>Infirmier(ère) : </Text>
          {fiche.infirmierNom} — Statut : {fiche.statut}
        </Text>

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

        {fiche.commentaires.length > 0 ? (
          <>
            <Text style={styles.sectionTitre}>Commentaires</Text>
            {fiche.commentaires.map((c, i) => (
              <Text key={i} style={styles.commentaire}>
                • {c.texte}
              </Text>
            ))}
          </>
        ) : null}

        {autresFiches.length > 0 ? (
          <>
            <Text style={styles.sectionTitre}>Autres traitements du dossier</Text>
            {autresFiches.map((h) => (
              <View key={h.id} style={styles.historiqueBloc}>
                <Text style={styles.historiqueTitre}>
                  {formaterDateAffichage(h.debutTraitementLe)} →{" "}
                  {formaterDateAffichage(h.finEffectiveLe)} — {h.statut}
                </Text>
                <Text style={styles.historiqueLigne}>
                  {h.lignes.length} ligne(s) — Poids :{" "}
                  {h.poidsKg != null ? `${h.poidsKg} kg` : "—"} — Infirmier :{" "}
                  {h.infirmierNom}
                </Text>
              </View>
            ))}
          </>
        ) : null}

        <PiedPdfInfirmiersServeur />
      </Page>
    </Document>
  );
}

export async function genererPdfFicheTraitement(
  data: DonneesFicheTraitementPdf
): Promise<Buffer> {
  enregistrerPolicesPdfServeur();
  const { logo } = cheminsAssetsPdfServeur();
  const instance = pdf(<DocumentFicheTraitement data={data} logoPath={logo} />);
  const blob = await instance.toBlob();
  return Buffer.from(await blob.arrayBuffer());
}
