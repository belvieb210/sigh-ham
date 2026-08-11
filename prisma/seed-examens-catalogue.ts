/**
 * Importe le catalogue complet des examens et paramètres depuis liste_examens_et_paramètres.json
 * Usage : npx tsx prisma/seed-examens-catalogue.ts
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

interface ParametreJson {
  name: string;
  unite?: string;
  range_usuelle?: string;
  required?: boolean;
}

interface ExamenJson {
  code: string;
  nom: string;
  type: string;
  formulaire?: string;
  service?: string;
  specimen?: string;
  prix: number;
  unite?: string;
  range_usuelle?: string;
  description?: string;
  parameters: ParametreJson[];
}

interface ExportJson {
  examens: ExamenJson[];
}

function categorieDepuisType(type: string): string {
  const map: Record<string, string> = {
    BIOCHIMIE: "Biochimie",
    HEMATOLOGIE: "Hématologie",
    HORMONES: "Hormonologie",
    "IMMUNO CHIMILUMINESCENCE (CLIA)": "Immunologie",
    MICROBIOLOGIE: "Microbiologie",
    SEROLOGIE: "Sérologie",
    COAGULATION: "Hémostase",
    "FLUIDE (LIQUIDE BIOLOGIQUE)": "Fluides",
    HISTOPATHOLOGIE: "Histopathologie",
    "FROTTIS - SECRETION": "Cytologie",
    "BILANS DES ANALYSES MEDICALES": "Bilans",
    "CHARGE VIRAL": "Virologie",
    PARASITOLOGIE: "Parasitologie",
  };
  return map[type] ?? type;
}

async function main() {
  const chemin = join(process.cwd(), "liste_examens_et_paramètres.json");
  const brut = readFileSync(chemin, "utf-8");
  const data = JSON.parse(brut) as ExportJson;

  console.log(`📋 Import de ${data.examens.length} examens…`);

  let typesOk = 0;
  let paramsOk = 0;

  for (const ex of data.examens) {
    const code = ex.code.trim();
    if (!code) continue;

    const typeExamen = await prisma.typeExamen.upsert({
      where: { code },
      create: {
        code,
        libelle: ex.nom.trim(),
        categorie: categorieDepuisType(ex.type),
        prix: new Prisma.Decimal(ex.prix),
        delaiHeures: 24,
        actif: true,
        formulaire: ex.formulaire ?? null,
        serviceLabo: ex.service ?? null,
        specimen: ex.specimen ?? null,
        uniteDefaut: ex.unite ?? null,
        rangeUsuelle: ex.range_usuelle ?? null,
        description: ex.description ?? null,
      },
      update: {
        libelle: ex.nom.trim(),
        categorie: categorieDepuisType(ex.type),
        prix: new Prisma.Decimal(ex.prix),
        formulaire: ex.formulaire ?? null,
        serviceLabo: ex.service ?? null,
        specimen: ex.specimen ?? null,
        uniteDefaut: ex.unite ?? null,
        rangeUsuelle: ex.range_usuelle ?? null,
        description: ex.description ?? null,
      },
    });
    typesOk++;

    const idsExistants = await prisma.parametreTypeExamen.findMany({
      where: { typeExamenId: typeExamen.id },
      select: { id: true, nom: true },
    });
    const nomsSouhaites = new Set(ex.parameters.map((p) => p.name.trim()));

    for (let i = 0; i < ex.parameters.length; i++) {
      const p = ex.parameters[i];
      const nom = p.name.trim();
      await prisma.parametreTypeExamen.upsert({
        where: {
          typeExamenId_nom: { typeExamenId: typeExamen.id, nom },
        },
        create: {
          typeExamenId: typeExamen.id,
          nom,
          unite: p.unite ?? null,
          rangeUsuelle: p.range_usuelle ?? null,
          obligatoire: p.required !== false,
          ordre: i,
        },
        update: {
          unite: p.unite ?? null,
          rangeUsuelle: p.range_usuelle ?? null,
          obligatoire: p.required !== false,
          ordre: i,
        },
      });
      paramsOk++;
    }

    const aSupprimer = idsExistants.filter((e) => !nomsSouhaites.has(e.nom));
    if (aSupprimer.length > 0) {
      await prisma.parametreTypeExamen.deleteMany({
        where: { id: { in: aSupprimer.map((a) => a.id) } },
      });
    }
  }

  console.log(`✓ ${typesOk} types d'examen synchronisés`);
  console.log(`✓ ${paramsOk} paramètres synchronisés`);
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
