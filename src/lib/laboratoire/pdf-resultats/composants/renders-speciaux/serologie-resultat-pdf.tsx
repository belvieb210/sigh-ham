import { View } from "@react-pdf/renderer";
import type { LigneParametrePdf } from "@/lib/laboratoire/pdf-resultats/types";
import { TableauColonnesPdf } from "@/lib/laboratoire/pdf-resultats/composants/renders-speciaux/primitives-tableau-pdf";
import { TableauParametresResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/tableau-parametres-resultat-pdf";
import { grouperParametresSerologie } from "@/lib/laboratoire/pdf-resultats/utilitaires-serologie-pdf";

/** Port renderSerologie / Salmonella / Widal — regroupe RESULTAT + VALEUR par antigène. */
export function SerologieResultatPdf({
  lignes,
  titreSerologie,
  normaliserPrefixe = false,
}: {
  lignes: LigneParametrePdf[];
  titreSerologie?: string;
  normaliserPrefixe?: boolean;
}) {
  const { groupes, restants } = grouperParametresSerologie(lignes, {
    normaliserPrefixe,
  });

  const rows = groupes.map((g) => {
    const prefix =
      g.prefix.toUpperCase() === "SÉROLOGIE" && titreSerologie?.trim()
        ? titreSerologie.trim()
        : g.prefix;
    return [prefix, g.resultat, g.valeur];
  });

  if (rows.length === 0 && restants.length === 0) {
    return null;
  }

  // Ancien fallback 1 ligne (RESULTAT/VALEUR seuls) — évité dès qu'on a des groupes.
  if (rows.length === 0 && restants.length <= 2) {
    return (
      <TableauParametresResultatPdf
        lignes={lignes}
        options={{ showFlag: false, showRange: false, showValues: true, showUnit: true }}
        titreSerologie={titreSerologie}
      />
    );
  }

  return (
    <View>
      {rows.length > 0 ? (
        <TableauColonnesPdf
          headers={["PARAMÈTRES", "RÉSULTAT", "VALEUR"]}
          widths={["35%", "32.5%", "32.5%"]}
          rows={rows}
          alignRow="center"
        />
      ) : null}
      {restants.length > 0 ? (
        <TableauParametresResultatPdf
          lignes={restants}
          options={{
            showFlag: false,
            showRange: false,
            showValues: false,
            showUnit: true,
          }}
        />
      ) : null}
    </View>
  );
}
