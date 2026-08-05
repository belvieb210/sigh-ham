import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { Prisma as PrismaNs } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

function decimalVersNombre(
  v: { toNumber?: () => number; toString?: () => string } | number | null | undefined
): number | null {
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (typeof v.toNumber === "function") return v.toNumber();
  return Number(v.toString?.() ?? v) || 0;
}

export type TypeExamenDto = {
  id: string;
  code: string;
  libelle: string;
  categorie: string;
  prix: number;
  delaiHeures: number;
  actif: boolean;
  packPrenuptial: boolean;
};

export type MedicamentDto = {
  id: string;
  code: string;
  nom: string;
  categorie: string | null;
  forme: string | null;
  dosage: string | null;
  prixAchat: number | null;
  prixUnitaire: number;
  stockMinimum: number;
  emplacement: string | null;
  actif: boolean;
};

export function mapperTypeExamen(e: {
  id: string;
  code: string;
  libelle: string;
  categorie: string;
  prix: { toNumber?: () => number } | number;
  delaiHeures: number;
  actif: boolean;
  packPrenuptial: boolean;
}): TypeExamenDto {
  return {
    id: e.id,
    code: e.code,
    libelle: e.libelle,
    categorie: e.categorie,
    prix: decimalVersNombre(e.prix) ?? 0,
    delaiHeures: e.delaiHeures,
    actif: e.actif,
    packPrenuptial: e.packPrenuptial,
  };
}

export function mapperMedicament(m: {
  id: string;
  code: string;
  nom: string;
  categorie: string | null;
  forme: string | null;
  dosage: string | null;
  prixAchat: { toNumber?: () => number } | number | null;
  prixUnitaire: { toNumber?: () => number } | number;
  stockMinimum: number;
  emplacement: string | null;
  actif: boolean;
}): MedicamentDto {
  return {
    id: m.id,
    code: m.code,
    nom: m.nom,
    categorie: m.categorie,
    forme: m.forme,
    dosage: m.dosage,
    prixAchat: decimalVersNombre(m.prixAchat),
    prixUnitaire: decimalVersNombre(m.prixUnitaire) ?? 0,
    stockMinimum: m.stockMinimum,
    emplacement: m.emplacement,
    actif: m.actif,
  };
}

export async function listerTypesExamen(opts?: {
  q?: string;
  actif?: boolean;
}) {
  const where: Prisma.TypeExamenWhereInput = {};
  if (opts?.actif != null) where.actif = opts.actif;
  if (opts?.q?.trim()) {
    const q = opts.q.trim();
    where.OR = [
      { code: { contains: q } },
      { libelle: { contains: q } },
      { categorie: { contains: q } },
    ];
  }
  const rows = await prisma.typeExamen.findMany({
    where,
    orderBy: [{ actif: "desc" }, { libelle: "asc" }],
  });
  return rows.map(mapperTypeExamen);
}

export async function creerTypeExamen(data: {
  code: string;
  libelle: string;
  categorie: string;
  prix: number;
  delaiHeures?: number;
  actif?: boolean;
  packPrenuptial?: boolean;
}) {
  const code = data.code.trim().toUpperCase();
  const libelle = data.libelle.trim();
  const categorie = data.categorie.trim();
  if (!code || !libelle || !categorie) throw new Error("CHAMPS_REQUIS");
  if (!Number.isFinite(data.prix) || data.prix < 0) throw new Error("PRIX_INVALIDE");

  try {
    const cree = await prisma.typeExamen.create({
      data: {
        code,
        libelle,
        categorie,
        prix: data.prix,
        delaiHeures: data.delaiHeures ?? 24,
        actif: data.actif ?? true,
        packPrenuptial: data.packPrenuptial ?? false,
      },
    });
    return mapperTypeExamen(cree);
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

export async function mettreAJourTypeExamen(
  id: string,
  data: Partial<{
    code: string;
    libelle: string;
    categorie: string;
    prix: number;
    delaiHeures: number;
    actif: boolean;
    packPrenuptial: boolean;
  }>
) {
  const existant = await prisma.typeExamen.findUnique({ where: { id } });
  if (!existant) throw new Error("INTROUVABLE");

  const payload: Prisma.TypeExamenUpdateInput = {};
  if (data.code != null) payload.code = data.code.trim().toUpperCase();
  if (data.libelle != null) payload.libelle = data.libelle.trim();
  if (data.categorie != null) payload.categorie = data.categorie.trim();
  if (data.prix != null) {
    if (!Number.isFinite(data.prix) || data.prix < 0) throw new Error("PRIX_INVALIDE");
    payload.prix = data.prix;
  }
  if (data.delaiHeures != null) payload.delaiHeures = data.delaiHeures;
  if (data.actif != null) payload.actif = data.actif;
  if (data.packPrenuptial != null) payload.packPrenuptial = data.packPrenuptial;

  try {
    const maj = await prisma.typeExamen.update({ where: { id }, data: payload });
    return mapperTypeExamen(maj);
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

export async function listerMedicaments(opts?: {
  q?: string;
  actif?: boolean;
}) {
  const where: Prisma.MedicamentWhereInput = {};
  if (opts?.actif != null) where.actif = opts.actif;
  if (opts?.q?.trim()) {
    const q = opts.q.trim();
    where.OR = [
      { code: { contains: q } },
      { nom: { contains: q } },
      { categorie: { contains: q } },
      { forme: { contains: q } },
    ];
  }
  const rows = await prisma.medicament.findMany({
    where,
    orderBy: [{ actif: "desc" }, { nom: "asc" }],
  });
  return rows.map(mapperMedicament);
}

export async function creerMedicament(data: {
  code: string;
  nom: string;
  categorie?: string | null;
  forme?: string | null;
  dosage?: string | null;
  prixAchat?: number | null;
  prixUnitaire: number;
  stockMinimum?: number;
  emplacement?: string | null;
  actif?: boolean;
}) {
  const code = data.code.trim().toUpperCase();
  const nom = data.nom.trim();
  if (!code || !nom) throw new Error("CHAMPS_REQUIS");
  if (!Number.isFinite(data.prixUnitaire) || data.prixUnitaire < 0) {
    throw new Error("PRIX_INVALIDE");
  }

  try {
    const cree = await prisma.medicament.create({
      data: {
        code,
        nom,
        categorie: data.categorie?.trim() || null,
        forme: data.forme?.trim() || null,
        dosage: data.dosage?.trim() || null,
        prixAchat:
          data.prixAchat != null && Number.isFinite(data.prixAchat)
            ? data.prixAchat
            : null,
        prixUnitaire: data.prixUnitaire,
        stockMinimum: data.stockMinimum ?? 10,
        emplacement: data.emplacement?.trim() || null,
        actif: data.actif ?? true,
      },
    });
    return mapperMedicament(cree);
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

export async function mettreAJourMedicament(
  id: string,
  data: Partial<{
    code: string;
    nom: string;
    categorie: string | null;
    forme: string | null;
    dosage: string | null;
    prixAchat: number | null;
    prixUnitaire: number;
    stockMinimum: number;
    emplacement: string | null;
    actif: boolean;
  }>
) {
  const existant = await prisma.medicament.findUnique({ where: { id } });
  if (!existant) throw new Error("INTROUVABLE");

  const payload: Prisma.MedicamentUpdateInput = {};
  if (data.code != null) payload.code = data.code.trim().toUpperCase();
  if (data.nom != null) payload.nom = data.nom.trim();
  if (data.categorie !== undefined) payload.categorie = data.categorie?.trim() || null;
  if (data.forme !== undefined) payload.forme = data.forme?.trim() || null;
  if (data.dosage !== undefined) payload.dosage = data.dosage?.trim() || null;
  if (data.prixAchat !== undefined) {
    payload.prixAchat =
      data.prixAchat != null && Number.isFinite(data.prixAchat)
        ? data.prixAchat
        : null;
  }
  if (data.prixUnitaire != null) {
    if (!Number.isFinite(data.prixUnitaire) || data.prixUnitaire < 0) {
      throw new Error("PRIX_INVALIDE");
    }
    payload.prixUnitaire = data.prixUnitaire;
  }
  if (data.stockMinimum != null) payload.stockMinimum = data.stockMinimum;
  if (data.emplacement !== undefined) {
    payload.emplacement = data.emplacement?.trim() || null;
  }
  if (data.actif != null) payload.actif = data.actif;

  try {
    const maj = await prisma.medicament.update({ where: { id }, data: payload });
    return mapperMedicament(maj);
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

function messageErreurCatalogue(code: string): string | null {
  switch (code) {
    case "CHAMPS_REQUIS":
      return "Champs obligatoires manquants.";
    case "PRIX_INVALIDE":
      return "Prix invalide.";
    case "CODE_DUPLIQUE":
      return "Ce code existe déjà.";
    case "INTROUVABLE":
      return "Élément introuvable.";
    default:
      return null;
  }
}

export { messageErreurCatalogue };
