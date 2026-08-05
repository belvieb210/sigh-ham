import "server-only";
import { prisma } from "@/lib/prisma";
import { INFORMATIONS_HOPITAL } from "@/constants/navigation";

export type CategorieParametre = "branding" | "securite" | "general";

const DEFAUTS_BRANDING: Record<string, string> = {
  "etablissement.nom": INFORMATIONS_HOPITAL.nom,
  "etablissement.nomCourt": INFORMATIONS_HOPITAL.nomCourt,
  "etablissement.nomComplet": INFORMATIONS_HOPITAL.nomComplet,
  "etablissement.slogan": INFORMATIONS_HOPITAL.slogan,
  "etablissement.telephone": INFORMATIONS_HOPITAL.telephone,
  "etablissement.email": INFORMATIONS_HOPITAL.email,
  "etablissement.adresse": INFORMATIONS_HOPITAL.adresseCourte,
};

export async function lireParametre(cle: string, defaut = ""): Promise<string> {
  const row = await prisma.parametreSysteme.findUnique({ where: { cle } });
  if (row) return row.valeur;
  return DEFAUTS_BRANDING[cle] ?? defaut;
}

export async function listerParametres(categorie?: string) {
  const rows = await prisma.parametreSysteme.findMany({
    where: categorie ? { categorie } : undefined,
    orderBy: [{ categorie: "asc" }, { cle: "asc" }],
  });
  return rows;
}

export async function upsertParametres(
  items: { cle: string; valeur: string; categorie?: string; description?: string }[],
  updatedById?: string
) {
  const resultats = [];
  for (const item of items) {
    const row = await prisma.parametreSysteme.upsert({
      where: { cle: item.cle },
      update: {
        valeur: item.valeur,
        updatedById: updatedById ?? null,
        ...(item.categorie ? { categorie: item.categorie } : {}),
        ...(item.description !== undefined ? { description: item.description } : {}),
      },
      create: {
        cle: item.cle,
        valeur: item.valeur,
        categorie: item.categorie ?? "general",
        description: item.description ?? null,
        updatedById: updatedById ?? null,
      },
    });
    resultats.push(row);
  }
  return resultats;
}

/** Branding fusionné (DB + constantes) pour l'affichage admin. */
export async function obtenirBrandingEtablissement() {
  const keys = Object.keys(DEFAUTS_BRANDING);
  const rows = await prisma.parametreSysteme.findMany({
    where: { cle: { in: keys } },
  });
  const map = new Map(rows.map((r) => [r.cle, r.valeur]));
  return {
    nom: map.get("etablissement.nom") ?? DEFAUTS_BRANDING["etablissement.nom"],
    nomCourt:
      map.get("etablissement.nomCourt") ?? DEFAUTS_BRANDING["etablissement.nomCourt"],
    nomComplet:
      map.get("etablissement.nomComplet") ??
      DEFAUTS_BRANDING["etablissement.nomComplet"],
    slogan:
      map.get("etablissement.slogan") ?? DEFAUTS_BRANDING["etablissement.slogan"],
    telephone:
      map.get("etablissement.telephone") ??
      DEFAUTS_BRANDING["etablissement.telephone"],
    email:
      map.get("etablissement.email") ?? DEFAUTS_BRANDING["etablissement.email"],
    adresse:
      map.get("etablissement.adresse") ?? DEFAUTS_BRANDING["etablissement.adresse"],
  };
}
