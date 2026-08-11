import "server-only";
import { prisma } from "@/lib/prisma";
import { calculerAge } from "@/features/caisse/utils-format";
import type { StatutExamen } from "@/generated/prisma/client";

export interface ParametreSaisieDto {
  id: string;
  nom: string;
  unite: string | null;
  rangeUsuelle: string | null;
  obligatoire: boolean;
  ordre: number;
  valeur: string;
  nonRequis: boolean;
}

export interface ExamenSaisieDto {
  id: string;
  code: string;
  libelle: string;
  categorie: string;
  prix: number;
  statut: StatutExamen;
  formulaire: string | null;
  remarque: string | null;
  parametres: ParametreSaisieDto[];
}

export interface SaisieResultatsDto {
  dossierId: string;
  numeroEnregistrement: string;
  numeroTransfert: string | null;
  prenom: string;
  nom: string;
  sexe: string | null;
  age: number | null;
  telephone: string | null;
  examens: ExamenSaisieDto[];
}

export interface LigneResultatSaisie {
  parametreTypeExamenId: string;
  valeur: string;
  nonRequis?: boolean;
}

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
      remarque: ex.notes,
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
    if (!nonRequis && cat.obligatoire && !ligne.valeur.trim()) {
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
        },
        update: {
          parametre: cat.nom,
          valeur: ligne.valeur.trim(),
          unite: cat.unite,
          normeMax: cat.rangeUsuelle,
          nonRequis: ligne.nonRequis === true,
        },
      });
    }

    const maintenant = new Date();
    const statut = input.verifier
      ? ("TERMINE" as const)
      : examen.statut === "PRESCRIT" || examen.statut === "PRELEVE"
        ? ("EN_ANALYSE" as const)
        : examen.statut;

    await tx.examenLaboratoire.update({
      where: { id: examenId },
      data: {
        notes: input.remarque?.trim() || null,
        technicienId,
        statut,
        resultatLe: input.verifier ? maintenant : examen.resultatLe,
      },
    });
  });
}

export function cheminSaisieResultats(dossierId: string) {
  return `/sigh/laboratoire/saisie-resultats/${dossierId}`;
}
