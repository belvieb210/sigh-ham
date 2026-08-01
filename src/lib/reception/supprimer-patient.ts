import "server-only";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

async function supprimerPhotoSiLocale(photoUrl: string | null) {
  if (!photoUrl?.startsWith("/uploads/patients/")) return;
  const chemin = path.join(process.cwd(), "public", photoUrl);
  try {
    await unlink(chemin);
  } catch {
    /* fichier déjà absent */
  }
}

/**
 * Suppression définitive d'un patient et de tout son dossier clinique.
 * Ordre explicite : pas de Cascade Prisma depuis Patient/DossierPatient.
 */
export async function supprimerPatientDefinitivement(numeroPatient: string): Promise<void> {
  const patient = await prisma.patient.findUnique({
    where: { numeroPatient },
    select: {
      id: true,
      photoUrl: true,
      dossiers: { select: { id: true } },
    },
  });

  if (!patient) {
    throw new Error("Patient introuvable.");
  }

  const dossierIds = patient.dossiers.map((d) => d.id);

  await prisma.$transaction(async (tx) => {
    const conversations = await tx.conversation.findMany({
      where: {
        OR: [
          { patientId: patient.id },
          ...(dossierIds.length > 0 ? [{ dossierId: { in: dossierIds } }] : []),
        ],
      },
      select: { id: true },
    });
    const conversationIds = conversations.map((c) => c.id);

    if (conversationIds.length > 0) {
      await tx.message.updateMany({
        where: { conversationId: { in: conversationIds } },
        data: { messageParentId: null },
      });
      await tx.conversation.deleteMany({
        where: { id: { in: conversationIds } },
      });
    }

    if (dossierIds.length > 0) {
      const passages = await tx.passage.findMany({
        where: { dossierId: { in: dossierIds } },
        select: { id: true },
      });
      const passageIds = passages.map((p) => p.id);

      if (passageIds.length > 0) {
        await tx.fileAttente.deleteMany({ where: { passageId: { in: passageIds } } });
      }

      const transferts = await tx.transfert.findMany({
        where: { dossierId: { in: dossierIds } },
        select: { id: true },
      });
      const transfertIds = transferts.map((t) => t.id);

      if (transfertIds.length > 0) {
        await tx.transfertRecuperation.deleteMany({
          where: { transfertId: { in: transfertIds } },
        });
        await tx.transfert.deleteMany({ where: { id: { in: transfertIds } } });
      }

      if (passageIds.length > 0) {
        await tx.passage.deleteMany({ where: { id: { in: passageIds } } });
      }

      await tx.enregistrementReception.deleteMany({
        where: { dossierId: { in: dossierIds } },
      });
      await tx.constantesVitales.deleteMany({
        where: { dossierId: { in: dossierIds } },
      });

      const consultations = await tx.consultation.findMany({
        where: { dossierId: { in: dossierIds } },
        select: { id: true },
      });
      const consultationIds = consultations.map((c) => c.id);
      if (consultationIds.length > 0) {
        await tx.diagnostic.deleteMany({
          where: { consultationId: { in: consultationIds } },
        });
        await tx.prescriptionActe.deleteMany({
          where: { consultationId: { in: consultationIds } },
        });
        await tx.consultation.deleteMany({ where: { id: { in: consultationIds } } });
      }

      const factures = await tx.facture.findMany({
        where: { dossierId: { in: dossierIds } },
        select: { id: true },
      });
      const factureIds = factures.map((f) => f.id);
      if (factureIds.length > 0) {
        await tx.paiement.deleteMany({ where: { factureId: { in: factureIds } } });
        await tx.ligneFacture.deleteMany({ where: { factureId: { in: factureIds } } });
        await tx.facture.deleteMany({ where: { id: { in: factureIds } } });
      }

      const examens = await tx.examenLaboratoire.findMany({
        where: { dossierId: { in: dossierIds } },
        select: { id: true },
      });
      const examenIds = examens.map((e) => e.id);
      if (examenIds.length > 0) {
        await tx.resultatExamen.deleteMany({ where: { examenId: { in: examenIds } } });
        await tx.examenLaboratoire.deleteMany({ where: { id: { in: examenIds } } });
      }

      const ordonnances = await tx.ordonnance.findMany({
        where: { dossierId: { in: dossierIds } },
        select: { id: true },
      });
      const ordonnanceIds = ordonnances.map((o) => o.id);
      if (ordonnanceIds.length > 0) {
        await tx.delivrancePharmacie.deleteMany({
          where: { ordonnanceId: { in: ordonnanceIds } },
        });
        await tx.ligneOrdonnance.deleteMany({
          where: { ordonnanceId: { in: ordonnanceIds } },
        });
        await tx.ordonnance.deleteMany({ where: { id: { in: ordonnanceIds } } });
      }

      await tx.examenPrenuptial.deleteMany({ where: { dossierId: { in: dossierIds } } });
      await tx.admission.deleteMany({ where: { dossierId: { in: dossierIds } } });
      await tx.transfertRecuperation.deleteMany({
        where: { dossierId: { in: dossierIds } },
      });
      await tx.dossierPatient.deleteMany({ where: { id: { in: dossierIds } } });
    }

    await tx.transfertRecuperation.deleteMany({ where: { patientId: patient.id } });
    await tx.patient.delete({ where: { id: patient.id } });
  });

  await supprimerPhotoSiLocale(patient.photoUrl);
}
