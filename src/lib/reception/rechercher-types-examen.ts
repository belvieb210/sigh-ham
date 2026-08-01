import "server-only";
import { prisma } from "@/lib/prisma";
import type { TypeExamenReception } from "@/lib/reception/types";

export function mapperTypeExamen(row: {
  id: string;
  code: string;
  libelle: string;
  categorie: string;
  prix: { toNumber(): number } | number;
  delaiHeures: number;
}): TypeExamenReception {
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

export async function rechercherTypesExamen(
  recherche?: string,
  limite = 12
): Promise<TypeExamenReception[]> {
  const terme = recherche?.trim();

  const rows = await prisma.typeExamen.findMany({
    where: {
      actif: true,
      ...(terme
        ? {
            OR: [
              { code: { contains: terme, mode: "insensitive" } },
              { libelle: { contains: terme, mode: "insensitive" } },
              { categorie: { contains: terme, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ categorie: "asc" }, { libelle: "asc" }],
    take: limite,
  });

  return rows.map(mapperTypeExamen);
}
