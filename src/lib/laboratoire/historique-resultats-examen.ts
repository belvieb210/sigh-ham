import "server-only";

import { prisma } from "@/lib/prisma";
import { trierParametresParFormulaire } from "@/lib/laboratoire/ordre-parametres-formulaire";
import {
  extraireRemarqueSansOrientation,
  lireOrientationAnalyseDepuisNotes,
} from "@/constants/laboratoire-orientations";
import { retirerPiecesJointesDesNotes } from "@/constants/laboratoire-notes-examen";

export type ParametreHistoriqueDto = {
  nom: string;
  valeur: string;
  unite: string | null;
  rangeUsuelle: string | null;
  flag: string | null;
  nonRequis: boolean;
  commentaire: string | null;
};

export type OccurrenceHistoriqueExamenDto = {
  examenId: string;
  dossierId: string;
  numeroDossier: string;
  dateResultat: string | null;
  orientationAnalyse: string | null;
  remarque: string | null;
  enregistrePar: string | null;
  parametres: ParametreHistoriqueDto[];
};

export type HistoriqueResultatsExamenDto = {
  examenCourantId: string;
  typeExamen: {
    code: string;
    libelle: string;
    formulaire: string | null;
  };
  patient: {
    prenom: string;
    nom: string;
    numeroPatient: string;
  };
  occurrences: OccurrenceHistoriqueExamenDto[];
};

function formaterUtilisateur(prenom: string, nom: string): string {
  return `${prenom} ${nom}`.trim() || "—";
}

export async function chargerHistoriqueResultatsExamen(
  examenIdCourant: string
): Promise<HistoriqueResultatsExamenDto | null> {
  const courant = await prisma.examenLaboratoire.findUnique({
    where: { id: examenIdCourant },
    include: {
      dossier: { include: { patient: true } },
      typeExamen: true,
    },
  });

  if (!courant) return null;

  const precedents = await prisma.examenLaboratoire.findMany({
    where: {
      typeExamenId: courant.typeExamenId,
      dossier: { patientId: courant.dossier.patientId },
      statut: { not: "ANNULE" },
      resultats: { some: {} },
    },
    include: {
      dossier: true,
      technicien: { select: { prenom: true, nom: true } },
      typeExamen: { include: { parametres: true } },
      resultats: true,
    },
    orderBy: [{ resultatLe: "desc" }, { updatedAt: "desc" }],
  });

  const occurrences: OccurrenceHistoriqueExamenDto[] = precedents.map((ex) => {
    const notesSansPj = retirerPiecesJointesDesNotes(ex.notes);
    const parametresBruts = ex.resultats.map((r) => ({
      nom: r.parametre,
      valeur: r.valeur,
      unite: r.unite,
      rangeUsuelle: r.normeMax ?? r.normeMin,
      flag: r.flag,
      nonRequis: r.nonRequis,
      commentaire: r.commentaire,
      ordre:
        ex.typeExamen.parametres.find((p) => p.id === r.parametreTypeExamenId)
          ?.ordre ?? 9999,
    }));

    const parametres = trierParametresParFormulaire(
      ex.typeExamen.formulaire,
      parametresBruts
    ).map(({ nom, valeur, unite, rangeUsuelle, flag, nonRequis, commentaire }) => ({
      nom,
      valeur,
      unite,
      rangeUsuelle,
      flag,
      nonRequis,
      commentaire,
    }));

    return {
      examenId: ex.id,
      dossierId: ex.dossierId,
      numeroDossier: ex.dossier.numeroDossier,
      dateResultat: ex.resultatLe?.toISOString() ?? ex.updatedAt.toISOString(),
      orientationAnalyse: lireOrientationAnalyseDepuisNotes(ex.notes),
      remarque: extraireRemarqueSansOrientation(notesSansPj) || null,
      enregistrePar: ex.technicien
        ? formaterUtilisateur(ex.technicien.prenom, ex.technicien.nom)
        : null,
      parametres,
    };
  });

  return {
    examenCourantId: courant.id,
    typeExamen: {
      code: courant.typeExamen.code,
      libelle: courant.typeExamen.libelle,
      formulaire: courant.typeExamen.formulaire,
    },
    patient: {
      prenom: courant.dossier.patient.prenom,
      nom: courant.dossier.patient.nom,
      numeroPatient: courant.dossier.patient.numeroPatient,
    },
    occurrences,
  };
}
