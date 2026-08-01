/**
 * Données de démonstration messagerie SIGH
 * Usage : npx tsx prisma/seed-messagerie.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hasherMotDePasse } from "../src/lib/auth/mot-de-passe";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const SALLES_CANAUX = [
  "RECEPTION",
  "INFIRMIERS",
  "MEDECINS",
  "CAISSE",
  "LABORATOIRE",
  "PHARMACIE",
  "EGLISE",
  "MEDECINS_EXTERNES",
  "HOSPITALISATION",
  "ADMIN",
] as const;

const LIBELLES_SALLE: Record<string, string> = {
  RECEPTION: "Réception",
  INFIRMIERS: "Infirmiers",
  MEDECINS: "Médecins",
  CAISSE: "Caisse",
  LABORATOIRE: "Laboratoire",
  PHARMACIE: "Pharmacie",
  EGLISE: "Église",
  MEDECINS_EXTERNES: "Médecins externes",
  HOSPITALISATION: "Hospitalisation",
  ADMIN: "Administration",
};

async function assurerCanauxSalles() {
  for (const code of SALLES_CANAUX) {
    const existant = await prisma.conversation.findFirst({
      where: { type: "CANAL_SALLE", salleCode: code },
    });
    if (existant) continue;
    await prisma.conversation.create({
      data: {
        type: "CANAL_SALLE",
        salleCode: code,
        sujet: `Canal ${LIBELLES_SALLE[code]}`,
        epingle: true,
      },
    });
  }
}

const COMPTES_DEMO = [
  {
    identifiant: "infirmier.demo@ham.local",
    email: "infirmier.demo@ham.local",
    motDePasse: "Demo2026!",
    prenom: "Clarisse",
    nom: "Mputu",
    roleCode: "INFIRMIER",
  },
  {
    identifiant: "medecin.demo@ham.local",
    email: "medecin.demo@ham.local",
    motDePasse: "Demo2026!",
    prenom: "Dr. Patrick",
    nom: "Kabongo",
    roleCode: "MEDECIN",
  },
  {
    identifiant: "labo.demo@ham.local",
    email: "labo.demo@ham.local",
    motDePasse: "Demo2026!",
    prenom: "Sarah",
    nom: "Ilunga",
    roleCode: "LABORANTIN",
  },
  {
    identifiant: "caisse.demo@ham.local",
    email: "caisse.demo@ham.local",
    motDePasse: "Demo2026!",
    prenom: "Eric",
    nom: "Mutombo",
    roleCode: "CAISSIER",
  },
];

async function upsertUtilisateur(compte: (typeof COMPTES_DEMO)[0]) {
  const role = await prisma.role.findUnique({ where: { code: compte.roleCode } });
  if (!role) throw new Error(`Rôle ${compte.roleCode} introuvable`);

  const hash = await hasherMotDePasse(compte.motDePasse);

  return prisma.utilisateur.upsert({
    where: { identifiant: compte.identifiant },
    update: {
      email: compte.email,
      motDePasseHash: hash,
      prenom: compte.prenom,
      nom: compte.nom,
      roleId: role.id,
      statut: "ACTIF",
    },
    create: {
      identifiant: compte.identifiant,
      email: compte.email,
      motDePasseHash: hash,
      prenom: compte.prenom,
      nom: compte.nom,
      roleId: role.id,
      statut: "ACTIF",
    },
    include: { role: { include: { salle: true } } },
  });
}

async function main() {
  console.log("💬 Seed messagerie SIGH");

  await assurerCanauxSalles();

  const utilisateurs = [];
  for (const compte of COMPTES_DEMO) {
    const u = await upsertUtilisateur(compte);
    utilisateurs.push(u);
    console.log(`✓ ${u.prenom} ${u.nom} (${compte.roleCode})`);
  }

  const receptionniste = await prisma.utilisateur.findUnique({
    where: { identifiant: "bokulubelvie@gmail.com" },
    include: { role: { include: { salle: true } } },
  });

  if (!receptionniste) {
    console.log("⚠ Compte réceptionniste absent — lancez npm run db:seed:reception");
  }

  const tous = receptionniste ? [receptionniste, ...utilisateurs] : utilisateurs;

  const canaux = await prisma.conversation.findMany({
    where: { type: "CANAL_SALLE" },
  });

  for (const canal of canaux) {
    for (const u of tous) {
      await prisma.participantConversation.upsert({
        where: {
          conversationId_utilisateurId: {
            conversationId: canal.id,
            utilisateurId: u.id,
          },
        },
        update: {},
        create: {
          conversationId: canal.id,
          utilisateurId: u.id,
        },
      });
    }
  }
  console.log(`✓ Participants ajoutés aux ${canaux.length} canaux`);

  const canalReception = canaux.find((c) => c.salleCode === "RECEPTION");
  const infirmier = utilisateurs.find((u) => u.role.code === "INFIRMIER");
  const medecin = utilisateurs.find((u) => u.role.code === "MEDECIN");

  if (canalReception && receptionniste) {
    const existants = await prisma.message.count({
      where: { conversationId: canalReception.id },
    });

    if (existants === 0) {
      await prisma.message.createMany({
        data: [
          {
            conversationId: canalReception.id,
            expediteurId: receptionniste.id,
            contenu: "Bonjour à toutes et à tous. Le flux du matin est actif — merci de confirmer les transferts en attente.",
            priorite: "NORMALE",
          },
          {
            conversationId: canalReception.id,
            expediteurId: infirmier?.id ?? receptionniste.id,
            contenu: "Reçu. 3 patients en attente de constantes vitales.",
            priorite: "NORMALE",
          },
          {
            conversationId: canalReception.id,
            expediteurId: medecin?.id ?? receptionniste.id,
            contenu: "URGENT — Patient PAT-2026-0338 en détresse respiratoire, merci de prioriser le transfert infirmiers → médecins.",
            priorite: "URGENTE",
          },
        ],
      });
      console.log("✓ Messages de démonstration (#réception)");
    }
  }

  const canalLabo = canaux.find((c) => c.salleCode === "LABORATOIRE");
  const laborantin = utilisateurs.find((u) => u.role.code === "LABORANTIN");

  if (canalLabo && laborantin && receptionniste) {
    const existants = await prisma.message.count({
      where: { conversationId: canalLabo.id },
    });

    if (existants === 0) {
      await prisma.message.create({
        data: {
          conversationId: canalLabo.id,
          expediteurId: laborantin.id,
          contenu: "Résultats NFS disponibles pour PAT-2026-0340. Le médecin traitant sera notifié via transfert dossier.",
          priorite: "NORMALE",
        },
      });
      console.log("✓ Message de démonstration (#laboratoire)");
    }
  }

  if (receptionniste && medecin) {
    let direct = await prisma.conversation.findFirst({
      where: {
        type: "DIRECT",
        AND: [
          { participants: { some: { utilisateurId: receptionniste.id } } },
          { participants: { some: { utilisateurId: medecin.id } } },
        ],
      },
    });

    if (!direct) {
      direct = await prisma.conversation.create({
        data: {
          type: "DIRECT",
          createurId: receptionniste.id,
          participants: {
            create: [
              { utilisateurId: receptionniste.id, role: "ADMIN" },
              { utilisateurId: medecin.id, role: "MEMBRE" },
            ],
          },
        },
      });

      await prisma.message.create({
        data: {
          conversationId: direct.id,
          expediteurId: medecin.id,
          contenu: "Belvie, peux-tu vérifier le dossier de MULUMBA Jean avant facturation caisse ?",
          priorite: "NORMALE",
          lectures: { create: { utilisateurId: medecin.id } },
        },
      });
      console.log("✓ Conversation directe réception ↔ médecin");
    }
  }

  console.log("✅ Seed messagerie terminé");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
