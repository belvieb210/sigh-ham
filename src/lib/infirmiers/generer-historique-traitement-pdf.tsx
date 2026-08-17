import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  CartePatientPdfInfirmiers,
  EnTetePdfInfirmiersServeur,
  PiedPdfInfirmiersServeur,
} from "@/lib/infirmiers/en-tete-pdf-infirmiers-serveur";
import { formaterDateAffichage } from "@/lib/infirmiers/fiche-traitement-utils";
import { cheminsAssetsPdfServeur } from "@/lib/pdf/assets-pdf-serveur";
import { bufferDepuisDocumentPdf } from "@/lib/pdf/rendre-pdf-serveur";
import type { FicheTraitementResume } from "@/lib/infirmiers/types-fiche-traitement";

export interface DonneesHistoriqueTraitementPdf {
  hopital: string;
  nomComplet: string;
  numeroDossier: string;
  numeroPatient: string;
  telephone: string | null;
  fiches: FicheTraitementResume[];
  dateEmission: string;
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
    marginTop: 8,
    textTransform: "uppercase",
  },
  ficheBloc: {
    borderWidth: 1,
    borderColor: BLEU_CONTOUR,
    borderRadius: 3,
    padding: 6,
    marginBottom: 8,
  },
  ficheEntete: {
    fontSize: 10,
    fontWeight: "bold",
    color: BLEU,
    marginBottom: 4,
  },
  ligne: { fontSize: 9, marginBottom: 1, lineHeight: 1.25 },
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
  cellDate: { width: "22%", padding: 4, fontSize: 8 },
  cellMed: { width: "28%", padding: 4, fontSize: 8 },
  cellDose: { width: "18%", padding: 4, fontSize: 8 },
  cellTraiteur: { width: "32%", padding: 4, fontSize: 8 },
  cellHeader: { fontWeight: "bold", color: BLEU },
  comparaison: { fontSize: 8, color: "#0d6e3f", marginTop: 2 },
});

function deltaPoids(
  actuel: number | null | undefined,
  precedent: number | null | undefined
): string | null {
  if (actuel == null || precedent == null) return null;
  const d = actuel - precedent;
  if (d === 0) return "Poids stable";
  const signe = d > 0 ? "+" : "";
  return `Évolution poids : ${signe}${d.toFixed(1)} kg (avant ${precedent} kg)`;
}

function DocumentHistoriqueTraitement({
  data,
  logoPath,
}: {
  data: DonneesHistoriqueTraitementPdf;
  logoPath: string;
}) {
  const fiches = [...data.fiches].sort(
    (a, b) =>
      new Date(b.debutTraitementLe).getTime() -
      new Date(a.debutTraitementLe).getTime()
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <EnTetePdfInfirmiersServeur
          logoPath={logoPath}
          hopital={data.hopital}
          lignesBadge={["HISTORIQUE", "TRAITEMENTS"]}
        />

        <CartePatientPdfInfirmiers
          titre="Patient"
          lignes={[
            `Nom : ${data.nomComplet}`,
            `N° dossier : ${data.numeroDossier} — ${data.numeroPatient}`,
            `Téléphone : ${data.telephone ?? "—"}`,
            `Date d'édition : ${data.dateEmission}`,
            `Nombre de fiches : ${fiches.length}`,
          ]}
        />

        <Text style={styles.sectionTitre}>Fiches de traitement par période</Text>

        {fiches.map((fiche, index) => {
          const prec = fiches[index + 1];
          const compPoids = deltaPoids(fiche.poidsKg, prec?.poidsKg);
          return (
            <View key={fiche.id} style={styles.ficheBloc} wrap={false}>
              <Text style={styles.ficheEntete}>
                {formaterDateAffichage(fiche.debutTraitementLe)} →{" "}
                {formaterDateAffichage(fiche.finEffectiveLe)} — {fiche.statut}
              </Text>
              <Text style={styles.ligne}>
                <Text style={styles.label}>Médecin prescripteur : </Text>
                {fiche.medecinPrescripteur ?? "—"}
              </Text>
              <Text style={styles.ligne}>
                <Text style={styles.label}>Poids : </Text>
                {fiche.poidsKg != null ? `${fiche.poidsKg} kg` : "—"}
              </Text>
              {compPoids ? (
                <Text style={styles.comparaison}>{compPoids}</Text>
              ) : null}
              <Text style={styles.ligne}>
                <Text style={styles.label}>Infirmier(ère) : </Text>
                {fiche.infirmierNom}
              </Text>

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
                <View style={{ marginTop: 4 }}>
                  <Text style={[styles.ligne, styles.label]}>Commentaires :</Text>
                  {fiche.commentaires.map((c, i) => (
                    <Text key={i} style={styles.ligne}>
                      • {c.texte}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}

        <PiedPdfInfirmiersServeur />
      </Page>
    </Document>
  );
}

export async function genererPdfHistoriqueTraitementInfirmiers(
  data: DonneesHistoriqueTraitementPdf
): Promise<Buffer> {
  const { logo } = cheminsAssetsPdfServeur();
  return bufferDepuisDocumentPdf(
    <DocumentHistoriqueTraitement data={data} logoPath={logo} />
  );
}
