import "server-only";
import { Sexe } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { genererNumerosPatient } from "@/lib/reception/numeros";
import {
  construireObservations,
  validerDonneesEnregistrement,
} from "@/lib/reception/enregistrer-patient";
import type { DonneesEnregistrementPatient } from "@/lib/reception/types";

/**
 * Enregistre un patient pour un médecin externe :
 * Patient.medecinExterneId + dossier + passage + file MEDECINS_EXTERNES
 */
export async function enregistrerPatientMedecinExterne(
  agentId: string,
  medecinExterneId: string,
  donnees: DonneesEnregistrementPatient,
  photo?: File | null
) {
  const erreur = validerDonneesEnregistrement(donnees);
  if (erreur) throw new Error(erreur);

  const salle = await prisma.salle.findUnique({
    where: { code: "MEDECINS_EXTERNES" },
  });
  if (!salle) throw new Error("Salle médecins externes introuvable.");

  const resultat = await prisma.$transaction(async (tx) => {
    const { numeroPatient, numeroEnregistrement } =
      await genererNumerosPatient(tx);

    const patient = await tx.patient.create({
      data: {
        numeroPatient,
        nom: donnees.nom.trim().toUpperCase(),
        prenom: donnees.prenom.trim(),
        sexe: donnees.sexe as Sexe,
        dateNaissance: new Date(donnees.dateNaissance),
        telephone: donnees.telephone?.trim(),
        email: donnees.email?.trim() || null,
        adresse: donnees.adresse?.trim(),
        ville: donnees.ville?.trim() || null,
        province: donnees.commune?.trim() || null,
        pays:
          !donnees.pays || donnees.pays === "RDC"
            ? "RD Congo"
            : donnees.pays.trim(),
        groupeSanguin:
          donnees.groupeSanguin?.trim() &&
          donnees.groupeSanguin !== "Inconnu" &&
          donnees.groupeSanguin !== ""
            ? donnees.groupeSanguin
            : null,
        contactUrgence: donnees.contactUrgence?.trim() || null,
        telephoneUrgence: donnees.telephoneUrgence?.trim() || null,
        medecinExterneId,
      },
    });

    const dossier = await tx.dossierPatient.create({
      data: {
        numeroDossier: numeroEnregistrement,
        patientId: patient.id,
        statut: "OUVERT",
        motifOuverture: "Enregistrement médecin externe",
        salleEnregistrement: "MEDECINS_EXTERNES",
      },
    });

    const passage = await tx.passage.create({
      data: {
        dossierId: dossier.id,
        statut: "EN_ATTENTE",
        motif: "Patient enregistré par médecin externe",
      },
    });

    const maxOrdre = await tx.fileAttente.aggregate({
      where: { salleId: salle.id, serviLe: null },
      _max: { numeroOrdre: true },
    });

    await tx.fileAttente.create({
      data: {
        passageId: passage.id,
        salleId: salle.id,
        numeroOrdre: (maxOrdre._max.numeroOrdre ?? 0) + 1,
      },
    });

    await tx.enregistrementReception.create({
      data: {
        dossierId: dossier.id,
        agentId,
        typeVisite: donnees.typeVisite || "nouveau",
        assurance:
          donnees.assurance?.trim() &&
          donnees.assurance !== "Aucune" &&
          donnees.assurance !== ""
            ? donnees.assurance
            : null,
        numeroAssurance: donnees.numeroAssurance?.trim() || null,
        observations: construireObservations(donnees),
      },
    });

    return {
      patientId: patient.id,
      dossierId: dossier.id,
      numeroPatient,
      numeroEnregistrement,
    };
  });

  if (photo) {
    const { sauvegarderPhotoPatient } = await import(
      "@/lib/reception/photo-patient"
    );
    const photoUrl = await sauvegarderPhotoPatient(
      resultat.numeroPatient,
      photo
    );
    await prisma.patient.update({
      where: { id: resultat.patientId },
      data: { photoUrl },
    });
  }

  return resultat;
}
