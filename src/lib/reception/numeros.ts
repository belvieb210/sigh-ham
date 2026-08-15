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
  const annee = date.getFullYear();
  const debutAnnee = new Date(annee, 0, 1);
  const finAnnee = new Date(annee + 1, 0, 1);

  const dejaEnregistres = await tx.enregistrementReception.count({
    where: {
      enregistreLe: { gte: debutAnnee, lt: finAnnee },
    },
  });

  const sequence = dejaEnregistres + 1;
  return `${formaterDateEnregistrement(date)}${formaterCompteurAnnuel(sequence)}`;
}

/**
 * Réserve une plage de numéros PAT-YYYY##### sans collision (dans une transaction).
 */
export async function reserverNumerosTransfert(
  tx: ClientTransaction,
  count: number,
  date = new Date()
): Promise<string[]> {
  if (count <= 0) return [];

  const annee = date.getFullYear();
  const debutAnnee = new Date(annee, 0, 1);
  const finAnnee = new Date(annee + 1, 0, 1);

  const dejaCetteAnnee = await tx.transfert.count({
    where: { emisLe: { gte: debutAnnee, lt: finAnnee } },
  });

  const numeros: string[] = [];
  for (let i = 0; i < count; i++) {
    numeros.push(`PAT-${annee}${String(dejaCetteAnnee + 1 + i).padStart(5, "0")}`);
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
 * N° d'enregistrement dossier (visite) : YYYYMMDD + compteur annuel.
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

async function prochainNumeroEnregistrement(
  tx: ClientTransaction,
  date = new Date()
): Promise<string> {
  const annee = date.getFullYear();
  const debutAnnee = new Date(annee, 0, 1);
  const finAnnee = new Date(annee + 1, 0, 1);

  const dejaEnregistres = await tx.enregistrementReception.count({
    where: {
      enregistreLe: { gte: debutAnnee, lt: finAnnee },
    },
  });

  const sequence = dejaEnregistres + 1;
  return `${formaterDateEnregistrement(date)}${formaterCompteurAnnuel(sequence)}`;
}

export async function genererNumeroEnregistrementVisite(tx: ClientTransaction) {
  return prochainNumeroEnregistrement(tx);
}

/** Nouveau patient : n° permanent + 1er dossier (même n° à la première visite). */
export async function genererNumerosPatient(tx: ClientTransaction) {
  const numeroPatient = await prochainNumeroPatientPermanent(tx);
  return { numeroPatient, numeroEnregistrement: numeroPatient };
}

/**
 * Numéros pour client walk-in pharmacie : alignés sur la réception mais
 * basés sur les patients existants du jour (évite les collisions car la
 * pharmacie ne crée pas d'enregistrement réception).
 */
export async function genererNumerosClientPharmacie(
  tx: ClientTransaction,
  date = new Date()
) {
  const prefix = formaterDateEnregistrement(date);
  const receptionNum = await prochainNumeroPatientPermanent(tx, date);
  const receptionSeq = Number.parseInt(receptionNum.slice(prefix.length), 10) || 0;

  const patients = await tx.patient.findMany({
    where: { numeroPatient: { startsWith: prefix } },
    select: { numeroPatient: true },
  });

  let maxSeq = 0;
  for (const p of patients) {
    const n = Number.parseInt(p.numeroPatient.slice(prefix.length), 10);
    if (Number.isFinite(n)) maxSeq = Math.max(maxSeq, n);
  }

  const sequence = Math.max(maxSeq, receptionSeq) + 1;
  const numeroPatient = `${prefix}${formaterCompteurAnnuel(sequence)}`;
  return { numeroPatient, numeroEnregistrement: numeroPatient };
}

export async function apercuNumerosPatient() {
  const { prisma } = await import("@/lib/prisma");
  return prisma.$transaction(async (tx) => genererNumerosPatient(tx));
}
