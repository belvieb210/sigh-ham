import type { LigneFactureExamensCaisse } from "@/lib/caisse/types";

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
