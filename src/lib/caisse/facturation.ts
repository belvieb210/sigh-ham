import "server-only";
import type { CodeSalle, ModePaiement, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { genererNumeroFacture } from "@/lib/caisse/numeros";
import type {
  DestinationApresEncaissement,
  DossierFacturationCaisse,
  EncaissementResumeJour,
  FactureResumeJour,
  ModeFactureCaisse,
} from "@/lib/caisse/types";

function decimalVersNombre(valeur: { toNumber?: () => number } | number | string): number {
  if (typeof valeur === "number") return valeur;
  if (typeof valeur === "string") return Number.parseFloat(valeur) || 0;
  if (valeur && typeof valeur.toNumber === "function") return valeur.toNumber();
  return Number(valeur) || 0;
}

function formaterCaissier(prenom: string, nom: string) {
  return `${prenom} ${nom}`.trim();
}

async function inscrireFileAttenteDestination(
  tx: Prisma.TransactionClient,
  passageId: string,
  salleDestinationId: string
) {
  const existante = await tx.fileAttente.findUnique({ where: { passageId } });
  if (existante) {
    return tx.fileAttente.update({
      where: { passageId },
      data: {
        salleId: salleDestinationId,
        serviLe: null,
        arriveLe: new Date(),
      },
    });
  }

  const ordreMax = await tx.fileAttente.aggregate({
    where: { salleId: salleDestinationId },
    _max: { numeroOrdre: true },
  });

  return tx.fileAttente.create({
    data: {
      salleId: salleDestinationId,
      passageId,
      numeroOrdre: (ordreMax._max.numeroOrdre ?? 0) + 1,
    },
  });
}

export async function obtenirDossierFacturation(
  dossierId: string
): Promise<DossierFacturationCaisse | null> {
  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    include: {
      patient: true,
      examensLaboratoire: {
        where: { statut: { not: "ANNULE" } },
        include: { typeExamen: true },
        orderBy: { createdAt: "asc" },
      },
      factures: {
        orderBy: { createdAt: "desc" },
        include: {
          lignes: true,
          paiements: {
            orderBy: { payeLe: "desc" },
            include: { caissier: { select: { prenom: true, nom: true } } },
          },
        },
      },
      passages: {
        where: { statut: { not: "ANNULE" } },
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          fileAttente: { include: { salle: true } },
          transferts: {
            where: {
              salleDestination: { code: "CAISSE" },
              statut: { in: ["ACCEPTE", "EN_TRAITEMENT", "TERMINE"] },
            },
            orderBy: { emisLe: "desc" },
            take: 1,
            include: {
              emetteur: { select: { prenom: true, nom: true } },
            },
          },
        },
      },
      enregistrementsReception: {
        orderBy: { enregistreLe: "desc" },
        take: 1,
        select: { remise: true },
      },
    },
  });

  if (!dossier) return null;

  const passage = dossier.passages[0] ?? null;
  const fileAttente =
    passage?.fileAttente?.salle.code === "CAISSE" && !passage.fileAttente.serviLe
      ? passage.fileAttente
      : null;
  const transfert = passage?.transferts[0] ?? null;
  const facture =
    dossier.factures.find((f) => f.statut !== "ANNULEE" && f.statut !== "PAYEE") ??
    dossier.factures[0] ??
    null;

  const lignesExamens = dossier.examensLaboratoire.map((ex) => ({
    id: ex.id,
    libelle: ex.typeExamen.libelle,
    quantite: 1,
    prixUnitaire: decimalVersNombre(ex.typeExamen.prix),
    montant: decimalVersNombre(ex.typeExamen.prix),
    source: "EXAMEN" as const,
  }));

  const lignesFacture =
    facture?.lignes.map((l) => ({
      id: l.id,
      libelle: l.libelle,
      quantite: l.quantite,
      prixUnitaire: decimalVersNombre(l.prixUnitaire),
      montant: decimalVersNombre(l.montant),
      source: "FACTURE" as const,
    })) ?? [];

  const lignes = lignesFacture.length > 0 ? lignesFacture : lignesExamens;
  const montantTotal =
    facture != null
      ? decimalVersNombre(facture.montantTotal)
      : lignes.reduce((acc, l) => acc + l.montant, 0);

  let statutAttente: DossierFacturationCaisse["statutAttente"] = "HORS_FILE";
  if (fileAttente) statutAttente = "EN_ATTENTE_PAIEMENT";
  else if (facture?.statut === "PAYEE") statutAttente = "PAYE";

  const historiquePaiements = dossier.factures.flatMap((f) =>
    f.paiements.map((p) => {
      const modeFacture =
        p.reference
          ?.split("|")
          .find((part) => part.startsWith("modeFacture="))
          ?.replace("modeFacture=", "") ?? null;
      return {
        id: p.id,
        numeroRecu: f.numeroFacture.replace(/^FAC-/, "REC-"),
        montant: decimalVersNombre(p.montant),
        mode: p.mode,
        typeFacture: modeFacture,
        reference: p.reference,
        payeLe: p.payeLe.toISOString(),
        caissier: formaterCaissier(p.caissier.prenom, p.caissier.nom),
        statut:
          f.statut === "PAYEE" || decimalVersNombre(p.montant) > 0
            ? ("PAYE" as const)
            : ("PARTIEL" as const),
      };
    })
  );

  const remiseProposee = decimalVersNombre(
    dossier.enregistrementsReception[0]?.remise ?? 0
  );

  return {
    dossierId: dossier.id,
    numeroPatient: dossier.patient.numeroPatient,
    numeroDossier: dossier.numeroDossier,
    prenom: dossier.patient.prenom,
    nom: dossier.patient.nom,
    telephone: dossier.patient.telephone,
    sexe: dossier.patient.sexe ?? null,
    dateNaissance: dossier.patient.dateNaissance?.toISOString() ?? null,
    statutAttente,
    fileAttenteId: fileAttente?.id ?? null,
    transfertId: transfert?.id ?? null,
    recuLe:
      fileAttente?.arriveLe.toISOString() ??
      transfert?.accepteLe?.toISOString() ??
      transfert?.emisLe.toISOString() ??
      null,
    transferePar: transfert?.emetteur
      ? formaterCaissier(transfert.emetteur.prenom, transfert.emetteur.nom)
      : null,
    remiseProposee,
    idsTypesExamen: dossier.examensLaboratoire.map((ex) => ex.typeExamenId),
    facture: {
      id: facture?.id ?? null,
      numeroFacture: facture?.numeroFacture ?? null,
      statut: facture?.statut ?? null,
      montantTotal,
      montantPaye: facture ? decimalVersNombre(facture.montantPaye) : 0,
      devise: facture?.devise ?? "USD",
      lignes,
      historiquePaiements,
    },
  };
}

export async function preparerFactureDossier(dossierId: string) {
  const detail = await obtenirDossierFacturation(dossierId);
  if (!detail) throw new Error("Dossier introuvable.");

  if (detail.facture.id && detail.facture.statut !== "ANNULEE") {
    return detail;
  }

  if (detail.facture.lignes.length === 0) {
    throw new Error("Aucune prestation facturable pour ce dossier.");
  }

  const facture = await prisma.$transaction(async (tx) => {
    const numeroFacture = await genererNumeroFacture(tx);
    const montantTotal = detail.facture.lignes.reduce((acc, l) => acc + l.montant, 0);

    return tx.facture.create({
      data: {
        numeroFacture,
        dossierId,
        statut: "EMISE",
        montantTotal,
        montantPaye: 0,
        devise: "CDF",
        emiseLe: new Date(),
        lignes: {
          create: detail.facture.lignes.map((l) => ({
            libelle: l.libelle,
            quantite: l.quantite,
            prixUnitaire: l.prixUnitaire,
            montant: l.montant,
          })),
        },
      },
    });
  });

  return obtenirDossierFacturation(facture.dossierId);
}

/** Ajoute un type d'examen au dossier (prescription) et à la facture ouverte si elle existe. */
export async function ajouterExamenAuDossierCaisse(
  dossierId: string,
  typeExamenId: string,
  agentId: string
) {
  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    select: { id: true },
  });
  if (!dossier) throw new Error("Dossier introuvable.");

  const typeExamen = await prisma.typeExamen.findFirst({
    where: { id: typeExamenId, actif: true },
  });
  if (!typeExamen) throw new Error("Examen introuvable ou inactif.");

  const deja = await prisma.examenLaboratoire.findFirst({
    where: {
      dossierId,
      typeExamenId,
      statut: { not: "ANNULE" },
    },
    select: { id: true },
  });
  if (deja) throw new Error("Cet examen est déjà prescrit pour ce dossier.");

  const prix = decimalVersNombre(typeExamen.prix);

  await prisma.$transaction(async (tx) => {
    await tx.examenLaboratoire.create({
      data: {
        dossierId,
        typeExamenId,
        prescripteurId: agentId,
        statut: "PRESCRIT",
        notes: "Ajouté à la caisse",
      },
    });

    const facture = await tx.facture.findFirst({
      where: {
        dossierId,
        statut: { in: ["BROUILLON", "EMISE", "PARTIELLEMENT_PAYEE"] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (facture) {
      await tx.ligneFacture.create({
        data: {
          factureId: facture.id,
          libelle: typeExamen.libelle,
          quantite: 1,
          prixUnitaire: prix,
          montant: prix,
        },
      });
      await tx.facture.update({
        where: { id: facture.id },
        data: {
          montantTotal: { increment: prix },
        },
      });
    }
  });

  const detail = await obtenirDossierFacturation(dossierId);
  if (!detail) throw new Error("Dossier introuvable après ajout.");
  return detail;
}

/** Retire une ligne d'examen de la facturation (annule la prescription + ligne facture). */
export async function retirerLigneFacturationCaisse(
  dossierId: string,
  ligneId: string,
  source: "EXAMEN" | "FACTURE"
) {
  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    select: { id: true },
  });
  if (!dossier) throw new Error("Dossier introuvable.");

  const factureOuverte = await prisma.facture.findFirst({
    where: {
      dossierId,
      statut: { in: ["BROUILLON", "EMISE", "PARTIELLEMENT_PAYEE"] },
    },
    orderBy: { createdAt: "desc" },
  });

  if (source === "EXAMEN") {
    const examen = await prisma.examenLaboratoire.findFirst({
      where: { id: ligneId, dossierId, statut: { not: "ANNULE" } },
      include: { typeExamen: true },
    });
    if (!examen) throw new Error("Examen introuvable.");

    await prisma.$transaction(async (tx) => {
      await tx.examenLaboratoire.update({
        where: { id: examen.id },
        data: { statut: "ANNULE" },
      });

      if (factureOuverte) {
        const ligne = await tx.ligneFacture.findFirst({
          where: {
            factureId: factureOuverte.id,
            libelle: examen.typeExamen.libelle,
            montant: { gt: 0 },
          },
          orderBy: { id: "asc" },
        });
        if (ligne) {
          const montantLigne = decimalVersNombre(ligne.montant);
          await tx.ligneFacture.delete({ where: { id: ligne.id } });
          await tx.facture.update({
            where: { id: factureOuverte.id },
            data: { montantTotal: { decrement: montantLigne } },
          });
        }
      }
    });
  } else {
    const ligne = await prisma.ligneFacture.findFirst({
      where: { id: ligneId, facture: { dossierId } },
      include: { facture: true },
    });
    if (!ligne) throw new Error("Ligne introuvable.");
    if (ligne.facture.statut === "PAYEE" || ligne.facture.statut === "ANNULEE") {
      throw new Error("Impossible de modifier une facture clôturée.");
    }
    if (decimalVersNombre(ligne.montant) <= 0) {
      throw new Error("Cette ligne ne peut pas être retirée ici.");
    }

    await prisma.$transaction(async (tx) => {
      const examen = await tx.examenLaboratoire.findFirst({
        where: {
          dossierId,
          statut: { not: "ANNULE" },
          typeExamen: { libelle: ligne.libelle },
        },
        orderBy: { createdAt: "desc" },
      });
      if (examen) {
        await tx.examenLaboratoire.update({
          where: { id: examen.id },
          data: { statut: "ANNULE" },
        });
      }

      const montantLigne = decimalVersNombre(ligne.montant);
      await tx.ligneFacture.delete({ where: { id: ligne.id } });
      await tx.facture.update({
        where: { id: ligne.factureId },
        data: { montantTotal: { decrement: montantLigne } },
      });
    });
  }

  const detail = await obtenirDossierFacturation(dossierId);
  if (!detail) throw new Error("Dossier introuvable après suppression.");
  return detail;
}

export interface DonneesEncaissement {
  dossierId: string;
  montant: number;
  modePaiement: ModePaiement;
  modeFacture: ModeFactureCaisse;
  remise: number;
  reference?: string;
  destinationApres: DestinationApresEncaissement;
}

export async function encaisserFacture(caissierId: string, donnees: DonneesEncaissement) {
  if (donnees.montant <= 0) {
    throw new Error("Le montant du paiement doit être supérieur à zéro.");
  }
  if (donnees.remise < 0) {
    throw new Error("La remise ne peut pas être négative.");
  }

  let detail = await obtenirDossierFacturation(donnees.dossierId);
  if (!detail) throw new Error("Dossier introuvable.");

  if (!detail.facture.id) {
    detail = await preparerFactureDossier(donnees.dossierId);
    if (!detail?.facture.id) throw new Error("Impossible de préparer la facture.");
  }

  const factureId = detail.facture.id!;
  const totalApresRemise = Math.max(0, detail.facture.montantTotal - donnees.remise);
  const dejaPaye = detail.facture.montantPaye;
  const reste = Math.max(0, totalApresRemise - dejaPaye);

  if (donnees.montant > reste + 0.01) {
    throw new Error("Le montant saisi dépasse le reste à payer.");
  }

  const referenceParts = [
    `modeFacture=${donnees.modeFacture}`,
    donnees.remise > 0 ? `remise=${donnees.remise}` : null,
    donnees.reference?.trim() ? `ref=${donnees.reference.trim()}` : null,
  ].filter(Boolean);

  const resultat = await prisma.$transaction(async (tx) => {
    const facture = await tx.facture.findUniqueOrThrow({ where: { id: factureId } });

    if (donnees.remise > 0 && decimalVersNombre(facture.montantTotal) === detail!.facture.montantTotal) {
      await tx.ligneFacture.create({
        data: {
          factureId,
          libelle: "Remise",
          quantite: 1,
          prixUnitaire: -donnees.remise,
          montant: -donnees.remise,
        },
      });
      await tx.facture.update({
        where: { id: factureId },
        data: { montantTotal: totalApresRemise },
      });
    }

    const paiement = await tx.paiement.create({
      data: {
        factureId,
        montant: donnees.montant,
        mode: donnees.modePaiement,
        reference: referenceParts.join("|") || null,
        caissierId,
      },
    });

    const nouveauMontantPaye = dejaPaye + donnees.montant;
    const statut =
      nouveauMontantPaye + 0.01 >= totalApresRemise
        ? "PAYEE"
        : nouveauMontantPaye > 0
          ? "PARTIELLEMENT_PAYEE"
          : "EMISE";

    await tx.facture.update({
      where: { id: factureId },
      data: {
        montantPaye: nouveauMontantPaye,
        statut,
        emiseLe: facture.emiseLe ?? new Date(),
      },
    });

    const passage = await tx.passage.findFirst({
      where: {
        dossierId: donnees.dossierId,
        statut: { not: "ANNULE" },
      },
      orderBy: { createdAt: "desc" },
      include: {
        fileAttente: true,
        transferts: {
          where: {
            salleDestination: { code: "CAISSE" },
            statut: { in: ["ACCEPTE", "EN_TRAITEMENT"] },
          },
          orderBy: { emisLe: "desc" },
          take: 1,
        },
      },
    });

    if (passage?.fileAttente && !passage.fileAttente.serviLe) {
      await tx.fileAttente.update({
        where: { id: passage.fileAttente.id },
        data: { serviLe: new Date() },
      });
    }

    if (passage?.transferts[0]) {
      await tx.transfert.update({
        where: { id: passage.transferts[0].id },
        data: {
          statut: "TERMINE",
          termineLe: new Date(),
          recepteurId: caissierId,
        },
      });
    }

    let transfertSuivantId: string | null = null;

    if (donnees.destinationApres !== "AUCUNE" && passage && statut === "PAYEE") {
      const codeSalle = donnees.destinationApres as CodeSalle;
      const salleDestination = await tx.salle.findUnique({ where: { code: codeSalle } });
      const salleOrigine = await tx.salle.findUnique({ where: { code: "CAISSE" } });

      if (salleDestination && salleOrigine) {
        const transfert = await tx.transfert.create({
          data: {
            dossierId: donnees.dossierId,
            passageId: passage.id,
            salleOrigineId: salleOrigine.id,
            salleDestinationId: salleDestination.id,
            emetteurId: caissierId,
            statut: "ACCEPTE",
            motif: `Paiement validé — orientation vers ${salleDestination.nom}`,
            accepteLe: new Date(),
            recepteurId: caissierId,
          },
        });

        await tx.passage.update({
          where: { id: passage.id },
          data: {
            statut: "EN_ATTENTE",
            motif: `Transfert vers ${salleDestination.nom}`,
          },
        });

        await inscrireFileAttenteDestination(tx, passage.id, salleDestination.id);
        transfertSuivantId = transfert.id;
      }
    }

    return {
      paiementId: paiement.id,
      factureId,
      statut,
      transfertSuivantId,
    };
  });

  const dossierMisAJour = await obtenirDossierFacturation(donnees.dossierId);

  return {
    ...resultat,
    dossier: dossierMisAJour,
  };
}

export async function listerFacturesDuJour(): Promise<FactureResumeJour[]> {
  const debutJour = new Date();
  debutJour.setHours(0, 0, 0, 0);
  const finJour = new Date();
  finJour.setHours(23, 59, 59, 999);

  const factures = await prisma.facture.findMany({
    where: { createdAt: { gte: debutJour, lte: finJour } },
    include: {
      dossier: { include: { patient: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return factures.map((f) => ({
    id: f.id,
    dossierId: f.dossierId,
    numeroFacture: f.numeroFacture,
    statut: f.statut,
    montantTotal: decimalVersNombre(f.montantTotal),
    montantPaye: decimalVersNombre(f.montantPaye),
    devise: f.devise,
    emiseLe: f.emiseLe?.toISOString() ?? null,
    patient: `${f.dossier.patient.prenom} ${f.dossier.patient.nom}`,
    numeroPatient: f.dossier.patient.numeroPatient,
  }));
}

export async function listerEncaissementsDuJour(): Promise<EncaissementResumeJour[]> {
  const debutJour = new Date();
  debutJour.setHours(0, 0, 0, 0);
  const finJour = new Date();
  finJour.setHours(23, 59, 59, 999);

  const paiements = await prisma.paiement.findMany({
    where: { payeLe: { gte: debutJour, lte: finJour } },
    include: {
      caissier: { select: { prenom: true, nom: true } },
      facture: {
        include: {
          dossier: { include: { patient: true } },
        },
      },
    },
    orderBy: { payeLe: "desc" },
  });

  return paiements.map((p) => ({
    id: p.id,
    montant: decimalVersNombre(p.montant),
    mode: p.mode,
    reference: p.reference,
    payeLe: p.payeLe.toISOString(),
    numeroFacture: p.facture.numeroFacture,
    patient: `${p.facture.dossier.patient.prenom} ${p.facture.dossier.patient.nom}`,
    caissier: formaterCaissier(p.caissier.prenom, p.caissier.nom),
  }));
}
