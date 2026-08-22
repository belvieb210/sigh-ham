import { View } from "@react-pdf/renderer";
import type { LigneParametrePdf } from "@/lib/laboratoire/pdf-resultats/types";
import { TableauColonnesPdf } from "@/lib/laboratoire/pdf-resultats/composants/renders-speciaux/primitives-tableau-pdf";
import { valeurAffichageParametre } from "@/lib/laboratoire/pdf-resultats/utilitaires-parametres";

function afficherValeur(l: LigneParametrePdf, majuscules: boolean): string {
  const raw = valeurAffichageParametre(l);
  return majuscules ? raw : raw.toLowerCase();
}

/** Tableau 30/70 Paramètres · Résultat/Description (Rivalta, Trypanosomiase, Histopatho…). */
export function DeuxColonnesResultatPdf({
  lignes,
  col2Label = "Résultat",
  paramProportion = 30,
  majusculesValeur = false,
}: {
  lignes: LigneParametrePdf[];
  col2Label?: string;
  paramProportion?: number;
  majusculesValeur?: boolean;
  alignLeftCol2?: boolean;
}) {
  const visibles = lignes.filter((l) => !l.nonRequis);
  if (!visibles.length) return null;

  const col1 = `${paramProportion}%`;
  const col2 = `${100 - paramProportion}%`;
  const rows = visibles.map((l) => [l.name, afficherValeur(l, majusculesValeur)]);

  return (
    <View>
      <TableauColonnesPdf
        headers={["PARAMÈTRES", col2Label.toUpperCase()]}
        widths={[col1, col2]}
        rows={rows}
        alignRow="left"
      />
    </View>
  );
}
