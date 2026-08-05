import "server-only";
import { calculerAge } from "@/features/caisse/utils-format";
import { prisma } from "@/lib/prisma";
import type {
  DossierRechercheMedecins,
  NoteMedicaleResume,
  PatientDuJour,
  PatientFileMedecins,
  PatientTransfereCaisse,
} from "@/lib/medecins/types";

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

function debutJourLocal(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

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

export async function listerPatientsTransferesCaisse(): Promise<
  PatientTransfereCaisse[]
> {
  const debut = debutJourLocal();
  const rows = await prisma.transfert.findMany({
    where: {
      salleOrigine: { code: "MEDECINS" },
      salleDestination: { code: "CAISSE" },
      OR: [
        { statut: "EN_ATTENTE" },
        {
          statut: { in: ["ACCEPTE", "EN_TRAITEMENT", "TERMINE"] },
          emisLe: { gte: debut },
        },
      ],
    },
    include: {
      dossier: { include: { patient: true } },
      salleDestination: { select: { nom: true } },
    },
    orderBy: { emisLe: "desc" },
    take: 100,
  });

  return rows.map((t) => ({
    id: t.id,
    dossierId: t.dossierId,
    nomComplet: `${t.dossier.patient.prenom} ${t.dossier.patient.nom}`.trim(),
    numeroDossier: t.dossier.numeroDossier,
    telephone: t.dossier.patient.telephone ?? "",
    statut: t.statut,
    destination: t.salleDestination.nom,
    emisLe: t.emisLe.toISOString(),
    heure: formaterHeure(t.emisLe.toISOString()),
  }));
}

/** Tous les transferts sortants depuis MEDECINS (confirm / rejet / restaurer). */
export async function listerPatientsTransferesSortantsMedecins(): Promise<
  PatientFileMedecins[]
> {
  const debut = debutJourLocal();
  const transferts = await prisma.transfert.findMany({
    where: {
      salleOrigine: { code: "MEDECINS" },
      OR: [
        { statut: "EN_ATTENTE" },
        {
          statut: "REFUSE",
          recuperation: { statut: "EN_RECUPERATION" },
        },
        {
          statut: { in: ["ACCEPTE", "EN_TRAITEMENT", "TERMINE"] },
          emisLe: { gte: debut },
        },
      ],
    },
    include: {
      salleDestination: { select: { code: true, nom: true } },
      salleOrigine: { select: { nom: true, code: true } },
      recuperation: { select: { statut: true } },
      dossier: { include: { patient: true } },
      passage: { select: { id: true, motif: true } },
    },
    orderBy: { emisLe: "desc" },
    take: 200,
  });

  const parDossier = new Map<string, (typeof transferts)[number][]>();
  for (const t of transferts) {
    const liste = parDossier.get(t.dossierId) ?? [];
    liste.push(t);
    parDossier.set(t.dossierId, liste);
  }

  const dossierIds = [...parDossier.keys()];
  const consultationsOuvertes =
    dossierIds.length === 0
      ? []
      : await prisma.consultation.findMany({
          where: { dossierId: { in: dossierIds }, finLe: null },
          select: { id: true, dossierId: true },
        });
  const consultMap = new Map(
    consultationsOuvertes.map((c) => [c.dossierId, c.id])
  );

  const patients: PatientFileMedecins[] = [];
  let ordre = 1;
  for (const [, sortants] of parDossier) {
    const principal = sortants[0]!;
    const dossier = principal.dossier;
    const patient = dossier.patient;
    const enRecuperation = sortants.some(
      (s) => s.recuperation?.statut === "EN_RECUPERATION"
    );
    const orientation = sortants
      .map((s) => raccourcirOrientation(s.salleDestination.nom))
      .join(", ");
    const premiere = raccourcirOrientation(principal.salleDestination.nom);

    let statut = "Transféré";
    let statutCouleur = "bg-emerald-100 text-emerald-700";
    if (enRecuperation && principal.statut === "REFUSE") {
      statut = "Rejeté";
      statutCouleur = "bg-red-100 text-red-700";
    } else if (principal.statut === "EN_ATTENTE") {
      statut = "À confirmer";
      statutCouleur = "bg-orange-100 text-orange-800";
    }

    patients.push({
      cleListe: `tr-${principal.id}`,
      dossierId: dossier.id,
      passageId: principal.passageId ?? principal.passage?.id ?? "",
      numeroPatient: patient.numeroPatient,
      numeroDossier: dossier.numeroDossier,
      nomComplet: `${patient.prenom} ${patient.nom}`.trim(),
      prenom: patient.prenom,
      nom: patient.nom,
      telephone: patient.telephone ?? "—",
      age: calculerAge(patient.dateNaissance?.toISOString() ?? null),
      sexe: patient.sexe ?? null,
      motif: principal.motif ?? principal.passage?.motif ?? "—",
      provenance: "Médecins",
      orientation,
      orientationCouleur:
        COULEURS_ORIENTATION[premiere] ?? "bg-slate-100 text-slate-600",
      codeSalleDestination: principal.salleDestination.code,
      codesSalleDestination: sortants.map((s) => s.salleDestination.code),
      statut,
      statutCouleur,
      heure: formaterHeure(principal.emisLe.toISOString()),
      arriveeLe: principal.emisLe.toISOString(),
      transfertId: null,
      transfertSortantId: principal.id,
      statutTransfertSortant: principal.statut,
      enRecuperation,
      numeroOrdre: ordre++,
      consultationOuverteId: consultMap.get(dossier.id) ?? null,
    });
  }

  return patients;
}

export async function listerPatientsDuJourMedecins(): Promise<PatientDuJour[]> {
  const debut = debutJourLocal();
  const rows = await prisma.consultation.findMany({
    where: { debutLe: { gte: debut } },
    include: {
      dossier: { include: { patient: true } },
      medecin: { select: { prenom: true, nom: true } },
    },
    orderBy: { debutLe: "desc" },
    take: 100,
  });

  return rows.map((c) => ({
    dossierId: c.dossierId,
    consultationId: c.id,
    nomComplet: `${c.dossier.patient.prenom} ${c.dossier.patient.nom}`.trim(),
    numeroDossier: c.dossier.numeroDossier,
    telephone: c.dossier.patient.telephone ?? "",
    motif: c.motif,
    debutLe: c.debutLe.toISOString(),
    finLe: c.finLe?.toISOString() ?? null,
    medecin: `${c.medecin.prenom} ${c.medecin.nom}`.trim(),
  }));
}

export async function rechercherDossiersMedecins(
  q?: string
): Promise<DossierRechercheMedecins[]> {
  const terme = q?.trim();
  const rows = await prisma.dossierPatient.findMany({
    where: terme
      ? {
          OR: [
            { numeroDossier: { contains: terme, mode: "insensitive" as const } },
            { patient: { nom: { contains: terme, mode: "insensitive" as const } } },
            {
              patient: {
                prenom: { contains: terme, mode: "insensitive" as const },
              },
            },
            { patient: { telephone: { contains: terme } } },
          ],
        }
      : undefined,
    include: { patient: true },
    orderBy: { updatedAt: "desc" },
    take: 40,
  });

  return rows.map((d) => ({
    id: d.id,
    numero: d.numeroDossier,
    nomComplet: `${d.patient.prenom} ${d.patient.nom}`.trim(),
    telephone: d.patient.telephone ?? "",
    age: calculerAge(d.patient.dateNaissance?.toISOString() ?? null),
    sexe: d.patient.sexe,
    updatedAt: d.updatedAt.toISOString(),
  }));
}

export async function listerNotesMedicalesRecentes(): Promise<
  NoteMedicaleResume[]
> {
  const debut = debutJourLocal();
  const ilYa7j = new Date(debut);
  ilYa7j.setDate(ilYa7j.getDate() - 7);

  const consultations = await prisma.consultation.findMany({
    where: { debutLe: { gte: ilYa7j } },
    include: {
      dossier: { include: { patient: true } },
      actes: true,
      diagnostics: true,
    },
    orderBy: { debutLe: "desc" },
    take: 40,
  });

  const notes: NoteMedicaleResume[] = [];
  for (const c of consultations) {
    const p = c.dossier.patient;
    const patient = `${p.prenom} ${p.nom}`.trim();
    for (const a of c.actes) {
      if (!a.notes && !a.libelle) continue;
      notes.push({
        id: a.id,
        dossierId: c.dossierId,
        consultationId: c.id,
        patient,
        libelle: a.libelle,
        typeActe: a.typeActe,
        notes: a.notes,
        creeLe: c.debutLe.toISOString(),
      });
    }
    for (const d of c.diagnostics) {
      notes.push({
        id: `diag-${d.id}`,
        dossierId: c.dossierId,
        consultationId: c.id,
        patient,
        libelle: d.libelle,
        typeActe: d.principal ? "DIAGNOSTIC_PRINCIPAL" : "DIAGNOSTIC",
        notes: d.codeCim ? `CIM: ${d.codeCim}` : null,
        creeLe: c.debutLe.toISOString(),
      });
    }
    if (c.conclusion?.trim()) {
      notes.push({
        id: `conc-${c.id}`,
        dossierId: c.dossierId,
        consultationId: c.id,
        patient,
        libelle: "Conclusion",
        typeActe: "CONCLUSION",
        notes: c.conclusion,
        creeLe: c.debutLe.toISOString(),
      });
    }
  }

  return notes.slice(0, 50);
}
