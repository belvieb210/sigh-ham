/**
 * Crée ou met à jour le compte médecin
 * Usage : npx tsx prisma/seed-utilisateur-medecin.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hasherMotDePasse } from "../src/lib/auth/mot-de-passe";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const COMPTE = {
  identifiant: "medecin@gmail.com",
  email: "medecin@gmail.com",
  motDePasse: "Belvie210@!!",
  prenom: "Jean",
  nom: "Mukendi",
  roleCode: "MEDECIN",
};

async function main() {
  const role = await prisma.role.findUnique({
    where: { code: COMPTE.roleCode },
    include: { salle: true },
  });

  if (!role) {
    throw new Error(`Rôle ${COMPTE.roleCode} introuvable. Lancez d'abord npm run db:seed`);
  }

  if (role.salle?.code !== "MEDECINS") {
    throw new Error(
      `Le rôle MEDECIN n'est pas lié à la salle MEDECINS (salle actuelle: ${role.salle?.code ?? "aucune"}).`
    );
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

  console.log("✅ Compte médecin créé / mis à jour");
  console.log(`   Email       : ${COMPTE.email}`);
  console.log(`   Nom         : ${utilisateur.prenom} ${utilisateur.nom}`);
  console.log(`   Rôle        : ${COMPTE.roleCode}`);
  console.log(`   Salle       : MEDECINS`);
  console.log(`   Mot de passe : ${COMPTE.motDePasse}`);
  console.log(`   Redirect    : /sigh/medecins`);
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
