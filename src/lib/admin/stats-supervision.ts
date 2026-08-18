import "server-only";
import { prisma } from "@/lib/prisma";

function debutJourLocal(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function variationPct(actuel: number, precedent: number) {
  if (precedent === 0) return actuel === 0 ? 0 : 100;
  return Math.round(((actuel - precedent) / precedent) * 100);
}

function cleJour(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const j = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${j}`;
}

function chargeSalle(enFile: number, attenteMoyMin: number) {
  if (enFile >= 8 || attenteMoyMin >= 25) return "eleve" as const;
  if (enFile >= 4 || attenteMoyMin >= 12) return "modere" as const;
  return "normal" as const;
}

/** Statistiques temps réel pour le tableau de bord administration. */
export async function obtenirStatsSupervision() {
  const maintenant = new Date();
  const debutJour = debutJourLocal(maintenant);
  const debutHier = debutJourLocal(new Date(debutJour.getTime() - 86_400_000));
  const debut7j = debutJourLocal(new Date(debutJour.getTime() - 6 * 86_400_000));

  const [
    utilisateursActifs,
    utilisateursTotal,
    utilisateursSuspendus,
    sessionsActives,
    patientsTotal,
    dossiersOuverts,
    filesOuvertes,
    connexionsJour,
    connexionsHier,
    messagesJour,
    conversationsActives,
    facturesJour,
    facturesHier,
    examensPrescrits,
    examensTermines,
    examensTerminesHier,
    examensEnCours,
    examensAnnulesJour,
    connexions7j,
    journalBrut,
    sessionsBrutes,
    salles,
  ] = await Promise.all([
    prisma.utilisateur.count({ where: { statut: "ACTIF" } }),
    prisma.utilisateur.count(),
    prisma.utilisateur.count({
      where: { statut: { in: ["SUSPENDU", "INACTIF"] } },
    }),
    prisma.session.count({
      where: { expireLe: { gt: maintenant } },
    }),
    prisma.patient.count(),
    prisma.dossierPatient.count({
      where: { statut: { in: ["OUVERT", "EN_COURS"] } },
    }),
    prisma.fileAttente.findMany({
      where: { serviLe: null },
      select: { salleId: true, appeleLe: true, arriveLe: true },
    }),
    prisma.journalAudit.count({
      where: { type: "CONNEXION", createdAt: { gte: debutJour } },
    }),
    prisma.journalAudit.count({
      where: {
        type: "CONNEXION",
        createdAt: { gte: debutHier, lt: debutJour },
      },
    }),
    prisma.message.count({ where: { envoyeLe: { gte: debutJour } } }),
    prisma.conversation.count({
      where: { archivee: false },
    }),
    prisma.facture.count({ where: { createdAt: { gte: debutJour } } }),
    prisma.facture.count({
      where: { createdAt: { gte: debutHier, lt: debutJour } },
    }),
    prisma.examenLaboratoire.count({
      where: { statut: "PRESCRIT" },
    }),
    prisma.examenLaboratoire.count({
      where: { statut: "TERMINE", resultatLe: { gte: debutJour } },
    }),
    prisma.examenLaboratoire.count({
      where: {
        statut: "TERMINE",
        resultatLe: { gte: debutHier, lt: debutJour },
      },
    }),
    prisma.examenLaboratoire.count({
      where: { statut: { in: ["PRELEVE", "EN_ANALYSE"] } },
    }),
    prisma.examenLaboratoire.count({
      where: { statut: "ANNULE", updatedAt: { gte: debutJour } },
    }),
    prisma.journalAudit.findMany({
      where: { type: "CONNEXION", createdAt: { gte: debut7j } },
      select: { createdAt: true },
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
      where: { expireLe: { gt: maintenant } },
      orderBy: { createdAt: "desc" },
      take: 80,
      include: {
        utilisateur: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            identifiant: true,
            photoUrl: true,
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
    prisma.salle.findMany({
      where: { actif: true },
      orderBy: { ordre: "asc" },
      select: { id: true, code: true, nom: true },
    }),
  ]);

  const statsParSalle = new Map<
    string,
    { enFile: number; enCours: number; attenteMs: number }
  >();
  for (const f of filesOuvertes) {
    const courant = statsParSalle.get(f.salleId) ?? {
      enFile: 0,
      enCours: 0,
      attenteMs: 0,
    };
    if (f.appeleLe) courant.enCours += 1;
    else courant.enFile += 1;
    courant.attenteMs += maintenant.getTime() - f.arriveLe.getTime();
    statsParSalle.set(f.salleId, courant);
  }

  const dernierParUtilisateur = new Map<string, string>();
  for (const e of journalBrut) {
    if (e.utilisateurId && !dernierParUtilisateur.has(e.utilisateurId)) {
      dernierParUtilisateur.set(e.utilisateurId, e.action);
    }
  }

  const parJour = new Map<string, number>();
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(debut7j);
    d.setDate(debut7j.getDate() + i);
    parJour.set(cleJour(d), 0);
  }
  for (const c of connexions7j) {
    const cle = cleJour(c.createdAt);
    parJour.set(cle, (parJour.get(cle) ?? 0) + 1);
  }

  const utilisateursUniques = new Map<
    string,
    (typeof sessionsBrutes)[number]["utilisateur"]
  >();
  for (const s of sessionsBrutes) {
    if (!utilisateursUniques.has(s.utilisateur.id)) {
      utilisateursUniques.set(s.utilisateur.id, s.utilisateur);
    }
  }

  const parRole = new Map<string, number>();
  for (const u of utilisateursUniques.values()) {
    const cle = u.role.salle?.nom ?? u.role.nom;
    parRole.set(cle, (parRole.get(cle) ?? 0) + 1);
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
      connexionsHier,
      connexionsVariation: variationPct(connexionsJour, connexionsHier),
      messagesJour,
      conversationsActives,
      facturesJour,
      facturesHier,
      facturesVariation: variationPct(facturesJour, facturesHier),
      examensPrescrits,
      examensTermines,
      examensTerminesHier,
      examensVariation: variationPct(examensTermines, examensTerminesHier),
    },
    salles: salles.map((s) => {
      const st = statsParSalle.get(s.id);
      const enFile = st?.enFile ?? 0;
      const enCours = st?.enCours ?? 0;
      const n = enFile + enCours;
      const attenteMoyMin =
        n > 0 ? Math.round((st?.attenteMs ?? 0) / n / 60_000) : 0;
      return {
        code: s.code,
        nom: s.nom,
        enFile,
        enCours,
        attenteMoyMin,
        charge: chargeSalle(enFile, attenteMoyMin),
      };
    }),
    examensJour: {
      termines: examensTermines,
      enCours: examensEnCours,
      enAttente: examensPrescrits,
      nonRealises: examensAnnulesJour,
    },
    connexions7j: [...parJour.entries()].map(([date, valeur]) => ({
      date,
      valeur,
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
        photoUrl: s.utilisateur.photoUrl,
        role: {
          nom: s.utilisateur.role.nom,
          salle: s.utilisateur.role.salle,
        },
      },
      derniereAction: dernierParUtilisateur.get(s.utilisateur.id) ?? null,
    })),
    personnel: {
      total: utilisateursUniques.size,
      avatars: [...utilisateursUniques.values()].slice(0, 8).map((u) => ({
        id: u.id,
        prenom: u.prenom,
        nom: u.nom,
        photoUrl: u.photoUrl,
      })),
      parRole: [...parRole.entries()].map(([label, count]) => ({
        label,
        count,
      })),
    },
    genereLe: maintenant.toISOString(),
  };
}
