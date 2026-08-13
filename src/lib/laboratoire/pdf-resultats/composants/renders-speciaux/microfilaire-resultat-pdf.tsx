import { View } from "@react-pdf/renderer";
import type { LigneParametrePdf } from "@/lib/laboratoire/pdf-resultats/types";
import {
  TableauColonnesPdf,
  TableauLabelValeurPdf,
} from "@/lib/laboratoire/pdf-resultats/composants/renders-speciaux/primitives-tableau-pdf";
import {
  observationEspece,
  parserMicrofilaire,
  pathologieEspece,
} from "@/lib/laboratoire/pdf-resultats/utilitaires-parasitologie";

/** Port renderMicrofilaire() — SPECIMEN, MÉTHODE, tableau espèces. */
export function MicrofilaireResultatPdf({
  lignes,
}: {
  lignes: LigneParametrePdf[];
}) {
  const { specimen, methode, especes } = parserMicrofilaire(lignes);

  const meta: { label: string; valeur: string }[] = [];
  if (specimen) meta.push({ label: "SPECIMEN", valeur: specimen });
  if (methode) meta.push({ label: "MÉTHODE", valeur: methode });

  const rows = especes.map((l) => [
    l.name,
    observationEspece(l),
    pathologieEspece(l),
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
