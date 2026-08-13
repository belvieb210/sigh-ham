import type {
  ModeRenderExamenPdf,
  OptionsTableauParametresPdf,
} from "@/lib/laboratoire/pdf-resultats/types";

const DEFAUT_BIO: OptionsTableauParametresPdf = {
  showFlag: true,
  showRange: true,
  showUnit: true,
};

const PARASITO_SANS_FLAG: OptionsTableauParametresPdf = {
  showFlag: false,
  showRange: true,
  showUnit: false,
  commentProportion: 0.45,
};

const DEUX_COL_RESULTAT = {
  col2Label: "Résultat",
  paramProportion: 30,
  majusculesValeur: false,
} as const;

const DEUX_COL_DESCRIPTION = {
  col2Label: "Description",
  paramProportion: 30,
  alignLeftCol2: true,
} as const;

/** Registre type → mode de render (colonnes / layout). Port des generate*PDF PHP. */
const REGISTRE: Record<string, ModeRenderExamenPdf> = {
  generic: { kind: "parametres", options: DEFAUT_BIO },
  bioCliaHorm: { kind: "bioCliaHorm", options: DEFAUT_BIO },
  hemogramme: { kind: "parametres", options: DEFAUT_BIO },
  ionogramme: { kind: "parametres", options: DEFAUT_BIO },
  nfl: { kind: "parametres", options: DEFAUT_BIO },
  reticulocyte: { kind: "parametres", options: DEFAUT_BIO },
  hematologie: { kind: "parametres", options: DEFAUT_BIO },
  bilanAzotes: { kind: "parametres", options: DEFAUT_BIO },
  profLip: { kind: "parametres", options: DEFAUT_BIO },
  bilirCompl: { kind: "parametres", options: DEFAUT_BIO },
  bilanProtTot: { kind: "parametres", options: DEFAUT_BIO },
  proteinurie24h: { kind: "parametres", options: DEFAUT_BIO },
  spotUrine: { kind: "parametres", options: DEFAUT_BIO },
  glycemieGestationnelle: { kind: "parametres", options: DEFAUT_BIO },
  surveillanceProstat: { kind: "parametres", options: DEFAUT_BIO },
  microAlbuminuries: { kind: "parametres", options: DEFAUT_BIO },
  coagulation: { kind: "parametres", options: DEFAUT_BIO },
  tempsSaignement: { kind: "parametres", options: DEFAUT_BIO },
  tpInr: { kind: "parametres", options: DEFAUT_BIO },
  valeurAbsoluEosinophiles: { kind: "parametres", options: DEFAUT_BIO },
  sedimentUrinaire: { kind: "parametres", options: PARASITO_SANS_FLAG },
  urinesRoutines: { kind: "parametres", options: PARASITO_SANS_FLAG },
  sellesRoutines: { kind: "parametres", options: PARASITO_SANS_FLAG },
  frottiessangperiph: {
    kind: "parametres",
    options: { showFlag: false, showRange: true, showUnit: true, paramProportion: 0.45 },
  },
  frottisSecretion: {
    kind: "parametres",
    options: { showFlag: false, showRange: false, showUnit: false },
  },
  fluide: {
    kind: "parametres",
    options: { showFlag: false, showRange: false, showUnit: false },
  },
  spermogramme: {
    kind: "parametres",
    options: { showFlag: false, showRange: true, showUnit: true },
  },
  serologie: { kind: "serologie" },
  salmonella: { kind: "serologie" },
  widal: { kind: "serologie" },
  malaria: { kind: "malaria" },
  bilansTorch: { kind: "bilansTorch" },
  groupageSanguin: { kind: "groupageSanguin" },
  microfilaire: { kind: "microfilaire" },
  electrophorese: { kind: "electrophorese" },
  ziehlNelsen: { kind: "ziehlNelsen" },
  rivalta: {
    kind: "deuxColonnes",
    options: { ...DEUX_COL_RESULTAT, majusculesValeur: true },
  },
  proteineBincesJones: { kind: "deuxColonnes", options: DEUX_COL_RESULTAT },
  trypanosomiase: { kind: "deuxColonnes", options: DEUX_COL_RESULTAT },
  sangOcculte: { kind: "deuxColonnes", options: DEUX_COL_RESULTAT },
  histopathologie: { kind: "deuxColonnes", options: DEUX_COL_DESCRIPTION },
  chargeViral: { kind: "deuxColonnes", options: DEUX_COL_DESCRIPTION },
  hemoculture: { kind: "parametres", options: { showFlag: false, showRange: true, showUnit: true } },
  coproculture: { kind: "parametres", options: { showFlag: false, showRange: true, showUnit: true } },
  microbiologie: { kind: "parametres", options: { showFlag: false, showRange: true, showUnit: true } },
  goutteFraiche: { kind: "goutteFraiche" },
  malariaTDR: { kind: "malariaTDR" },
};

export function resoudreModeRenderExamen(typeNormalise: string): ModeRenderExamenPdf {
  return REGISTRE[typeNormalise] ?? REGISTRE.generic!;
}
