/**
 * Compte administrateur système
 * Usage : npx tsx prisma/seed-utilisateur-admin.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hasherMotDePasse } from "../src/lib/auth/mot-de-passe";
import { INFORMATIONS_HOPITAL } from "../src/constants/navigation";
import { assurerPermissions } from "./seed-permissions";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const COMPTE = {
  identifiant: "admin@gmail.com",
  email: "admin@gmail.com",
  motDePasse: "Belvie210@!!",
  prenom: "Belvie",
  nom: "Administrateur",
};

const PARAMETRES_DEFAUT: {
  cle: string;
  valeur: string;
  categorie: string;
  description: string;
}[] = [
  {
    cle: "etablissement.nom",
    valeur: INFORMATIONS_HOPITAL.nom,
    categorie: "branding",
    description: "Nom court affiché dans l'application",
  },
  {
    cle: "etablissement.nomCourt",
    valeur: INFORMATIONS_HOPITAL.nomCourt,
    categorie: "branding",
    description: "Nom court (en-têtes)",
  },
  {
    cle: "etablissement.nomComplet",
    valeur: INFORMATIONS_HOPITAL.nomComplet,
    categorie: "branding",
    description: "Raison sociale / nom complet",
  },
  {
    cle: "etablissement.slogan",
    valeur: INFORMATIONS_HOPITAL.slogan,
    categorie: "branding",
    description: "Slogan institutionnel",
  },
  {
    cle: "etablissement.telephone",
    valeur: INFORMATIONS_HOPITAL.telephone,
    categorie: "branding",
    description: "Téléphone principal",
  },
  {
    cle: "etablissement.email",
    valeur: INFORMATIONS_HOPITAL.email,
    categorie: "branding",
    description: "E-mail de contact",
  },
  {
    cle: "etablissement.adresse",
    valeur: INFORMATIONS_HOPITAL.adresseCourte,
    categorie: "branding",
    description: "Adresse affichée",
  },
  {
    cle: "securite.sessionDureeHeures",
    valeur: "12",
    categorie: "securite",
    description: "Durée de session (heures)",
  },
  {
    cle: "securite.exigerMotDePasseFort",
    valeur: "true",
    categorie: "securite",
    description: "Exiger un mot de passe fort à la création",
  },
];

async function assurerParametres() {
  for (const p of PARAMETRES_DEFAUT) {
    await prisma.parametreSysteme.upsert({
      where: { cle: p.cle },
      update: {},
      create: p,
    });
  }
  console.log(`✓ ${PARAMETRES_DEFAUT.length} paramètres système`);
}

async function main() {
  await assurerParametres();
  await assurerPermissions(prisma);

  const role = await prisma.role.findUnique({
    where: { code: "SUPER_ADMIN" },
  });
  if (!role) {
    throw new Error("Rôle SUPER_ADMIN introuvable. Lancez npm run db:seed");
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

  console.log(`✅ ${COMPTE.identifiant} → ${utilisateur.prenom} ${utilisateur.nom}`);
  console.log(`Mot de passe : ${COMPTE.motDePasse}`);
  console.log("Redirect    : /sigh/admin");
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
