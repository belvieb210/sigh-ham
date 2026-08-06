import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import { INFORMATIONS_HOPITAL } from "@/constants/navigation";
import { INFOS_LEGALES_TICKET } from "@/constants/ticket-thermique";

export type BrandingPdfLabo = {
  nom: string;
  nomComplet: string;
  slogan: string;
  telephone: string;
  email: string;
  adresse: string;
};

export const BRANDING_PDF_FALLBACK: BrandingPdfLabo = {
  nom: INFORMATIONS_HOPITAL.nom,
  nomComplet: INFORMATIONS_HOPITAL.nomComplet,
  slogan: INFORMATIONS_HOPITAL.slogan,
  telephone: INFORMATIONS_HOPITAL.telephone,
  email: INFORMATIONS_HOPITAL.email,
  adresse: INFORMATIONS_HOPITAL.adresseCourte,
};

const BLEU = "#1a4d7c";
const BLEU_CONTOUR = "#7eb6e0";
const GRIS = "#555555";

const styles = StyleSheet.create({
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
  badgeTexte: {
    color: BLEU,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
  },
  separateur: {
    borderBottomWidth: 1.5,
    borderBottomColor: BLEU_CONTOUR,
    marginVertical: 8,
  },
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

export function EnTetePdfLabo({
  branding = BRANDING_PDF_FALLBACK,
  lignesBadge,
  compact,
}: {
  branding?: BrandingPdfLabo | null;
  lignesBadge: string[];
  compact?: boolean;
}) {
  const b = branding ?? BRANDING_PDF_FALLBACK;
  const L = INFOS_LEGALES_TICKET;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const logoSrc = `${origin}/images/logo-ham-laboratoire.png`;
  const telephone = b.telephone || L.telephones;
  const email = b.email || L.email;

  return (
    <>
      <View style={styles.enTete}>
        <View style={[styles.enTeteGauche, compact ? { width: "65%" } : {}]}>
          <Image src={logoSrc} style={styles.logo} />
          <View style={styles.infos}>
            <Text style={styles.nomLabo}>{b.nom || "HAM LABORATOIRE"}</Text>
            <Text style={styles.sousNom}>
              {b.nomComplet ||
                "Centre de Diagnostic et d'Analyses Médicales"}
            </Text>
            <Text style={styles.sousNom}>{L.rccm}</Text>
            <Text style={styles.sousNom}>Tél. {telephone}</Text>
            <Text style={styles.sousNom}>{email}</Text>
            {b.adresse ? (
              <Text style={styles.sousNom}>{b.adresse}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.badge}>
          {lignesBadge.map((ligne) => (
            <Text key={ligne} style={styles.badgeTexte}>
              {ligne}
            </Text>
          ))}
        </View>
      </View>
      <View style={styles.separateur} />
    </>
  );
}

export function PiedPdfLabo({
  branding = BRANDING_PDF_FALLBACK,
  prefixe,
}: {
  branding?: BrandingPdfLabo | null;
  prefixe?: string;
}) {
  const b = branding ?? BRANDING_PDF_FALLBACK;
  const L = INFOS_LEGALES_TICKET;
  const telephone = b.telephone || L.telephones;
  const adresse = b.adresse || L.adresseComplete;
  const slogan = b.slogan || L.sloganPied;
  const corps = prefixe
    ? `${prefixe} — ${slogan} — ${telephone}`
    : `${slogan} — ${telephone} — ${adresse}`;

  return (
    <View style={styles.pied} fixed>
      <Text style={styles.piedTexte}>{corps}</Text>
    </View>
  );
}
