import "server-only";
import { prisma } from "@/lib/prisma";

/** Statistiques temps réel pour le tableau de bord administration. */
export async function obtenirStatsSupervision() {
  const debutJour = new Date();
  debutJour.setHours(0, 0, 0, 0);

  const [
    utilisateursActifs,
    utilisateursTotal,
    utilisateursSuspendus,
    sessionsActives,
    patientsTotal,
    dossiersOuverts,
    filesParSalle,
    connexionsJour,
    messagesJour,
    conversationsActives,
    facturesJour,
    examensPrescrits,
    examensTermines,
  ] = await Promise.all([
    prisma.utilisateur.count({ where: { statut: "ACTIF" } }),
    prisma.utilisateur.count(),
    prisma.utilisateur.count({
      where: { statut: { in: ["SUSPENDU", "INACTIF"] } },
    }),
    prisma.session.count({
      where: { expireLe: { gt: new Date() } },
    }),
    prisma.patient.count(),
    prisma.dossierPatient.count({ where: { statut: "OUVERT" } }),
    prisma.fileAttente.groupBy({
      by: ["salleId"],
      where: { serviLe: null },
      _count: { _all: true },
    }),
    prisma.journalAudit.count({
      where: { type: "CONNEXION", createdAt: { gte: debutJour } },
    }),
    prisma.message.count({ where: { envoyeLe: { gte: debutJour } } }),
    prisma.conversation.count({
      where: { archivee: false },
    }),
    prisma.facture.count({ where: { createdAt: { gte: debutJour } } }),
    prisma.examenLaboratoire.count({
      where: { statut: "PRESCRIT", createdAt: { gte: debutJour } },
    }),
    prisma.examenLaboratoire.count({
      where: { statut: "TERMINE", resultatLe: { gte: debutJour } },
    }),
  ]);

  const salles = await prisma.salle.findMany({
    where: { actif: true },
    orderBy: { ordre: "asc" },
    select: { id: true, code: true, nom: true },
  });

  const fileMap = new Map(
    filesParSalle.map((f) => [f.salleId, f._count._all])
  );

  return {
    kpis: {
      utilisateursActifs,
      utilisateursTotal,
      utilisateursSuspendus,
      sessionsActives,
      patientsTotal,
      dossiersOuverts,
      connexionsJour,
      messagesJour,
      conversationsActives,
      facturesJour,
      examensPrescrits,
      examensTermines,
    },
    salles: salles.map((s) => ({
      code: s.code,
      nom: s.nom,
      enFile: fileMap.get(s.id) ?? 0,
    })),
    genereLe: new Date().toISOString(),
  };
}
