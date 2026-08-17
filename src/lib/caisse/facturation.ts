import "server-only";
import type { ModePaiement, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { genererNumeroFacture } from "@/lib/caisse/numeros";
import {
  obtenirSectionPharmacieDossier,
  preparerFacturePharmacieDossier,
} from "@/lib/caisse/facturation-pharmacie";
import { reorienterPatientDepuisCaisse } from "@/lib/caisse/reorienter-patient-caisse";
import { estClientWalkInPharmacie, numeroIdentitePersonne } from "@/lib/pharmacie/client-walk-in";
import { creerTokenRecuFacture } from "@/lib/caisse/token-recu-public";
import { evaluerEtatFacturationDual } from "@/lib/caisse/etat-facturation-dual";
import {
  construireLignesFactureExamens,
  extraireLignesExamensNonFacturees,
} from "@/lib/caisse/construire-lignes-facture-examens";
import { prescrireExamensInitiaux } from "@/lib/reception/prescrire-examens-initiaux";
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

/** Si l'avance couvre déjà le nouveau total (ligne retirée / remise), passer en PAYEE. */
async function reconcilerStatutFactureApresAjustement(
  tx: Prisma.TransactionClient,
  factureId: string
) {
  const facture = await tx.facture.findUnique({
    where: { id: factureId },
    include: { lignes: true },
  });
  if (!facture || facture.statut === "ANNULEE" || facture.statut === "PAYEE") {
    return;
  }

  const totalDu = Math.max(
    0,
    facture.lignes.reduce((acc, l) => acc + decimalVersNombre(l.montant), 0)
  );
  const paye = decimalVersNombre(facture.montantPaye);
  const statut =
    paye + 0.01 >= totalDu && paye > 0
      ? "PAYEE"
      : paye > 0
        ? "PARTIELLEMENT_PAYEE"
        : facture.statut === "BROUILLON"
          ? "BROUILLON"
          : "EMISE";

  await tx.facture.update({
    where: { id: factureId },
    data: { montantTotal: totalDu, statut },
  });
}

function formaterCaissier(prenom: string, nom: string) {
  return `${prenom} ${nom}`.trim();
}

function estFacturePharmacie(
  facture: { ventePharmacie?: unknown; numeroFacture?: string } | null | undefined
) {
  return Boolean(
    facture?.ventePharmacie || facture?.numeroFacture?.startsWith("FAC-PH-")
  );
}

function construireDetailFacture(
  facture: {
    id: string;
    numeroFacture: string;
    statut: DossierFacturationCaisse["facture"]["statut"];
    montantTotal: { toNumber?: () => number } | number | string;
    montantPaye: { toNumber?: () => number } | number | string;
    devise: string;
    ventePharmacie?: unknown;
    lignes: {
      id: string;
      libelle: string;
      quantite: number;
      prixUnitaire: { toNumber?: () => number } | number | string;
      montant: { toNumber?: () => number } | number | string;
    }[];
    paiements: {
      id: string;
      montant: { toNumber?: () => number } | number | string;
      mode: ModePaiement;
      reference: string | null;
      payeLe: Date;
      caissier: { prenom: string; nom: string };
    }[];
  } | null,
  lignesFallback: DossierFacturationCaisse["facture"]["lignes"],
  historiquePaiements: DossierFacturationCaisse["facture"]["historiquePaiements"]
): DossierFacturationCaisse["facture"] {
  const lignesFacture =
    facture?.lignes.map((l) => ({
      id: l.id,
      libelle: l.libelle,
      quantite: l.quantite,
      prixUnitaire: decimalVersNombre(l.prixUnitaire),
      montant: decimalVersNombre(l.montant),
      source: "FACTURE" as const,
    })) ?? [];

  const lignes = lignesFacture.length > 0 ? lignesFacture : lignesFallback;
  const montantTotal =
    facture != null
      ? decimalVersNombre(facture.montantTotal)
      : lignes.reduce((acc, l) => acc + l.montant, 0);

  const paiementsFacture = facture?.paiements ?? [];
  const aUneAvanceExplicite = paiementsFacture.some((p) =>
    p.reference?.split("|").some((part) => part === "modeFacture=AVANCE")
  );
  const aUneAvance =
    facture != null &&
    facture.statut !== "PAYEE" &&
    facture.statut !== "ANNULEE" &&
    (aUneAvanceExplicite || facture.statut === "PARTIELLEMENT_PAYEE");

  return {
    id: facture?.id ?? null,
    numeroFacture: facture?.numeroFacture ?? null,
    statut: facture?.statut ?? null,
    montantTotal,
    montantPaye: facture ? decimalVersNombre(facture.montantPaye) : 0,
    devise: facture?.devise ?? "USD",
    lignes,
    historiquePaiements,
    aUneAvance,
    isPharmacie: estFacturePharmacie(facture),
  };
}

export async function obtenirDossierFacturation(
  dossierId: string,
  factureId?: string
): Promise<DossierFacturationCaisse | null> {
  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    include: {
      patient: true,
      examensLaboratoire: {
        where: { statut: { not: "ANNULE" } },
        include: { typeExamen: true, paquetBilan: true },
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
          ventePharmacie: true,
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

  const factureParam = factureId
    ? dossier.factures.find((f) => f.id === factureId)
    : null;

  const facturesExamens = dossier.factures.filter((f) => !estFacturePharmacie(f));
  const factureExamensOuverte =
    facturesExamens.find((f) => f.statut !== "ANNULEE" && f.statut !== "PAYEE") ??
    null;
  const factureExamensPayeeRecente =
    facturesExamens.find((f) => f.statut === "PAYEE") ?? null;

  const lignesExamensPrescrits = construireLignesFactureExamens(
    dossier.examensLaboratoire.map((ex) => ({
      id: ex.id,
      paquetBilanId: ex.paquetBilanId,
      typeExamen: ex.typeExamen,
      paquetBilan: ex.paquetBilan,
    }))
  );
  const lignesExamensDejaFacturees = facturesExamens
    .filter((f) => f.statut !== "ANNULEE")
    .flatMap((f) =>
      f.lignes.map((l) => ({
        libelle: l.libelle,
        montant: decimalVersNombre(l.montant),
      }))
    );
  const lignesExamensNonFacturees = extraireLignesExamensNonFacturees(
    lignesExamensPrescrits,
    lignesExamensDejaFacturees
  );
  const aDesExamensNonFactures = lignesExamensNonFacturees.length > 0;

  const factureParamExamens =
    factureParam && !estFacturePharmacie(factureParam) ? factureParam : null;
  const factureExamensBrute = aDesExamensNonFactures
    ? factureExamensOuverte
    : (factureParamExamens && factureParamExamens.statut !== "ANNULEE"
        ? factureParamExamens
        : null) ??
      factureExamensOuverte ??
      factureExamensPayeeRecente ??
      facturesExamens[0] ??
      null;

  const facturePharmacieBrute =
    factureParam && estFacturePharmacie(factureParam) ? factureParam : null;

  const pharmacie = await obtenirSectionPharmacieDossier(
    dossierId,
    facturePharmacieBrute?.id
  );

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

  const factureExamens = construireDetailFacture(
    factureExamensBrute,
    aDesExamensNonFactures && !factureExamensBrute
      ? lignesExamensNonFacturees
      : lignesExamensPrescrits,
    historiquePaiements.filter((p) =>
      factureExamensBrute
        ? p.numeroRecu === factureExamensBrute.numeroFacture.replace(/^FAC-/, "REC-")
        : true
    )
  );

  const factureActive = facturePharmacieBrute
    ? pharmacie.facture ??
      construireDetailFacture(
        facturePharmacieBrute,
        pharmacie.lignes,
        historiquePaiements.filter((p) =>
          facturePharmacieBrute
            ? p.numeroRecu ===
              facturePharmacieBrute.numeroFacture.replace(/^FAC-/, "REC-")
            : false
        )
      )
    : factureExamens;

  let statutAttente: DossierFacturationCaisse["statutAttente"] = "HORS_FILE";
  const facturationDual = evaluerEtatFacturationDual({
    nombreExamens: dossier.examensLaboratoire.length,
    aDesMedicaments: pharmacie.aDesMedicaments,
    statutFactureExamens: aDesExamensNonFactures
      ? (factureExamensOuverte?.statut ?? null)
      : factureExamens.statut,
    statutFacturePharmacie: pharmacie.facture?.statut ?? null,
    enFile: Boolean(fileAttente),
    aDesExamensNonFactures,
  });
  statutAttente = facturationDual.statutAttente;

  const remiseProposee = decimalVersNombre(
    dossier.enregistrementsReception[0]?.remise ?? 0
  );

  return {
    dossierId: dossier.id,
    numeroPatient: numeroIdentitePersonne(
      dossier.numeroDossier,
      dossier.patient.numeroPatient
    ),
    numeroDossier: dossier.numeroDossier,
    prenom: dossier.patient.prenom,
    nom: dossier.patient.nom,
    telephone: dossier.patient.telephone,
    sexe: dossier.patient.sexe ?? null,
    dateNaissance: dossier.patient.dateNaissance?.toISOString() ?? null,
    estClientWalkIn: estClientWalkInPharmacie(dossier.numeroDossier),
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
    idsPaquetsBilan: [
      ...new Set(
        dossier.examensLaboratoire
          .map((ex) => ex.paquetBilanId)
          .filter((id): id is string => Boolean(id))
      ),
    ],
    examens: {
      lignes: factureExamens.lignes.filter(
        (l) => l.montant > 0 && l.libelle !== "Frais divers"
      ),
      facture: factureExamens,
      idsTypesExamen: dossier.examensLaboratoire.map((ex) => ex.typeExamenId),
      idsPaquetsBilan: [
        ...new Set(
          dossier.examensLaboratoire
            .map((ex) => ex.paquetBilanId)
            .filter((id): id is string => Boolean(id))
        ),
      ],
    },
    pharmacie,
    facture: factureActive,
    facturationDual,
  };
}

export async function preparerFactureDossier(
  dossierId: string,
  options?: { devise?: string; factureId?: string; typeFacture?: "NORMALE" | "PHARMACIE" },
  caissierId?: string
) {
  if (options?.typeFacture === "PHARMACIE") {
    if (!caissierId) throw new Error("Caissier requis pour la facture pharmacie.");
    const section = await preparerFacturePharmacieDossier(dossierId, caissierId, {
      factureId: options.factureId,
      devise: options.devise,
    });
    return obtenirDossierFacturation(dossierId, section.facture?.id ?? undefined);
  }

  const detail = await obtenirDossierFacturation(
    dossierId,
    options?.factureId?.trim() || undefined
  );
  if (!detail) throw new Error("Dossier introuvable.");

  const factureExamens = detail.examens.facture;
  const factureExamensOuverte =
    Boolean(factureExamens.id) &&
    factureExamens.statut != null &&
    factureExamens.statut !== "ANNULEE" &&
    factureExamens.statut !== "PAYEE";

  if (factureExamensOuverte) {
    if (options?.devise) {
      const devise = options.devise === "USD" ? "USD" : "CDF";
      if (factureExamens.devise !== devise) {
        await prisma.facture.update({
          where: { id: factureExamens.id as string },
          data: { devise },
        });
        return obtenirDossierFacturation(dossierId, factureExamens.id ?? undefined);
      }
    }
    return detail;
  }

  if (factureExamens.statut === "PAYEE") {
    return detail;
  }

  const lignesPositives = factureExamens.lignes.filter((l) => l.montant > 0);
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

/** Ajoute un paquet bilan (forfait) au dossier et à la facture ouverte si elle existe. */
export async function ajouterPaquetBilanAuDossierCaisse(
  dossierId: string,
  paquetBilanId: string,
  agentId: string
) {
  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    select: { id: true },
  });
  if (!dossier) throw new Error("Dossier introuvable.");

  const paquet = await prisma.paquetBilan.findFirst({
    where: { id: paquetBilanId, actif: true },
  });
  if (!paquet) throw new Error("Paquet bilan introuvable ou inactif.");

  const deja = await prisma.examenLaboratoire.findFirst({
    where: {
      dossierId,
      paquetBilanId,
      statut: { not: "ANNULE" },
    },
    select: { id: true },
  });
  if (deja) throw new Error("Ce paquet bilan est déjà prescrit pour ce dossier.");

  const prixForfait = decimalVersNombre(paquet.prix);

  await prisma.$transaction(async (tx) => {
    await prescrireExamensInitiaux(tx, dossierId, agentId, [], false, "CAISSE", [
      paquetBilanId,
    ]);

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
          libelle: paquet.libelle,
          quantite: 1,
          prixUnitaire: prixForfait,
          montant: prixForfait,
        },
      });
      await tx.facture.update({
        where: { id: facture.id },
        data: {
          montantTotal: { increment: prixForfait },
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
    if (ligneId.startsWith("paquet-")) {
      const paquetBilanId = ligneId.slice("paquet-".length);
      const examensPaquet = await prisma.examenLaboratoire.findMany({
        where: {
          dossierId,
          paquetBilanId,
          statut: { not: "ANNULE" },
        },
        include: { paquetBilan: true },
      });
      if (examensPaquet.length === 0) throw new Error("Paquet introuvable.");

      await prisma.$transaction(async (tx) => {
        for (const ex of examensPaquet) {
          await tx.examenLaboratoire.update({
            where: { id: ex.id },
            data: { statut: "ANNULE" },
          });
        }

        if (factureOuverte) {
          const libellePaquet = examensPaquet[0]?.paquetBilan?.libelle;
          if (libellePaquet) {
            const ligne = await tx.ligneFacture.findFirst({
              where: {
                factureId: factureOuverte.id,
                libelle: libellePaquet,
                montant: { gt: 0 },
              },
              orderBy: { id: "asc" },
            });
            if (ligne) {
              const montantLigne = decimalVersNombre(ligne.montant);
              await tx.ligneFacture.delete({ where: { id: ligne.id } });
              const factureMaj = await tx.facture.update({
                where: { id: factureOuverte.id },
                data: { montantTotal: { decrement: montantLigne } },
              });
              await reconcilerStatutFactureApresAjustement(tx, factureMaj.id);
            }
          }
        }
      });
    } else {
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
          const factureMaj = await tx.facture.update({
            where: { id: factureOuverte.id },
            data: { montantTotal: { decrement: montantLigne } },
          });
          await reconcilerStatutFactureApresAjustement(tx, factureMaj.id);
        }
      }
    });
    }
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
      const factureMaj = await tx.facture.update({
        where: { id: ligne.factureId },
        data: { montantTotal: { decrement: montantLigne } },
      });
      await reconcilerStatutFactureApresAjustement(tx, factureMaj.id);
    });
  }

  const detail = await obtenirDossierFacturation(dossierId);
  if (!detail) throw new Error("Dossier introuvable après suppression.");
  return detail;
}

export interface DonneesEncaissement {
  dossierId: string;
  factureId?: string;
  typeFacture?: "NORMALE" | "PHARMACIE";
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

  if (montant < 0) {
    throw new Error("Le montant du paiement est invalide.");
  }

  const detail = await preparerFactureDossier(
    donnees.dossierId,
    {
      devise: donnees.devise,
      factureId: donnees.factureId,
      typeFacture: donnees.typeFacture,
    },
    caissierId
  );
  if (!detail) {
    throw new Error("Dossier introuvable.");
  }

  const factureIdEffectif =
    donnees.typeFacture === "PHARMACIE"
      ? detail.pharmacie.facture?.id ?? detail.facture.id
      : detail.examens.facture.id ?? detail.facture.id;

  if (!factureIdEffectif) {
    throw new Error("Impossible d'enregistrer la facture.");
  }

  // Recharger avec la bonne facture active
  const detailFacture = await obtenirDossierFacturation(
    donnees.dossierId,
    factureIdEffectif
  );
  if (!detailFacture?.facture.id) {
    throw new Error("Impossible d'enregistrer la facture.");
  }

  const factureId = detailFacture.facture.id;
  const remiseDeja = detailFacture.facture.lignes
    .filter((l) => l.montant < 0)
    .reduce((acc, l) => acc + Math.abs(l.montant), 0);
  const fraisDeja = detailFacture.facture.lignes
    .filter((l) => l.libelle === "Frais divers")
    .reduce((acc, l) => acc + l.montant, 0);

  const totalLignesPositives = detailFacture.facture.lignes
    .filter((l) => l.montant > 0)
    .reduce((acc, l) => acc + l.montant, 0);

  const fraisAAjouter = Math.max(0, fraisDivers - fraisDeja);
  const remiseAAppliquer = Math.max(0, remise - remiseDeja);
  const totalDu = Math.max(
    0,
    totalLignesPositives + fraisAAjouter - remise
  );
  const dejaPaye = detailFacture.facture.montantPaye;
  const reste = Math.max(0, totalDu - dejaPaye);

  /** Avance déjà couverte (remise / lignes) : clôturer sans nouveau paiement. */
  const clotureSansPaiement =
    donnees.modeFacture === "SOLDE" && montant <= 0.01 && reste <= 0.01;

  if (!clotureSansPaiement && montant <= 0) {
    throw new Error("Le montant du paiement doit être supérieur à zéro.");
  }

  const aUneAvance = detailFacture.facture.aUneAvance;

  if (donnees.modeFacture === "SOLDE" && !aUneAvance) {
    throw new Error(
      "Le mode Solde n'est disponible qu'après une facture d'avance pour ces examens."
    );
  }

  if (aUneAvance && donnees.modeFacture !== "SOLDE") {
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

    let paiementId: string | null = null;
    const montantEncaisse = clotureSansPaiement ? 0 : montant;

    if (montantEncaisse > 0.01) {
      const paiement = await tx.paiement.create({
        data: {
          factureId,
          montant: montantEncaisse,
          mode: donnees.modePaiement,
          reference: referenceParts.join("|") || null,
          caissierId,
        },
      });
      paiementId = paiement.id;
    }

    const nouveauMontantPaye = dejaPaye + montantEncaisse;
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
      paiementId,
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

  if (resultat.statut === "PAYEE") {
    try {
      const { marquerVentePayeeParFacture } = await import(
        "@/lib/pharmacie/gestion-ventes"
      );
      await marquerVentePayeeParFacture(resultat.factureId);
    } catch (e) {
      console.error("[encaisserFacture] vente pharmacie", e);
    }
  }

  if (resultat.statut === "PAYEE" && donnees.destinationApres === "AUCUNE") {
    const {
      evaluerEtCloturerVisite,
      libererFileCaisseSansSuite,
    } = await import("@/lib/visites/evaluer-cloture-visite");
    await libererFileCaisseSansSuite(donnees.dossierId);
    await evaluerEtCloturerVisite(donnees.dossierId);
  }

  const dossierMisAJour = await obtenirDossierFacturation(
    donnees.dossierId,
    factureId
  );

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
      ventePharmacie: true,
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
      numeroPatient: numeroIdentitePersonne(
        f.dossier.numeroDossier,
        f.dossier.patient.numeroPatient
      ),
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
      isPharmacie: Boolean(f.ventePharmacie) || f.numeroFacture.startsWith("FAC-PH-"),
      estClientWalkIn: estClientWalkInPharmacie(f.dossier.numeroDossier),
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
