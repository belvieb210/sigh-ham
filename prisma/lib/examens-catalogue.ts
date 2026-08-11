import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface ParametreCatalogueJson {
  name: string;
  unite?: string;
  range_usuelle?: string;
  required?: boolean;
}

export interface ExamenCatalogueJson {
  code: string;
  nom: string;
  type: string;
  formulaire?: string;
  service?: string;
  specimen?: string;
  prix: number;
  unite?: string;
  range_usuelle?: string;
  description?: string;
  parameters: ParametreCatalogueJson[];
}

export interface ExportCatalogueJson {
  examens: ExamenCatalogueJson[];
}

/** Codes historiques (seed initial) → code équivalent dans le catalogue dbham. */
export const CODES_LEGACY_VERS_CATALOGUE: Record<string, string> = {
  CREAT: "CRE",
  DDIMER: "D_DIMER",
  GLY: "GJ",
  GS: "GROUPAGE",
  HBS: "HBSAG",
  HIV: "HIVqual",
  URINE: "ECBU",
  VDRL: "SYP",
};

export function categorieDepuisType(type: string): string {
  const map: Record<string, string> = {
    BIOCHIMIE: "Biochimie",
    HEMATOLOGIE: "Hématologie",
    HORMONES: "Hormonologie",
    "IMMUNO CHIMILUMINESCENCE (CLIA)": "Immunologie",
    MICROBIOLOGIE: "Microbiologie",
    SEROLOGIE: "Sérologie",
    COAGULATION: "Hémostase",
    "FLUIDE (LIQUIDE BIOLOGIQUE)": "Fluides",
    HISTOPATHOLOGIE: "Histopathologie",
    "FROTTIS - SECRETION": "Cytologie",
    "BILANS DES ANALYSES MEDICALES": "Bilans",
    "CHARGE VIRAL": "Virologie",
    PARASITOLOGIE: "Parasitologie",
  };
  return map[type] ?? type;
}

export function chargerCatalogueExamens(
  chemin = join(process.cwd(), "liste_examens_et_paramètres.json")
): ExportCatalogueJson {
  const brut = readFileSync(chemin, "utf-8");
  return JSON.parse(brut) as ExportCatalogueJson;
}

export function indexCatalogueParCode(
  data: ExportCatalogueJson
): Map<string, ExamenCatalogueJson> {
  return new Map(data.examens.map((ex) => [ex.code.trim(), ex]));
}

export function metaDepuisCatalogue(ex: ExamenCatalogueJson) {
  return {
    formulaire: ex.formulaire?.trim() || null,
    serviceLabo: ex.service?.trim() || categorieDepuisType(ex.type),
    specimen: ex.specimen?.trim() || null,
    uniteDefaut: ex.unite?.trim() || null,
    rangeUsuelle: ex.range_usuelle?.trim() || null,
    description: ex.description?.trim() || null,
    categorie: categorieDepuisType(ex.type),
  };
}

export function metaIncomplete(type: {
  specimen: string | null;
  formulaire: string | null;
  serviceLabo: string | null;
}) {
  return !type.specimen?.trim() || !type.formulaire?.trim() || !type.serviceLabo?.trim();
}
