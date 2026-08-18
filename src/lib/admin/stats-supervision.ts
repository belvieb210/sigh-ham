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
    journalBrut,
    sessionsBrutes,
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
    prisma.journalAudit.findMany({
      orderBy: { createdAt: "desc" },
      take: 80,
      include: {
        utilisateur: {
          select: { id: true, prenom: true, nom: true, identifiant: true },
        },
      },
    }),
    prisma.session.findMany({
      where: { expireLe: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      take: 24,
      include: {
        utilisateur: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            identifiant: true,
            role: {
              select: {
                nom: true,
                salle: { select: { code: true, nom: true } },
              },
            },
          },
        },
      },
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

  const dernierParUtilisateur = new Map<string, string>();
  for (const e of journalBrut) {
    if (e.utilisateurId && !dernierParUtilisateur.has(e.utilisateurId)) {
      dernierParUtilisateur.set(e.utilisateurId, e.action);
    }
  }

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
    journal: journalBrut.map((e) => ({
      id: e.id,
      type: e.type,
      module: e.module,
      entite: e.entite,
      action: e.action,
      createdAt: e.createdAt.toISOString(),
      utilisateur: e.utilisateur
        ? {
            prenom: e.utilisateur.prenom,
            nom: e.utilisateur.nom,
            identifiant: e.utilisateur.identifiant,
          }
        : null,
    })),
    sessions: sessionsBrutes.map((s) => ({
      id: s.id,
      createdAt: s.createdAt.toISOString(),
      utilisateur: {
        prenom: s.utilisateur.prenom,
        nom: s.utilisateur.nom,
        identifiant: s.utilisateur.identifiant,
        role: {
          nom: s.utilisateur.role.nom,
          salle: s.utilisateur.role.salle,
        },
      },
      derniereAction: dernierParUtilisateur.get(s.utilisateur.id) ?? null,
    })),
    genereLe: new Date().toISOString(),
  };
}
