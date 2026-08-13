import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { LigneParametrePdf } from "@/lib/laboratoire/pdf-resultats/types";
import { COULEURS_RESULTAT_PDF } from "@/lib/laboratoire/pdf-resultats/composants/styles-resultat-pdf";
import { TableauLabelValeurPdf } from "@/lib/laboratoire/pdf-resultats/composants/renders-speciaux/primitives-tableau-pdf";
import {
  ANTIGENES,
  parserGroupageSanguin,
} from "@/lib/laboratoire/pdf-resultats/utilitaires-groupage-sanguin";

const ROUGE = "#c00000";

const styles = StyleSheet.create({
  blocPrincipal: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "stretch",
  },
  grille: {
    width: "58%",
    borderWidth: 1,
    borderColor: COULEURS_RESULTAT_PDF.bordureTableau,
  },
  blocResultat: {
    width: "42%",
    borderWidth: 1,
    borderColor: "#a0aabf",
    borderLeftWidth: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COULEURS_RESULTAT_PDF.bordureTableau,
  },
  cellLabel: {
    width: "50%",
    paddingVertical: 4,
    paddingHorizontal: 4,
    fontSize: 8,
    borderRightWidth: 1,
    borderRightColor: COULEURS_RESULTAT_PDF.bordureTableau,
  },
  cellLabelBold: {
    fontWeight: "bold",
    fontSize: 9,
    textAlign: "center",
    backgroundColor: "#ebf0f5",
  },
  cellAntigene: {
    width: "12.5%",
    paddingVertical: 4,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: COULEURS_RESULTAT_PDF.bordureTableau,
  },
  cellBulle: {
    width: "12.5%",
    paddingVertical: 3,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: COULEURS_RESULTAT_PDF.bordureTableau,
  },
  cellBulleLast: { borderRightWidth: 0 },
  rowAnticorps: {
    paddingVertical: 5,
    fontSize: 8,
    fontStyle: "italic",
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: COULEURS_RESULTAT_PDF.bordureTableau,
  },
  bulle: {
    width: 14,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: ROUGE,
    alignItems: "center",
    justifyContent: "center",
  },
  bulleSelected: {
    backgroundColor: ROUGE,
    borderWidth: 0,
  },
  bullePoint: {
    color: "#ffffff",
    fontSize: 5,
    letterSpacing: -1,
  },
  groupeTexte: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  rhesusLigne: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 4,
  },
  rhesusLabel: {
    fontSize: 10,
    fontStyle: "italic",
    marginRight: 2,
  },
  rhesusValeur: {
    fontSize: 16,
    fontWeight: "bold",
  },
  notes: {
    fontSize: 9,
    fontStyle: "italic",
    marginTop: 4,
    padding: 6,
    borderWidth: 1,
    borderColor: COULEURS_RESULTAT_PDF.bordureTableau,
    lineHeight: 1.35,
  },
});

function BulleAglutination({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.bulle, ...(selected ? [styles.bulleSelected] : [])]}>
      {selected ? <Text style={styles.bullePoint}>•••</Text> : null}
    </View>
  );
}

const METHODES = [
  { key: "beth" as const, label: "BETH-VINCENT (Directe)" },
  { key: "simonin" as const, label: "SIMONIN (Indirecte)" },
];

/** Port renderGroupageSanguin() — grille Beth/Simonin + bloc ABO/Rh. */
export function GroupageSanguinResultatPdf({
  lignes,
}: {
  lignes: LigneParametrePdf[];
}) {
  const data = parserGroupageSanguin(lignes);

  return (
    <View>
      <View style={styles.blocPrincipal}>
        <View style={styles.grille}>
          <View style={styles.row}>
            <Text style={[styles.cellLabel, styles.cellLabelBold]}>
              MÉTHODES / ANTIGÈNES
            </Text>
            {ANTIGENES.map((a, i) => (
              <Text
                key={a}
                style={[
                  styles.cellAntigene,
                  ...(i === ANTIGENES.length - 1 ? [{ borderRightWidth: 0 }] : []),
                ]}
              >
                {a}
              </Text>
            ))}
          </View>

          {METHODES.map((methode, mi) => (
            <View key={methode.key}>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>{methode.label}</Text>
                {ANTIGENES.map((a, i) => (
                  <View
                    key={a}
                    style={[
                      styles.cellBulle,
                      ...(i === ANTIGENES.length - 1 ? [styles.cellBulleLast] : []),
                    ]}
                  >
                    <BulleAglutination
                      selected={data.estSelectionne(methode.key, a)}
                    />
                  </View>
                ))}
              </View>
              {mi === 0 ? (
                <Text style={styles.rowAnticorps}>
                  Anticorps (hématies lavées)
                </Text>
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.blocResultat}>
          <Text style={styles.groupeTexte}>{data.groupe || " "}</Text>
          {data.rhesus ? (
            <View style={styles.rhesusLigne}>
              <Text style={styles.rhesusLabel}>Rh </Text>
              <Text style={styles.rhesusValeur}>{data.rhesus}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {data.methode ? (
        <TableauLabelValeurPdf
          colLabel="30%"
          lignes={[{ label: "MÉTHODES", valeur: data.methode }]}
        />
      ) : null}

      {data.notes ? <Text style={styles.notes}>{data.notes}</Text> : null}
    </View>
  );
}
