/**
 * Crée 2 comptes médecins externes (isolation démo)
 * Usage : npx tsx prisma/seed-utilisateur-medecin-externe.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hasherMotDePasse } from "../src/lib/auth/mot-de-passe";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const COMPTES = [
  {
    identifiant: "externe1@gmail.com",
    email: "externe1@gmail.com",
    motDePasse: "Belvie210@!!",
    prenom: "Paul",
    nom: "Kalala",
    specialite: "Médecine générale",
  },
  {
    identifiant: "externe2@gmail.com",
    email: "externe2@gmail.com",
    motDePasse: "Belvie210@!!",
    prenom: "Marie",
    nom: "Tshibangu",
    specialite: "Pédiatrie",
  },
];

async function upsertCompte(c: (typeof COMPTES)[0], roleId: string) {
  let fiche = await prisma.medecinExterne.findFirst({
    where: { email: c.email },
  });
  if (!fiche) {
    fiche = await prisma.medecinExterne.create({
      data: {
        prenom: c.prenom,
        nom: c.nom,
        email: c.email,
        specialite: c.specialite,
        telephone: "+243800000099",
      },
    });
  }

  const hash = await hasherMotDePasse(c.motDePasse);
  const utilisateur = await prisma.utilisateur.upsert({
    where: { identifiant: c.identifiant },
    update: {
      email: c.email,
      motDePasseHash: hash,
      prenom: c.prenom,
      nom: c.nom,
      roleId,
      statut: "ACTIF",
      medecinExterneId: fiche.id,
    },
    create: {
      identifiant: c.identifiant,
      email: c.email,
      motDePasseHash: hash,
      prenom: c.prenom,
      nom: c.nom,
      roleId,
      statut: "ACTIF",
      medecinExterneId: fiche.id,
    },
  });

  console.log(`✅ ${c.email} → ${utilisateur.prenom} ${utilisateur.nom} (fiche ${fiche.id})`);
}

async function main() {
  const role = await prisma.role.findUnique({
    where: { code: "MEDECIN_EXTERNE" },
    include: { salle: true },
  });
  if (!role) {
    throw new Error("Rôle MEDECIN_EXTERNE introuvable. Lancez npm run db:seed");
  }
  if (role.salle?.code !== "MEDECINS_EXTERNES") {
    throw new Error("Rôle non lié à MEDECINS_EXTERNES");
  }

  for (const c of COMPTES) {
    await upsertCompte(c, role.id);
  }

  console.log("Mot de passe : Belvie210@!!");
  console.log("Redirect    : /sigh/medecins-externes");
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
