import "server-only";
import type { CodeSalle } from "@/generated/prisma/enums";
import { notifierSalle } from "@/lib/notifications/service-notifications";
import { metadonneesNotificationI18n } from "@/lib/notifications/cles-i18n";
import {
  lienFileSalle,
  lienMessagerieReception,
} from "@/lib/notifications/liens";

export async function evenementNouveauPatient(params: {
  patientId: string;
  numeroPatient: string;
  nom: string;
  prenom: string;
  dossierId: string;
}) {
  await notifierSalle("RECEPTION", {
    type: "NOUVEAU_PATIENT",
    titre: "Nouveau patient enregistré",
    message: `${params.prenom} ${params.nom} (${params.numeroPatient}) vient d'être enregistré.`,
    entite: "patient",
    entiteId: params.patientId,
    lien: `/sigh/reception/enregistres`,
    metadonnees: metadonneesNotificationI18n("NOUVEAU_PATIENT", {
      prenom: params.prenom,
      nom: params.nom,
      numero: params.numeroPatient,
      dossierId: params.dossierId,
    }),
  }).catch(console.error);
}

/**
 * Notifie la salle de destination qu'un transfert est en attente de confirmation (⋮).
 */
export async function evenementDemandeTransfert(params: {
  patientId: string;
  nom: string;
  prenom: string;
  numeroPatient: string;
  salleDestination: CodeSalle;
  transfertId: string;
}) {
  const lien = lienFileSalle(params.salleDestination);

  await notifierSalle(params.salleDestination, {
    type: "DEMANDE_TRANSFERT",
    titre: "Transfert en attente",
    message: `${params.prenom} ${params.nom} attend confirmation dans votre service.`,
    module: params.salleDestination,
    entite: "transfert",
    entiteId: params.transfertId,
    lien,
    metadonnees: metadonneesNotificationI18n("DEMANDE_TRANSFERT", {
      prenom: params.prenom,
      nom: params.nom,
      numero: params.numeroPatient,
      patientId: params.patientId,
    }),
  }).catch(console.error);
}

/**
 * Notifie la salle de destination qu'un patient y a été transféré (après confirmation).
 */
export async function evenementPatientTransfere(params: {
  patientId: string;
  nom: string;
  prenom: string;
  numeroPatient: string;
  salleDestination: CodeSalle;
  transfertId: string;
}) {
  const lien = lienFileSalle(params.salleDestination);

  await notifierSalle(params.salleDestination, {
    type: "PATIENT_TRANSFERE",
    titre: "Patient transféré",
    message: `${params.prenom} ${params.nom} a été orienté vers votre service.`,
    module: params.salleDestination,
    entite: "transfert",
    entiteId: params.transfertId,
    lien,
    metadonnees: metadonneesNotificationI18n("PATIENT_TRANSFERE", {
      prenom: params.prenom,
      nom: params.nom,
      numero: params.numeroPatient,
      patientId: params.patientId,
    }),
  }).catch(console.error);

  if (params.salleDestination === "INFIRMIERS") {
    await notifierSalle("INFIRMIERS", {
      type: "PATIENT_EN_ATTENTE",
      titre: "Patient en attente",
      message: `${params.prenom} ${params.nom} attend la prise des constantes.`,
      module: "INFIRMIERS",
      entite: "transfert",
      entiteId: params.transfertId,
      lien,
      metadonnees: metadonneesNotificationI18n("PATIENT_EN_ATTENTE", {
        prenom: params.prenom,
        nom: params.nom,
      }),
    }).catch(console.error);
  }
}

export async function evenementNouveauMessage(params: {
  destinataireIds: string[];
  expediteurNom: string;
  conversationId: string;
  apercu: string;
}) {
  const { creerNotification } = await import("@/lib/notifications/service-notifications");
  const apercu = params.apercu.slice(0, 120);
  await Promise.all(
    params.destinataireIds.map((utilisateurId) =>
      creerNotification({
        utilisateurId,
        type: "NOUVEAU_MESSAGE",
        titre: "Nouveau message",
        message: `${params.expediteurNom} : ${apercu}`,
        lien: lienMessagerieReception(params.conversationId),
        metadonnees: metadonneesNotificationI18n("NOUVEAU_MESSAGE", {
          expediteur: params.expediteurNom,
          apercu,
        }),
      }).catch(console.error)
    )
  );
}
