import "server-only";
import { prisma } from "@/lib/prisma";
import {
  champsIdentitePatientPrisma,
  construireObservations,
  validerDonneesEnregistrement,
} from "@/lib/reception/enregistrer-patient";
import type {
  DonneesEnregistrementPatient,
  ResultatEnregistrementPatient,
} from "@/lib/reception/types";

export async function mettreAJourPatient(
  numeroPatient: string,
  agentId: string,
  donnees: DonneesEnregistrementPatient,
  photo?: File | null
): Promise<ResultatEnregistrementPatient> {
  const erreur = validerDonneesEnregistrement(donnees);
  if (erreur) throw new Error(erreur);

  const patientExistant = await prisma.patient.findUnique({
    where: { numeroPatient },
    select: {
      id: true,
      numeroPatient: true,
      dossiers: {
        orderBy: { ouvertLe: "desc" },
        take: 1,
        select: {
          id: true,
          numeroDossier: true,
          enregistrementsReception: {
            orderBy: { enregistreLe: "desc" },
            take: 1,
            select: { id: true },
          },
        },
      },
    },
  });

  if (!patientExistant) {
    throw new Error("Patient introuvable.");
  }

  const dossier = patientExistant.dossiers[0];
  if (!dossier) {
    throw new Error("Aucun dossier associé à ce patient.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.patient.update({
      where: { id: patientExistant.id },
      data: champsIdentitePatientPrisma(donnees),
    });

    const enregistrementId = dossier.enregistrementsReception[0]?.id;
    const dataEnregistrement = {
      typeVisite: donnees.typeVisite || "nouveau",
      assurance:
        donnees.assurance?.trim() &&
        donnees.assurance !== "Aucune" &&
        donnees.assurance !== ""
          ? donnees.assurance
          : null,
      numeroAssurance: donnees.numeroAssurance?.trim() || null,
      observations: construireObservations(donnees),
    };

    if (enregistrementId) {
      await tx.enregistrementReception.update({
        where: { id: enregistrementId },
        data: dataEnregistrement,
      });
    } else {
      await tx.enregistrementReception.create({
        data: {
          dossierId: dossier.id,
          agentId,
          ...dataEnregistrement,
        },
      });
    }
  });

  if (photo) {
    const { sauvegarderPhotoPatient } = await import("@/lib/reception/photo-patient");
    const photoUrl = await sauvegarderPhotoPatient(patientExistant.numeroPatient, photo);
    await prisma.patient.update({
      where: { id: patientExistant.id },
      data: { photoUrl },
    });
  }

  return {
    patientId: patientExistant.id,
    dossierId: dossier.id,
    numeroPatient: patientExistant.numeroPatient,
    numeroEnregistrement: dossier.numeroDossier,
  };
}
