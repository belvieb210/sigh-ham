import { View } from "@react-pdf/renderer";
import type { LigneParametrePdf } from "@/lib/laboratoire/pdf-resultats/types";
import { TableauColonnesPdf } from "@/lib/laboratoire/pdf-resultats/composants/renders-speciaux/primitives-tableau-pdf";
import { TableauParametresResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/tableau-parametres-resultat-pdf";
import { grouperParametresTorch } from "@/lib/laboratoire/pdf-resultats/utilitaires-serologie-pdf";

/** Port renderBilansTorch() — Param · Résultat · Valeur · Range avec regroupement IgG/IgM. */
export function BilansTorchResultatPdf({ lignes }: { lignes: LigneParametrePdf[] }) {
  const { groupes, restants } = grouperParametresTorch(lignes);

  const rows = groupes.map((g) => [g.prefix, g.resultat, g.valeur, g.range]);

  return (
    <View>
      {rows.length > 0 ? (
        <TableauColonnesPdf
          headers={["PARAMÈTRES", "RÉSULTAT", "VALEUR", "RANGE USUELLE"]}
          widths={["30%", "25%", "22.5%", "22.5%"]}
          rows={rows}
          alignRow="left"
        />
      ) : null}
      {restants.length > 0 ? (
        <TableauParametresResultatPdf
          lignes={restants}
          options={{
            showFlag: false,
            showRange: true,
            showValues: true,
            showUnit: true,
          }}
        />
      ) : null}
    </View>
  );
}
