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
const NOIR = "#111111";

/** Styles calqués sur devis-estimation-pdf (compact, sans espaces fantômes react-pdf). */
const styles = StyleSheet.create({
  enTete: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 0,
    paddingBottom: 0,
  },
  enTeteGauche: {
    flexDirection: "row",
    width: "58%",
    alignItems: "flex-start",
  },
  logo: {
    width: 48,
    height: 48,
    objectFit: "contain",
  },
  enTeteInfos: {
    flex: 1,
    paddingLeft: 8,
  },
  nomLabo: {
    fontSize: 12,
    fontWeight: "bold",
    color: NOIR,
    marginBottom: 1,
  },
  sousNom: {
    fontSize: 8,
    color: GRIS,
    marginBottom: 0,
    lineHeight: 1.2,
  },
  contact: {
    fontSize: 8,
    color: GRIS,
    marginTop: 0,
    lineHeight: 1.2,
  },
  enTeteDroite: {
    width: "40%",
    alignItems: "flex-end",
  },
  badgeTitre: {
    borderWidth: 1.5,
    borderColor: BLEU,
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginBottom: 0,
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
    marginBottom: 6,
  },
  carte: {
    borderWidth: 1,
    borderColor: BLEU_CONTOUR,
    borderRadius: 4,
    padding: 6,
    marginBottom: 6,
  },
  carteTitre: {
    fontSize: 10,
    fontWeight: "bold",
    color: BLEU,
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  /** Une seule Text par ligne : évite la hauteur min. excessives de react-pdf */
  carteLigne: {
    fontSize: 10,
    color: NOIR,
    marginBottom: 1,
    lineHeight: 1.2,
  },
  carteLabel: {
    fontWeight: "bold",
    color: NOIR,
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
});

export function EnTetePdfLabo({
  branding = BRANDING_PDF_FALLBACK,
  lignesBadge,
}: {
  branding?: BrandingPdfLabo | null;
  lignesBadge: string[];
  /** @deprecated conservé pour compat — l'en-tête est toujours compact */
  compact?: boolean;
}) {
  const b = branding ?? BRANDING_PDF_FALLBACK;
  const L = INFOS_LEGALES_TICKET;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const logoSrc = `${origin}/images/logo-ham-laboratoire.png`;
  /** Tél. / email : ticket légal (comme estimation) + fallback branding */
  const telephone = L.telephones || b.telephone;
  const email = L.email || b.email;
  const nom = b.nom?.trim() || "HAM LABORATOIRE";

  return (
    <>
      <View style={styles.enTete}>
        <View style={styles.enTeteGauche}>
          <Image src={logoSrc} style={styles.logo} />
          <View style={styles.enTeteInfos}>
            <Text style={styles.nomLabo}>{nom}</Text>
            <Text style={styles.sousNom}>
              Centre de Diagnostic et d&apos;Analyses Médicales
            </Text>
            <Text style={styles.sousNom}>{L.rccm}</Text>
            <Text style={styles.contact}>Tél. {telephone}</Text>
            <Text style={styles.contact}>{email}</Text>
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

export type LigneCartePatientPdf = {
  label: string;
  valeur: string;
};

/** Carte patient compacte — même rendu que « Informations du patient » / estimation. */
export function CartePatientPdf({
  titre,
  lignes,
}: {
  titre: string;
  lignes: LigneCartePatientPdf[];
}) {
  return (
    <View style={styles.carte}>
      <Text style={styles.carteTitre}>{titre}</Text>
      {lignes.map((l) => (
        <Text key={`${l.label}-${l.valeur}`} style={styles.carteLigne}>
          <Text style={styles.carteLabel}>{l.label} : </Text>
          {l.valeur}
        </Text>
      ))}
    </View>
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
  const telephone = L.telephones || b.telephone;
  const adresse = L.adresseComplete || b.adresse;
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
