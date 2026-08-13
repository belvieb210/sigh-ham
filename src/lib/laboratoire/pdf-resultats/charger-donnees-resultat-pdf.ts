import "server-only";

import { prisma } from "@/lib/prisma";
import { calculerAge } from "@/features/caisse/utils-format";
import {
  extraireRemarqueSansOrientation,
} from "@/constants/laboratoire-orientations";
import { detecterTypeExamenPdf } from "@/lib/laboratoire/pdf-resultats/detecter-type-examen";
import type { DonneesResultatExamenPdf } from "@/lib/laboratoire/pdf-resultats/types";
import { mapperResultatsPrismaVersPdf } from "@/lib/laboratoire/pdf-resultats/utilitaires-parametres";

export async function chargerDonneesResultatExamenPdf(
  dossierId: string,
  examenId: string
): Promise<DonneesResultatExamenPdf | null> {
  const examen = await prisma.examenLaboratoire.findFirst({
    where: { id: examenId, dossierId },
    include: {
      dossier: { include: { patient: true } },
      typeExamen: true,
      resultats: {
        orderBy: { parametre: "asc" },
      },
    },
  });

  if (!examen) return null;

  const patient = examen.dossier.patient;
  const remarque = extraireRemarqueSansOrientation(examen.notes);

  const examenPdf = {
    examenId: examen.id,
    typeCode: examen.typeExamen.code,
    typeFormulaire: examen.typeExamen.formulaire,
    libelle: examen.typeExamen.libelle,
    specimen: examen.typeExamen.specimen,
    description: examen.typeExamen.description,
    commentaireGlobal: remarque || null,
    dateAnalyse: examen.resultatLe?.toISOString() ?? examen.updatedAt.toISOString(),
    resultats: mapperResultatsPrismaVersPdf(
      examen.resultats.map((r) => ({
        parametre: r.parametre,
        valeur: r.valeur,
        unite: r.unite,
        normeMin: r.normeMin,
        normeMax: r.normeMax,
        nonRequis: r.nonRequis,
        anormal: r.anormal,
        commentaire: r.commentaire,
      }))
    ),
  };

  return {
    patient: {
      dossierId,
      numeroEnregistrement: examen.dossier.numeroDossier,
      numeroPatient: patient.numeroPatient,
      nom: patient.nom,
      prenom: patient.prenom,
      sexe: patient.sexe,
      age: calculerAge(patient.dateNaissance?.toISOString() ?? null),
      telephone: patient.telephone,
      medecinDemandeur: null,
      cnomMedecin: null,
    },
    examen: examenPdf,
    typeRender: detecterTypeExamenPdf(examenPdf),
  };
}

export async function chargerDonneesResultatsMultiExamensPdf(
  dossierId: string,
  examenIds: string[]
): Promise<DonneesResultatExamenPdf[]> {
  const pages: DonneesResultatExamenPdf[] = [];
  for (const id of examenIds) {
    const data = await chargerDonneesResultatExamenPdf(dossierId, id);
    if (data) pages.push(data);
  }
  return pages;
}
