import { View } from "@react-pdf/renderer";
import type { LigneParametrePdf } from "@/lib/laboratoire/pdf-resultats/types";
import {
  TableauColonnesPdf,
} from "@/lib/laboratoire/pdf-resultats/composants/renders-speciaux/primitives-tableau-pdf";
import {
  parserMalariaTDR,
  texteMethodeMalariaTDR,
} from "@/lib/laboratoire/pdf-resultats/utilitaires-serologie-pdf";

/** Port renderMalariaTDR() — méthodes + espèces parasites. */
export function MalariaTDRResultatPdf({
  lignes,
}: {
  lignes: LigneParametrePdf[];
}) {
  const { methodes, especes, densiteVal } = parserMalariaTDR(lignes);

  const rowsMethodes = methodes.map((l) => [
    l.name,
    texteMethodeMalariaTDR(l, densiteVal),
  ]);

  const rowsEspeces = especes.map((l) => [
    l.name,
    (l.value ?? "").trim().replace(/[Μμ]/g, "µ"),
  ]);

  return (
    <View>
      {rowsMethodes.length > 0 ? (
        <TableauColonnesPdf
          headers={["MÉTHODES", "RÉSULTAT"]}
          widths={["50%", "50%"]}
          rows={rowsMethodes}
          alignRow="left"
        />
      ) : null}
      {rowsEspeces.length > 0 ? (
        <TableauColonnesPdf
          headers={["ESPÈCE DES PARASITES", "SEMI CHROMATOGRAPHIE"]}
          widths={["50%", "50%"]}
          rows={rowsEspeces}
          alignRow="left"
        />
      ) : null}
    </View>
  );
}
