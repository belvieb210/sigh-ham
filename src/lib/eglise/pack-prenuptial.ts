import "server-only";
import { prisma } from "@/lib/prisma";

export interface DonneesPrenuptiales {
  paroisse?: string;
  dateMariage?: string;
  conjointNom?: string;
}

/** Types d'examens du pack prénuptial actif. */
export async function listerTypesExamenPackPrenuptial() {
  return prisma.typeExamen.findMany({
    where: { packPrenuptial: true, actif: true },
    orderBy: { libelle: "asc" },
  });
}

/**
 * Crée/met à jour ExamenPrenuptial + prescrit le pack d'examens labo.
 */
export async function assurerDossierPrenuptial(
  dossierId: string,
  agentId: string,
  donnees: DonneesPrenuptiales = {}
) {
  const dateMariage = donnees.dateMariage?.trim()
    ? new Date(donnees.dateMariage)
    : null;

  const existant = await prisma.examenPrenuptial.findFirst({
    where: { dossierId },
    orderBy: { planifieLe: "desc" },
  });

  let examenPrenuptialId: string;
  if (existant) {
    await prisma.examenPrenuptial.update({
      where: { id: existant.id },
      data: {
        paroisse: donnees.paroisse?.trim() || existant.paroisse,
        conjointNom: donnees.conjointNom?.trim() || existant.conjointNom,
        dateMariage: dateMariage ?? existant.dateMariage,
      },
    });
    examenPrenuptialId = existant.id;
  } else {
    const cree = await prisma.examenPrenuptial.create({
      data: {
        dossierId,
        paroisse: donnees.paroisse?.trim() || null,
        conjointNom: donnees.conjointNom?.trim() || null,
        dateMariage,
        statut: "PLANIFIE",
      },
    });
    examenPrenuptialId = cree.id;
  }

  const pack = await listerTypesExamenPackPrenuptial();
  if (pack.length === 0) {
    return { examenPrenuptialId, examensPrescrits: 0 };
  }

  const deja = await prisma.examenLaboratoire.findMany({
    where: {
      dossierId,
      typeExamenId: { in: pack.map((t) => t.id) },
    },
    select: { typeExamenId: true },
  });
  const dejaIds = new Set(deja.map((e) => e.typeExamenId));
  const nouveaux = pack.filter((t) => !dejaIds.has(t.id));

  if (nouveaux.length > 0) {
    await prisma.examenLaboratoire.createMany({
      data: nouveaux.map((type) => ({
        dossierId,
        typeExamenId: type.id,
        prescripteurId: agentId,
        statut: "PRESCRIT" as const,
        notes: "Pack prénuptial — prescrit au service Église",
      })),
    });
  }

  return { examenPrenuptialId, examensPrescrits: nouveaux.length };
}
