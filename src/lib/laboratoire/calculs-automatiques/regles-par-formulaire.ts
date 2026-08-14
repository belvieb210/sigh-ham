import type { ConfigCalculFormulaire } from "@/lib/laboratoire/calculs-automatiques/types";
import { normaliserNomParametre } from "@/lib/laboratoire/calculs-automatiques/utilitaires-numeriques";

const LEUCOCYTES_POURCENT = ["NEUT%", "LYMPH%", "MONO%", "EOS%", "BASO%"] as const;

const HEMOGLOBINES_POURCENT = [
  "HEMOGLOBINE A",
  "HEMOGLOBINE A2",
  "HEMOGLOBINE F",
  "HEMOGLOBINE S",
  "HEMOGLOBINE D,C,E…",
] as const;

const SOMME_LEUCOCYTES = {
  id: "leucocytes",
  label: "Total formule leucocytaire",
  sources: [...LEUCOCYTES_POURCENT],
  cible: 100,
  bloquerSiDepasse: true,
};

const SOMME_HEMOGLOBINES = {
  id: "hemoglobines",
  label: "Total hémoglobines",
  sources: [...HEMOGLOBINES_POURCENT],
  cible: 100,
  bloquerSiDepasse: true,
};

const CONFIGS: Record<string, ConfigCalculFormulaire> = {
  valeur_absolu_eosinophiles: {
    champsCalcules: ["VALEUR ABSOLU DES EOSINOPHILES"],
    derives: [
      {
        cible: "VALEUR ABSOLU DES EOSINOPHILES",
        format: "entier",
        calcul: (lire) => {
          const gb = lire("GLOBULES BLANCS");
          const pct = lire("POURCENTAGE DES EOSINOPHILES");
          if (gb === null || pct === null || gb <= 0 || pct <= 0) return null;
          return (pct * gb) / 100;
        },
      },
    ],
  },

  spermogramme: {
    champsCalcules: [
      "NUMERATION DES SPERMATOZOIDES",
      "IMMOBILE",
      "MOBILITE NON PROGRESSIVE",
      "FORMES ANORMALES",
      "FORMES MORTES",
    ],
    derives: [
      {
        cible: "NUMERATION DES SPERMATOZOIDES",
        format: "numeration",
        calcul: (lire) => {
          const vol = lire("VOLUME COLLECTE");
          const conc = lire("CONCENTRATION DE SPERME");
          if (vol === null || conc === null || vol <= 0 || conc <= 0) return null;
          return vol * conc;
        },
      },
      {
        cible: "IMMOBILE",
        format: "pourcentage",
        calcul: (lire) => {
          const totale = lire("MOBILITE TOTALE");
          if (totale === null || totale < 0 || totale > 100) return null;
          return 100 - totale;
        },
      },
      {
        cible: "MOBILITE NON PROGRESSIVE",
        format: "pourcentage",
        calcul: (lire) => {
          const totale = lire("MOBILITE TOTALE");
          const progressive = lire("MOBILITE PROGRESSIVE");
          if (
            totale === null ||
            progressive === null ||
            totale < 0 ||
            progressive < 0 ||
            totale < progressive
          ) {
            return null;
          }
          return totale - progressive;
        },
      },
      {
        cible: "FORMES ANORMALES",
        format: "pourcentage",
        calcul: (lire) => {
          const normales = lire("FORMES NORMALES");
          if (normales === null || normales < 0 || normales > 100) return null;
          return 100 - normales;
        },
      },
      {
        cible: "FORMES MORTES",
        format: "pourcentage",
        calcul: (lire) => {
          const vivantes = lire("FORMES VIVANTES");
          if (vivantes === null || vivantes < 0 || vivantes > 100) return null;
          return 100 - vivantes;
        },
      },
    ],
  },

  electrophorese: {
    champsCalcules: [],
    sommes: [SOMME_HEMOGLOBINES],
    derives: [],
  },

  nfs: {
    champsCalcules: [],
    sommes: [SOMME_LEUCOCYTES],
    derives: [],
  },

  nfl: {
    champsCalcules: [],
    sommes: [SOMME_LEUCOCYTES],
    derives: [],
  },

  micro_albuminuries: {
    champsCalcules: ["RAPPORT ALBU/CREAT"],
    derives: [
      {
        cible: "RAPPORT ALBU/CREAT",
        calcul: (lire) => {
          const albuminurie = lire("ALBUMINURIE");
          const creatinurie = lire("CREATINURIE");
          if (albuminurie === null || creatinurie === null || creatinurie <= 0) {
            return null;
          }
          return (albuminurie / creatinurie) * 100;
        },
      },
    ],
  },

  bilans_azotes: {
    champsCalcules: ["RAPPORT UREE/CREATININE"],
    derives: [
      {
        cible: "RAPPORT UREE/CREATININE",
        calcul: (lire) => {
          const uree = lire("UREE");
          const creatinine = lire("CREATININE");
          if (uree === null || creatinine === null || uree <= 0) return null;
          return (creatinine / uree) * 100;
        },
      },
    ],
  },

  ptt: {
    champsCalcules: ["GLOBULINE", "RAPPORT ALBU/GLOBU"],
    derives: [
      {
        cible: "GLOBULINE",
        calcul: (lire) => {
          const pt = lire("PROTEINE TOTALES");
          const albumine = lire("ALBUMINE");
          if (pt === null || albumine === null) return null;
          return pt - albumine;
        },
      },
      {
        cible: "RAPPORT ALBU/GLOBU",
        calcul: (lire) => {
          const albumine = lire("ALBUMINE");
          const globuline = lire("GLOBULINE");
          if (albumine === null || globuline === null || globuline <= 0) return null;
          return albumine / globuline;
        },
      },
    ],
  },

  bilirubi: {
    champsCalcules: ["BILIRUBINE INDIRECT"],
    derives: [
      {
        cible: "BILIRUBINE INDIRECT",
        calcul: (lire) => {
          const total = lire("BILIRUBINE TOTAL");
          const direct = lire("BILIRUBINE DIRECT");
          if (total === null || direct === null) return null;
          return total - direct;
        },
      },
    ],
  },

  profil_lipidique: {
    champsCalcules: [
      "LDL CHOLESTEROL",
      "RAPPORT CHOL/HDL",
      "RAPPORT LDL/HDL",
      "VLDL",
    ],
    derives: [
      {
        cible: "LDL CHOLESTEROL",
        calcul: (lire) => {
          const total = lire("TOTAL CHOLESTEROL");
          const hdl = lire("HDL CHOLESTEROL");
          const tg = lire("TRIGLYCERIDE");
          if (total === null || hdl === null || tg === null) return null;
          return total - hdl - tg / 5;
        },
      },
      {
        cible: "RAPPORT CHOL/HDL",
        calcul: (lire) => {
          const total = lire("TOTAL CHOLESTEROL");
          const hdl = lire("HDL CHOLESTEROL");
          if (total === null || hdl === null || hdl === 0) return null;
          return total / hdl;
        },
      },
      {
        cible: "RAPPORT LDL/HDL",
        calcul: (lire) => {
          const ldl = lire("LDL CHOLESTEROL");
          const hdl = lire("HDL CHOLESTEROL");
          if (ldl === null || hdl === null || hdl === 0) return null;
          return ldl / hdl;
        },
      },
      {
        cible: "VLDL",
        calcul: (lire) => {
          const total = lire("TOTAL CHOLESTEROL");
          const hdl = lire("HDL CHOLESTEROL");
          const ldl = lire("LDL CHOLESTEROL");
          if (total === null || hdl === null || ldl === null) return null;
          return total - hdl - ldl;
        },
      },
    ],
  },

  proteinurie24: {
    champsCalcules: ["PROTEINURIE 24 HEURES"],
    derives: [
      {
        cible: "PROTEINURIE 24 HEURES",
        calcul: (lire) => {
          const total = lire("TOTAL PROTEINURIE");
          if (total === null) return null;
          return (total / 24) * 10;
        },
      },
    ],
  },
};

function possedeParametres(
  parametres: { nom: string }[],
  noms: string[]
): boolean {
  const ensemble = new Set(parametres.map((p) => normaliserNomParametre(p.nom)));
  return noms.every((n) => ensemble.has(normaliserNomParametre(n)));
}

/** Résout la clé de calcul (gère les alias et le formulaire générique `bilans`). */
export function resoudreCleCalculAutomatique(
  formulaire: string | null | undefined,
  parametres: { nom: string }[]
): string | null {
  const brut = (formulaire ?? "").trim().toLowerCase();

  if (brut === "bilans") {
    if (
      possedeParametres(parametres, [
        "PROTEINE TOTALES",
        "ALBUMINE",
        "GLOBULINE",
      ])
    ) {
      return "ptt";
    }
    if (
      possedeParametres(parametres, [
        "TOTAL PROTEINURIE",
        "PROTEINURIE 24 HEURES",
      ])
    ) {
      return "proteinurie24";
    }
    return null;
  }

  if (brut === "profillipidique") return "profil_lipidique";

  if (CONFIGS[brut]) return brut;

  return null;
}

export function obtenirConfigCalcul(
  formulaire: string | null | undefined,
  parametres: { nom: string }[]
): ConfigCalculFormulaire | null {
  const cle = resoudreCleCalculAutomatique(formulaire, parametres);
  if (!cle) return null;
  return CONFIGS[cle] ?? null;
}

export function estChampCalculeAutomatique(
  formulaire: string | null | undefined,
  parametres: { nom: string }[],
  nomParametre: string
): boolean {
  const config = obtenirConfigCalcul(formulaire, parametres);
  if (!config) return false;
  const cle = normaliserNomParametre(nomParametre);
  return config.champsCalcules.some((n) => normaliserNomParametre(n) === cle);
}
