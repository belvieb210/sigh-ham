import "server-only";
import { prisma } from "@/lib/prisma";
import type { CodeSalle } from "@/generated/prisma/enums";
import { libelleSalle } from "@/lib/messagerie/libelles";

const SALLES_CANAUX: CodeSalle[] = [
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
];

/** Crée les canaux officiels par service s'ils n'existent pas encore. */
export async function assurerCanauxSalles() {
  for (const code of SALLES_CANAUX) {
    const existant = await prisma.conversation.findFirst({
      where: { type: "CANAL_SALLE", salleCode: code },
    });

    if (existant) continue;

    await prisma.conversation.create({
      data: {
        type: "CANAL_SALLE",
        salleCode: code,
        sujet: `Canal ${libelleSalle(code)}`,
        epingle: true,
        participants: {
          create: [],
        },
      },
    });
  }
}

/** Inscrit l'utilisateur aux canaux pertinents (sa salle + canaux généraux). */
export async function assurerParticipationUtilisateur(
  utilisateurId: string,
  salleCodeUtilisateur: CodeSalle | null
) {
  await assurerCanauxSalles();

  const canaux = await prisma.conversation.findMany({
    where: { type: "CANAL_SALLE" },
    select: { id: true, salleCode: true },
  });

  for (const canal of canaux) {
    const doitRejoindre =
      canal.salleCode === salleCodeUtilisateur ||
      canal.salleCode === "RECEPTION" ||
      canal.salleCode === "ADMIN";

    if (!doitRejoindre) continue;

    await prisma.participantConversation.upsert({
      where: {
        conversationId_utilisateurId: {
          conversationId: canal.id,
          utilisateurId,
        },
      },
      update: {},
      create: {
        conversationId: canal.id,
        utilisateurId,
        role: "MEMBRE",
      },
    });
  }
}
