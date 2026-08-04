import "server-only";
import { prisma } from "@/lib/prisma";
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
  input: { dossierId: string; typeExamenIds: string[]; notes?: string | null }
): Promise<ExamenMedecinsResume[]> {
  const dossierId = input.dossierId.trim();
  if (!dossierId) throw new Error("DOSSIER_ID_REQUIS");

  const ids = [...new Set(input.typeExamenIds.map((id) => id.trim()).filter(Boolean))];
  if (ids.length === 0) throw new Error("TYPES_REQUIS");

  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    select: { id: true },
  });
  if (!dossier) throw new Error("DOSSIER_INTROUVABLE");

  const types = await prisma.typeExamen.findMany({
    where: { id: { in: ids }, actif: true },
  });
  if (types.length !== ids.length) throw new Error("TYPES_INVALIDES");

  const notes = input.notes?.trim() || null;

  const crees = await prisma.$transaction(
    types.map((type) =>
      prisma.examenLaboratoire.create({
        data: {
          dossierId,
          typeExamenId: type.id,
          prescripteurId: medecinId,
          statut: "PRESCRIT",
          notes,
        },
        include: { typeExamen: true },
      })
    )
  );

  return crees.map((e) => ({
    id: e.id,
    statut: e.statut,
    createdAt: e.createdAt.toISOString(),
    notes: e.notes,
    typeExamen: mapperType(e.typeExamen),
  }));
}
