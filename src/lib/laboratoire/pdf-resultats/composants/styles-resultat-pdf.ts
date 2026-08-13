import { StyleSheet } from "@react-pdf/renderer";

export const COULEURS_RESULTAT_PDF = {
  noir: "#111111",
  gris: "#555555",
  bleu: "#1a4d7c",
  bleuContour: "#7eb6e0",
  bandeauTitre: "#d2dce6",
  bordureTableau: "#c8d2e6",
};

export const stylesResultatPdf = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    paddingTop: 28,
    paddingHorizontal: 42,
    paddingBottom: 48,
    color: COULEURS_RESULTAT_PDF.noir,
    backgroundColor: "#ffffff",
  },
  bandeauPatient: {
    borderWidth: 1,
    borderColor: COULEURS_RESULTAT_PDF.noir,
    padding: 6,
    marginBottom: 8,
    minHeight: 70,
  },
  bandeauLigne: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bandeauCol: {
    width: "50%",
    flexDirection: "row",
    fontSize: 9,
  },
  bandeauLabel: {
    fontWeight: "bold",
    width: 72,
  },
  bandeauValeur: {
    flex: 1,
  },
  bandeauTitreExamen: {
    backgroundColor: COULEURS_RESULTAT_PDF.bandeauTitre,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 4,
    marginTop: 4,
  },
  bandeauTitreTexte: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
  },
  table: {
    borderWidth: 1,
    borderColor: COULEURS_RESULTAT_PDF.bordureTableau,
    marginBottom: 6,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: COULEURS_RESULTAT_PDF.bordureTableau,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COULEURS_RESULTAT_PDF.bordureTableau,
  },
  cellHeader: {
    paddingVertical: 4,
    paddingHorizontal: 3,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: COULEURS_RESULTAT_PDF.bordureTableau,
  },
  cell: {
    paddingVertical: 3,
    paddingHorizontal: 3,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: COULEURS_RESULTAT_PDF.bordureTableau,
  },
  cellCenter: { textAlign: "center" },
  cellLast: { borderRightWidth: 0 },
  sectionTitre: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 4,
  },
  sectionTexte: {
    fontSize: 9,
    lineHeight: 1.35,
    marginBottom: 4,
  },
  commentaireLigne: {
    fontSize: 8,
    color: COULEURS_RESULTAT_PDF.gris,
    marginBottom: 2,
    paddingLeft: 4,
  },
  validationTitre: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 4,
  },
  validationLigne: {
    flexDirection: "row",
    fontSize: 9,
    marginBottom: 4,
  },
  signatureImage: {
    width: 80,
    height: 24,
    objectFit: "contain",
    marginVertical: 4,
  },
  validationFin: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    fontSize: 9,
  },
});
