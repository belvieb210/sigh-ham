import type { LigneParametrePdf } from "@/lib/laboratoire/pdf-resultats/types";

function normaliserNom(nom: string): string {
  return nom
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function valeurLigne(l: LigneParametrePdf): string {
  const other = (l.other ?? "").trim();
  if (other) return other;
  return (l.value ?? "").trim();
}

const RESERVE_MICRO =
  /^(specimen|methode|method|resultat|result)$/i;

/** Extraction SPECIMEN + MÉTHODE + espèces (port renderMicrofilaire PHP). */
export function parserMicrofilaire(lignes: LigneParametrePdf[]) {
  let specimen = "";
  let methode = "";
  const especes: LigneParametrePdf[] = [];

  for (const l of lignes) {
    const n = normaliserNom(l.name);
    if (n === "specimen") {
      specimen = valeurLigne(l);
    } else if (n === "methode" || n === "method") {
      methode = valeurLigne(l);
    } else if (/^result/.test(n)) {
      continue;
    } else if (!RESERVE_MICRO.test(l.name.trim())) {
      especes.push(l);
    }
  }

  return { specimen, methode, especes };
}

/** Extraction goutte fraîche : SPECIMEN + RESULTAT + espèces. */
export function parserGoutteFraiche(lignes: LigneParametrePdf[]) {
  let specimen = "";
  let resultat = "";
  const especes: LigneParametrePdf[] = [];

  for (const l of lignes) {
    const n = normaliserNom(l.name);
    if (n === "specimen") {
      specimen = valeurLigne(l);
    } else if (/^result/.test(n)) {
      resultat = valeurLigne(l);
    } else if (!/^(specimen|resultat|result)$/i.test(l.name.trim())) {
      especes.push(l);
    }
  }

  return { specimen, resultat, especes };
}

export const PATHOLOGIES_GOUTTE_FRAICHE = [
  "FILARIOSIS LYMPHATIQUES",
  "FILARIOSIS CUTANEES",
  "TROPISME OCULAIRE",
  "CHEVILLE ET PIED EN GENERAL",
  "MALADIE DU SOMMEIL",
];

export function observationEspece(l: LigneParametrePdf): string {
  const other = (l.other ?? "").trim();
  if (other) return other.toUpperCase();
  return (l.value ?? "").trim().toUpperCase();
}

export function pathologieEspece(l: LigneParametrePdf): string {
  return (l.value ?? "").trim().toUpperCase();
}
