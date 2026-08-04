import "server-only";
import { prisma } from "@/lib/prisma";
import { reorienterPatientDepuisPharmacie } from "@/lib/pharmacie/reorienter-patient-pharmacie";
import { debiterLotsFefo } from "@/lib/pharmacie/stock-fefo";

function decimal(n: { toNumber?: () => number } | number | null | undefined) {
  if (n == null) return 0;
  if (typeof n === "number") return n;
  if (typeof n.toNumber === "function") return n.toNumber();
  return Number(n);
}

async function prochainNumeroFacture() {
  const n = await prisma.facture.count();
  return `FAC-PH-${String(n + 1).padStart(6, "0")}`;
}

export async function creerVenteDirecte(
  pharmacienId: string,
  data: {
    dossierId: string;
    notes?: string;
    lignes: { medicamentId: string; quantite: number; remise?: number }[];
  }
) {
  if (!data.lignes.length) throw new Error("Ajoutez au moins un médicament.");

  const meds = await prisma.medicament.findMany({
    where: { id: { in: data.lignes.map((l) => l.medicamentId) } },
  });
  const byId = new Map(meds.map((m) => [m.id, m]));

  let montant = 0;
  const lignesData = data.lignes.map((l) => {
    const m = byId.get(l.medicamentId);
    if (!m) throw new Error("Médicament introuvable.");
    const prix = decimal(m.prixUnitaire);
    const remise = l.remise ?? 0;
    montant += Math.max(0, prix * l.quantite - remise);
    return {
      medicamentId: l.medicamentId,
      quantite: l.quantite,
      prixUnitaire: prix,
      remise,
    };
  });

  const numero = `VTE-${Date.now().toString(36).toUpperCase()}`;
  return prisma.ventePharmacie.create({
    data: {
      numero,
      dossierId: data.dossierId,
      type: "DIRECTE",
      pharmacienId,
      notes: data.notes?.trim() || null,
      montantTotal: montant,
      lignes: { create: lignesData },
    },
    include: { lignes: true },
  });
}

export async function transmettreVenteACaisse(
  pharmacienId: string,
  venteId: string
) {
  const vente = await prisma.ventePharmacie.findUnique({
    where: { id: venteId },
    include: {
      lignes: { include: { medicament: true } },
      dossier: { include: { patient: true } },
    },
  });
  if (!vente) throw new Error("Vente introuvable.");
  if (vente.statut !== "BROUILLON") {
    throw new Error("Seules les ventes brouillon peuvent être transmises.");
  }
  if (!vente.lignes.length) throw new Error("Vente sans lignes.");

  const numeroFacture = await prochainNumeroFacture();
  const montant = decimal(vente.montantTotal);

  const resultat = await prisma.$transaction(async (tx) => {
    const facture = await tx.facture.create({
      data: {
        numeroFacture,
        dossierId: vente.dossierId,
        statut: "EMISE",
        montantTotal: montant,
        montantPaye: 0,
        emiseLe: new Date(),
        lignes: {
          create: vente.lignes.map((l) => ({
            libelle: `${l.medicament.nom}${l.medicament.dosage ? ` ${l.medicament.dosage}` : ""}`,
            quantite: l.quantite,
            prixUnitaire: l.prixUnitaire,
            montant: Math.max(
              0,
              decimal(l.prixUnitaire) * l.quantite - decimal(l.remise)
            ),
          })),
        },
      },
    });

    const maj = await tx.ventePharmacie.update({
      where: { id: venteId },
      data: {
        statut: "TRANSMISE",
        factureId: facture.id,
        transmiseLe: new Date(),
        pharmacienId,
      },
    });

    return { facture, vente: maj };
  });

  try {
    await reorienterPatientDepuisPharmacie(pharmacienId, vente.dossierId, [
      "CAISSE",
    ]);
  } catch {
    /* patient peut ne pas être en file pharmacie (vente directe hors file) */
  }

  return resultat;
}

export async function marquerVentePayeeParFacture(factureId: string) {
  const vente = await prisma.ventePharmacie.findFirst({
    where: { factureId },
  });
  if (!vente) return null;
  if (vente.statut !== "TRANSMISE") return vente;

  return prisma.ventePharmacie.update({
    where: { id: vente.id },
    data: { statut: "PAYEE", payeeLe: new Date() },
  });
}

export async function delivrerVente(pharmacienId: string, venteId: string) {
  const vente = await prisma.ventePharmacie.findUnique({
    where: { id: venteId },
    include: { lignes: true },
  });
  if (!vente) throw new Error("Vente introuvable.");
  if (vente.statut !== "PAYEE") {
    throw new Error("La vente doit être payée avant la remise.");
  }

  const allocationsParLigne: {
    medicamentId: string;
    allocations: { lotId: string; quantite: number }[];
  }[] = [];

  for (const ligne of vente.lignes) {
    const allocations = await debiterLotsFefo({
      medicamentId: ligne.medicamentId,
      quantite: ligne.quantite,
      utilisateurId: pharmacienId,
      refType: "VENTE",
      refId: vente.id,
    });
    allocationsParLigne.push({ medicamentId: ligne.medicamentId, allocations });
    const premierLot = allocations[0]?.lotId;
    if (premierLot) {
      await prisma.ligneVentePharmacie.update({
        where: { id: ligne.id },
        data: { lotId: premierLot },
      });
    }
  }

  const delivrance = await prisma.delivrancePharmacie.create({
    data: {
      venteId: vente.id,
      ordonnanceId: vente.ordonnanceId,
      pharmacienId,
      lignes: {
        create: allocationsParLigne.flatMap((a) =>
          a.allocations.map((al) => ({
            medicamentId: a.medicamentId,
            lotId: al.lotId,
            quantite: al.quantite,
          }))
        ),
      },
    },
  });

  await prisma.ventePharmacie.update({
    where: { id: vente.id },
    data: { statut: "DELIVREE", delivreeLe: new Date() },
  });

  if (vente.ordonnanceId) {
    await prisma.ordonnance.update({
      where: { id: vente.ordonnanceId },
      data: { statut: "DELIVREE" },
    });
  }

  return delivrance;
}
