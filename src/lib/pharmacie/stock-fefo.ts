import "server-only";
import { prisma } from "@/lib/prisma";

export async function stockDisponibleMedicament(medicamentId: string) {
  const agg = await prisma.lotMedicament.aggregate({
    where: {
      medicamentId,
      quantite: { gt: 0 },
      expirationLe: { gt: new Date() },
    },
    _sum: { quantite: true },
  });
  return agg._sum.quantite ?? 0;
}

export async function synchroniserStockAgrege(medicamentId: string) {
  const qty = await stockDisponibleMedicament(medicamentId);
  const existant = await prisma.stockMedicament.findFirst({
    where: { medicamentId },
  });
  if (existant) {
    await prisma.stockMedicament.update({
      where: { id: existant.id },
      data: { quantite: qty },
    });
  } else {
    await prisma.stockMedicament.create({
      data: { medicamentId, quantite: qty },
    });
  }
  return qty;
}

/** FEFO : lots non expirés, expiration croissante */
export async function selectionnerLotsFefo(
  medicamentId: string,
  quantiteDemandee: number
) {
  const lots = await prisma.lotMedicament.findMany({
    where: {
      medicamentId,
      quantite: { gt: 0 },
      expirationLe: { gt: new Date() },
    },
    orderBy: { expirationLe: "asc" },
  });

  let reste = quantiteDemandee;
  const allocations: { lotId: string; quantite: number }[] = [];
  for (const lot of lots) {
    if (reste <= 0) break;
    const q = Math.min(lot.quantite, reste);
    allocations.push({ lotId: lot.id, quantite: q });
    reste -= q;
  }
  if (reste > 0) {
    throw new Error(
      `Stock insuffisant (FEFO) pour ce médicament. Manque ${reste} unité(s).`
    );
  }
  return allocations;
}

export async function debiterLotsFefo(opts: {
  medicamentId: string;
  quantite: number;
  utilisateurId: string;
  refType: string;
  refId: string;
}) {
  const allocations = await selectionnerLotsFefo(opts.medicamentId, opts.quantite);
  for (const a of allocations) {
    await prisma.lotMedicament.update({
      where: { id: a.lotId },
      data: { quantite: { decrement: a.quantite } },
    });
    await prisma.mouvementStock.create({
      data: {
        lotId: a.lotId,
        type: "SORTIE",
        quantite: a.quantite,
        utilisateurId: opts.utilisateurId,
        refType: opts.refType,
        refId: opts.refId,
      },
    });
  }
  await synchroniserStockAgrege(opts.medicamentId);
  void import("@/lib/notifications/alertes-stock").then(({ evaluerAlertesMedicament }) =>
    evaluerAlertesMedicament(opts.medicamentId).catch(console.error)
  );
  return allocations;
}

export async function crediterLot(opts: {
  lotId: string;
  quantite: number;
  utilisateurId: string;
  type: "ENTREE" | "RETOUR" | "AJUSTEMENT";
  refType?: string;
  refId?: string;
}) {
  const lot = await prisma.lotMedicament.update({
    where: { id: opts.lotId },
    data: { quantite: { increment: opts.quantite } },
  });
  await prisma.mouvementStock.create({
    data: {
      lotId: opts.lotId,
      type: opts.type,
      quantite: opts.quantite,
      utilisateurId: opts.utilisateurId,
      refType: opts.refType,
      refId: opts.refId,
    },
  });
  await synchroniserStockAgrege(lot.medicamentId);
  void import("@/lib/notifications/alertes-stock").then(({ evaluerAlertesMedicament }) =>
    evaluerAlertesMedicament(lot.medicamentId).catch(console.error)
  );
  return lot;
}
