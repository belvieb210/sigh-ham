import "server-only";

import { prisma } from "@/lib/prisma";

export type ExamenPublic = {
  id: string;
  code: string;
  libelle: string;
  categorie: string;
  prix: number;
  delaiHeures: number;
  description: string | null;
  serviceLabo: string | null;
  specimen: string | null;
};

export async function chargerExamensPublics(): Promise<ExamenPublic[]> {
  const rows = await prisma.typeExamen.findMany({
    where: { actif: true },
    orderBy: [{ categorie: "asc" }, { libelle: "asc" }],
    select: {
      id: true,
      code: true,
      libelle: true,
      categorie: true,
      prix: true,
      delaiHeures: true,
      description: true,
      serviceLabo: true,
      specimen: true,
    },
  });

  return rows.map((row) => ({
    ...row,
    prix: typeof row.prix === "number" ? row.prix : row.prix.toNumber(),
  }));
}
