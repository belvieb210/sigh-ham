import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { DonneesCrConsultation } from "@/features/medecins/consultation-pdf";
import {
  EnTetePdfLabo,
  PiedPdfLabo,
  type BrandingPdfLabo,
} from "@/features/medecins/en-tete-pdf-labo";
import type { DonneesOrdonnancePdf } from "@/features/medecins/ordonnance-pdf";

export type DifferenceHistorique = {
  domaine: string;
  champ: string;
  avant: string;
  apres: string;
  type: "ajoute" | "retire" | "modifie";
};

export interface DonneesHistoriqueDossierPdf {
  patient: string;
  numeroDossier: string;
  telephone?: string | null;
  age?: number | null;
  sexe?: string | null;
  consultations: DonneesCrConsultation[];
  ordonnances: DonneesOrdonnancePdf[];
  differences: DifferenceHistorique[];
  /** Libellés de la paire comparée (ex. dates A/B) */
  comparaisonLibelle?: string | null;
  branding?: BrandingPdfLabo | null;
}

let polices = false;

export function enregistrerPolicesPdfHistorique() {
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
const VERT = "#166534";
const ROUGE = "#b91c1c";
const AMBRE = "#92400e";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 9,
    paddingTop: 18,
    paddingHorizontal: 24,
    paddingBottom: 44,
    color: "#111111",
  },
  titre: { fontSize: 12, fontWeight: "bold", color: BLEU, marginBottom: 4 },
  sectionTitre: {
    fontSize: 10,
    fontWeight: "bold",
    color: BLEU,
    marginTop: 8,
    marginBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#cfe0ef",
    paddingBottom: 2,
  },
  ligne: { marginBottom: 2, lineHeight: 1.3 },
  label: { fontWeight: "bold" },
  bloc: {
    borderWidth: 1,
    borderColor: BLEU_CONTOUR,
    borderRadius: 3,
    padding: 6,
    marginBottom: 6,
  },
  diffAjoute: { color: VERT },
  diffRetire: { color: ROUGE },
  diffModifie: { color: AMBRE },
  grilleVitaux: { flexDirection: "row", flexWrap: "wrap" },
  vital: { width: "33%", marginBottom: 2, fontSize: 8 },
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

export function DocumentHistoriqueDossierPdf({
  donnees,
}: {
  donnees: DonneesHistoriqueDossierPdf;
}) {
  return (
    <Document
      title={`Historique médical — ${donnees.patient}`}
      author={donnees.branding?.nom ?? "HAM Laboratoire"}
    >
      <Page size="A4" style={styles.page}>
        <EnTetePdfLabo
          branding={donnees.branding}
          lignesBadge={["HISTORIQUE", "MÉDICAL"]}
          compact
        />

        <Text style={styles.titre}>Dossier patient — synthèse &amp; comparaison</Text>
        <Text style={styles.ligne}>
          <Text style={styles.label}>Patient : </Text>
          {donnees.patient} · {donnees.numeroDossier}
          {donnees.telephone ? ` · ${donnees.telephone}` : ""}
        </Text>
        <Text style={styles.ligne}>
          <Text style={styles.label}>Âge / Sexe : </Text>
          {donnees.age != null ? `${donnees.age} ans` : "—"}
          {donnees.sexe ? ` / ${donnees.sexe}` : ""}
        </Text>
        <Text style={styles.ligne}>
          {donnees.consultations.length} consultation(s) ·{" "}
          {donnees.ordonnances.length} ordonnance(s)
        </Text>

        {donnees.differences.length > 0 ? (
          <View>
            <Text style={styles.sectionTitre}>
              Différences
              {donnees.comparaisonLibelle
                ? ` — ${donnees.comparaisonLibelle}`
                : " (paire sélectionnée)"}
            </Text>
            {donnees.differences.map((d, i) => (
              <Text
                key={`${d.champ}-${i}`}
                style={[
                  styles.ligne,
                  d.type === "ajoute"
                    ? styles.diffAjoute
                    : d.type === "retire"
                      ? styles.diffRetire
                      : styles.diffModifie,
                ]}
              >
                [{d.domaine}] {d.champ} —{" "}
                {d.type === "ajoute"
                  ? `Ajouté : ${d.apres}`
                  : d.type === "retire"
                    ? `Retiré : ${d.avant}`
                    : `${d.avant || "—"} → ${d.apres || "—"}`}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.ligne}>
            Aucune différence significative entre les actes comparés (ou un seul
            acte).
          </Text>
        )}

        <Text style={styles.sectionTitre}>Consultations</Text>
        {donnees.consultations.length === 0 ? (
          <Text style={styles.ligne}>Aucune consultation.</Text>
        ) : (
          donnees.consultations.map((c, idx) => {
            const sv = c.signesVitaux;
            const vitaux = [
              ligneVital("T°", sv?.temperature),
              ligneVital(
                "TA",
                sv?.tensionSystolique != null && sv?.tensionDiastolique != null
                  ? `${sv.tensionSystolique}/${sv.tensionDiastolique}`
                  : null
              ),
              ligneVital("FC", sv?.frequenceCardiaque),
              ligneVital("Poids", sv?.poidsKg),
              ligneVital("SpO₂", sv?.saturationO2),
            ].filter(Boolean) as string[];
            return (
              <View key={`c-${idx}`} style={styles.bloc} wrap={false}>
                <Text style={styles.ligne}>
                  <Text style={styles.label}>
                    #{idx + 1} — {formaterDate(c.debutLe)}
                  </Text>
                  {" · "}
                  {c.medecin}
                  {c.finLe ? " · clôturée" : " · ouverte"}
                </Text>
                <Text style={styles.ligne}>
                  <Text style={styles.label}>Motif : </Text>
                  {c.motif || "—"}
                </Text>
                {vitaux.length > 0 ? (
                  <View style={styles.grilleVitaux}>
                    {vitaux.map((v) => (
                      <Text key={v} style={styles.vital}>
                        {v}
                      </Text>
                    ))}
                  </View>
                ) : null}
                {c.anamnese ? (
                  <Text style={styles.ligne}>Anamnèse : {c.anamnese}</Text>
                ) : null}
                {c.examenClinique ? (
                  <Text style={styles.ligne}>Examen : {c.examenClinique}</Text>
                ) : null}
                {c.conclusion ? (
                  <Text style={styles.ligne}>Conclusion : {c.conclusion}</Text>
                ) : null}
                {c.diagnostics.length > 0 ? (
                  <Text style={styles.ligne}>
                    Diagnostics :{" "}
                    {c.diagnostics.map((d) => d.libelle).join(" · ")}
                  </Text>
                ) : null}
              </View>
            );
          })
        )}

        <Text style={styles.sectionTitre}>Ordonnances</Text>
        {donnees.ordonnances.length === 0 ? (
          <Text style={styles.ligne}>Aucune ordonnance.</Text>
        ) : (
          donnees.ordonnances.map((o, idx) => (
            <View key={`o-${idx}`} style={styles.bloc} wrap={false}>
              <Text style={styles.ligne}>
                <Text style={styles.label}>
                  #{idx + 1} — {formaterDate(o.prescritLe)}
                </Text>
                {" · "}
                {o.medecin}
              </Text>
              {o.lignes.length === 0 ? (
                <Text style={styles.ligne}>Sans médicament listé.</Text>
              ) : (
                o.lignes.map((l, j) => (
                  <Text key={`${l.medicament}-${j}`} style={styles.ligne}>
                    • {l.medicament}
                    {l.dosage ? ` (${l.dosage})` : ""} ×{l.quantite}
                    {l.posologie ? ` — ${l.posologie}` : ""}
                    {l.dureeJours != null ? ` · ${l.dureeJours} j` : ""}
                  </Text>
                ))
              )}
              {o.notes ? <Text style={styles.ligne}>Notes : {o.notes}</Text> : null}
            </View>
          ))
        )}

        <PiedPdfLabo
          branding={donnees.branding}
          prefixe="Document de synthèse médicale"
        />
      </Page>
    </Document>
  );
}
