/** Mapping catégorie examen → tube / département labo (étiquettes codes-barres). */

export interface MappingTubeLabo {
  typeTube: string;
  departement: string;
  codeDepartement: string;
}

const PAR_DEFAUT: MappingTubeLabo = {
  typeTube: "SEC-SERUM",
  departement: "BIOCHIMIE",
  codeDepartement: "BIO",
};

const MAP_CATEGORIES: Record<string, MappingTubeLabo> = {
  hematologie: {
    typeTube: "EDTA-SANG",
    departement: "HEMATOLOGIE",
    codeDepartement: "HEM",
  },
  hemostase: {
    typeTube: "EDTA-SANG",
    departement: "HEMATOLOGIE",
    codeDepartement: "HEM",
  },
  biochimie: {
    typeTube: "SEC-SERUM",
    departement: "BIOCHIMIE",
    codeDepartement: "BIO",
  },
  serologie: {
    typeTube: "SEC-SERUM",
    departement: "BIOCHIMIE",
    codeDepartement: "BIO",
  },
  sérologie: {
    typeTube: "SEC-SERUM",
    departement: "BIOCHIMIE",
    codeDepartement: "BIO",
  },
  hormonologie: {
    typeTube: "SEC-SERUM",
    departement: "BIOCHIMIE",
    codeDepartement: "BIO",
  },
  microbiologie: {
    typeTube: "ECBU-URINES",
    departement: "MICROBIOLOGIE",
    codeDepartement: "MIC",
  },
};

export function mappingTubeDepuisCategorie(categorie: string | null | undefined): MappingTubeLabo {
  if (!categorie?.trim()) return PAR_DEFAUT;
  const cle = categorie
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  return MAP_CATEGORIES[cle] ?? PAR_DEFAUT;
}
