import type { LigneFactureExamensCaisse } from "@/lib/caisse/types";
import { normaliserLibelleFacture } from "@/lib/resultats-public/normaliser-identite";

function decimalVersNombre(
  v: { toNumber?: () => number; toString?: () => string } | number | null | undefined
): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  if (typeof v.toNumber === "function") return v.toNumber();
  return Number(v.toString?.() ?? v) || 0;
}

type ExamenFacturation = {
  id: string;
  paquetBilanId: string | null;
  typeExamen: { libelle: string; prix: { toNumber?: () => number } | number };
  paquetBilan?: { libelle: string; prix: { toNumber?: () => number } | number } | null;
};

/** Une ligne forfait par paquet ; prix unitaire pour les examens hors paquet. */
export function construireLignesFactureExamens(
  examens: ExamenFacturation[]
): LigneFactureExamensCaisse[] {
  const lignes: LigneFactureExamensCaisse[] = [];
  const paquetsVus = new Set<string>();

  for (const ex of examens) {
    if (ex.paquetBilanId && ex.paquetBilan) {
      if (paquetsVus.has(ex.paquetBilanId)) continue;
      paquetsVus.add(ex.paquetBilanId);
      const montant = decimalVersNombre(ex.paquetBilan.prix);
      lignes.push({
        id: `paquet-${ex.paquetBilanId}`,
        libelle: ex.paquetBilan.libelle,
        quantite: 1,
        prixUnitaire: montant,
        montant,
        source: "EXAMEN",
      });
      continue;
    }

    const montant = decimalVersNombre(ex.typeExamen.prix);
    lignes.push({
      id: ex.id,
      libelle: ex.typeExamen.libelle,
      quantite: 1,
      prixUnitaire: montant,
      montant,
      source: "EXAMEN",
    });
  }

  return lignes;
}

function consommerLigneFacturee(
  restants: Map<string, number>,
  libelle: string
): boolean {
  const cle = normaliserLibelleFacture(libelle);
  if (!cle) return false;
  const n = restants.get(cle) ?? 0;
  if (n > 0) {
    restants.set(cle, n - 1);
    return true;
  }
  for (const [autre, qte] of restants) {
    if (qte <= 0) continue;
    if (cle === autre || cle.includes(autre) || autre.includes(cle)) {
      restants.set(autre, qte - 1);
      return true;
    }
  }
  return false;
}

/** Prestations prescrites absentes des factures examens non annulées. */
export function extraireLignesExamensNonFacturees(
  lignesPrescrites: LigneFactureExamensCaisse[],
  lignesDejaFacturees: { libelle: string; montant: number }[]
): LigneFactureExamensCaisse[] {
  const restants = new Map<string, number>();
  for (const ligne of lignesDejaFacturees) {
    if (ligne.montant <= 0) continue;
    const cle = normaliserLibelleFacture(ligne.libelle);
    if (!cle) continue;
    restants.set(cle, (restants.get(cle) ?? 0) + 1);
  }

  const nonFacturees: LigneFactureExamensCaisse[] = [];
  for (const ligne of lignesPrescrites) {
    if (ligne.montant <= 0) continue;
    if (!consommerLigneFacturee(restants, ligne.libelle)) {
      nonFacturees.push(ligne);
    }
  }
  return nonFacturees;
}
