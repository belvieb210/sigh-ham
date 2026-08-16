import type { LigneEstimationInput } from "@/lib/eglise/estimations-convention";
import { construireLignesFactureExamens } from "@/lib/caisse/construire-lignes-facture-examens";

type ExamenEstimationSource = {
  id: string;
  typeExamenId: string;
  paquetBilanId: string | null;
  typeExamen: {
    code: string;
    libelle: string;
    prix: { toNumber?: () => number } | number;
  };
  paquetBilan?: {
    code: string;
    libelle: string;
    prix: { toNumber?: () => number } | number;
  } | null;
};

/** Lignes estimation / convention PDF : forfait paquet ou prix unitaire. */
export function construireLignesEstimationExamens(
  examens: ExamenEstimationSource[]
): LigneEstimationInput[] {
  const lignesFacture = construireLignesFactureExamens(
    examens.map((ex) => ({
      id: ex.id,
      paquetBilanId: ex.paquetBilanId,
      typeExamen: ex.typeExamen,
      paquetBilan: ex.paquetBilan,
    }))
  );

  return lignesFacture.map((ligne) => {
    if (ligne.id.startsWith("paquet-")) {
      const paquetId = ligne.id.slice("paquet-".length);
      const paquet = examens.find((e) => e.paquetBilanId === paquetId)?.paquetBilan;
      return {
        code: paquet?.code ?? "PAQUET",
        libelle: ligne.libelle,
        prixUnitaire: ligne.montant,
      };
    }

    const examen = examens.find((e) => e.id === ligne.id);
    return {
      typeExamenId: examen?.typeExamenId,
      code: examen?.typeExamen.code ?? "",
      libelle: ligne.libelle,
      prixUnitaire: ligne.montant,
    };
  });
}
