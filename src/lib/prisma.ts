import "server-only";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";

function creerClientPrisma() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL manquant dans l'environnement.");
  }

  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

function hashClientPrisma(): string {
  try {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"));
    const clientGenere = readFileSync(
      join(process.cwd(), "src/generated/prisma/client.ts")
    );
    return createHash("md5").update(schema).update(clientGenere).digest("hex");
  } catch {
    return "";
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaHash: string | undefined;
};

const schemaHash = hashClientPrisma();

if (
  process.env.NODE_ENV !== "production" &&
  globalForPrisma.prisma &&
  globalForPrisma.prismaSchemaHash !== schemaHash
) {
  void globalForPrisma.prisma.$disconnect();
  globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? creerClientPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSchemaHash = schemaHash;
}

export { creerClientPrisma };
