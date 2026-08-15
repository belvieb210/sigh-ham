import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { Prisma as PrismaNs } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

function decimalVersNombre(
  v: { toNumber?: () => number; toString?: () => string } | number | null | undefined
): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  if (typeof v.toNumber === "function") return v.toNumber();
  return Number(v.toString?.() ?? v) || 0;
}

export type PaquetBilanDto = {
  id: string;
  code: string;
  libelle: string;
  description: string | null;
  prix: number;
  actif: boolean;
  ordre: number;
  examens: {
    id: string;
    typeExamenId: string;
    code: string;
    libelle: string;
    prix: number;
    ordre: number;
  }[];
  nbExamens: number;
  prixSommeExamens: number;
};

function mapperPaquet(row: {
  id: string;
  code: string;
  libelle: string;
  description: string | null;
  prix: { toNumber?: () => number } | number;
  actif: boolean;
  ordre: number;
  examens: {
    id: string;
    ordre: number;
    typeExamenId: string;
    typeExamen: {
      code: string;
      libelle: string;
      prix: { toNumber?: () => number } | number;
    };
  }[];
}): PaquetBilanDto {
  const examens = row.examens
    .slice()
    .sort((a, b) => a.ordre - b.ordre)
    .map((e) => ({
      id: e.id,
      typeExamenId: e.typeExamenId,
      code: e.typeExamen.code,
      libelle: e.typeExamen.libelle,
      prix: decimalVersNombre(e.typeExamen.prix),
      ordre: e.ordre,
    }));
  const prixSommeExamens = examens.reduce((s, e) => s + e.prix, 0);
  return {
    id: row.id,
    code: row.code,
    libelle: row.libelle,
    description: row.description,
    prix: decimalVersNombre(row.prix),
    actif: row.actif,
    ordre: row.ordre,
    examens,
    nbExamens: examens.length,
    prixSommeExamens,
  };
}

const includeExamens = {
  examens: {
    include: {
      typeExamen: { select: { code: true, libelle: true, prix: true } },
    },
  },
} as const;

export async function listerPaquetsBilans(opts?: { q?: string; actif?: boolean }) {
  const where: Prisma.PaquetBilanWhereInput = {};
  if (opts?.actif != null) where.actif = opts.actif;
  if (opts?.q?.trim()) {
    const q = opts.q.trim();
    where.OR = [
      { code: { contains: q, mode: "insensitive" } },
      { libelle: { contains: q, mode: "insensitive" } },
    ];
  }
  const rows = await prisma.paquetBilan.findMany({
    where,
    include: includeExamens,
    orderBy: [{ actif: "desc" }, { ordre: "asc" }, { libelle: "asc" }],
  });
  return rows.map(mapperPaquet);
}

export async function obtenirPaquetBilan(id: string) {
  const row = await prisma.paquetBilan.findUnique({
    where: { id },
    include: includeExamens,
  });
  if (!row) throw new Error("INTROUVABLE");
  return mapperPaquet(row);
}

export async function creerPaquetBilan(data: {
  code: string;
  libelle: string;
  description?: string | null;
  prix: number;
  actif?: boolean;
  ordre?: number;
  typeExamenIds?: string[];
}) {
  const code = data.code.trim().toUpperCase();
  const libelle = data.libelle.trim();
  if (!code || !libelle) throw new Error("CHAMPS_REQUIS");
  if (!Number.isFinite(data.prix) || data.prix < 0) throw new Error("PRIX_INVALIDE");

  const ids = [...new Set(data.typeExamenIds ?? [])];
  if (ids.length === 0) throw new Error("EXAMENS_REQUIS");

  try {
    const cree = await prisma.$transaction(async (tx) => {
      const paquet = await tx.paquetBilan.create({
        data: {
          code,
          libelle,
          description: data.description?.trim() || null,
          prix: data.prix,
          actif: data.actif ?? true,
          ordre: data.ordre ?? 0,
        },
      });
      await tx.paquetBilanExamen.createMany({
        data: ids.map((typeExamenId, index) => ({
          paquetBilanId: paquet.id,
          typeExamenId,
          ordre: index,
        })),
      });
      return tx.paquetBilan.findUniqueOrThrow({
        where: { id: paquet.id },
        include: includeExamens,
      });
    });
    return mapperPaquet(cree);
  } catch (e) {
    if (
      e instanceof PrismaNs.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new Error("CODE_DUPLIQUE");
    }
    throw e;
  }
}

export async function mettreAJourPaquetBilan(
  id: string,
  data: Partial<{
    code: string;
    libelle: string;
    description: string | null;
    prix: number;
    actif: boolean;
    ordre: number;
    typeExamenIds: string[];
  }>
) {
  const existant = await prisma.paquetBilan.findUnique({ where: { id } });
  if (!existant) throw new Error("INTROUVABLE");

  const payload: Prisma.PaquetBilanUpdateInput = {};
  if (data.code != null) payload.code = data.code.trim().toUpperCase();
  if (data.libelle != null) payload.libelle = data.libelle.trim();
  if (data.description !== undefined) payload.description = data.description?.trim() || null;
  if (data.prix != null) {
    if (!Number.isFinite(data.prix) || data.prix < 0) throw new Error("PRIX_INVALIDE");
    payload.prix = data.prix;
  }
  if (data.actif != null) payload.actif = data.actif;
  if (data.ordre != null) payload.ordre = data.ordre;

  try {
    const maj = await prisma.$transaction(async (tx) => {
      await tx.paquetBilan.update({ where: { id }, data: payload });
      if (data.typeExamenIds) {
        const ids = [...new Set(data.typeExamenIds)];
        if (ids.length === 0) throw new Error("EXAMENS_REQUIS");
        await tx.paquetBilanExamen.deleteMany({ where: { paquetBilanId: id } });
        await tx.paquetBilanExamen.createMany({
          data: ids.map((typeExamenId, index) => ({
            paquetBilanId: id,
            typeExamenId,
            ordre: index,
          })),
        });
      }
      return tx.paquetBilan.findUniqueOrThrow({
        where: { id },
        include: includeExamens,
      });
    });
    return mapperPaquet(maj);
  } catch (e) {
    if (
      e instanceof PrismaNs.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new Error("CODE_DUPLIQUE");
    }
    if (e instanceof Error && e.message === "EXAMENS_REQUIS") throw e;
    throw e;
  }
}

export function messageErreurPaquet(code: string): string | null {
  switch (code) {
    case "CHAMPS_REQUIS":
      return "Code et libellé obligatoires.";
    case "PRIX_INVALIDE":
      return "Prix forfaitaire invalide.";
    case "CODE_DUPLIQUE":
      return "Ce code de paquet existe déjà.";
    case "EXAMENS_REQUIS":
      return "Sélectionnez au moins un examen.";
    case "INTROUVABLE":
      return "Paquet introuvable.";
    default:
      return null;
  }
}
