import { View } from "@react-pdf/renderer";
import {
  BandeauPatientResultatPdf,
} from "@/lib/laboratoire/pdf-resultats/composants/bandeau-resultat-pdf";
import { EnTeteResultatPdfServeur } from "@/lib/laboratoire/pdf-resultats/composants/en-tete-resultat-pdf-serveur";
import { stylesResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/styles-resultat-pdf";
import type {
  DonneesExamenResultatPdf,
  DonneesPatientResultatPdf,
} from "@/lib/laboratoire/pdf-resultats/types";

/** En-tête + bandeau patient répétés en haut de chaque page (fixed). */
export function EnteteFixePageResultatPdf({
  logoPath,
  patient,
  examen,
  avatarHomme,
  avatarFemme,
  lignesBadge = ["RAPPORT DE", "RÉSULTATS"],
}: {
  logoPath: string;
  patient: DonneesPatientResultatPdf;
  examen: DonneesExamenResultatPdf;
  avatarHomme: string;
  avatarFemme: string;
  lignesBadge?: string[];
}) {
  return (
    <View fixed style={stylesResultatPdf.enteteFixe}>
      <EnTeteResultatPdfServeur logoPath={logoPath} lignesBadge={lignesBadge} />
      <BandeauPatientResultatPdf
        patient={patient}
        examen={examen}
        avatarHomme={avatarHomme}
        avatarFemme={avatarFemme}
      />
    </View>
  );
}
