/**
 * Aliases modal_type → type de render (port de MethodDiscoveryRegistry PHP).
 * Référence : docs/legacy/pdf_resultat.php, pdf_resultat.md §5.2
 */
export const ALIASES_TYPE_EXAMEN_PDF: Record<string, string> = {
  nfs: "hemogramme",
  hematologie: "hemogramme",
  hb_hct: "hemogramme",
  nfl: "ionogramme",
  ziehl_nelsen: "ziehlNelsen",
  zn: "ziehlNelsen",
  tp_inr: "tpInr",
  micro_albuminuries: "microAlbuminuries",
  frottis_sang: "frottiessangperiph",
  frottis_blood: "frottiessangperiph",
  selles_routine: "sellesRoutines",
  sellesroutine: "sellesRoutines",
  bilans_azotes: "bilanAzotes",
  bilans_torch: "bilansTorch",
  proteine_binces_jones: "proteineBincesJones",
  frottis_secretion: "frottisSecretion",
  glycemie_gestationnelle: "glycemieGestationnelle",
  spot_urines: "spotUrine",
  sediment_urinaire: "sedimentUrinaire",
  sedimenturinaire: "sedimentUrinaire",
  ptt: "bilanProtTot",
  proteinurie24: "bilanProtTot",
  proteinurie24h: "proteinurie24h",
  bilirubi: "bilirCompl",
  profil_lipidique: "profLip",
  rivalta: "rivalta",
  sangocculte: "sangOcculte",
  sang_occulte: "sangOcculte",
  trypanosomiase: "trypanosomiase",
  histopathologie: "histopathologie",
  charge_viral: "chargeViral",
  chargeviral: "chargeViral",
  malaria_tdr: "malariaTDR",
  malaria_ge: "malariaTDR",
  biocliahorm: "bioCliaHorm",
  biochimie: "bioCliaHorm",
  clia: "bioCliaHorm",
  hormones: "bioCliaHorm",
  examform: "bioCliaHorm",
  coagulation: "coagulation",
  temps_saignement: "tempsSaignement",
  surveillance_prostatique: "surveillanceProstat",
  groupage_sanguin: "groupageSanguin",
  groupe_sanguin: "groupageSanguin",
  hemoculture: "hemoculture",
  coproculture: "coproculture",
  electrophorese: "electrophorese",
  reticulocyte: "reticulocyte",
  urinesroutines: "urinesRoutines",
  urines_routines: "urinesRoutines",
  serologie: "serologie",
  seriologie: "serologie",
  salmonella: "salmonella",
  widal: "widal",
  malaria: "malaria",
  spermogramme: "spermogramme",
  goutte_fraiche: "goutteFraiche",
  valeur_absolu_eosinophiles: "valeurAbsoluEosinophiles",
  microbiologie: "microbiologie",
  fluide: "fluide",
  microfilaire: "microfilaire",
  ionogramme: "ionogramme",
};

export function normaliserCleTypeExamen(raw: string | null | undefined): string {
  if (!raw || !String(raw).trim()) return "generic";
  const s = String(raw).trim();
  const snake = s
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
  const compact = snake.replace(/_/g, "");
  return (
    ALIASES_TYPE_EXAMEN_PDF[s] ??
    ALIASES_TYPE_EXAMEN_PDF[compact] ??
    ALIASES_TYPE_EXAMEN_PDF[snake] ??
    s.replace(/_/g, "")
  );
}
