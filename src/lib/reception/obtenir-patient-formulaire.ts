import "server-only";
import { prisma } from "@/lib/prisma";
import type { DonneesFormulairePatient } from "@/lib/reception/types";

const CHAMPS_OBSERVATIONS: Record<string, keyof DonneesFormulairePatient> = {
  "Post-nom": "postNom",
  "État civil": "etatCivil",
  "Téléphone secondaire": "telephoneSecondaire",
  Profession: "profession",
  Employeur: "employeur",
  "N° pièce d'identité": "numeroPieceIdentite",
};

function parserObservations(observations: string | null | undefined): Partial<DonneesFormulairePatient> {
  if (!observations?.trim()) return {};

  const resultat: Partial<DonneesFormulairePatient> = {};
  const lignesLibres: string[] = [];

  for (const ligne of observations.split("\n")) {
    const sep = ligne.indexOf(" : ");
    if (sep === -1) {
      lignesLibres.push(ligne);
      continue;
    }

    const cle = ligne.slice(0, sep);
    const valeur = ligne.slice(sep + 3).trim();
    const champ = CHAMPS_OBSERVATIONS[cle];

    if (champ && valeur) {
      (resultat as Record<string, string>)[champ] = valeur;
    } else {
      lignesLibres.push(ligne);
    }
  }

  if (lignesLibres.length > 0) {
    resultat.observations = lignesLibres.join("\n");
  }

  return resultat;
}

function formaterDateNaissance(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function normaliserPaysFormulaire(pays: string | null | undefined): string {
  if (!pays || pays === "RD Congo") return "RDC";
  return pays;
}

function formaterDateEnregistrement(date: Date): string {
  return date.toLocaleDateString("fr-FR");
}

function formaterHeureEnregistrement(date: Date): string {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export async function obtenirPatientPourFormulaire(
  numeroPatient: string
): Promise<DonneesFormulairePatient | null> {
  const patient = await prisma.patient.findUnique({
    where: { numeroPatient },
    include: {
      dossiers: {
        where: {
          statut: { in: ["OUVERT", "EN_COURS"] },
          transferts: {
            none: { statut: { notIn: ["ANNULE", "REFUSE"] } },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          enregistrementsReception: { orderBy: { enregistreLe: "desc" }, take: 1 },
        },
      },
    },
  });

  if (!patient) return null;

  const dossier =
    patient.dossiers[0] ??
    (await prisma.dossierPatient.findFirst({
      where: { patientId: patient.id },
      orderBy: { createdAt: "desc" },
      include: {
        enregistrementsReception: { orderBy: { enregistreLe: "desc" }, take: 1 },
      },
    }));
  const enregistrement = dossier?.enregistrementsReception[0];
  const depuisObservations = parserObservations(enregistrement?.observations);
  const enregistreLe = enregistrement?.enregistreLe ?? dossier?.createdAt ?? patient.createdAt;

  return {
    numeroPatient: patient.numeroPatient,
    numeroEnregistrement: dossier?.numeroDossier ?? patient.numeroPatient,
    dossierId: dossier?.id,
    typeVisite: enregistrement?.typeVisite ?? "ancien",
    nom: patient.nom,
    prenom: patient.prenom,
    postNom: depuisObservations.postNom ?? "",
    sexe: patient.sexe === "MASCULIN" || patient.sexe === "FEMININ" ? patient.sexe : "FEMININ",
    dateNaissance: formaterDateNaissance(patient.dateNaissance),
    telephone: patient.telephone ?? "",
    telephoneSecondaire: depuisObservations.telephoneSecondaire ?? "",
    email: patient.email ?? "",
    etatCivil: depuisObservations.etatCivil ?? "",
    adresse: patient.adresse ?? "",
    commune: patient.province ?? "",
    ville: patient.ville ?? "Kinshasa",
    pays: normaliserPaysFormulaire(patient.pays),
    contactUrgence: patient.contactUrgence ?? "",
    telephoneUrgence: patient.telephoneUrgence ?? "",
    profession: depuisObservations.profession ?? "",
    employeur: depuisObservations.employeur ?? "",
    groupeSanguin: patient.groupeSanguin ?? "",
    assurance: enregistrement?.assurance ?? "",
    numeroAssurance: enregistrement?.numeroAssurance ?? "",
    numeroPieceIdentite: depuisObservations.numeroPieceIdentite ?? "",
    observations: depuisObservations.observations ?? "",
    dateEnregistrement: formaterDateEnregistrement(enregistreLe),
    heureEnregistrement: formaterHeureEnregistrement(enregistreLe),
    photoUrl: patient.photoUrl,
  };
}
