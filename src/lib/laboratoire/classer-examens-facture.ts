import { lireOrientationAnalyseDepuisNotes } from "@/constants/laboratoire-orientations";
import { normaliserLibelleFacture } from "@/lib/resultats-public/normaliser-identite";

const LIBELLES_LIGNE_NON_EXAMEN = new Set([
  "remise",
  "frais divers",
  "avance",
  "acompte",
]);

export type ExamenFactureBrut = {
  id: string;
  statut: string;
  libelle: string;
  notes: string | null;
  resultatLe: Date | null;
  aResultats: boolean;
};

export type ExamenFactureClasse = {
  id: string;
  libelle: string;
  statut: string;
  disponible: boolean;
};

function libellesFactureCorrespondent(
  libelleExamen: string,
  libellesFacture: Set<string>
): boolean {
  if (libellesFacture.size === 0) return true;
  const ex = normaliserLibelleFacture(libelleExamen);
  for (const lf of libellesFacture) {
    if (ex === lf || ex.includes(lf) || lf.includes(ex)) return true;
  }
  return false;
}

export function estExamenDrApprouve(ex: {
  statut: string;
  notes: string | null;
  aResultats: boolean;
}): boolean {
  return (
    ex.statut === "TERMINE" &&
    lireOrientationAnalyseDepuisNotes(ex.notes) === "DR_APPROUVE" &&
    ex.aResultats
  );
}

/** Exclut remises, frais administratifs et lignes à montant négatif ou nul. */
export function estLigneFactureExamen(ligne: {
  libelle: string;
  montant: number;
}): boolean {
  const lib = normaliserLibelleFacture(ligne.libelle);
  if (LIBELLES_LIGNE_NON_EXAMEN.has(lib)) return false;
  if (ligne.montant <= 0) return false;
  return true;
}

/** Examens rattachés à une facture : approuvés vs encore indisponibles. */
export function classerExamensFacture(
  lignesFacture: { libelle: string; montant: number }[],
  examensDossier: ExamenFactureBrut[]
): {
  approuves: ExamenFactureClasse[];
  enAttente: ExamenFactureClasse[];
  numeroFactureLignes: number;
} {
  const lignesExamens = lignesFacture.filter(estLigneFactureExamen);

  const libellesFacture = new Set(
    lignesExamens.map((l) => normaliserLibelleFacture(l.libelle))
  );

  const surFacture = examensDossier.filter((ex) =>
    libellesFactureCorrespondent(ex.libelle, libellesFacture)
  );

  const approuves: ExamenFactureClasse[] = surFacture
    .filter(estExamenDrApprouve)
    .map((ex) => ({
      id: ex.id,
      libelle: ex.libelle,
      statut: ex.statut,
      disponible: true,
    }));

  const enAttente: ExamenFactureClasse[] = surFacture
    .filter((ex) => !estExamenDrApprouve(ex))
    .map((ex) => ({
      id: ex.id,
      libelle: ex.libelle,
      statut: ex.statut,
      disponible: false,
    }));

  const libellesCouvert = new Set(
    surFacture.map((ex) => normaliserLibelleFacture(ex.libelle))
  );
  for (const ligne of lignesExamens) {
    const cle = normaliserLibelleFacture(ligne.libelle);
    const dejaCouvert = [...libellesCouvert].some(
      (l) => l === cle || l.includes(cle) || cle.includes(l)
    );
    if (!dejaCouvert) {
      enAttente.push({
        id: `ligne-${cle}`,
        libelle: ligne.libelle,
        statut: "PRESCRIT",
        disponible: false,
      });
    }
  }

  return {
    approuves,
    enAttente,
    numeroFactureLignes: lignesExamens.length,
  };
}
