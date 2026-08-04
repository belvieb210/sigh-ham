/**
 * Compte agent pastoral (service Église)
 * Usage : npx tsx prisma/seed-utilisateur-eglise.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hasherMotDePasse } from "../src/lib/auth/mot-de-passe";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const COMPTE = {
  identifiant: "eglise@gmail.com",
  email: "eglise@gmail.com",
  motDePasse: "Belvie210@!!",
  prenom: "Joseph",
  nom: "Mukendi",
};

/** Codes du pack examens prénuptiaux (flag packPrenuptial). */
const CODES_PACK_PRENUPTIAL = ["HIV", "GS", "NFS", "GLY", "VDRL", "HBS"];

async function assurerPackPrenuptial() {
  const extras = [
    {
      code: "VDRL",
      libelle: "VDRL / Syphilis",
      categorie: "Sérologie",
      prix: 10,
      delaiHeures: 24,
    },
    {
      code: "HBS",
      libelle: "Ag HBs (Hépatite B)",
      categorie: "Sérologie",
      prix: 14,
      delaiHeures: 24,
    },
  ];

  for (const type of extras) {
    await prisma.typeExamen.upsert({
      where: { code: type.code },
      update: { ...type, packPrenuptial: true, actif: true },
      create: { ...type, packPrenuptial: true, actif: true },
    });
  }

  await prisma.typeExamen.updateMany({
    where: { code: { in: CODES_PACK_PRENUPTIAL } },
    data: { packPrenuptial: true },
  });

  console.log(`✓ Pack prénuptial : ${CODES_PACK_PRENUPTIAL.join(", ")}`);
}

async function main() {
  await assurerPackPrenuptial();

  const role = await prisma.role.findUnique({
    where: { code: "AGENT_EGLISE" },
    include: { salle: true },
  });
  if (!role) {
    throw new Error("Rôle AGENT_EGLISE introuvable. Lancez npm run db:seed");
  }
  if (role.salle?.code !== "EGLISE") {
    throw new Error("Rôle non lié à EGLISE");
  }

  const hash = await hasherMotDePasse(COMPTE.motDePasse);
  const utilisateur = await prisma.utilisateur.upsert({
    where: { identifiant: COMPTE.identifiant },
    update: {
      email: COMPTE.email,
      motDePasseHash: hash,
      prenom: COMPTE.prenom,
      nom: COMPTE.nom,
      roleId: role.id,
      statut: "ACTIF",
    },
    create: {
      identifiant: COMPTE.identifiant,
      email: COMPTE.email,
      motDePasseHash: hash,
      prenom: COMPTE.prenom,
      nom: COMPTE.nom,
      roleId: role.id,
      statut: "ACTIF",
    },
  });

  console.log(`✅ ${COMPTE.email} → ${utilisateur.prenom} ${utilisateur.nom}`);
  console.log("Mot de passe : Belvie210@!!");
  console.log("Redirect    : /sigh/eglise");
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
