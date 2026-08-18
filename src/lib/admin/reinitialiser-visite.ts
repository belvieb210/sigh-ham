import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { enregistrerOperationGouvernance } from "@/lib/admin/operations-gouvernance";

export async function listerVisitesPatientAdmin(patientId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: {
      id: true,
      numeroPatient: true,
      prenom: true,
      nom: true,
      photoUrl: true,
      telephone: true,
      dossiers: {
        orderBy: { ouvertLe: "desc" },
        select: {
          id: true,
          numeroDossier: true,
          statut: true,
          ouvertLe: true,
          clotureLe: true,
          salleEnregistrement: true,
          _count: {
            select: {
              transferts: true,
              factures: true,
              examensLaboratoire: true,
              consultations: true,
              ordonnances: true,
              ventesPharmacie: true,
              passages: true,
            },
          },
        },
      },
    },
  });
  if (!patient) return null;

  return {
    patient: {
      id: patient.id,
      numeroPatient: patient.numeroPatient,
      prenom: patient.prenom,
      nom: patient.nom,
      photoUrl: patient.photoUrl,
      telephone: patient.telephone,
    },
    visites: patient.dossiers.map((d) => ({
      dossierId: d.id,
      numeroDossier: d.numeroDossier,
      statut: d.statut,
      ouvertLe: d.ouvertLe.toISOString(),
      clotureLe: d.clotureLe?.toISOString() ?? null,
      salleEnregistrement: d.salleEnregistrement,
      totaux: d._count,
    })),
  };
}

async function snapshotVisite(
  tx: Prisma.TransactionClient,
  dossierId: string
) {
  const dossier = await tx.dossierPatient.findUnique({
    where: { id: dossierId },
    include: {
      transferts: {
        select: {
          id: true,
          numeroTransfert: true,
          statut: true,
          salleOrigine: { select: { code: true, nom: true } },
          salleDestination: { select: { code: true, nom: true } },
        },
      },
      factures: {
        select: {
          id: true,
          numeroFacture: true,
          statut: true,
          montantTotal: true,
          montantPaye: true,
        },
      },
      examensLaboratoire: {
        select: {
          id: true,
          statut: true,
          typeExamen: { select: { libelle: true } },
        },
      },
      ventesPharmacie: { select: { id: true, numero: true, statut: true } },
    },
  });
  if (!dossier) throw new Error("Visite introuvable.");
  return {
    numeroDossier: dossier.numeroDossier,
    statut: dossier.statut,
    ouvertLe: dossier.ouvertLe.toISOString(),
    transferts: dossier.transferts,
    factures: dossier.factures.map((f) => ({
      ...f,
      montantTotal: Number(f.montantTotal),
      montantPaye: Number(f.montantPaye),
    })),
    examens: dossier.examensLaboratoire.map((e) => ({
      id: e.id,
      statut: e.statut,
      libelle: e.typeExamen.libelle,
    })),
    ventes: dossier.ventesPharmacie,
  };
}

export async function reinitialiserVisitePatientAdmin(params: {
  acteurId: string;
  patientId: string;
  dossierId: string;
  confirmation: string;
}) {
  const dossier = await prisma.dossierPatient.findFirst({
    where: { id: params.dossierId, patientId: params.patientId },
    select: {
      id: true,
      numeroDossier: true,
      patient: {
        select: { id: true, numeroPatient: true, prenom: true, nom: true },
      },
    },
  });
  if (!dossier) throw new Error("Visite introuvable.");

  const attendu = dossier.numeroDossier.trim().toUpperCase();
  if (params.confirmation.trim().toUpperCase() !== attendu) {
    throw new Error(
      `Pour confirmer, saisissez le n° de dossier exactement : ${dossier.numeroDossier}`
    );
  }

  await prisma.$transaction(async (tx) => {
    const snap = await snapshotVisite(tx, params.dossierId);

    const delivrances = await tx.delivrancePharmacie.findMany({
      where: {
        OR: [
          { vente: { dossierId: params.dossierId } },
          { ordonnance: { dossierId: params.dossierId } },
        ],
      },
      include: { lignes: true },
    });

    const medicamentsASync = new Set<string>();
    for (const deliv of delivrances) {
      for (const ligne of deliv.lignes) {
        await tx.lotMedicament.update({
          where: { id: ligne.lotId },
          data: { quantite: { increment: ligne.quantite } },
        });
        await tx.mouvementStock.create({
          data: {
            lotId: ligne.lotId,
            type: "RETOUR",
            quantite: ligne.quantite,
            utilisateurId: params.acteurId,
            refType: "REINITIALISATION_VISITE",
            refId: params.dossierId,
          },
        });
        medicamentsASync.add(ligne.medicamentId);
      }
    }

    await tx.retourPharmacie.deleteMany({
      where: { vente: { dossierId: params.dossierId } },
    });
    await tx.delivrancePharmacie.deleteMany({
      where: {
        OR: [
          { vente: { dossierId: params.dossierId } },
          { ordonnance: { dossierId: params.dossierId } },
        ],
      },
    });

    await tx.ventePharmacie.updateMany({
      where: { dossierId: params.dossierId },
      data: { factureId: null, ordonnanceId: null },
    });
    await tx.ventePharmacie.deleteMany({ where: { dossierId: params.dossierId } });
    await tx.ordonnance.deleteMany({ where: { dossierId: params.dossierId } });

    const factureIds = (
      await tx.facture.findMany({
        where: { dossierId: params.dossierId },
        select: { id: true },
      })
    ).map((f) => f.id);
    if (factureIds.length > 0) {
      await tx.paiement.deleteMany({ where: { factureId: { in: factureIds } } });
      await tx.facture.deleteMany({ where: { id: { in: factureIds } } });
    }

    await tx.examenLaboratoire.deleteMany({ where: { dossierId: params.dossierId } });

    await tx.estimationConvention.updateMany({
      where: { dossierId: params.dossierId },
      data: { transfertId: null },
    });
    await tx.estimationConvention.deleteMany({
      where: { dossierId: params.dossierId },
    });

    await tx.transfertRecuperation.deleteMany({
      where: { dossierId: params.dossierId },
    });
    await tx.transfert.deleteMany({ where: { dossierId: params.dossierId } });

    await tx.consultation.deleteMany({ where: { dossierId: params.dossierId } });
    await tx.ficheTraitement.deleteMany({ where: { dossierId: params.dossierId } });
    await tx.constantesVitales.deleteMany({
      where: { dossierId: params.dossierId },
    });
    await tx.enregistrementReception.deleteMany({
      where: { dossierId: params.dossierId },
    });
    await tx.examenPrenuptial.deleteMany({
      where: { dossierId: params.dossierId },
    });

    const admissions = await tx.admission.findMany({
      where: { dossierId: params.dossierId },
      select: { id: true, litId: true },
    });
    const litIds = admissions.map((a) => a.litId).filter((id): id is string => !!id);
    if (litIds.length > 0) {
      await tx.lit.updateMany({
        where: { id: { in: litIds } },
        data: { occupe: false },
      });
    }
    await tx.admission.deleteMany({ where: { dossierId: params.dossierId } });

    await tx.conversation.updateMany({
      where: { dossierId: params.dossierId },
      data: { dossierId: null },
    });

    await tx.passage.deleteMany({ where: { dossierId: params.dossierId } });

    await enregistrerOperationGouvernance({
      tx,
      acteurId: params.acteurId,
      type: "REINITIALISATION_VISITE",
      typeAudit: "SUPPRESSION",
      patientId: dossier.patient.id,
      numeroPatient: dossier.patient.numeroPatient,
      dossierId: null,
      numeroDossier: dossier.numeroDossier,
      action: `Réinitialisation complète de ${dossier.numeroDossier} — ${dossier.patient.prenom} ${dossier.patient.nom}`,
      snapshot: snap,
    });

    await tx.dossierPatient.delete({ where: { id: params.dossierId } });

    for (const medicamentId of medicamentsASync) {
      const qty = await tx.lotMedicament.aggregate({
        where: {
          medicamentId,
          quantite: { gt: 0 },
          expirationLe: { gt: new Date() },
        },
        _sum: { quantite: true },
      });
      const existant = await tx.stockMedicament.findFirst({
        where: { medicamentId },
      });
      const quantite = qty._sum.quantite ?? 0;
      if (existant) {
        await tx.stockMedicament.update({
          where: { id: existant.id },
          data: { quantite },
        });
      } else {
        await tx.stockMedicament.create({
          data: { medicamentId, quantite },
        });
      }
    }
  });

  return { numeroDossier: dossier.numeroDossier };
}
