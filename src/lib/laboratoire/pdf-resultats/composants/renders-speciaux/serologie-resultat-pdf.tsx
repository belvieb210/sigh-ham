import { View } from "@react-pdf/renderer";
import type { LigneParametrePdf } from "@/lib/laboratoire/pdf-resultats/types";
import { TableauColonnesPdf } from "@/lib/laboratoire/pdf-resultats/composants/renders-speciaux/primitives-tableau-pdf";
import { TableauParametresResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/tableau-parametres-resultat-pdf";
import { grouperParametresSerologie } from "@/lib/laboratoire/pdf-resultats/utilitaires-serologie-pdf";

/** Port renderSerologie / Salmonella / Widal — regroupe RESULTAT + VALEUR par antigène. */
export function SerologieResultatPdf({
  lignes,
  titreSerologie,
}: {
  lignes: LigneParametrePdf[];
  titreSerologie?: string;
}) {
  const { groupes, restants } = grouperParametresSerologie(lignes);

  if (groupes.length === 0 && restants.length <= 2) {
    return (
      <TableauParametresResultatPdf
        lignes={lignes}
        options={{ showFlag: false, showRange: false, showValues: true, showUnit: true }}
        titreSerologie={titreSerologie}
      />
    );
  }

  const rows = groupes.map((g) => [g.prefix, g.resultat, g.valeur]);

  return (
    <View>
      {rows.length > 0 ? (
        <TableauColonnesPdf
          headers={["PARAMÈTRES", "RÉSULTAT", "VALEUR"]}
          widths={["35%", "32.5%", "32.5%"]}
          rows={rows}
          alignRow="left"
        />
      ) : null}
      {restants.length > 0 ? (
        <TableauParametresResultatPdf
          lignes={restants}
          options={{
            showFlag: false,
            showRange: false,
            showValues: true,
            showUnit: true,
          }}
        />
      ) : null}
    </View>
  );
}
