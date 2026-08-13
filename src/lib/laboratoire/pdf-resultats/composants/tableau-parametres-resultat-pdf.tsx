import { Text, View } from "@react-pdf/renderer";
import type {
  LigneParametrePdf,
  OptionsTableauParametresPdf,
} from "@/lib/laboratoire/pdf-resultats/types";
import { stylesResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/styles-resultat-pdf";
import { valeurAffichageParametre } from "@/lib/laboratoire/pdf-resultats/utilitaires-parametres";

type ColDef = { key: string; label: string; width: string; center?: boolean };

function colonnesDepuisOptions(opts: OptionsTableauParametresPdf): ColDef[] {
  const showFlag = opts.showFlag ?? true;
  const showRange = opts.showRange ?? true;
  const showValues = opts.showValues ?? false;
  const equalFour = opts.equalFour && showFlag && showRange && !showValues;

  if (equalFour) {
    return [
      { key: "param", label: "Paramètres", width: "25%" },
      { key: "flag", label: "Flag", width: "25%" },
      { key: "result", label: "Résultat", width: "25%" },
      { key: "range", label: "Range usuelle", width: "25%" },
    ];
  }

  const prop = opts.paramProportion;
  const paramPct =
    prop != null && prop > 0 && prop < 1 ? `${Math.round(prop * 100)}%` : "36%";

  const cols: ColDef[] = [{ key: "param", label: "Paramètres", width: paramPct }];
  if (showFlag) cols.push({ key: "flag", label: "Flag", width: "10%", center: true });
  cols.push({
    key: "result",
    label: "Résultat",
    width: showValues ? "22%" : "28%",
    center: true,
  });
  if (showValues) cols.push({ key: "values", label: "Valeur", width: "22%", center: true });
  if (showRange) cols.push({ key: "range", label: "Range usuelle", width: "22%" });
  return cols;
}

function Cell({
  width,
  center,
  last,
  children,
}: {
  width: string;
  center?: boolean;
  last?: boolean;
  children: string;
}) {
  return (
    <Text
      style={[
        stylesResultatPdf.cell,
        { width },
        ...(center ? [stylesResultatPdf.cellCenter] : []),
        ...(last ? [stylesResultatPdf.cellLast] : []),
      ]}
    >
      {children}
    </Text>
  );
}

function HeaderCell({
  width,
  last,
  children,
}: {
  width: string;
  last?: boolean;
  children: string;
}) {
  return (
    <Text
      style={[
        stylesResultatPdf.cellHeader,
        { width },
        ...(last ? [stylesResultatPdf.cellLast] : []),
      ]}
    >
      {children}
    </Text>
  );
}

/** Port de renderParamètres() — tableau générique biochimie / NFS / ionogramme… */
export function TableauParametresResultatPdf({
  lignes,
  options = {},
  titreSerologie,
}: {
  lignes: LigneParametrePdf[];
  options?: OptionsTableauParametresPdf;
  titreSerologie?: string;
}) {
  const cols = colonnesDepuisOptions(options);
  const showValues = options.showValues ?? false;

  if (showValues && !options.showFlag && !options.showRange) {
    let resultat = "";
    let valeurs = "";
    for (const l of lignes) {
      const n = l.name.toUpperCase();
      if (n === "RESULTAT" || n === "RÉSULTAT") resultat = valeurAffichageParametre(l);
      if (n === "VALEURS" || n === "VALEUR") valeurs = valeurAffichageParametre(l);
    }
    return (
      <View style={stylesResultatPdf.table}>
        <View style={stylesResultatPdf.tableHeader}>
          {cols.map((c, i) => (
            <HeaderCell key={c.key} width={c.width} last={i === cols.length - 1}>
              {c.label.toUpperCase()}
            </HeaderCell>
          ))}
        </View>
        <View style={stylesResultatPdf.tableRow}>
          <Cell width={cols[0]!.width}>{titreSerologie ?? "SÉROLOGIE"}</Cell>
          <Cell width={cols[1]!.width} center last={cols.length === 2}>
            {resultat}
          </Cell>
          {cols[2] ? (
            <Cell width={cols[2].width} center last>
              {valeurs}
            </Cell>
          ) : null}
        </View>
      </View>
    );
  }

  const visibles = lignes.filter((l) => !l.nonRequis);

  return (
    <View style={stylesResultatPdf.table}>
      <View style={stylesResultatPdf.tableHeader}>
        {cols.map((c, i) => (
          <HeaderCell key={c.key} width={c.width} last={i === cols.length - 1}>
            {c.label.toUpperCase()}
          </HeaderCell>
        ))}
      </View>
      {visibles.map((l, idx) => (
        <View key={`${l.name}-${idx}`} style={stylesResultatPdf.tableRow}>
          <Cell width={cols[0]!.width}>{l.name}</Cell>
          {options.showFlag ? (
            <Cell width={cols.find((c) => c.key === "flag")!.width} center>
              {l.flag ?? ""}
            </Cell>
          ) : null}
          <Cell
            width={cols.find((c) => c.key === "result")!.width}
            center
          >
            {valeurAffichageParametre(l)}
          </Cell>
          {showValues ? (
            <Cell width={cols.find((c) => c.key === "values")!.width} center>
              {l.other ?? ""}
            </Cell>
          ) : null}
          {options.showRange !== false ? (
            <Cell width={cols.find((c) => c.key === "range")!.width} last>
              {l.range ?? ""}
            </Cell>
          ) : null}
        </View>
      ))}
    </View>
  );
}

export function CommentairesIndividuelsPdf({
  lignes,
}: {
  lignes: LigneParametrePdf[];
}) {
  const avecCommentaire = lignes.filter((l) => l.commentaire?.trim());
  if (!avecCommentaire.length) return null;
  return (
    <View>
      {avecCommentaire.map((l, i) => (
        <Text key={i} style={stylesResultatPdf.commentaireLigne}>
          {l.name} : {l.commentaire}
        </Text>
      ))}
    </View>
  );
}
