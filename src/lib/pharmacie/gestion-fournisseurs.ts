import "server-only";
import { prisma } from "@/lib/prisma";
import { crediterLot, synchroniserStockAgrege } from "@/lib/pharmacie/stock-fefo";

export async function listerFournisseurs() {
  return prisma.fournisseurPharmacie.findMany({ orderBy: { nom: "asc" } });
}

export async function upsertFournisseur(data: {
  id?: string;
  nom: string;
  telephone?: string;
  email?: string;
  adresse?: string;
}) {
  if (data.id) {
    return prisma.fournisseurPharmacie.update({
      where: { id: data.id },
      data: {
        nom: data.nom.trim(),
        telephone: data.telephone?.trim() || null,
        email: data.email?.trim() || null,
        adresse: data.adresse?.trim() || null,
      },
    });
  }
  return prisma.fournisseurPharmacie.create({
    data: {
      nom: data.nom.trim(),
      telephone: data.telephone?.trim() || null,
      email: data.email?.trim() || null,
      adresse: data.adresse?.trim() || null,
    },
  });
}

export async function recevoirAchat(
  pharmacienId: string,
  data: {
    fournisseurId: string;
    notes?: string;
    lignes: {
      medicamentId: string;
      numeroLot: string;
      quantite: number;
      prixAchat: number;
      expirationLe: string;
    }[];
  }
) {
  if (!data.lignes.length) throw new Error("Ajoutez des lignes d'achat.");
  const numero = `ACH-${Date.now().toString(36).toUpperCase()}`;

  return prisma.$transaction(async (tx) => {
    const achat = await tx.achatPharmacie.create({
      data: {
        numero,
        fournisseurId: data.fournisseurId,
        pharmacienId,
        statut: "RECU",
        notes: data.notes?.trim() || null,
        recuLe: new Date(),
      },
    });

    for (const l of data.lignes) {
      const lot = await tx.lotMedicament.upsert({
        where: {
          medicamentId_numeroLot: {
            medicamentId: l.medicamentId,
            numeroLot: l.numeroLot.trim(),
          },
        },
        create: {
          medicamentId: l.medicamentId,
          numeroLot: l.numeroLot.trim(),
          quantite: l.quantite,
          expirationLe: new Date(l.expirationLe),
          fournisseurId: data.fournisseurId,
        },
        update: {
          quantite: { increment: l.quantite },
          expirationLe: new Date(l.expirationLe),
          fournisseurId: data.fournisseurId,
        },
      });

      await tx.mouvementStock.create({
        data: {
          lotId: lot.id,
          type: "ENTREE",
          quantite: l.quantite,
          utilisateurId: pharmacienId,
          refType: "ACHAT",
          refId: achat.id,
        },
      });

      await tx.ligneAchatPharmacie.create({
        data: {
          achatId: achat.id,
          medicamentId: l.medicamentId,
          lotId: lot.id,
          numeroLot: l.numeroLot.trim(),
          quantite: l.quantite,
          prixAchat: l.prixAchat,
          expirationLe: new Date(l.expirationLe),
        },
      });

      await synchroniserStockAgrege(l.medicamentId);
    }

    return achat;
  });
}

export async function creerRetourVente(
  pharmacienId: string,
  venteId: string,
  lignes: { medicamentId: string; lotId: string; quantite: number }[],
  motif?: string
) {
  const vente = await prisma.ventePharmacie.findUnique({ where: { id: venteId } });
  if (!vente) throw new Error("Vente introuvable.");
  if (vente.statut !== "DELIVREE") {
    throw new Error("Seules les ventes délivrées peuvent être retournées.");
  }
  if (!lignes.length) throw new Error("Aucune ligne de retour.");

  const retour = await prisma.retourPharmacie.create({
    data: {
      venteId,
      pharmacienId,
      motif: motif?.trim() || null,
      lignes: {
        create: lignes.map((l) => ({
          medicamentId: l.medicamentId,
          lotId: l.lotId,
          quantite: l.quantite,
        })),
      },
    },
  });

  for (const l of lignes) {
    await crediterLot({
      lotId: l.lotId,
      quantite: l.quantite,
      utilisateurId: pharmacienId,
      type: "RETOUR",
      refType: "RETOUR",
      refId: retour.id,
    });
  }

  return retour;
}
