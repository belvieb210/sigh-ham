import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { PaquetBilanReception } from "@/lib/reception/types";
function decimalVersNombre(
  v: { toNumber?: () => number; toString?: () => string } | number | null | undefined
): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  if (typeof v.toNumber === "function") return v.toNumber();
  return Number(v.toString?.() ?? v) || 0;
}

export async function listerPaquetsBilansActifs(opts?: {
  q?: string;
}): Promise<PaquetBilanReception[]> {
  const where: Prisma.PaquetBilanWhereInput = {
    actif: true,
  };
  if (opts?.q?.trim()) {
    const q = opts.q.trim();
    where.OR = [
      { code: { contains: q, mode: "insensitive" } },
      { libelle: { contains: q, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.paquetBilan.findMany({
    where,
    orderBy: [{ ordre: "asc" }, { libelle: "asc" }],
    include: {
      examens: {
        orderBy: { ordre: "asc" },
        include: {
          typeExamen: {
            select: {
              id: true,
              code: true,
              libelle: true,
              categorie: true,
              prix: true,
              delaiHeures: true,
            },
          },
        },
      },
    },
  });

  return rows.map((p) => ({
    id: p.id,
    code: p.code,
    libelle: p.libelle,
    description: p.description,
    prix: decimalVersNombre(p.prix),
    examens: p.examens.map((e) => ({
      id: e.typeExamen.id,
      code: e.typeExamen.code,
      libelle: e.typeExamen.libelle,
      categorie: e.typeExamen.categorie,
      prix: decimalVersNombre(e.typeExamen.prix),
      delaiHeures: e.typeExamen.delaiHeures,
    })),
  }));
}
