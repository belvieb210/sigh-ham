import { View } from "@react-pdf/renderer";
import type { LigneParametrePdf } from "@/lib/laboratoire/pdf-resultats/types";
import {
  TableauColonnesPdf,
  TableauLabelValeurPdf,
} from "@/lib/laboratoire/pdf-resultats/composants/renders-speciaux/primitives-tableau-pdf";
import {
  observationEspece,
  parserGoutteFraiche,
  pathologieEspece,
  PATHOLOGIES_GOUTTE_FRAICHE,
} from "@/lib/laboratoire/pdf-resultats/utilitaires-parasitologie";

/** Port renderGoutteFraiche() — SPECIMEN, RESULTAT, tableau espèces + pathologies statiques. */
export function GoutteFraicheResultatPdf({
  lignes,
}: {
  lignes: LigneParametrePdf[];
}) {
  const { specimen, resultat, especes } = parserGoutteFraiche(lignes);

  const meta: { label: string; valeur: string }[] = [];
  if (specimen) meta.push({ label: "SPECIMEN", valeur: specimen });
  if (resultat) meta.push({ label: "RESULTAT", valeur: resultat });

  const rows = especes.map((l, idx) => [
    l.name,
    observationEspece(l),
    PATHOLOGIES_GOUTTE_FRAICHE[idx] ?? pathologieEspece(l),
  ]);

  return (
    <View>
      {meta.length > 0 ? <TableauLabelValeurPdf lignes={meta} /> : null}
      {rows.length > 0 ? (
        <TableauColonnesPdf
          headers={["ESPÈCE DES PARASITES", "OBSERVATION", "PATHOLOGIE"]}
          widths={["40%", "30%", "30%"]}
          rows={rows}
          alignRow="left"
        />
      ) : null}
    </View>
  );
}
