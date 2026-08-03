import "server-only";
import { prisma } from "@/lib/prisma";
import type { SessionCaisseActive } from "@/lib/caisse/types";

function decimalVersNombre(valeur: { toNumber?: () => number } | number | string): number {
  if (typeof valeur === "number") return valeur;
  if (typeof valeur === "string") return Number.parseFloat(valeur) || 0;
  if (valeur && typeof valeur.toNumber === "function") return valeur.toNumber();
  return Number(valeur) || 0;
}

export async function obtenirSessionCaisseActive(
  caissierId: string
): Promise<SessionCaisseActive | null> {
  const session = await prisma.sessionCaisse.findFirst({
    where: { caissierId, clotureeLe: null },
    include: { caissier: { select: { prenom: true, nom: true } } },
    orderBy: { ouverteLe: "desc" },
  });
  if (!session) return null;
  return {
    id: session.id,
    caissierId: session.caissierId,
    numeroCaisse: session.numeroCaisse,
    soldeOuverture: decimalVersNombre(session.soldeOuverture),
    ouverteLe: session.ouverteLe.toISOString(),
    caissierNom: `${session.caissier.prenom} ${session.caissier.nom}`.trim(),
  };
}

export async function ouvrirSessionCaisse(
  caissierId: string,
  options?: { soldeOuverture?: number; numeroCaisse?: string }
): Promise<SessionCaisseActive> {
  const existante = await obtenirSessionCaisseActive(caissierId);
  if (existante) return existante;

  const derniere = await prisma.sessionCaisse.findFirst({
    where: { caissierId },
    orderBy: { ouverteLe: "desc" },
  });

  const solde =
    options?.soldeOuverture ??
    (derniere?.soldeCloture != null
      ? decimalVersNombre(derniere.soldeCloture)
      : 0);
  const numero = options?.numeroCaisse?.trim() || derniere?.numeroCaisse || "01";

  const session = await prisma.sessionCaisse.create({
    data: {
      caissierId,
      soldeOuverture: solde,
      numeroCaisse: numero,
    },
    include: { caissier: { select: { prenom: true, nom: true } } },
  });

  return {
    id: session.id,
    caissierId: session.caissierId,
    numeroCaisse: session.numeroCaisse,
    soldeOuverture: decimalVersNombre(session.soldeOuverture),
    ouverteLe: session.ouverteLe.toISOString(),
    caissierNom: `${session.caissier.prenom} ${session.caissier.nom}`.trim(),
  };
}

export async function cloturerSessionCaisse(
  caissierId: string,
  soldeCloture?: number
): Promise<SessionCaisseActive | null> {
  const active = await prisma.sessionCaisse.findFirst({
    where: { caissierId, clotureeLe: null },
    orderBy: { ouverteLe: "desc" },
  });
  if (!active) return null;

  const debutJour = new Date(active.ouverteLe);
  const paiements = await prisma.paiement.aggregate({
    where: {
      caissierId,
      payeLe: { gte: debutJour },
    },
    _sum: { montant: true },
  });
  const encaisse = decimalVersNombre(paiements._sum.montant ?? 0);
  const soldeFinal =
    soldeCloture ?? decimalVersNombre(active.soldeOuverture) + encaisse;

  const session = await prisma.sessionCaisse.update({
    where: { id: active.id },
    data: {
      clotureeLe: new Date(),
      soldeCloture: soldeFinal,
    },
    include: { caissier: { select: { prenom: true, nom: true } } },
  });

  return {
    id: session.id,
    caissierId: session.caissierId,
    numeroCaisse: session.numeroCaisse,
    soldeOuverture: decimalVersNombre(session.soldeOuverture),
    ouverteLe: session.ouverteLe.toISOString(),
    caissierNom: `${session.caissier.prenom} ${session.caissier.nom}`.trim(),
  };
}
