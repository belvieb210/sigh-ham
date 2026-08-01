import { CodeSalle } from "../src/generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const SALLES: { code: CodeSalle; nom: string; ordre: number }[] = [
  { code: "RECEPTION", nom: "Réception", ordre: 1 },
  { code: "INFIRMIERS", nom: "Infirmiers", ordre: 2 },
  { code: "MEDECINS", nom: "Médecins", ordre: 3 },
  { code: "CAISSE", nom: "Caisse", ordre: 4 },
  { code: "LABORATOIRE", nom: "Laboratoire", ordre: 5 },
  { code: "PHARMACIE", nom: "Pharmacie", ordre: 6 },
  { code: "EGLISE", nom: "Église — Examens prénuptiaux", ordre: 7 },
  { code: "MEDECINS_EXTERNES", nom: "Médecins externes", ordre: 8 },
  { code: "HOSPITALISATION", nom: "Hospitalisation", ordre: 9 },
  { code: "ADMIN", nom: "Administration", ordre: 10 },
  { code: "MESSAGERIE", nom: "Messagerie", ordre: 11 },
];

const ROLES: {
  code: string;
  nom: string;
  salleCode?: CodeSalle;
  systeme?: boolean;
}[] = [
  { code: "SUPER_ADMIN", nom: "Super administrateur", systeme: true },
  { code: "ADMIN", nom: "Administrateur", salleCode: "ADMIN", systeme: true },
  { code: "RECEPTIONNISTE", nom: "Réceptionniste", salleCode: "RECEPTION" },
  { code: "INFIRMIER", nom: "Infirmier(ère)", salleCode: "INFIRMIERS" },
  { code: "MEDECIN", nom: "Médecin", salleCode: "MEDECINS" },
  { code: "CAISSIER", nom: "Caissier(ère)", salleCode: "CAISSE" },
  { code: "LABORANTIN", nom: "Laborantin(e)", salleCode: "LABORATOIRE" },
  { code: "PHARMACIEN", nom: "Pharmacien(ne)", salleCode: "PHARMACIE" },
  { code: "AGENT_EGLISE", nom: "Agent pastoral", salleCode: "EGLISE" },
  { code: "MEDECIN_EXTERNE", nom: "Médecin externe", salleCode: "MEDECINS_EXTERNES" },
  { code: "INFIRMIER_HOSP", nom: "Infirmier hospitalisation", salleCode: "HOSPITALISATION" },
];

async function main() {
  console.log("🌱 Seed SIGH — HAM LABORATOIRE");

  for (const salle of SALLES) {
    await prisma.salle.upsert({
      where: { code: salle.code },
      update: { nom: salle.nom, ordre: salle.ordre },
      create: salle,
    });
  }
  console.log(`✓ ${SALLES.length} salles`);

  const salles = await prisma.salle.findMany();
  const salleParCode = Object.fromEntries(salles.map((s) => [s.code, s.id]));

  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {
        nom: role.nom,
        systeme: role.systeme ?? false,
        salleId: role.salleCode ? salleParCode[role.salleCode] : null,
      },
      create: {
        code: role.code,
        nom: role.nom,
        systeme: role.systeme ?? false,
        salleId: role.salleCode ? salleParCode[role.salleCode] : null,
      },
    });
  }
  console.log(`✓ ${ROLES.length} rôles`);

  const typesExamen = [
    { code: "NFS", libelle: "Numération formule sanguine", categorie: "Hématologie", prix: 15, delaiHeures: 4 },
    { code: "GLY", libelle: "Glycémie à jeun", categorie: "Biochimie", prix: 8, delaiHeures: 2 },
    { code: "CREAT", libelle: "Créatininémie", categorie: "Biochimie", prix: 10, delaiHeures: 4 },
    { code: "HIV", libelle: "Test VIH", categorie: "Sérologie", prix: 12, delaiHeures: 24 },
    { code: "URINE", libelle: "ECBU", categorie: "Microbiologie", prix: 9, delaiHeures: 24 },
    { code: "GS", libelle: "Groupe sanguin", categorie: "Hématologie", prix: 11, delaiHeures: 4 },
    { code: "DDIMER", libelle: "D-DIMER", categorie: "Hémostase", prix: 48, delaiHeures: 6 },
    { code: "TP_INR", libelle: "Temps de prothrombine et INR", categorie: "Hémostase", prix: 26, delaiHeures: 4 },
    { code: "TSH", libelle: "TSH ultrasensible", categorie: "Hormonologie", prix: 22, delaiHeures: 24 },
    { code: "CRP", libelle: "Protéine C réactive", categorie: "Biochimie", prix: 14, delaiHeures: 4 },
  ];

  for (const type of typesExamen) {
    await prisma.typeExamen.upsert({
      where: { code: type.code },
      update: type,
      create: type,
    });
  }
  console.log(`✓ ${typesExamen.length} types d'examen laboratoire`);

  console.log("✅ Seed terminé");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
