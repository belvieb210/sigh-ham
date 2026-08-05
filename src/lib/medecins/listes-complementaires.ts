import "server-only";
import { calculerAge } from "@/features/caisse/utils-format";
import { prisma } from "@/lib/prisma";
import type {
  DossierRechercheMedecins,
  NoteMedicaleResume,
  PatientDuJour,
  PatientTransfereCaisse,
} from "@/lib/medecins/types";

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
