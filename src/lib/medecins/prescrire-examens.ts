import "server-only";
import { prisma } from "@/lib/prisma";
import { prescrireExamensInitiaux } from "@/lib/reception/prescrire-examens-initiaux";
import type {
  ExamenMedecinsResume,
  TypeExamenMedecins,
} from "@/lib/medecins/types";

function mapperType(row: {
  id: string;
  code: string;
  libelle: string;
  categorie: string;
  prix: { toNumber(): number } | number;
  delaiHeures: number;
}): TypeExamenMedecins {
  const prix = typeof row.prix === "number" ? row.prix : row.prix.toNumber();
  return {
    id: row.id,
    code: row.code,
    libelle: row.libelle,
    categorie: row.categorie,
    prix,
    delaiHeures: row.delaiHeures,
  };
}

export async function listerTypesExamenMedecins(): Promise<TypeExamenMedecins[]> {
  const rows = await prisma.typeExamen.findMany({
    where: { actif: true },
    orderBy: [{ categorie: "asc" }, { libelle: "asc" }],
  });
  return rows.map(mapperType);
}

export async function listerExamensDossierMedecins(
  dossierId: string
): Promise<ExamenMedecinsResume[]> {
  const rows = await prisma.examenLaboratoire.findMany({
    where: { dossierId },
    include: { typeExamen: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return rows.map((e) => ({
    id: e.id,
    statut: e.statut,
    createdAt: e.createdAt.toISOString(),
    notes: e.notes,
    typeExamen: mapperType(e.typeExamen),
  }));
}

export async function prescrireExamensMedecins(
  medecinId: string,
  input: {
    dossierId: string;
    typeExamenIds: string[];
    paquetsBilanIds?: string[];
    notes?: string | null;
  }
): Promise<ExamenMedecinsResume[]> {
  const dossierId = input.dossierId.trim();
  if (!dossierId) throw new Error("DOSSIER_ID_REQUIS");

  const ids = [...new Set(input.typeExamenIds.map((id) => id.trim()).filter(Boolean))];
  const paquetsIds = [
    ...new Set((input.paquetsBilanIds ?? []).map((id) => id.trim()).filter(Boolean)),
  ];

  if (ids.length === 0 && paquetsIds.length === 0) throw new Error("TYPES_REQUIS");

  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    select: { id: true },
  });
  if (!dossier) throw new Error("DOSSIER_INTROUVABLE");

  if (ids.length > 0) {
    const types = await prisma.typeExamen.findMany({
      where: { id: { in: ids }, actif: true },
    });
    if (types.length !== ids.length) throw new Error("TYPES_INVALIDES");
  }

  if (paquetsIds.length > 0) {
    const paquets = await prisma.paquetBilan.findMany({
      where: { id: { in: paquetsIds }, actif: true },
    });
    if (paquets.length !== paquetsIds.length) throw new Error("PAQUETS_INVALIDES");
  }

  await prisma.$transaction(async (tx) => {
    await prescrireExamensInitiaux(
      tx,
      dossierId,
      medecinId,
      ids,
      false,
      "MEDECINS",
      paquetsIds
    );
  });

  return listerExamensDossierMedecins(dossierId);
}
