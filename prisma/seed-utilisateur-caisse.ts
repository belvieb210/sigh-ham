/**
 * Crée ou met à jour le compte caissier de démonstration
 * Usage : npx tsx prisma/seed-utilisateur-caisse.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hasherMotDePasse } from "../src/lib/auth/mot-de-passe";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const COMPTE = {
  identifiant: "caisse.demo@ham.local",
  email: "caisse.demo@ham.local",
  motDePasse: "Demo2026!",
  prenom: "Eric",
  nom: "Mutombo",
  roleCode: "CAISSIER",
};

async function main() {
  const role = await prisma.role.findUnique({
    where: { code: COMPTE.roleCode },
  });

  if (!role) {
    throw new Error(`Rôle ${COMPTE.roleCode} introuvable. Lancez d'abord npm run db:seed`);
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

  console.log("✅ Compte caissier créé / mis à jour");
  console.log(`   Email    : ${COMPTE.email}`);
  console.log(`   Nom      : ${utilisateur.prenom} ${utilisateur.nom}`);
  console.log(`   Rôle     : ${COMPTE.roleCode}`);
  console.log(`   Mot de passe : ${COMPTE.motDePasse}`);
  console.log(`   Redirect : /sigh/caisse`);
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
