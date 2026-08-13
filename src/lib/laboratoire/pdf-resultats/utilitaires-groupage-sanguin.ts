import type { LigneParametrePdf } from "@/lib/laboratoire/pdf-resultats/types";

const ANTIGENES = ["A", "B", "AB", "O"] as const;

function normaliserCle(nom: string): string {
  return nom
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");
}

function estTruthy(v: string): boolean {
  const s = v.trim().toLowerCase();
  if (!s || s === "0" || s === "false" || s === "non" || s === "negatif" || s === "n") {
    return false;
  }
  return true;
}

function trouverValeur(
  lignes: LigneParametrePdf[],
  candidats: string[]
): string {
  const set = new Set(candidats.map((c) => normaliserCle(c)));
  for (const l of lignes) {
    const key = normaliserCle(l.name);
    if (set.has(key)) {
      const v = (l.other ?? l.value ?? "").trim();
      if (v) return v;
    }
  }
  for (const l of lignes) {
    const key = normaliserCle(l.name);
    for (const c of candidats) {
      if (key.includes(normaliserCle(c))) {
        const v = (l.other ?? l.value ?? "").trim();
        if (v) return v;
      }
    }
  }
  return "";
}

function normaliserRhesus(raw: string): string {
  if (!raw.trim()) return "";
  const up = raw.trim().toUpperCase();
  if (/POS|OUI/.test(up)) return "POSITIF";
  if (/NEG|NON/.test(up)) return "NEGATIF";
  return up;
}

function selectedFromGroupe(
  groupeNorm: string,
  methodKey: "beth" | "simonin",
  antigen: string
): boolean | null {
  const g = groupeNorm.replace(/0/g, "O");
  if (g === "A") {
    if (methodKey === "beth") return ["A", "AB"].includes(antigen);
    if (methodKey === "simonin") return antigen === "B";
  }
  if (g === "B") {
    if (methodKey === "beth") return ["B", "AB"].includes(antigen);
    if (methodKey === "simonin") return antigen === "A";
  }
  if (g === "AB") {
    if (methodKey === "beth") return ["A", "AB", "B"].includes(antigen);
    if (methodKey === "simonin") return false;
  }
  if (g === "O") {
    if (methodKey === "beth") return antigen === "O";
    if (methodKey === "simonin") return ["A", "B"].includes(antigen);
  }
  return null;
}

function mapSelections(lignes: LigneParametrePdf[]): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const l of lignes) {
    const key = normaliserCle(l.name);
    const val = (l.other ?? l.value ?? "").trim();
    if (/^(beth|simonin)_[ab0o]+$/.test(key.replace(/ab/g, "ab"))) {
      out[key] = estTruthy(val);
    }
    if (/^beth_/.test(key) || /^simonin_/.test(key)) {
      out[key] = estTruthy(val);
    }
  }
  return out;
}

export interface DonneesGroupageSanguinPdf {
  groupe: string;
  rhesus: string;
  methode: string;
  notes: string;
  selections: Record<string, boolean>;
  estSelectionne: (methodKey: "beth" | "simonin", antigen: string) => boolean;
}

export function parserGroupageSanguin(
  lignes: LigneParametrePdf[]
): DonneesGroupageSanguinPdf {
  let groupe = trouverValeur(lignes, [
    "groupe",
    "groupe_sanguin",
    "groupe_abo",
    "group",
    "blood_group",
    "abo_groupe",
  ]).toUpperCase();

  let rhesus = trouverValeur(lignes, [
    "rhesus_d",
    "rh_d",
    "rh",
    "rhesus",
    "rhesis_d",
    "rhésus_d",
  ]);
  if (!rhesus) {
    for (const l of lignes) {
      const nm = normaliserCle(l.name);
      if (nm.includes("rhesus") || nm === "rh" || nm.includes("rh_d")) {
        rhesus = (l.other ?? l.value ?? "").trim();
        if (rhesus) break;
      }
    }
  }
  rhesus = normaliserRhesus(rhesus);

  let methode = trouverValeur(lignes, [
    "methode",
    "method",
    "methodes",
    "groupage_methode",
  ]).toUpperCase();

  const notes = trouverValeur(lignes, [
    "notes",
    "note",
    "comment",
    "interpretation",
    "groupage_notes",
  ]);

  const selections = mapSelections(lignes);
  const groupeNorm = groupe.replace(/0/g, "O");

  const estSelectionne = (methodKey: "beth" | "simonin", antigen: string) => {
    const chk = `${methodKey}_${antigen.toLowerCase().replace("-", "_")}`;
    const key = normaliserCle(chk);
    if (selections[key]) return true;
    for (const [k, v] of Object.entries(selections)) {
      if (k === key && v) return true;
    }
    const derived = selectedFromGroupe(groupeNorm, methodKey, antigen);
    return derived === null ? false : derived;
  };

  if (!methode) {
    const parts: string[] = [];
    if (ANTIGENES.some((a) => estSelectionne("beth", a))) {
      parts.push("BETH-VINCENT (Directe)");
    }
    if (ANTIGENES.some((a) => estSelectionne("simonin", a))) {
      parts.push("SIMONIN (Indirecte)");
    }
    if (parts.length) methode = parts.join(" ; ");
  }

  return {
    groupe: groupeNorm,
    rhesus,
    methode,
    notes,
    selections,
    estSelectionne,
  };
}

export { ANTIGENES };
