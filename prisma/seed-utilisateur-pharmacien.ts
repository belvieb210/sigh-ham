/**
 * Crée ou met à jour le compte pharmacien + lots démo
 * Usage : npx tsx prisma/seed-utilisateur-pharmacien.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hasherMotDePasse } from "../src/lib/auth/mot-de-passe";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const COMPTE = {
  identifiant: "pharmacien@gmail.com",
  email: "pharmacien@gmail.com",
  motDePasse: "Belvie210@!!",
  prenom: "Divine",
  nom: "Mwamba",
  roleCode: "PHARMACIEN",
};

async function seedLotsDemo(pharmacienId: string) {
  const meds = await prisma.medicament.findMany({
    where: { actif: true },
    take: 8,
    orderBy: { nom: "asc" },
  });
  if (meds.length === 0) {
    console.log("⚠ Aucun médicament — lancez db:seed:medicaments-medecins");
    return;
  }

  let fournisseur = await prisma.fournisseurPharmacie.findFirst({
    where: { nom: "Pharma Distrib Kin" },
  });
  if (!fournisseur) {
    fournisseur = await prisma.fournisseurPharmacie.create({
      data: {
        nom: "Pharma Distrib Kin",
        telephone: "+243800000001",
        email: "distrib@example.com",
      },
    });
  }

  const expiration = new Date();
  expiration.setMonth(expiration.getMonth() + 14);

  for (let i = 0; i < meds.length; i++) {
    const m = meds[i]!;
    const numeroLot = `LOT-DEMO-${m.code || i + 1}`;
    const existant = await prisma.lotMedicament.findFirst({
      where: { medicamentId: m.id, numeroLot },
    });
    if (existant) continue;

    const lot = await prisma.lotMedicament.create({
      data: {
        medicamentId: m.id,
        numeroLot,
        quantite: 50 + i * 10,
        expirationLe: expiration,
        fournisseurId: fournisseur.id,
      },
    });

    await prisma.mouvementStock.create({
      data: {
        type: "ENTREE",
        lotId: lot.id,
        quantite: lot.quantite,
        utilisateurId: pharmacienId,
        refType: "SEED",
        refId: "demo",
      },
    });

    const total = await prisma.lotMedicament.aggregate({
      where: { medicamentId: m.id, quantite: { gt: 0 }, expirationLe: { gt: new Date() } },
      _sum: { quantite: true },
    });
    const qty = total._sum.quantite ?? 0;
    const stock = await prisma.stockMedicament.findFirst({ where: { medicamentId: m.id } });
    if (stock) {
      await prisma.stockMedicament.update({
        where: { id: stock.id },
        data: { quantite: qty, lot: numeroLot, expirationLe: expiration },
      });
    } else {
      await prisma.stockMedicament.create({
        data: {
          medicamentId: m.id,
          quantite: qty,
          lot: numeroLot,
          expirationLe: expiration,
        },
      });
    }
  }

  console.log(`✅ Lots démo créés pour ${meds.length} médicament(s)`);
}

async function main() {
  const role = await prisma.role.findUnique({
    where: { code: COMPTE.roleCode },
    include: { salle: true },
  });

  if (!role) {
    throw new Error(`Rôle ${COMPTE.roleCode} introuvable. Lancez d'abord npm run db:seed`);
  }

  if (role.salle?.code !== "PHARMACIE") {
    throw new Error(
      `Le rôle PHARMACIEN n'est pas lié à la salle PHARMACIE (salle actuelle: ${role.salle?.code ?? "aucune"}).`
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

  console.log("✅ Compte pharmacien créé / mis à jour");
  console.log(`   Email       : ${COMPTE.email}`);
  console.log(`   Nom         : ${utilisateur.prenom} ${utilisateur.nom}`);
  console.log(`   Rôle        : ${COMPTE.roleCode}`);
  console.log(`   Salle       : PHARMACIE`);
  console.log(`   Mot de passe : ${COMPTE.motDePasse}`);
  console.log(`   Redirect    : /sigh/pharmacie`);

  await seedLotsDemo(utilisateur.id);
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
