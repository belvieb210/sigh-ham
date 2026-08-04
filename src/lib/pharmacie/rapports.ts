import "server-only";
import { prisma } from "@/lib/prisma";

function debutJour(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function rapportVentesPharmacie(opts?: {
  depuis?: Date;
  jusqua?: Date;
}) {
  const depuis = opts?.depuis ?? debutJour();
  const jusqua = opts?.jusqua ?? new Date();

  const ventes = await prisma.ventePharmacie.findMany({
    where: {
      creeLe: { gte: depuis, lte: jusqua },
      statut: { in: ["PAYEE", "DELIVREE", "TRANSMISE"] },
    },
    include: {
      lignes: { include: { medicament: true } },
      dossier: { include: { patient: true } },
    },
    orderBy: { creeLe: "desc" },
  });

  const ca = ventes
    .filter((v) => v.statut === "PAYEE" || v.statut === "DELIVREE")
    .reduce((s, v) => s + Number(v.montantTotal), 0);

  const parProduit = new Map<string, { nom: string; quantite: number; montant: number }>();
  for (const v of ventes) {
    for (const l of v.lignes) {
      const cur = parProduit.get(l.medicamentId) ?? {
        nom: l.medicament.nom,
        quantite: 0,
        montant: 0,
      };
      cur.quantite += l.quantite;
      cur.montant += Number(l.prixUnitaire) * l.quantite - Number(l.remise);
      parProduit.set(l.medicamentId, cur);
    }
  }

  const top = [...parProduit.values()].sort((a, b) => b.quantite - a.quantite);

  return {
    depuis: depuis.toISOString(),
    jusqua: jusqua.toISOString(),
    nombreVentes: ventes.length,
    chiffreAffaires: ca,
    topProduits: top.slice(0, 20),
    flopProduits: [...top].reverse().slice(0, 10),
    ventes: ventes.map((v) => ({
      numero: v.numero,
      client: `${v.dossier.patient.prenom} ${v.dossier.patient.nom}`.trim(),
      statut: v.statut,
      montant: Number(v.montantTotal),
      creeLe: v.creeLe.toISOString(),
    })),
  };
}

export async function rapportStockPharmacie() {
  const lots = await prisma.lotMedicament.findMany({
    include: { medicament: true, fournisseur: true },
    orderBy: [{ expirationLe: "asc" }],
  });
  const maintenant = new Date();
  const dans30 = new Date();
  dans30.setDate(dans30.getDate() + 30);

  return {
    lots: lots.map((l) => ({
      id: l.id,
      numeroLot: l.numeroLot,
      medicament: l.medicament.nom,
      quantite: l.quantite,
      expirationLe: l.expirationLe.toISOString(),
      expire: l.expirationLe < maintenant,
      bientot: l.expirationLe <= dans30 && l.expirationLe >= maintenant,
      fournisseur: l.fournisseur?.nom ?? null,
    })),
    expires: lots.filter((l) => l.expirationLe < maintenant && l.quantite > 0).length,
    bientot: lots.filter(
      (l) => l.expirationLe <= dans30 && l.expirationLe >= maintenant && l.quantite > 0
    ).length,
  };
}

export function exporterCsv(
  colonnes: string[],
  lignes: (string | number)[][]
): string {
  const esc = (v: string | number) => {
    const s = String(v);
    return s.includes(";") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  return [colonnes.map(esc).join(";"), ...lignes.map((r) => r.map(esc).join(";"))].join(
    "\n"
  );
}
