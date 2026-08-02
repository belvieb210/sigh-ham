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

/** Bleu médical HAM — rendu PDF professionnel */
const BLEU = "#0b4f8a";
const BLEU_CLAIR = "#e8f1f8";
const BLEU_MOYEN = "#1a6bb5";
const GRIS = "#475569";
const GRIS_CLAIR = "#f1f5f9";
const BORDURE = "#cbd5e1";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 12,
    paddingTop: 0,
    paddingBottom: 28,
    paddingHorizontal: 0,
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },
  bandeau: {
    backgroundColor: BLEU,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  bandeauTexte: {
    color: "#ffffff",
    fontSize: 10,
    textAlign: "center",
    letterSpacing: 0.6,
  },
  contenu: {
    paddingHorizontal: 36,
    paddingTop: 22,
  },
  enTete: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 14,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 10,
    backgroundColor: BLEU,
    alignItems: "center",
    justifyContent: "center",
  },
  logoBadgeTexte: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  enTeteTexte: {
    flex: 1,
    paddingLeft: 12,
  },
  nomCentre: {
    fontSize: 13,
    fontWeight: "bold",
    color: BLEU,
    marginBottom: 2,
  },
  nomLabo: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  legal: {
    fontSize: 9,
    color: GRIS,
    marginBottom: 1,
  },
  slogan: {
    fontSize: 10,
    color: BLEU_MOYEN,
    fontWeight: "bold",
    marginTop: 4,
  },
  bandeauTitre: {
    backgroundColor: BLEU_CLAIR,
    borderLeftWidth: 5,
    borderLeftColor: BLEU,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  titre: {
    fontSize: 22,
    fontWeight: "bold",
    color: BLEU,
    letterSpacing: 1.5,
  },
  sousTitre: {
    fontSize: 11,
    color: GRIS,
    marginTop: 3,
  },
  carteMeta: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: BORDURE,
    borderRadius: 6,
    marginBottom: 20,
    overflow: "hidden",
  },
  metaCol: {
    width: "50%",
    padding: 14,
  },
  metaColDroite: {
    width: "50%",
    padding: 14,
    borderLeftWidth: 1,
    borderLeftColor: BORDURE,
    backgroundColor: GRIS_CLAIR,
  },
  metaLabel: {
    fontSize: 9,
    color: GRIS,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
    fontWeight: "bold",
  },
  metaValeur: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#0f172a",
  },
  sectionTitre: {
    fontSize: 13,
    fontWeight: "bold",
    color: BLEU,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  table: {
    borderWidth: 1,
    borderColor: BORDURE,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BLEU,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  headerCell: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 11,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDURE,
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: BLEU_CLAIR,
  },
  colCode: { width: "14%", fontSize: 12, fontWeight: "bold", color: BLEU },
  colNom: { width: "44%", fontSize: 12 },
  colCat: { width: "24%", fontSize: 11, color: GRIS },
  colPrix: { width: "18%", fontSize: 12, textAlign: "right", fontWeight: "bold" },
  totalBloc: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 18,
  },
  totalCarte: {
    width: "48%",
    backgroundColor: BLEU,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  totalValeur: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  mention: {
    backgroundColor: GRIS_CLAIR,
    borderRadius: 4,
    padding: 12,
    fontSize: 10,
    color: GRIS,
    lineHeight: 1.45,
    marginBottom: 20,
  },
  pied: {
    borderTopWidth: 2,
    borderTopColor: BLEU,
    paddingTop: 12,
    marginTop: 8,
  },
  piedSlogan: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    color: BLEU,
    marginBottom: 4,
  },
  piedLigne: {
    fontSize: 10,
    textAlign: "center",
    color: GRIS,
    marginBottom: 2,
  },
});

interface PropsDocumentDevisEstimation {
  donnees: DonneesDevisEstimation;
}

function ChampMeta({ label, valeur }: { label: string; valeur: string }) {
  return (
    <View>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValeur}>{valeur}</Text>
    </View>
  );
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
        <View style={styles.bandeau}>
          <Text style={styles.bandeauTexte}>
            CENTRE DE DIAGNOSTIC ET D&apos;ANALYSES MÉDICALES — DOCUMENT OFFICIEL
          </Text>
        </View>

        <View style={styles.contenu}>
          <View style={styles.enTete}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeTexte}>HAM</Text>
            </View>
            <View style={styles.enTeteTexte}>
              <Text style={styles.nomCentre}>{L.ligne1}</Text>
              <Text style={styles.nomLabo}>{L.ligne2}</Text>
              <Text style={styles.legal}>{L.rccm}</Text>
              <Text style={styles.legal}>{L.idNat}</Text>
              <Text style={styles.legal}>
                {L.nImpot} {L.minSante}
              </Text>
              <Text style={styles.slogan}>
                {L.sloganLigne1} {L.sloganLigne2}
              </Text>
            </View>
          </View>

          <View style={styles.bandeauTitre}>
            <Text style={styles.titre}>{donnees.labels.titreTicket}</Text>
            <Text style={styles.sousTitre}>
              Devis estimatif d&apos;examens médicaux — non contractuel
            </Text>
          </View>

          <View style={styles.carteMeta}>
            <View style={styles.metaCol}>
              <ChampMeta label={donnees.labels.patient} valeur={patient || "—"} />
              <ChampMeta label={donnees.labels.telephone} valeur={tel} />
              <ChampMeta
                label={donnees.labels.medecin}
                valeur={donnees.medecinResponsable || "—"}
              />
            </View>
            <View style={styles.metaColDroite}>
              <ChampMeta
                label={donnees.labels.numero}
                valeur={donnees.numeroEnregistrement || "—"}
              />
              <ChampMeta
                label={donnees.labels.date}
                valeur={donnees.dateEnregistrement || "—"}
              />
              <ChampMeta
                label="Examens"
                valeur={`${donnees.examens.length} sélectionné${donnees.examens.length > 1 ? "s" : ""}`}
              />
            </View>
          </View>

          <Text style={styles.sectionTitre}>Détail des examens</Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.colCode, styles.headerCell]}>Code</Text>
              <Text style={[styles.colNom, styles.headerCell]}>
                {donnees.labels.description}
              </Text>
              <Text style={[styles.colCat, styles.headerCell]}>Catégorie</Text>
              <Text style={[styles.colPrix, styles.headerCell]}>
                {donnees.labels.prix}
              </Text>
            </View>

            {donnees.examens.map((examen, index) => (
              <View
                key={examen.id}
                style={
                  index % 2 === 1
                    ? [styles.tableRow, styles.tableRowAlt]
                    : styles.tableRow
                }
                wrap={false}
              >
                <Text style={styles.colCode}>{examen.code}</Text>
                <Text style={styles.colNom}>{examen.libelle}</Text>
                <Text style={styles.colCat}>{examen.categorie}</Text>
                <Text style={styles.colPrix}>{formaterPrix(examen.prix)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalBloc}>
            <View style={styles.totalCarte}>
              <Text style={styles.totalLabel}>{donnees.labels.total}</Text>
              <Text style={styles.totalValeur}>{formaterPrix(montantTotal)}</Text>
            </View>
          </View>

          <Text style={styles.mention}>
            Ce document est un devis estimatif. Les examens ne sont facturés
            qu&apos;après validation et envoi à la caisse. Les tarifs indiqués
            peuvent évoluer selon les protocoles et disponibilités du laboratoire.
          </Text>

          <View style={styles.pied}>
            <Text style={styles.piedSlogan}>{L.sloganPied}</Text>
            <Text style={styles.piedLigne}>
              {L.adresseLigne1} — {L.adresseLigne2}
            </Text>
            <Text style={styles.piedLigne}>{L.ville}</Text>
            <Text style={styles.piedLigne}>
              {L.telephones} · {L.email}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
