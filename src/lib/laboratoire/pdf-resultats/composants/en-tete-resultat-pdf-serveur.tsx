import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import { INFORMATIONS_HOPITAL } from "@/constants/navigation";
import { INFOS_LEGALES_TICKET } from "@/constants/ticket-thermique";

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
  nomLabo: { fontSize: 12, fontWeight: "bold", color: "#111111", marginBottom: 1 },
  sousNom: { fontSize: 8, color: "#555555", lineHeight: 1.2 },
  contact: { fontSize: 8, color: "#555555", lineHeight: 1.2 },
  enTeteDroite: { width: "40%", alignItems: "flex-end" },
  badgeTitre: {
    borderWidth: 1.5,
    borderColor: "#1a4d7c",
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  badgeTitreTexte: {
    color: "#1a4d7c",
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 1.15,
  },
  separateurEnTete: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#7eb6e6",
    marginTop: 2,
    marginBottom: 6,
  },
  pied: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1a4d7c",
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  piedTexte: { color: "#ffffff", fontSize: 7, textAlign: "center" },
});

export function EnTeteResultatPdfServeur({
  logoPath,
  lignesBadge,
}: {
  logoPath: string;
  lignesBadge: string[];
}) {
  const L = INFOS_LEGALES_TICKET;
  const nom = INFORMATIONS_HOPITAL.nom?.trim() || "HAM LABORATOIRE";
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
            <Text style={styles.contact}>Tél. {L.telephones}</Text>
            <Text style={styles.contact}>{L.email}</Text>
          </View>
        </View>
        <View style={styles.enTeteDroite}>
          <View style={styles.badgeTitre}>
            {lignesBadge.map((l) => (
              <Text key={l} style={styles.badgeTitreTexte}>
                {l}
              </Text>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.separateurEnTete} />
    </>
  );
}

export function PiedResultatPdfServeur() {
  const L = INFOS_LEGALES_TICKET;
  return (
    <View style={styles.pied} fixed>
      <Text style={styles.piedTexte}>
        {L.sloganPied} — {L.telephones} — {L.adresseComplete}
      </Text>
    </View>
  );
}
