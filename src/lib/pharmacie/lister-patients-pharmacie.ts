import "server-only";
import { calculerAge } from "@/features/caisse/utils-format";
import { prisma } from "@/lib/prisma";
import { listerPatientsFileAttenteSalle } from "@/lib/transferts/visibilite-salle";
import type { PatientFilePharmacie, StatsPharmacieJour } from "@/lib/pharmacie/types";

const COULEURS_ORIENTATION: Record<string, string> = {
  Infirmiers: "bg-violet-100 text-violet-700",
  Réception: "bg-slate-100 text-slate-700",
  Caisse: "bg-rose-100 text-rose-700",
  Laboratoire: "bg-cyan-100 text-cyan-800",
  Pharmacie: "bg-emerald-100 text-emerald-800",
  Hospitalisation: "bg-indigo-100 text-indigo-800",
  Église: "bg-amber-100 text-amber-800",
  "Médecin externe": "bg-orange-100 text-orange-800",
  Médecin: "bg-blue-100 text-blue-700",
};

function formaterHeure(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function raccourcirOrientation(nom: string): string {
  if (nom.startsWith("Médecin")) {
    return nom.includes("externe") ? "Médecin externe" : "Médecin";
  }
  if (nom.startsWith("Infirmier")) return "Infirmiers";
  if (nom.startsWith("Pharmacie")) return "Pharmacie";
  if (nom.startsWith("Caisse")) return "Caisse";
  if (nom.startsWith("Laboratoire")) return "Laboratoire";
  if (nom.startsWith("Hospitalisation")) return "Hospitalisation";
  if (nom.startsWith("Église") || nom.startsWith("Eglise")) return "Église";
  if (nom.startsWith("Réception") || nom.startsWith("Reception")) return "Réception";
  return nom;
}

function libelleStatut(opts: {
  statutTransfert: string | null;
  enRecuperation: boolean;
}): { statut: string; statutCouleur: string } {
  if (opts.enRecuperation && opts.statutTransfert === "REFUSE") {
    return { statut: "Rejeté", statutCouleur: "bg-red-100 text-red-700" };
  }
  if (opts.statutTransfert === "EN_ATTENTE") {
    return { statut: "À confirmer", statutCouleur: "bg-orange-100 text-orange-800" };
  }
  return { statut: "En attente", statutCouleur: "bg-amber-100 text-amber-800" };
}

function debutJourLocal(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function listerPatientsPharmacie(): Promise<PatientFilePharmacie[]> {
  const filesDedup = await listerPatientsFileAttenteSalle("PHARMACIE");
  const dossierIds = filesDedup.map((f) => f.passage.dossier.id);

  const transfertsSortants =
    dossierIds.length === 0
      ? []
      : await prisma.transfert.findMany({
          where: {
            dossierId: { in: dossierIds },
            salleOrigine: { code: "PHARMACIE" },
            OR: [
              { statut: "EN_ATTENTE" },
              {
                statut: "REFUSE",
                recuperation: { statut: "EN_RECUPERATION" },
              },
            ],
          },
          include: {
            salleDestination: { select: { code: true, nom: true } },
            recuperation: { select: { statut: true } },
          },
          orderBy: { emisLe: "desc" },
        });

  const sortantParDossier = new Map<string, (typeof transfertsSortants)[number][]>();
  for (const t of transfertsSortants) {
    const liste = sortantParDossier.get(t.dossierId) ?? [];
    liste.push(t);
    sortantParDossier.set(t.dossierId, liste);
  }

  const resultats = filesDedup.map((file) => {
    const dossier = file.passage.dossier;
    const patient = dossier.patient;
    const transfertEntrant = file.passage.transferts.find(
      (t) => t.salleDestination.code === "PHARMACIE"
    );
    const transfert = transfertEntrant ?? file.passage.transferts[0];
    const sortants = sortantParDossier.get(dossier.id) ?? [];
    const sortant = sortants[0];
    const enRecuperation = sortants.some(
      (s) => s.recuperation?.statut === "EN_RECUPERATION"
    );
    const orientation = sortants.length
      ? sortants.map((s) => raccourcirOrientation(s.salleDestination.nom)).join(", ")
      : "Pharmacie";
    const premiereOrientation = sortant
      ? raccourcirOrientation(sortant.salleDestination.nom)
      : "Pharmacie";
    const { statut, statutCouleur } = libelleStatut({
      statutTransfert: sortant?.statut ?? null,
      enRecuperation,
    });

    return {
      cleListe: file.id,
      dossierId: dossier.id,
      passageId: file.passageId,
      numeroPatient: patient.numeroPatient,
      numeroDossier: dossier.numeroDossier,
      nomComplet: `${patient.prenom} ${patient.nom}`.trim(),
      prenom: patient.prenom,
      nom: patient.nom,
      telephone: patient.telephone ?? "—",
      age: calculerAge(patient.dateNaissance?.toISOString() ?? null),
      sexe: patient.sexe ?? null,
      motif: transfert?.motif ?? file.passage.motif ?? "—",
      provenance:
        transfert?.salleOrigine?.nom?.trim() ||
        transfert?.salleOrigine?.code ||
        "—",
      orientation,
      orientationCouleur:
        COULEURS_ORIENTATION[premiereOrientation] ?? "bg-slate-100 text-slate-600",
      codeSalleDestination: sortant?.salleDestination.code ?? "PHARMACIE",
      codesSalleDestination: sortants.map((s) => s.salleDestination.code),
      statut,
      statutCouleur,
      heure: formaterHeure(file.arriveLe.toISOString()),
      arriveeLe: file.arriveLe.toISOString(),
      transfertId: transfert?.id ?? null,
      transfertSortantId: sortant?.id ?? null,
      statutTransfertSortant: sortant?.statut ?? null,
      enRecuperation,
      numeroOrdre: file.numeroOrdre,
    };
  });

  const ids = new Set(resultats.map((p) => p.dossierId));
  const ordonnances = await listerOrdonnancesEnAttentePharmacie(ids);
  return [...resultats, ...ordonnances].sort(
    (a, b) => new Date(b.arriveeLe).getTime() - new Date(a.arriveeLe).getTime()
  );
}

/** Ordonnances dont le transfert vers la pharmacie a déjà été confirmé à l'origine. */
async function listerOrdonnancesEnAttentePharmacie(
  dossierIdsDejaPresents: Set<string>
): Promise<PatientFilePharmacie[]> {
  const ordonnances = await prisma.ordonnance.findMany({
    where: {
      statut: { in: ["EN_ATTENTE", "PARTIELLEMENT_DELIVREE"] },
      lignes: { some: {} },
      dossierId: { notIn: [...dossierIdsDejaPresents] },
    },
    include: {
      dossier: { include: { patient: true } },
      lignes: { include: { medicament: true } },
    },
    orderBy: { prescritLe: "desc" },
    take: 40,
  });

  if (ordonnances.length === 0) return [];

  const dossierIds = ordonnances.map((o) => o.dossierId);
  const transferts = await prisma.transfert.findMany({
    where: {
      dossierId: { in: dossierIds },
      salleDestination: { code: "PHARMACIE" },
      statut: { in: ["ACCEPTE", "EN_TRAITEMENT"] },
    },
    include: {
      salleOrigine: { select: { code: true, nom: true } },
    },
    orderBy: { emisLe: "desc" },
  });

  const transfertParDossier = new Map<string, (typeof transferts)[number]>();
  for (const t of transferts) {
    if (!transfertParDossier.has(t.dossierId)) {
      transfertParDossier.set(t.dossierId, t);
    }
  }

  const resultats: PatientFilePharmacie[] = [];

  for (const o of ordonnances) {
    const t = transfertParDossier.get(o.dossierId);
    if (!t) continue;

    const patient = o.dossier.patient;
    const provenance =
      t.salleOrigine?.nom?.trim() || t.salleOrigine?.code || "Médecin";

    resultats.push({
      cleListe: `ord-${o.id}`,
      dossierId: o.dossierId,
      passageId: t.passageId ?? "",
      numeroPatient: patient.numeroPatient,
      numeroDossier: o.dossier.numeroDossier,
      nomComplet: `${patient.prenom} ${patient.nom}`.trim(),
      prenom: patient.prenom,
      nom: patient.nom,
      telephone: patient.telephone ?? "—",
      age: calculerAge(patient.dateNaissance?.toISOString() ?? null),
      sexe: patient.sexe ?? null,
      motif: `Ordonnance (${o.lignes.length} médicament(s))`,
      provenance,
      orientation: "Pharmacie",
      orientationCouleur: "bg-emerald-100 text-emerald-800",
      codeSalleDestination: "PHARMACIE",
      codesSalleDestination: ["PHARMACIE"],
      statut: "Ordonnance reçue",
      statutCouleur: "bg-emerald-100 text-emerald-800",
      heure: formaterHeure(o.prescritLe.toISOString()),
      arriveeLe: o.prescritLe.toISOString(),
      transfertId: t.id,
      transfertSortantId: null,
      statutTransfertSortant: null,
      enRecuperation: false,
      numeroOrdre: 9999,
    });
  }

  return resultats;
}

export async function obtenirStatsPharmacie(): Promise<StatsPharmacieJour> {
  const debut = debutJourLocal();
  const dans30j = new Date();
  dans30j.setDate(dans30j.getDate() + 30);
  const patients = await listerPatientsPharmacie();

  const [
    ordonnancesEnAttente,
    ordonnancesRecuesJour,
    ventesDuJour,
    ventesPayees,
    ventesTransmises,
    ventesPayeesJour,
    lotsFaibles,
    lotsExpirant,
    lotsExpires,
  ] = await Promise.all([
    prisma.ordonnance.count({ where: { statut: "EN_ATTENTE" } }),
    prisma.ordonnance.count({ where: { prescritLe: { gte: debut } } }),
    prisma.ventePharmacie.count({ where: { creeLe: { gte: debut } } }),
    prisma.ventePharmacie.findMany({
      where: {
        statut: { in: ["PAYEE", "DELIVREE"] },
        payeeLe: { gte: debut },
      },
      select: { montantTotal: true },
    }),
    prisma.ventePharmacie.count({ where: { statut: "TRANSMISE" } }),
    prisma.ventePharmacie.count({
      where: { statut: "PAYEE", payeeLe: { gte: debut } },
    }),
    prisma.lotMedicament.groupBy({
      by: ["medicamentId"],
      _sum: { quantite: true },
    }),
    prisma.lotMedicament.count({
      where: {
        quantite: { gt: 0 },
        expirationLe: { lte: dans30j, gte: debut },
      },
    }),
    prisma.lotMedicament.count({
      where: {
        quantite: { gt: 0 },
        expirationLe: { lt: debut },
      },
    }),
  ]);

  const meds = await prisma.medicament.findMany({
    where: { actif: true },
    select: { id: true, stockMinimum: true },
  });
  const stockParMed = new Map(
    lotsFaibles.map((g) => [g.medicamentId, g._sum.quantite ?? 0])
  );
  let stockFaible = 0;
  for (const m of meds) {
    if ((stockParMed.get(m.id) ?? 0) <= m.stockMinimum) stockFaible += 1;
  }

  const chiffreAffairesJour = ventesPayees.reduce(
    (s, v) => s + Number(v.montantTotal),
    0
  );

  return {
    patientsEnFile: patients.length,
    ordonnancesEnAttente,
    ordonnancesRecuesJour,
    ventesDuJour,
    chiffreAffairesJour,
    ventesEnAttentePaiement: ventesTransmises,
    paiementsValidesJour: ventesPayeesJour,
    stockFaible,
    lotsExpirantBientot: lotsExpirant,
    lotsExpires,
    arriveesFileIso: patients.map((p) => p.arriveeLe),
    dateReference: new Date().toISOString(),
  };
}
