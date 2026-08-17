import "server-only";
import { prisma } from "@/lib/prisma";
import { debiterLotsFefo } from "@/lib/pharmacie/stock-fefo";
import { preparerTransfertVentePharmacieVersCaisse } from "@/lib/pharmacie/orienter-vente-pharmacie-caisse";

function decimal(n: { toNumber?: () => number } | number | null | undefined) {
  if (n == null) return 0;
  if (typeof n === "number") return n;
  if (typeof n.toNumber === "function") return n.toNumber();
  return Number(n);
}

async function prochainNumeroFacture() {
  const n = await prisma.facture.count({
    where: { numeroFacture: { startsWith: "FAC-PH-" } },
  });
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
    where: { id: { in: data.lignes.map((l) => l.medicamentId) }, actif: true },
  });
  const byId = new Map(meds.map((m) => [m.id, m]));

  let montant = 0;
  const lignesData = data.lignes.map((l) => {
    if (!l.medicamentId?.trim()) {
      throw new Error("Un médicament du panier est invalide. Retirez-le et ajoutez-le à nouveau.");
    }
    const m = byId.get(l.medicamentId);
    if (!m) throw new Error(`Médicament introuvable (${l.medicamentId.slice(0, 8)}…).`);
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

    const prep = await preparerTransfertVentePharmacieVersCaisse(
      pharmacienId,
      vente.dossierId,
      tx
    );

    return { facture, vente: maj, transfertId: prep.transfertId };
  });

  const transfert = await prisma.transfert.findUnique({
    where: { id: resultat.transfertId },
    select: { statut: true },
  });
  if (transfert?.statut === "EN_ATTENTE") {
    const { confirmerTransfertPharmacie } = await import(
      "@/lib/pharmacie/gestion-transfert-pharmacie"
    );
    await confirmerTransfertPharmacie(pharmacienId, resultat.transfertId);
  }

  return resultat;
}

/** Crée ou remplace une vente brouillon puis la transmet à la caisse (transaction unique). */
export async function creerEtTransmettreVenteACaisse(
  pharmacienId: string,
  data: {
    dossierId: string;
    notes?: string;
    lignes: { medicamentId: string; quantite: number; remise?: number }[];
  }
) {
  const venteEnCours = await prisma.ventePharmacie.findFirst({
    where: {
      dossierId: data.dossierId,
      type: "DIRECTE",
      statut: { in: ["TRANSMISE", "PAYEE", "DELIVREE"] },
    },
    include: { facture: { select: { numeroFacture: true } } },
    orderBy: { creeLe: "desc" },
  });
  if (venteEnCours) {
    throw new Error(
      venteEnCours.facture?.numeroFacture
        ? `Une facture (${venteEnCours.facture.numeroFacture}) est déjà transmise pour ce client. Confirmez le transfert vers la caisse.`
        : "Cette vente a déjà été transmise à la caisse."
    );
  }

  const brouillonExistant = await prisma.ventePharmacie.findFirst({
    where: { dossierId: data.dossierId, statut: "BROUILLON", type: "DIRECTE" },
    select: { id: true },
  });

  if (brouillonExistant) {
    await prisma.ligneVentePharmacie.deleteMany({ where: { venteId: brouillonExistant.id } });
    await prisma.ventePharmacie.delete({ where: { id: brouillonExistant.id } });
  }

  const vente = await creerVenteDirecte(pharmacienId, data);
  return transmettreVenteACaisse(pharmacienId, vente.id);
}

export async function marquerVentePayeeParFacture(factureId: string) {
  const vente = await prisma.ventePharmacie.findFirst({
    where: { factureId },
  });
  if (!vente) return null;
  if (vente.statut === "PAYEE" || vente.statut === "DELIVREE") return vente;

  const maj = await prisma.ventePharmacie.update({
    where: { id: vente.id },
    data: { statut: "PAYEE", payeeLe: new Date() },
  });

  const { retirerDossierDeLaFilePharmacie } = await import(
    "@/lib/pharmacie/circuit-vente"
  );
  await retirerDossierDeLaFilePharmacie(vente.dossierId);

  return maj;
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

  const { evaluerEtCloturerVisite, libererFilePharmacieSiDelivre } = await import(
    "@/lib/visites/evaluer-cloture-visite"
  );
  await libererFilePharmacieSiDelivre(vente.dossierId);
  await evaluerEtCloturerVisite(vente.dossierId);

  return delivrance;
}
