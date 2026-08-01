import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

try {
  const count = await prisma.notification.count();
  console.log("notification count:", count);

  const conv = await prisma.conversation.findFirst();
  if (conv) {
    const msgs = await prisma.message.findMany({
      where: { conversationId: conv.id },
      take: 1,
      include: {
        expediteur: { include: { role: true } },
        lectures: true,
        piecesJointes: true,
        reactions: true,
        messageParent: {
          include: { expediteur: { select: { prenom: true, nom: true } } },
        },
      },
    });
    console.log("messages query OK", msgs.length);
  }

  const user = await prisma.utilisateur.findFirst({ where: { statut: "ACTIF" } });
  if (user) {
    const p = await prisma.presenceUtilisateur.upsert({
      where: { utilisateurId: user.id },
      update: { statut: "EN_LIGNE", dernierPing: new Date() },
      create: { utilisateurId: user.id, statut: "EN_LIGNE" },
    });
    console.log("presence OK", p.id);
  }
} catch (e) {
  console.error("ERROR:", e);
} finally {
  await prisma.$disconnect();
  await pool.end();
}
