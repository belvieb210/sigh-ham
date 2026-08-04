import "server-only";
import type { StatutExamen } from "@/generated/prisma/client";
import {
  ecrireOrientationAnalyseDansNotes,
  type IdOrientationStatutAnalyse,
  ORIENTATIONS_STATUT_ANALYSE,
  lireOrientationAnalyseDepuisNotes,
} from "@/constants/laboratoire-orientations";
import { prisma } from "@/lib/prisma";

const IDS_ORIENTATION = new Set(
  ORIENTATIONS_STATUT_ANALYSE.map((o) => o.id)
);

function statutExamenCible(
  orientation: IdOrientationStatutAnalyse
): StatutExamen {
  switch (orientation) {
    case "RECUS":
      return "PRESCRIT";
    case "EN_COURS":
      return "EN_ANALYSE";
    case "VERIFIES":
    case "DR_APPROUVE":
      return "TERMINE";
    case "REJETES":
      return "ANNULE";
    default:
      return "PRESCRIT";
  }
}

/**
 * Oriente le dossier vers un statut d'analyse (Reçus, En cours, …).
 * Met à jour le statut des examens + marqueur persistant dans notes.
 */
export async function orienterStatutAnalyseDossier(
  dossierId: string,
  orientation: string,
  technicienId: string
) {
  if (!IDS_ORIENTATION.has(orientation as IdOrientationStatutAnalyse)) {
    throw new Error("Statut d'analyse invalide.");
  }
  const statutCible = orientation as IdOrientationStatutAnalyse;

  const enFile = await prisma.fileAttente.findFirst({
    where: {
      serviLe: null,
      salle: { code: "LABORATOIRE" },
      passage: { dossierId },
    },
    select: { id: true },
  });
  if (!enFile) {
    throw new Error("Patient introuvable dans la file laboratoire.");
  }

  const examens = await prisma.examenLaboratoire.findMany({
    where: { dossierId },
    select: { id: true, notes: true, statut: true },
  });

  if (examens.length === 0) {
    throw new Error("Aucun examen à orienter pour ce dossier.");
  }

  const nouveauStatut = statutExamenCible(statutCible);
  const maintenant = new Date();

  await prisma.$transaction(
    examens.map((ex) => {
      const data: {
        statut: StatutExamen;
        notes: string;
        technicienId?: string;
        resultatLe?: Date | null;
      } = {
        statut: nouveauStatut,
        notes: ecrireOrientationAnalyseDansNotes(ex.notes, statutCible),
      };

      if (nouveauStatut === "EN_ANALYSE" || nouveauStatut === "TERMINE") {
        data.technicienId = technicienId;
      }
      if (nouveauStatut === "TERMINE") {
        if (ex.statut !== "TERMINE") data.resultatLe = maintenant;
      } else if (nouveauStatut !== "ANNULE") {
        data.resultatLe = null;
      }

      return prisma.examenLaboratoire.update({
        where: { id: ex.id },
        data,
      });
    })
  );

  if (statutCible === "DR_APPROUVE") {
    try {
      const { genererEtStockerRapportPrenuptial } = await import(
        "@/lib/eglise/stocker-rapport-prenuptial"
      );
      await genererEtStockerRapportPrenuptial(dossierId);
    } catch (err) {
      console.error(
        "[orienterStatutAnalyseDossier] génération PDF prénuptial:",
        err
      );
    }
  }

  return {
    dossierId,
    orientation: statutCible,
    examensMisAJour: examens.length,
  };
}

/** Statut d'analyse affiché / filtré pour les pages labo. */
export function deriverStatutAnalyse(examens: {
  statut: StatutExamen;
  notes?: string | null;
}[]): IdOrientationStatutAnalyse {
  for (const ex of examens) {
    const marque = lireOrientationAnalyseDepuisNotes(ex.notes);
    if (marque) return marque;
  }

  if (examens.some((e) => e.statut === "ANNULE")) return "REJETES";
  if (examens.some((e) => e.statut === "TERMINE")) return "VERIFIES";
  if (examens.some((e) => e.statut === "EN_ANALYSE")) return "EN_COURS";
  return "RECUS";
}
