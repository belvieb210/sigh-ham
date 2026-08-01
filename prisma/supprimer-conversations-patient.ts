/**
 * Supprime définitivement les conversations messagerie liées à un patient.
 * Usage : npx tsx prisma/supprimer-conversations-patient.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const avant = await prisma.conversation.findMany({
    where: { patientId: { not: null } },
    select: { id: true, sujet: true, patientId: true },
  });

  if (avant.length === 0) {
    console.log("Aucune conversation patient à supprimer.");
    return;
  }

  console.log(`${avant.length} conversation(s) patient trouvée(s) :`);
  for (const c of avant) {
    console.log(`  - ${c.id} | ${c.sujet ?? "(sans sujet)"}`);
  }

  const resultat = await prisma.conversation.deleteMany({
    where: { patientId: { not: null } },
  });

  console.log(`\n✓ ${resultat.count} conversation(s) patient supprimée(s) (messages et participants inclus).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
