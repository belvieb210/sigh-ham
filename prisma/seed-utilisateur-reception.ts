/**
 * Crée ou met à jour le compte réceptionniste Belvie
 * Usage : npx tsx prisma/seed-utilisateur-reception.ts
 */
import "dotenv/config";
import { creerClientPrisma } from "../src/lib/prisma";
import { hasherMotDePasse } from "../src/lib/auth/mot-de-passe";

const prisma = creerClientPrisma();

const COMPTE = {
  identifiant: "bokulubelvie@gmail.com",
  email: "bokulubelvie@gmail.com",
  motDePasse: "Belvie210@!!",
  prenom: "Belvie",
  nom: "Bokulu",
  roleCode: "RECEPTIONNISTE",
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

  console.log("✅ Compte réceptionniste créé / mis à jour");
  console.log(`   Email    : ${COMPTE.email}`);
  console.log(`   Nom      : ${utilisateur.prenom} ${utilisateur.nom}`);
  console.log(`   Rôle     : ${COMPTE.roleCode}`);
  console.log(`   Redirect : /sigh/reception`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
