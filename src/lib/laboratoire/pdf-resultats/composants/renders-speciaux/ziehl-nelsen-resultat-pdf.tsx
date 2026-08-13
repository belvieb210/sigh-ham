import { View } from "@react-pdf/renderer";
import type { LigneParametrePdf } from "@/lib/laboratoire/pdf-resultats/types";
import { TableauColonnesPdf } from "@/lib/laboratoire/pdf-resultats/composants/renders-speciaux/primitives-tableau-pdf";

interface LigneZn {
  date: string;
  ech: string;
  aspect: string;
  resultat: string;
}

function parserZiehlNelsen(lignes: LigneParametrePdf[]): LigneZn[] {
  const rows: Record<number, Partial<LigneZn>> = {};

  for (const l of lignes) {
    const name = l.name.trim().toUpperCase();
    const val = (l.value ?? "").trim();
    const mDate = name.match(/LIGNE_(\d+)_DATE/);
    const mEch = name.match(/LIGNE_(\d+)_ECH/);
    const mAspect = name.match(/LIGNE_(\d+)_ASPECT/);
    const mRes = name.match(/^LIGNE_(\d+)$/);

    if (mDate) {
      const i = Number(mDate[1]);
      rows[i] = { ...rows[i], date: val };
    } else if (mEch) {
      const i = Number(mEch[1]);
      rows[i] = { ...rows[i], ech: val };
    } else if (mAspect) {
      const i = Number(mAspect[1]);
      rows[i] = { ...rows[i], aspect: val };
    } else if (mRes) {
      const i = Number(mRes[1]);
      rows[i] = { ...rows[i], resultat: val };
    }
  }

  return Object.keys(rows)
    .map(Number)
    .sort((a, b) => a - b)
    .map((i) => ({
      date: rows[i]?.date ?? "",
      ech: rows[i]?.ech ?? "",
      aspect: rows[i]?.aspect ?? "",
      resultat: rows[i]?.resultat ?? "",
    }));
}

/** Port renderZiehlNelsen() — DATE · ÉCHANTILLON · ASPECT · RÉSULTAT. */
export function ZiehlNelsenResultatPdf({ lignes }: { lignes: LigneParametrePdf[] }) {
  const parsed = parserZiehlNelsen(lignes);
  if (!parsed.length) return null;

  const rows = parsed.map((r) => [r.date, r.ech, r.aspect, r.resultat]);

  return (
    <View>
      <TableauColonnesPdf
        headers={["DATE", "ÉCHANTILLON", "ASPECT", "RÉSULTAT"]}
        widths={["25%", "25%", "25%", "25%"]}
        rows={rows}
        alignRow="center"
      />
    </View>
  );
}
