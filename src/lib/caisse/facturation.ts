import "server-only";
import type { ModePaiement } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { genererNumeroFacture } from "@/lib/caisse/numeros";
import { reorienterPatientDepuisCaisse } from "@/lib/caisse/reorienter-patient-caisse";
import { creerTokenRecuFacture } from "@/lib/caisse/token-recu-public";
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

export async function preparerFactureDossier(
  dossierId: string,
  options?: { devise?: string }
) {
  const detail = await obtenirDossierFacturation(dossierId);
  if (!detail) throw new Error("Dossier introuvable.");

  if (detail.facture.id && detail.facture.statut !== "ANNULEE") {
    if (options?.devise) {
      const devise = options.devise === "USD" ? "USD" : "CDF";
      if (detail.facture.devise !== devise) {
        await prisma.facture.update({
          where: { id: detail.facture.id },
          data: { devise },
        });
        return obtenirDossierFacturation(dossierId);
      }
    }
    return detail;
  }

  const lignesPositives = detail.facture.lignes.filter((l) => l.montant > 0);
  if (lignesPositives.length === 0) {
    throw new Error("Aucune prestation facturable pour ce dossier.");
  }

  const devise = options?.devise === "USD" ? "USD" : "CDF";
  const montantTotal = lignesPositives.reduce((acc, l) => acc + l.montant, 0);

  const facture = await prisma.$transaction(async (tx) => {
    const numeroFacture = await genererNumeroFacture(tx);

    return tx.facture.create({
      data: {
        numeroFacture,
        dossierId,
        statut: "EMISE",
        montantTotal,
        montantPaye: 0,
        devise,
        emiseLe: new Date(),
        lignes: {
          create: lignesPositives.map((l) => ({
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
  fraisDivers?: number;
  devise?: string;
  reference?: string;
  destinationApres: DestinationApresEncaissement;
}

export async function encaisserFacture(caissierId: string, donnees: DonneesEncaissement) {
  const montant = Math.round(donnees.montant * 100) / 100;
  const remise = Math.max(0, Math.round((donnees.remise || 0) * 100) / 100);
  const fraisDivers = Math.max(0, Math.round((donnees.fraisDivers || 0) * 100) / 100);

  if (montant <= 0) {
    throw new Error("Le montant du paiement doit être supérieur à zéro.");
  }

  const detail = await preparerFactureDossier(donnees.dossierId, {
    devise: donnees.devise,
  });
  if (!detail?.facture.id) {
    throw new Error("Impossible d'enregistrer la facture.");
  }

  const factureId = detail.facture.id;
  const remiseDeja = detail.facture.lignes
    .filter((l) => l.montant < 0)
    .reduce((acc, l) => acc + Math.abs(l.montant), 0);
  const fraisDeja = detail.facture.lignes
    .filter((l) => l.libelle === "Frais divers")
    .reduce((acc, l) => acc + l.montant, 0);

  const totalLignesPositives = detail.facture.lignes
    .filter((l) => l.montant > 0)
    .reduce((acc, l) => acc + l.montant, 0);

  const fraisAAjouter = Math.max(0, fraisDivers - fraisDeja);
  const remiseAAppliquer = Math.max(0, remise - remiseDeja);
  const totalDu = Math.max(
    0,
    totalLignesPositives + fraisAAjouter - remise
  );
  const dejaPaye = detail.facture.montantPaye;
  const reste = Math.max(0, totalDu - dejaPaye);

  if (dejaPaye > 0.01 && donnees.modeFacture !== "SOLDE") {
    throw new Error(
      "Une avance a déjà été encaissée. Seul le mode Solde est autorisé pour régler le reste à payer."
    );
  }

  if (montant > reste + 0.01) {
    throw new Error(
      `Le montant saisi (${montant}) dépasse le reste à payer (${reste}).`
    );
  }

  const referenceParts = [
    `modeFacture=${donnees.modeFacture}`,
    remise > 0 ? `remise=${remise}` : null,
    fraisDivers > 0 ? `frais=${fraisDivers}` : null,
    donnees.reference?.trim() ? `ref=${donnees.reference.trim()}` : null,
  ].filter(Boolean);

  const resultat = await prisma.$transaction(async (tx) => {
    const facture = await tx.facture.findUniqueOrThrow({ where: { id: factureId } });

    if (facture.statut === "ANNULEE") {
      throw new Error("Cette facture est annulée.");
    }

    if (fraisAAjouter > 0) {
      await tx.ligneFacture.create({
        data: {
          factureId,
          libelle: "Frais divers",
          quantite: 1,
          prixUnitaire: fraisAAjouter,
          montant: fraisAAjouter,
        },
      });
    }

    if (remiseAAppliquer > 0) {
      await tx.ligneFacture.create({
        data: {
          factureId,
          libelle: "Remise",
          quantite: 1,
          prixUnitaire: -remiseAAppliquer,
          montant: -remiseAAppliquer,
        },
      });
    }

    await tx.facture.update({
      where: { id: factureId },
      data: {
        montantTotal: totalDu,
        devise:
          donnees.devise === "USD"
            ? "USD"
            : donnees.devise === "CDF"
              ? "CDF"
              : facture.devise,
        emiseLe: facture.emiseLe ?? new Date(),
      },
    });

    const paiement = await tx.paiement.create({
      data: {
        factureId,
        montant,
        mode: donnees.modePaiement,
        reference: referenceParts.join("|") || null,
        caissierId,
      },
    });

    const nouveauMontantPaye = dejaPaye + montant;
    const statut =
      nouveauMontantPaye + 0.01 >= totalDu
        ? "PAYEE"
        : nouveauMontantPaye > 0
          ? "PARTIELLEMENT_PAYEE"
          : "EMISE";

    await tx.facture.update({
      where: { id: factureId },
      data: {
        montantPaye: nouveauMontantPaye,
        statut,
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

    // Le patient reste en file caisse jusqu'à confirmation / transfert (menu ⋮).
    // Les avances (PARTIELLEMENT_PAYEE) restent aussi pour établir le solde.

    return {
      paiementId: paiement.id,
      factureId,
      numeroFacture: facture.numeroFacture,
      statut,
      passageId: passage?.id ?? null,
    };
  });

  // Après paiement total : transfert EN_ATTENTE (le patient reste en file)
  let transfertSuivantId: string | null = null;
  if (
    donnees.destinationApres !== "AUCUNE" &&
    resultat.statut === "PAYEE" &&
    resultat.passageId
  ) {
    try {
      const orient = await reorienterPatientDepuisCaisse(
        caissierId,
        donnees.dossierId,
        donnees.destinationApres
      );
      transfertSuivantId = orient.transfertId;
    } catch (e) {
      console.error("[encaisserFacture] orientation après paiement", e);
    }
  }

  const dossierMisAJour = await obtenirDossierFacturation(donnees.dossierId);

  return {
    ...resultat,
    transfertSuivantId,
    dossier: dossierMisAJour,
  };
}

/** Liste toutes les factures non annulées (historique complet), plus récentes d'abord. */
export async function listerFacturesDuJour(): Promise<FactureResumeJour[]> {
  const factures = await prisma.facture.findMany({
    where: { statut: { not: "ANNULEE" } },
    include: {
      lignes: { orderBy: { id: "asc" } },
      paiements: { orderBy: { payeLe: "desc" }, take: 1 },
      dossier: {
        include: {
          patient: true,
          examensLaboratoire: {
            where: { statut: { not: "ANNULE" } },
            select: { id: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return factures.map((f) => {
    const dernierPaiement = f.paiements[0] ?? null;
    const modeFacture =
      dernierPaiement?.reference
        ?.split("|")
        .find((part) => part.startsWith("modeFacture="))
        ?.replace("modeFacture=", "") ?? null;

    const lignesPositives = f.lignes.filter((l) => decimalVersNombre(l.montant) > 0);

    return {
      id: f.id,
      dossierId: f.dossierId,
      numeroFacture: f.numeroFacture,
      statut: f.statut,
      montantTotal: decimalVersNombre(f.montantTotal),
      montantPaye: decimalVersNombre(f.montantPaye),
      devise: f.devise,
      emiseLe: f.emiseLe?.toISOString() ?? null,
      patient: `${f.dossier.patient.prenom} ${f.dossier.patient.nom}`,
      prenom: f.dossier.patient.prenom,
      nom: f.dossier.patient.nom,
      numeroPatient: f.dossier.patient.numeroPatient,
      numeroDossier: f.dossier.numeroDossier,
      telephone: f.dossier.patient.telephone,
      dateNaissance: f.dossier.patient.dateNaissance?.toISOString() ?? null,
      sexe: f.dossier.patient.sexe ?? null,
      nombreExamens: f.dossier.examensLaboratoire.length,
      nombreLignes: lignesPositives.length,
      modePaiement: dernierPaiement?.mode ?? null,
      modeFacture,
      lignes: lignesPositives.map((l) => ({
        libelle: l.libelle,
        montant: decimalVersNombre(l.montant),
        quantite: l.quantite,
      })),
      tokenRecu: creerTokenRecuFacture(f.id),
      approuvee: Boolean(f.approuveeLe),
      approuveeLe: f.approuveeLe?.toISOString() ?? null,
    };
  });
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
