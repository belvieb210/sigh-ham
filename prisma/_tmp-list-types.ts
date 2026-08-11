import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const types = await prisma.typeExamen.findMany({
    include: { _count: { select: { parametres: true } } },
    orderBy: { code: "asc" },
  });

  const sansParams = types.filter((t) => t._count.parametres === 0);
  const sansMeta = types.filter(
    (t) => !t.specimen || !t.formulaire || !t.serviceLabo
  );

  console.log("Total types:", types.length);
  console.log("Sans parametres:", sansParams.length);
  console.log("Sans specimen/formulaire/service:", sansMeta.length);
  console.log("--- Sans parametres ---");
  for (const t of sansParams) {
    console.log(
      `${t.code} | ${t.libelle} | pack:${t.packPrenuptial} | specimen:${t.specimen ?? "-"}`
    );
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
