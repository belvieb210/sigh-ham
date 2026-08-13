import { normaliserCleTypeExamen } from "@/lib/laboratoire/pdf-resultats/aliases-types-examen";
import type { LigneParametrePdf } from "@/lib/laboratoire/pdf-resultats/types";

function normaliserNom(nom: string): string {
  return nom
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]+/g, "");
}

/** Niveau 3 SmartExamDetector — détection via noms de paramètres (port PHP). */
const SIGNATURES: { type: string; cles: string[]; minRatio?: number }[] = [
  {
    type: "hemogramme",
    cles: ["rb", "gb", "plaquettes", "hemoglobine", "hematocrite", "vgm", "hte"],
  },
  {
    type: "ionogramme",
    cles: ["sodium", "potassium", "chlore", "calcium", "bicarbonate", "na", "k"],
  },
  {
    type: "coagulation",
    cles: ["pt", "aptt", "tca", "inr", "temps", "flag"],
  },
  {
    type: "groupageSanguin",
    cles: ["groupe", "rhesus", "beth", "simonin", "abo"],
  },
  {
    type: "urinesRoutines",
    cles: ["couleur", "densite", "proteines", "glucose", "leucocytes", "ph"],
  },
  {
    type: "sellesRoutines",
    cles: ["helminthes", "protozoaires", "sang", "mucus", "selles"],
  },
  {
    type: "ziehlNelsen",
    cles: ["ligne_1_date", "ligne_1_ech", "ligne_1_aspect"],
  },
  {
    type: "electrophorese",
    cles: ["nomvariante", "variantevaleur", "hba", "hbf"],
  },
  {
    type: "microfilaire",
    cles: ["specimen", "methode", "wuchereria", "loa", "mansonella"],
  },
];

export function detecterTypeParStructureResultats(
  lignes: LigneParametrePdf[]
): string | null {
  if (!lignes.length) return null;

  const noms = lignes.map((l) => normaliserNom(l.name));
  let meilleur: { type: string; score: number } | null = null;

  for (const sig of SIGNATURES) {
    let matches = 0;
    for (const cle of sig.cles) {
      const c = cle.replace(/[\s_-]+/g, "");
      if (noms.some((n) => n.includes(c) || c.includes(n))) matches++;
    }
    if (matches === 0) continue;
    const ratio = matches / sig.cles.length;
    const min = sig.minRatio ?? 0.35;
    if (ratio >= min) {
      const score = ratio * 0.8;
      if (!meilleur || score > meilleur.score) {
        meilleur = { type: sig.type, score };
      }
    }
  }

  if (!meilleur) return null;
  return normaliserCleTypeExamen(meilleur.type);
}
