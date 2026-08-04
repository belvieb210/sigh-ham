/**
 * Catalogue médicaments de base pour le module médecins
 * Usage : npx tsx prisma/seed-medicaments-medecins.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const MEDICAMENTS = [
  { code: "PARA500", nom: "Paracétamol", forme: "Comprimé", dosage: "500 mg", prixUnitaire: 0.5 },
  { code: "IBU400", nom: "Ibuprofène", forme: "Comprimé", dosage: "400 mg", prixUnitaire: 0.8 },
  { code: "AMOX500", nom: "Amoxicilline", forme: "Gélule", dosage: "500 mg", prixUnitaire: 1.2 },
  { code: "MET500", nom: "Métronidazole", forme: "Comprimé", dosage: "500 mg", prixUnitaire: 0.9 },
  { code: "OMEP20", nom: "Oméprazole", forme: "Gélule", dosage: "20 mg", prixUnitaire: 1.0 },
  { code: "CETI10", nom: "Cétirizine", forme: "Comprimé", dosage: "10 mg", prixUnitaire: 0.6 },
  { code: "ORS", nom: "SRO (sels de réhydratation)", forme: "Sachet", dosage: "1 sachet", prixUnitaire: 0.4 },
  { code: "ALB400", nom: "Albendazole", forme: "Comprimé", dosage: "400 mg", prixUnitaire: 0.7 },
  { code: "CIPRO500", nom: "Ciprofloxacine", forme: "Comprimé", dosage: "500 mg", prixUnitaire: 1.5 },
  { code: "VITC", nom: "Vitamine C", forme: "Comprimé", dosage: "500 mg", prixUnitaire: 0.3 },
] as const;

async function main() {
  for (const m of MEDICAMENTS) {
    await prisma.medicament.upsert({
      where: { code: m.code },
      update: {
        nom: m.nom,
        forme: m.forme,
        dosage: m.dosage,
        prixUnitaire: m.prixUnitaire,
        actif: true,
      },
      create: {
        code: m.code,
        nom: m.nom,
        forme: m.forme,
        dosage: m.dosage,
        prixUnitaire: m.prixUnitaire,
        actif: true,
      },
    });
  }

  // Chambres / lits de démo si absents
  const nbChambres = await prisma.chambre.count();
  if (nbChambres === 0) {
    for (const numero of ["101", "102"]) {
      const chambre = await prisma.chambre.create({
        data: {
          numero,
          service: "Médecine générale",
          capacite: 2,
          actif: true,
        },
      });
      await prisma.lit.createMany({
        data: [
          { chambreId: chambre.id, numero: "A", occupe: false },
          { chambreId: chambre.id, numero: "B", occupe: false },
        ],
      });
    }
    console.log("✅ 2 chambres × 2 lits créées");
  }

  console.log(`✅ ${MEDICAMENTS.length} médicaments upsertés`);
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
