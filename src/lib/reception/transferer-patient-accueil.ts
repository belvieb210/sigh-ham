import "server-only";
import type { CodeSalle, Prisma, Sexe, StatutTransfert } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  genererNumeroEnregistrementVisite,
  genererNumerosPatient,
} from "@/lib/reception/numeros";
import {
  parserDonneesEnregistrement,
  validerDonneesEnregistrement,
} from "@/lib/reception/enregistrer-patient";
import type {
  DonneesEnregistrementPatient,
  DonneesTransfertAccueil,
  ResultatTransfertAccueil,
} from "@/lib/reception/types";

/** Salles disponibles via orientation rapide / transfert manuel */
export const ORIENTATIONS_TRANSFERT_RAPIDE: CodeSalle[] = [
  "INFIRMIERS",
  "MEDECINS",
  "CAISSE",
  "LABORATOIRE",
  "PHARMACIE",
  "HOSPITALISATION",
  "EGLISE",
  "MEDECINS_EXTERNES",
];

const ORIENTATIONS_VALIDES: CodeSalle[] = [
  "INFIRMIERS",
  "MEDECINS",
  "CAISSE",
  "LABORATOIRE",
  "PHARMACIE",
  "HOSPITALISATION",
  "EGLISE",
  "MEDECINS_EXTERNES",
];

const LIBELLES_MOTIF: Record<string, string> = {
  consultation: "Consultation générale",
  analyses: "Analyses de laboratoire",
  urgence: "Urgence",
  rdv: "Rendez-vous programmé",
  prenuptial: "Examen prénuptial",
};

function normaliserPays(pays?: string): string {
  if (!pays || pays === "RDC") return "RD Congo";
  return pays;
}

function libelleMotifVisite(
  motifPrincipal: string,
  motifAutreTexte?: string
): string {
  if (motifPrincipal === "autre") {
    return motifAutreTexte?.trim() || "Autre";
  }
  return LIBELLES_MOTIF[motifPrincipal] ?? motifPrincipal;
}

function donneesPatientDepuisFormulaire(donnees: DonneesEnregistrementPatient) {
  return {
    nom: donnees.nom.trim().toUpperCase(),
    prenom: donnees.prenom.trim(),
    sexe: donnees.sexe as Sexe,
    dateNaissance: new Date(donnees.dateNaissance),
    telephone: donnees.telephone?.trim(),
    email: donnees.email?.trim() || null,
    adresse: donnees.adresse?.trim(),
    ville: donnees.ville?.trim() || null,
    province: donnees.commune?.trim() || null,
    pays: normaliserPays(donnees.pays),
    groupeSanguin:
      donnees.groupeSanguin?.trim() &&
      donnees.groupeSanguin !== "Inconnu" &&
      donnees.groupeSanguin !== ""
        ? donnees.groupeSanguin
        : null,
    contactUrgence: donnees.contactUrgence?.trim() || null,
    telephoneUrgence: donnees.telephoneUrgence?.trim() || null,
  };
}

function construireObservationsEnregistrement(
  donnees: DonneesEnregistrementPatient,
  descriptionMotif?: string
): string | null {
  const lignes: string[] = [];

  if (descriptionMotif?.trim()) {
    lignes.push(`Description du motif : ${descriptionMotif.trim()}`);
  }
  if (donnees.postNom?.trim()) lignes.push(`Post-nom : ${donnees.postNom.trim()}`);
  if (donnees.etatCivil?.trim()) lignes.push(`État civil : ${donnees.etatCivil.trim()}`);
  if (donnees.telephoneSecondaire?.trim()) {
    lignes.push(`Téléphone secondaire : ${donnees.telephoneSecondaire.trim()}`);
  }
  if (donnees.profession?.trim()) lignes.push(`Profession : ${donnees.profession.trim()}`);
  if (donnees.employeur?.trim()) lignes.push(`Employeur : ${donnees.employeur.trim()}`);
  if (donnees.numeroPieceIdentite?.trim()) {
    lignes.push(`N° pièce d'identité : ${donnees.numeroPieceIdentite.trim()}`);
  }
  if (donnees.observations?.trim()) lignes.push(donnees.observations.trim());

  return lignes.length > 0 ? lignes.join("\n") : null;
}

export function parserDonneesTransfert(body: unknown): Partial<DonneesTransfertAccueil> {
  if (!body || typeof body !== "object") return {};

  const b = body as Record<string, unknown>;
  const base = parserDonneesEnregistrement(body);

  return {
    ...base,
    numeroPatient: String(b.numeroPatient ?? "").trim() || undefined,
    dossierId: String(b.dossierId ?? "").trim() || undefined,
    orientation: String(b.orientation ?? "").trim(),
    motifPrincipal: String(b.motifPrincipal ?? "").trim(),
    motifAutreTexte: String(b.motifAutreTexte ?? "").trim() || undefined,
    descriptionMotif: String(b.descriptionMotif ?? "").trim() || undefined,
    examensIds: Array.isArray(b.examensIds)
      ? b.examensIds.map((id) => String(id))
      : [],
    medecinResponsable: String(b.medecinResponsable ?? "").trim(),
    estEstimation: b.estEstimation === true,
    remise: Math.max(0, Number(b.remise) || 0),
    transfertManuel: b.transfertManuel === true,
  };
}

export function parserDonneesTransfertManuel(body: unknown): Partial<DonneesTransfertAccueil> {
  if (!body || typeof body !== "object") return { transfertManuel: true };

  const b = body as Record<string, unknown>;
  return {
    numeroPatient: String(b.numeroPatient ?? "").trim() || undefined,
    dossierId: String(b.dossierId ?? "").trim() || undefined,
    orientation: String(b.orientation ?? "").trim(),
    transfertManuel: true,
    examensIds: [],
  };
}

export function validerDonneesTransfertManuel(
  donnees: Partial<DonneesTransfertAccueil>
): string | null {
  if (!donnees.numeroPatient?.trim()) {
    return "Sélectionnez un patient avant d'effectuer un transfert manuel.";
  }

  if (!donnees.orientation?.trim()) {
    return "Veuillez sélectionner une salle de destination.";
  }

  if (!ORIENTATIONS_TRANSFERT_RAPIDE.includes(donnees.orientation as CodeSalle)) {
    return "Salle de destination invalide.";
  }

  return null;
}

export function validerDonneesTransfert(
  donnees: Partial<DonneesTransfertAccueil>
): string | null {
  const erreurPatient = validerDonneesEnregistrement(donnees);
  if (erreurPatient) return erreurPatient;

  if (!donnees.orientation?.trim()) {
    return "Veuillez sélectionner une salle de destination.";
  }

  if (!ORIENTATIONS_VALIDES.includes(donnees.orientation as CodeSalle)) {
    return "Salle de destination invalide.";
  }

  if (!donnees.motifPrincipal?.trim()) {
    return "Le motif principal de visite est obligatoire.";
  }

  if (donnees.motifPrincipal === "autre" && !donnees.motifAutreTexte?.trim()) {
    return "Veuillez préciser le motif de visite.";
  }

  if (!donnees.medecinResponsable?.trim()) {
    return "Le médecin responsable est obligatoire.";
  }

  if (donnees.remise != null && (Number.isNaN(donnees.remise) || donnees.remise < 0)) {
    return "La remise ne peut pas être négative.";
  }

  return null;
}

async function chargerDonneesPatientPourTransfertManuel(
  numeroPatient: string
): Promise<Omit<DonneesTransfertAccueil, "orientation" | "dossierId">> {
  const patient = await prisma.patient.findUnique({ where: { numeroPatient } });
  if (!patient) throw new Error("Patient introuvable.");

  return {
    numeroPatient: patient.numeroPatient,
    typeVisite: "ancien",
    nom: patient.nom,
    prenom: patient.prenom,
    sexe: patient.sexe === "MASCULIN" || patient.sexe === "FEMININ" ? patient.sexe : "FEMININ",
    dateNaissance: patient.dateNaissance
      ? patient.dateNaissance.toISOString().slice(0, 10)
      : "2000-01-01",
    telephone: patient.telephone ?? "—",
    adresse: patient.adresse ?? "—",
    ville: patient.ville ?? "Kinshasa",
    pays: patient.pays ?? "RD Congo",
    examensIds: [],
    transfertManuel: true,
  };
}

export async function transfererPatientManuel(
  agentId: string,
  donnees: Pick<DonneesTransfertAccueil, "numeroPatient" | "dossierId" | "orientation">
): Promise<ResultatTransfertAccueil> {
  const erreur = validerDonneesTransfertManuel(donnees);
  if (erreur) throw new Error(erreur);

  if (!donnees.numeroPatient) throw new Error("Patient introuvable.");

  const donneesPatient = await chargerDonneesPatientPourTransfertManuel(donnees.numeroPatient);

  return transfererPatientAccueil(agentId, {
    ...donneesPatient,
    dossierId: donnees.dossierId,
    orientation: donnees.orientation,
  });
}

const STATUTS_TRANSFERT_INACTIFS: StatutTransfert[] = ["ANNULE", "REFUSE"];

async function trouverDossierReutilisable(
  tx: Prisma.TransactionClient,
  patientId: string,
  dossierId?: string
) {
  const include = {
    passages: { orderBy: { createdAt: "desc" as const }, take: 1 },
    enregistrementsReception: { orderBy: { enregistreLe: "desc" as const }, take: 1 },
    transferts: {
      where: { statut: { notIn: STATUTS_TRANSFERT_INACTIFS } },
      select: { id: true },
      take: 1,
    },
  };

  if (dossierId) {
    const dossier = await tx.dossierPatient.findFirst({
      where: {
        id: dossierId,
        patientId,
        statut: { in: ["OUVERT", "EN_COURS"] },
      },
      include,
    });

    if (!dossier) return null;
    if (dossier.transferts.length > 0) {
      throw new Error(
        "Ce transfert est déjà confirmé : l'orientation rapide ne peut plus être appliquée."
      );
    }
    return dossier;
  }

  return tx.dossierPatient.findFirst({
    where: {
      patientId,
      statut: { in: ["OUVERT", "EN_COURS"] },
      transferts: {
        none: { statut: { notIn: STATUTS_TRANSFERT_INACTIFS } },
      },
    },
    orderBy: { createdAt: "desc" },
    include,
  });
}

async function prescrireExamensInitiaux(
  tx: Prisma.TransactionClient,
  dossierId: string,
  agentId: string,
  idsExamens: string[],
  estEstimation: boolean
) {
  if (idsExamens.length === 0) return 0;

  const typesExamens = await tx.typeExamen.findMany({
    where: { id: { in: idsExamens }, actif: true },
    select: { id: true },
  });

  if (typesExamens.length !== idsExamens.length) {
    throw new Error("Un ou plusieurs examens sélectionnés sont invalides.");
  }

  const noteExamen = estEstimation
    ? "Prescrit à la réception — estimation"
    : "Prescrit à la réception — examens initiaux";

  const dejaPrescrits = await tx.examenLaboratoire.findMany({
    where: { dossierId, typeExamenId: { in: idsExamens } },
    select: { typeExamenId: true },
  });
  const idsDejaPrescrits = new Set(dejaPrescrits.map((e) => e.typeExamenId));
  const nouveaux = typesExamens.filter((type) => !idsDejaPrescrits.has(type.id));

  if (nouveaux.length > 0) {
    await tx.examenLaboratoire.createMany({
      data: nouveaux.map((type) => ({
        dossierId,
        typeExamenId: type.id,
        prescripteurId: agentId,
        statut: "PRESCRIT" as const,
        notes: noteExamen,
      })),
    });
  }

  return nouveaux.length;
}

function donneesEnregistrementDepuisTransfert(
  donnees: DonneesTransfertAccueil,
  manuel: boolean
) {
  return {
    typeVisite: donnees.typeVisite || (donnees.numeroPatient ? "ancien" : "nouveau"),
    assurance:
      donnees.assurance?.trim() &&
      donnees.assurance !== "Aucune" &&
      donnees.assurance !== ""
        ? donnees.assurance
        : null,
    numeroAssurance: donnees.numeroAssurance?.trim() || null,
    observations: manuel
      ? construireObservationsEnregistrement(donnees)
      : construireObservationsEnregistrement(donnees, donnees.descriptionMotif),
    medecinResponsable: donnees.medecinResponsable?.trim() ?? "",
    estEstimation: donnees.estEstimation ?? false,
    remise: Math.max(0, Number(donnees.remise) || 0),
  };
}

export async function transfererPatientAccueil(
  agentId: string,
  donnees: DonneesTransfertAccueil
): Promise<ResultatTransfertAccueil> {
  const manuel = donnees.transfertManuel === true;
  const erreur = manuel
    ? validerDonneesTransfertManuel(donnees)
    : validerDonneesTransfert(donnees);
  if (erreur) throw new Error(erreur);

  const motifVisite = manuel
    ? "Transfert manuel"
    : libelleMotifVisite(donnees.motifPrincipal!, donnees.motifAutreTexte);
  const idsExamens = manuel ? [] : [...new Set(donnees.examensIds ?? [])];

  const resultat = await prisma.$transaction(async (tx) => {
    const [salleReception, salleDestination] = await Promise.all([
      tx.salle.findUnique({ where: { code: "RECEPTION" } }),
      tx.salle.findUnique({ where: { code: donnees.orientation as CodeSalle } }),
    ]);

    if (!salleReception || !salleDestination) {
      throw new Error("Configuration des salles incomplète.");
    }

    let patientId: string;
    let numeroPatient: string;

    if (donnees.numeroPatient) {
      const existant = await tx.patient.findUnique({
        where: { numeroPatient: donnees.numeroPatient },
      });
      if (!existant) throw new Error("Patient introuvable.");

      const misAJour = await tx.patient.update({
        where: { id: existant.id },
        data: donneesPatientDepuisFormulaire(donnees),
      });
      patientId = misAJour.id;
      numeroPatient = misAJour.numeroPatient;

      if (manuel) {
        const dossierAvecTransfert = await tx.dossierPatient.findFirst({
          where: {
            patientId,
            statut: { in: ["OUVERT", "EN_COURS"] },
            transferts: {
              some: {
                statut: "EN_ATTENTE",
                salleOrigine: { code: "RECEPTION" },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          include: {
            transferts: {
              where: {
                statut: "EN_ATTENTE",
                salleOrigine: { code: "RECEPTION" },
              },
              include: { salleOrigine: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        });

        const transfertEnAttente = dossierAvecTransfert?.transferts[0];
        if (dossierAvecTransfert && transfertEnAttente) {
          await tx.transfert.update({
            where: { id: transfertEnAttente.id },
            data: {
              salleDestinationId: salleDestination.id,
              motif: "Transfert manuel",
            },
          });

          if (transfertEnAttente.passageId) {
            await tx.passage.update({
              where: { id: transfertEnAttente.passageId },
              data: { motif: `Transfert vers ${salleDestination.nom}` },
            });
          }

          await tx.dossierPatient.update({
            where: { id: dossierAvecTransfert.id },
            data: { motifOuverture: "Transfert manuel" },
          });

          return {
            transfertId: transfertEnAttente.id,
            patientId,
            dossierId: dossierAvecTransfert.id,
            numeroPatient,
            numeroEnregistrement: dossierAvecTransfert.numeroDossier,
            salleDestination: salleDestination.nom,
            examensPrescrits: 0,
            transfertMisAJour: true,
          };
        }
      }
    } else {
      const numeros = await genererNumerosPatient(tx);
      numeroPatient = numeros.numeroPatient;

      const cree = await tx.patient.create({
        data: {
          numeroPatient,
          ...donneesPatientDepuisFormulaire(donnees),
        },
      });
      patientId = cree.id;
    }

    const dossierExistant = donnees.numeroPatient
      ? await trouverDossierReutilisable(tx, patientId, donnees.dossierId)
      : null;

    let dossierId: string;
    let numeroEnregistrement: string;
    let passageId: string;

    if (dossierExistant) {
      const dossierMisAJour = await tx.dossierPatient.update({
        where: { id: dossierExistant.id },
        data: {
          statut: "EN_COURS",
          motifOuverture: motifVisite,
        },
      });
      dossierId = dossierMisAJour.id;
      numeroEnregistrement = dossierMisAJour.numeroDossier;

      const enregistrement = dossierExistant.enregistrementsReception[0];
      const donneesEnregistrement = donneesEnregistrementDepuisTransfert(donnees, manuel);

      if (enregistrement) {
        await tx.enregistrementReception.update({
          where: { id: enregistrement.id },
          data: donneesEnregistrement,
        });
      } else {
        await tx.enregistrementReception.create({
          data: {
            dossierId,
            agentId,
            ...donneesEnregistrement,
          },
        });
      }

      const passageExistant = dossierExistant.passages[0];
      if (passageExistant && passageExistant.statut !== "ANNULE") {
        const passageMisAJour = await tx.passage.update({
          where: { id: passageExistant.id },
          data: {
            statut: "EN_ATTENTE",
            motif: `Transfert vers ${salleDestination.nom}`,
          },
        });
        passageId = passageMisAJour.id;
      } else {
        const passage = await tx.passage.create({
          data: {
            dossierId,
            statut: "EN_ATTENTE",
            motif: `Transfert vers ${salleDestination.nom}`,
          },
        });
        passageId = passage.id;
      }
    } else {
      numeroEnregistrement = await genererNumeroEnregistrementVisite(tx);

      const dossier = await tx.dossierPatient.create({
        data: {
          numeroDossier: numeroEnregistrement,
          patientId,
          statut: "EN_COURS",
          motifOuverture: motifVisite,
        },
      });
      dossierId = dossier.id;

      const passage = await tx.passage.create({
        data: {
          dossierId,
          statut: "EN_ATTENTE",
          motif: `Transfert vers ${salleDestination.nom}`,
        },
      });
      passageId = passage.id;

      await tx.enregistrementReception.create({
        data: {
          dossierId,
          agentId,
          ...donneesEnregistrementDepuisTransfert(donnees, manuel),
        },
      });
    }

    const examensPrescrits = await prescrireExamensInitiaux(
      tx,
      dossierId,
      agentId,
      idsExamens,
      donnees.estEstimation ?? false
    );

    const transfert = await tx.transfert.create({
      data: {
        dossierId,
        passageId,
        salleOrigineId: salleReception.id,
        salleDestinationId: salleDestination.id,
        statut: "EN_ATTENTE",
        motif: manuel ? "Transfert manuel" : motifVisite,
        notes: manuel ? null : donnees.descriptionMotif?.trim() || null,
        emetteurId: agentId,
      },
    });

    return {
      transfertId: transfert.id,
      patientId,
      dossierId,
      numeroPatient,
      numeroEnregistrement,
      salleDestination: salleDestination.nom,
      examensPrescrits,
    };
  });

  return resultat;
}
