import "server-only";
import type { Prisma } from "@/generated/prisma/client";

type ClientTransaction = Prisma.TransactionClient;

function extraireSequence(numero: string, prefixe: string): number {
  if (!numero.startsWith(prefixe)) return 0;
  const suite = numero.slice(prefixe.length);
  const n = parseInt(suite, 10);
  return Number.isFinite(n) ? n : 0;
}

/** PAT-2026-0001 — numéro patient (inchangé) */
async function prochainNumeroPatient(tx: ClientTransaction): Promise<string> {
  const annee = new Date().getFullYear();
  const base = `PAT-${annee}-`;

  const dernier = await tx.patient.findFirst({
    where: { numeroPatient: { startsWith: base } },
    orderBy: { numeroPatient: "desc" },
    select: { numeroPatient: true },
  });

  const seq = dernier ? extraireSequence(dernier.numeroPatient, base) + 1 : 1;
  return `${base}${String(seq).padStart(4, "0")}`;
}

/**
 * N° d'enregistrement : YYYYMMDD + compteur annuel sans limite.
 * Ex. 1er patient le 01/01/2027 → 20270101001
 * Ex. 13 245e de l'année → 2027031513245 (date du jour + séquence)
 * Le compteur repart à 001 chaque 1er janvier (nouvelle année).
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

export async function genererNumerosPatient(tx: ClientTransaction) {
  const [numeroPatient, numeroEnregistrement] = await Promise.all([
    prochainNumeroPatient(tx),
    prochainNumeroEnregistrement(tx),
  ]);
  return { numeroPatient, numeroEnregistrement };
}

export async function apercuNumerosPatient() {
  const { prisma } = await import("@/lib/prisma");
  return prisma.$transaction(async (tx) => genererNumerosPatient(tx));
}
