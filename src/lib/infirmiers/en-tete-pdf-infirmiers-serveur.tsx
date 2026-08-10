import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import { INFORMATIONS_HOPITAL } from "@/constants/navigation";
import { INFOS_LEGALES_TICKET } from "@/constants/ticket-thermique";

const BLEU = "#1a4d7c";
const BLEU_CONTOUR = "#7eb6e0";
const GRIS = "#555555";
const NOIR = "#111111";

const styles = StyleSheet.create({
  enTete: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 0,
  },
  enTeteGauche: { flexDirection: "row", width: "58%", alignItems: "flex-start" },
  logo: { width: 48, height: 48, objectFit: "contain" },
  enTeteInfos: { flex: 1, paddingLeft: 8 },
  nomLabo: { fontSize: 12, fontWeight: "bold", color: NOIR, marginBottom: 1 },
  sousNom: { fontSize: 8, color: GRIS, lineHeight: 1.2 },
  contact: { fontSize: 8, color: GRIS, lineHeight: 1.2 },
  enTeteDroite: { width: "40%", alignItems: "flex-end" },
  badgeTitre: {
    borderWidth: 1.5,
    borderColor: BLEU,
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  badgeTitreTexte: {
    color: BLEU,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 1.15,
  },
  separateurEnTete: {
    borderBottomWidth: 1.5,
    borderBottomColor: BLEU_CONTOUR,
    marginTop: 2,
    marginBottom: 8,
  },
  pied: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BLEU,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  piedTexte: { color: "#ffffff", fontSize: 7, textAlign: "center" },
  carte: {
    borderWidth: 1,
    borderColor: BLEU_CONTOUR,
    borderRadius: 4,
    padding: 6,
    marginBottom: 8,
  },
  carteTitre: {
    fontSize: 10,
    fontWeight: "bold",
    color: BLEU,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  carteLigne: { fontSize: 10, color: NOIR, marginBottom: 1, lineHeight: 1.2 },
});

export function EnTetePdfInfirmiersServeur({
  logoPath,
  lignesBadge,
  hopital,
}: {
  logoPath: string;
  lignesBadge: string[];
  hopital?: string;
}) {
  const L = INFOS_LEGALES_TICKET;
  const nom = hopital?.trim() || INFORMATIONS_HOPITAL.nom;

  return (
    <>
      <View style={styles.enTete}>
        <View style={styles.enTeteGauche}>
          <Image src={logoPath} style={styles.logo} />
          <View style={styles.enTeteInfos}>
            <Text style={styles.nomLabo}>{nom}</Text>
            <Text style={styles.sousNom}>
              Centre de Diagnostic et d&apos;Analyses Médicales
            </Text>
            <Text style={styles.sousNom}>{L.rccm}</Text>
            <Text style={styles.contact}>Tél. {L.telephones || INFORMATIONS_HOPITAL.telephone}</Text>
            <Text style={styles.contact}>{L.email || INFORMATIONS_HOPITAL.email}</Text>
          </View>
        </View>
        <View style={styles.enTeteDroite}>
          <View style={styles.badgeTitre}>
            {lignesBadge.map((ligne) => (
              <Text key={ligne} style={styles.badgeTitreTexte}>
                {ligne}
              </Text>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.separateurEnTete} />
    </>
  );
}

export function PiedPdfInfirmiersServeur() {
  const b = INFORMATIONS_HOPITAL;
  return (
    <View style={styles.pied} fixed>
      <Text style={styles.piedTexte}>
        {b.nomComplet} — {b.adresseCourte} — {b.telephone}
      </Text>
    </View>
  );
}

export function CartePatientPdfInfirmiers({
  titre,
  lignes,
}: {
  titre: string;
  lignes: string[];
}) {
  return (
    <View style={styles.carte}>
      <Text style={styles.carteTitre}>{titre}</Text>
      {lignes.map((l) => (
        <Text key={l} style={styles.carteLigne}>
          {l}
        </Text>
      ))}
    </View>
  );
}

export const stylesPdfInfirmiers = styles;
