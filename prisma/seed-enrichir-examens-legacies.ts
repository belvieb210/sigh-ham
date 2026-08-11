/**
 * Enrichit les types d'examen créés avant l'import catalogue (seed.ts, pack prénuptial)
 * avec specimen, formulaire, service et paramètres depuis liste_examens_et_paramètres.json.
 *
 * Usage : npx tsx prisma/seed-enrichir-examens-legacies.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  CODES_LEGACY_VERS_CATALOGUE,
  chargerCatalogueExamens,
  indexCatalogueParCode,
  metaDepuisCatalogue,
  metaIncomplete,
  type ExamenCatalogueJson,
} from "./lib/examens-catalogue";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function synchroniserParametres(
  typeExamenId: string,
  parametres: ExamenCatalogueJson["parameters"]
) {
  const existants = await prisma.parametreTypeExamen.findMany({
    where: { typeExamenId },
    select: { id: true, nom: true },
  });
  const nomsSouhaites = new Set(parametres.map((p) => p.name.trim()));

  for (let i = 0; i < parametres.length; i++) {
    const p = parametres[i];
    const nom = p.name.trim();
    await prisma.parametreTypeExamen.upsert({
      where: { typeExamenId_nom: { typeExamenId, nom } },
      create: {
        typeExamenId,
        nom,
        unite: p.unite?.trim() || null,
        rangeUsuelle: p.range_usuelle?.trim() || null,
        obligatoire: p.required !== false,
        ordre: i,
      },
      update: {
        unite: p.unite?.trim() || null,
        rangeUsuelle: p.range_usuelle?.trim() || null,
        obligatoire: p.required !== false,
        ordre: i,
      },
    });
  }

  const aSupprimer = existants.filter((e) => !nomsSouhaites.has(e.nom));
  if (aSupprimer.length > 0) {
    await prisma.parametreTypeExamen.deleteMany({
      where: { id: { in: aSupprimer.map((a) => a.id) } },
    });
  }
}

async function enrichirDepuisCatalogue(
  typeExamen: { id: string; code: string; libelle: string },
  source: ExamenCatalogueJson,
  options: { parametres: boolean; meta: boolean }
) {
  if (options.meta) {
    await prisma.typeExamen.update({
      where: { id: typeExamen.id },
      data: metaDepuisCatalogue(source),
    });
  }

  if (options.parametres && source.parameters.length > 0) {
    await synchroniserParametres(typeExamen.id, source.parameters);
  }

  console.log(
    `  ✓ ${typeExamen.code} (${typeExamen.libelle}) ← catalogue ${source.code}` +
      (options.parametres ? ` · ${source.parameters.length} param.` : " · métadonnées")
  );
}

async function main() {
  const catalogue = indexCatalogueParCode(chargerCatalogueExamens());

  const types = await prisma.typeExamen.findMany({
    include: { _count: { select: { parametres: true } } },
    orderBy: { code: "asc" },
  });

  const legacyCodes = new Set(Object.keys(CODES_LEGACY_VERS_CATALOGUE));
  let enrichis = 0;

  console.log("🔧 Enrichissement des examens legacy (pré-catalogue)…\n");

  for (const type of types) {
    const sansParams = type._count.parametres === 0;
    const sansMeta = metaIncomplete(type);
    if (!sansParams && !sansMeta) continue;

    const codeCatalogue =
      CODES_LEGACY_VERS_CATALOGUE[type.code] ??
      (catalogue.has(type.code) ? type.code : null);

    if (!codeCatalogue) {
      if (legacyCodes.has(type.code) || sansParams) {
        console.warn(`  ⚠ ${type.code} — aucune source catalogue trouvée`);
      }
      continue;
    }

    const source = catalogue.get(codeCatalogue);
    if (!source) {
      console.warn(`  ⚠ ${type.code} — code catalogue ${codeCatalogue} absent du JSON`);
      continue;
    }

    const estLegacy = legacyCodes.has(type.code);
    if (!estLegacy && !sansMeta) continue;

    await enrichirDepuisCatalogue(type, source, {
      meta: sansMeta,
      parametres: sansParams,
    });
    enrichis++;
  }

  console.log(`\n✅ ${enrichis} type(s) legacy enrichi(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
