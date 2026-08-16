import "server-only";
import type { Prisma } from "@/generated/prisma/client";

type ClientTransaction = Prisma.TransactionClient;

/**
 * N° permanent patient : YYYYMMDD + compteur annuel.
 * Ex. 20260902012 — attribué une seule fois à la création du patient.
 */
async function prochainNumeroPatientPermanent(
  tx: ClientTransaction,
  date = new Date()
): Promise<string> {
  const sequence = await prochaineSequenceAnnuellePatient(tx, date);
  return `${formaterDateEnregistrement(date)}${formaterCompteurAnnuel(sequence)}`;
}

/**
 * Prochaine séquence annuelle hospitalière (patients réception uniquement).
 * Les clients pharmacie (PH-*) ont leur propre compteur.
 */
async function prochaineSequenceAnnuellePatient(
  tx: ClientTransaction,
  date = new Date()
): Promise<number> {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(8822015)`;

  const annee = date.getFullYear();
  const prefixAnnee = String(annee);
  const debutAnnee = new Date(annee, 0, 1);
  const finAnnee = new Date(annee + 1, 0, 1);

  const patients = await tx.patient.findMany({
    where: { numeroPatient: { startsWith: prefixAnnee } },
    select: { numeroPatient: true },
  });
  const dejaEnregistres = await tx.enregistrementReception.count({
    where: {
      enregistreLe: { gte: debutAnnee, lt: finAnnee },
    },
  });

  let maxSeq = 0;
  for (const p of patients) {
    if (p.numeroPatient.startsWith("PH-")) continue;
    const seq = extraireSequenceAnnuelle(p.numeroPatient, annee);
    if (seq != null) maxSeq = Math.max(maxSeq, seq);
  }

  return Math.max(maxSeq, dejaEnregistres) + 1;
}

/** Format YYYYMMDD + séquence (ex. 20260815012 → 12). */
function extraireSequenceAnnuelle(numeroPatient: string, annee: number): number | null {
  const m = /^(\d{4})(\d{4})(\d+)$/.exec(numeroPatient);
  if (!m) return null;
  if (Number.parseInt(m[1], 10) !== annee) return null;
  const n = Number.parseInt(m[3], 10);
  return Number.isFinite(n) ? n : null;
}

/** N° client walk-in pharmacie : PH-YYYYMMDD + séquence du jour. */
async function prochainNumeroClientPharmacie(
  tx: ClientTransaction,
  date = new Date()
): Promise<string> {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(8822016)`;

  const prefixDate = formaterDateEnregistrement(date);
  const prefixPh = `PH-${prefixDate}`;

  const dossiers = await tx.dossierPatient.findMany({
    where: { numeroDossier: { startsWith: prefixPh } },
    select: { numeroDossier: true },
  });

  let maxSeq = 0;
  for (const d of dossiers) {
    const n = Number.parseInt(d.numeroDossier.slice(prefixPh.length), 10);
    if (Number.isFinite(n)) maxSeq = Math.max(maxSeq, n);
  }

  return `${prefixPh}${formaterCompteurAnnuel(maxSeq + 1)}`;
}

/**
 * Réserve une plage de numéros PAT-YYYY##### sans collision (dans une transaction).
 * Verrou advisory + max séquence existante (pas un simple COUNT) pour éviter les doublons concurrents.
 */
export async function reserverNumerosTransfert(
  tx: ClientTransaction,
  count: number,
  date = new Date()
): Promise<string[]> {
  if (count <= 0) return [];

  await tx.$executeRaw`SELECT pg_advisory_xact_lock(8822017)`;

  const annee = date.getFullYear();
  const prefix = `PAT-${annee}`;

  const transferts = await tx.transfert.findMany({
    where: { numeroTransfert: { startsWith: prefix } },
    select: { numeroTransfert: true },
  });

  let maxSeq = 0;
  for (const t of transferts) {
    if (!t.numeroTransfert) continue;
    const m = /^PAT-(\d{4})(\d+)$/.exec(t.numeroTransfert);
    if (!m || Number.parseInt(m[1]!, 10) !== annee) continue;
    const seq = Number.parseInt(m[2]!, 10);
    if (Number.isFinite(seq)) maxSeq = Math.max(maxSeq, seq);
  }

  const numeros: string[] = [];
  for (let i = 0; i < count; i++) {
    numeros.push(`PAT-${annee}${String(maxSeq + 1 + i).padStart(5, "0")}`);
  }
  return numeros;
}

/**
 * N° de transfert annuel : PAT + année + séquence sur 5 chiffres.
 * Ex. PAT-202600001, PAT-202600002 — repart à PAT-202700001 en 2027.
 */
export async function prochainNumeroTransfert(
  tx: ClientTransaction,
  date = new Date()
): Promise<string> {
  const [numero] = await reserverNumerosTransfert(tx, 1, date);
  return numero!;
}

/**
 * PAT du parcours : réutilise le n° déjà attribué à la VIS,
 * ou en crée un si c'est le premier hop.
 */
export async function numeroPatDuParcours(
  tx: ClientTransaction,
  dossierId: string,
  date = new Date()
): Promise<string> {
  const existant = await tx.transfert.findFirst({
    where: { dossierId, numeroTransfert: { not: null } },
    orderBy: { createdAt: "asc" },
    select: { numeroTransfert: true },
  });
  if (existant?.numeroTransfert) return existant.numeroTransfert;
  return prochainNumeroTransfert(tx, date);
}

/**
 * N° de visite : VIS-YYYY-XXXXXX (séquence annuelle, indépendante du n° patient).
 * Ex. VIS-2026-000001 — les dossiers existants (YYYYMMDD…) restent valides.
 */
async function prochainNumeroVisite(
  tx: ClientTransaction,
  date = new Date()
): Promise<string> {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(8822018)`;

  const annee = date.getFullYear();
  const prefix = `VIS-${annee}-`;

  const dossiers = await tx.dossierPatient.findMany({
    where: { numeroDossier: { startsWith: prefix } },
    select: { numeroDossier: true },
  });

  let maxSeq = 0;
  for (const d of dossiers) {
    const m = /^VIS-\d{4}-(\d+)$/.exec(d.numeroDossier);
    if (!m) continue;
    const seq = Number.parseInt(m[1]!, 10);
    if (Number.isFinite(seq)) maxSeq = Math.max(maxSeq, seq);
  }

  return `${prefix}${String(maxSeq + 1).padStart(6, "0")}`;
}

/**
 * N° d'enregistrement dossier (visite) : YYYYMMDD + compteur annuel.
 * Conservé pour la série pharmacie PH- et l'extraction de dates.
 */
function formaterDateEnregistrement(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function formaterCompteurAnnuel(sequence: number): string {
  if (sequence < 1000) return String(sequence).padStart(3, "0");
  return String(sequence);
}

export async function genererNumeroEnregistrementVisite(tx: ClientTransaction) {
  return prochainNumeroVisite(tx);
}

/** Nouveau patient hospitalier : n° permanent + 1re visite VIS-YYYY-XXXXXX. */
export async function genererNumerosPatient(
  tx: ClientTransaction,
  date = new Date()
) {
  const numeroPatient = await prochainNumeroPatientPermanent(tx, date);
  const numeroEnregistrement = await prochainNumeroVisite(tx, date);
  return { numeroPatient, numeroEnregistrement };
}

/**
 * Client walk-in pharmacie : série PH-YYYYMMDD### indépendante des patients hospitaliers.
 */
export async function genererNumerosClientPharmacie(
  tx: ClientTransaction,
  date = new Date()
) {
  const numeroDossier = await prochainNumeroClientPharmacie(tx, date);
  return { numeroPatient: numeroDossier, numeroEnregistrement: numeroDossier };
}

export async function apercuNumerosPatient() {
  const { prisma } = await import("@/lib/prisma");
  return prisma.$transaction(async (tx) => genererNumerosPatient(tx));
}
