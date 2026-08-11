import "server-only";
import { prisma } from "@/lib/prisma";
import { calculerAge } from "@/features/caisse/utils-format";
import {
  ecrireOrientationAnalyseDansNotes,
  extraireRemarqueSansOrientation,
} from "@/constants/laboratoire-orientations";
import type {
  LigneResultatSaisie,
  ParametreSaisieDto,
  SaisieResultatsDto,
} from "@/lib/laboratoire/saisie-resultats-types";

export type {
  ExamenSaisieDto,
  LigneResultatSaisie,
  ParametreSaisieDto,
  SaisieResultatsDto,
} from "@/lib/laboratoire/saisie-resultats-types";

function mapperParametres(
  parametresCatalogue: {
    id: string;
    nom: string;
    unite: string | null;
    rangeUsuelle: string | null;
    obligatoire: boolean;
    ordre: number;
  }[],
  resultatsExistants: {
    parametreTypeExamenId: string | null;
    valeur: string;
    nonRequis: boolean;
    commentaire: string | null;
  }[]
): ParametreSaisieDto[] {
  const parId = new Map(
    resultatsExistants
      .filter((r) => r.parametreTypeExamenId)
      .map((r) => [r.parametreTypeExamenId!, r])
  );

  return parametresCatalogue
    .slice()
    .sort((a, b) => a.ordre - b.ordre)
    .map((p) => {
      const existant = parId.get(p.id);
      return {
        id: p.id,
        nom: p.nom,
        unite: p.unite,
        rangeUsuelle: p.rangeUsuelle,
        obligatoire: p.obligatoire,
        ordre: p.ordre,
        valeur: existant?.valeur ?? "",
        nonRequis: existant?.nonRequis ?? false,
        commentaire: existant?.commentaire ?? "",
      };
    });
}

export async function chargerSaisieResultats(
  dossierId: string
): Promise<SaisieResultatsDto | null> {
  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    include: {
      patient: true,
      examensLaboratoire: {
        where: { statut: { not: "ANNULE" } },
        orderBy: { createdAt: "asc" },
        include: {
          typeExamen: {
            include: {
              parametres: { orderBy: { ordre: "asc" } },
            },
          },
          resultats: true,
        },
      },
    },
  });

  if (!dossier) return null;

  const patient = dossier.patient;

  return {
    dossierId: dossier.id,
    numeroEnregistrement: dossier.numeroDossier,
    numeroTransfert: patient.numeroPatient,
    prenom: patient.prenom,
    nom: patient.nom,
    sexe: patient.sexe,
    age: calculerAge(patient.dateNaissance?.toISOString() ?? null),
    telephone: patient.telephone,
    examens: dossier.examensLaboratoire.map((ex) => ({
      id: ex.id,
      code: ex.typeExamen.code,
      libelle: ex.typeExamen.libelle,
      categorie: ex.typeExamen.categorie,
      prix: Number(ex.typeExamen.prix),
      statut: ex.statut,
      formulaire: ex.typeExamen.formulaire,
      remarque: extraireRemarqueSansOrientation(ex.notes) || null,
      parametres: mapperParametres(ex.typeExamen.parametres, ex.resultats),
    })),
  };
}

export async function enregistrerResultatsExamen(
  examenId: string,
  technicienId: string,
  input: {
    lignes: LigneResultatSaisie[];
    remarque?: string | null;
    verifier?: boolean;
  }
) {
  const examen = await prisma.examenLaboratoire.findUnique({
    where: { id: examenId },
    include: {
      typeExamen: {
        include: { parametres: true },
      },
    },
  });

  if (!examen) throw new Error("Examen introuvable.");

  const idsValides = new Set(examen.typeExamen.parametres.map((p) => p.id));
  const catalogue = new Map(examen.typeExamen.parametres.map((p) => [p.id, p]));

  for (const ligne of input.lignes) {
    if (!idsValides.has(ligne.parametreTypeExamenId)) {
      throw new Error("Paramètre invalide pour cet examen.");
    }
    const cat = catalogue.get(ligne.parametreTypeExamenId)!;
    const nonRequis = ligne.nonRequis === true;
    if (
      input.verifier === true &&
      !nonRequis &&
      cat.obligatoire &&
      !ligne.valeur.trim()
    ) {
      throw new Error(`Le paramètre « ${cat.nom} » est requis.`);
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const ligne of input.lignes) {
      const cat = catalogue.get(ligne.parametreTypeExamenId)!;
      await tx.resultatExamen.upsert({
        where: {
          examenId_parametreTypeExamenId: {
            examenId,
            parametreTypeExamenId: ligne.parametreTypeExamenId,
          },
        },
        create: {
          examenId,
          parametreTypeExamenId: ligne.parametreTypeExamenId,
          parametre: cat.nom,
          valeur: ligne.valeur.trim(),
          unite: cat.unite,
          normeMin: null,
          normeMax: cat.rangeUsuelle,
          nonRequis: ligne.nonRequis === true,
          commentaire: ligne.commentaire?.trim() || null,
        },
        update: {
          parametre: cat.nom,
          valeur: ligne.valeur.trim(),
          unite: cat.unite,
          normeMax: cat.rangeUsuelle,
          nonRequis: ligne.nonRequis === true,
          commentaire: ligne.commentaire?.trim() || null,
        },
      });
    }

    const maintenant = new Date();
    const orientation = input.verifier ? "VERIFIES" : "EN_COURS";
    const statut = input.verifier
      ? ("TERMINE" as const)
      : examen.statut === "TERMINE"
        ? examen.statut
        : ("EN_ANALYSE" as const);
    const notes = ecrireOrientationAnalyseDansNotes(
      input.remarque?.trim() || null,
      orientation
    );

    await tx.examenLaboratoire.update({
      where: { id: examenId },
      data: {
        notes,
        technicienId,
        statut,
        resultatLe: input.verifier ? maintenant : examen.resultatLe,
      },
    });
  });
}
