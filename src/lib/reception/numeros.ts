import "server-only";
import type { Prisma } from "@/generated/prisma/client";

type ClientTransaction = Prisma.TransactionClient;

function extraireSequence(numero: string, prefixe: string): number {
  if (!numero.startsWith(prefixe)) return 0;
  const suite = numero.slice(prefixe.length);
  const n = parseInt(suite, 10);
  return Number.isFinite(n) ? n : 0;
}

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
 * N° de transfert annuel : PAT-YYYY + séquence sur 6 chiffres.
 * Ex. PAT-202600001, PAT-202600002 — nouveau à chaque transfert.
 */
export async function prochainNumeroTransfert(
  tx: ClientTransaction,
  date = new Date()
): Promise<string> {
  const annee = date.getFullYear();
  const prefix = `PAT-${annee}`;

  const dernier = await tx.transfert.findFirst({
    where: { numeroTransfert: { startsWith: prefix } },
    orderBy: { numeroTransfert: "desc" },
    select: { numeroTransfert: true },
  });

  const seq = dernier?.numeroTransfert
    ? extraireSequence(dernier.numeroTransfert, prefix) + 1
    : 1;

  return `${prefix}${String(seq).padStart(6, "0")}`;
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

export async function apercuNumerosPatient() {
  const { prisma } = await import("@/lib/prisma");
  return prisma.$transaction(async (tx) => genererNumerosPatient(tx));
}
