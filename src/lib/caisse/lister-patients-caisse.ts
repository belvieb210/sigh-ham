import "server-only";
import type { StatutFacture } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { listerPatientsFileAttenteSalle } from "@/lib/transferts/visibilite-salle";
import {
  estNumeroFacturePharmacie,
  evaluerEtatFacturationDual,
} from "@/lib/caisse/etat-facturation-dual";
import { estClientWalkInPharmacie, numeroIdentitePersonne } from "@/lib/pharmacie/client-walk-in";
import type { PatientFileCaisse, StatsCaisseJour } from "@/lib/caisse/types";
import {
  construireLignesFactureExamens,
  extraireLignesExamensNonFacturees,
} from "@/lib/caisse/construire-lignes-facture-examens";

function decimalVersNombre(valeur: { toNumber?: () => number } | number | string): number {
  if (typeof valeur === "number") return valeur;
  if (typeof valeur === "string") return Number.parseFloat(valeur) || 0;
  if (valeur && typeof valeur.toNumber === "function") return valeur.toNumber();
  return Number(valeur) || 0;
}

function extraireModeFacture(reference: string | null | undefined): string | null {
  if (!reference) return null;
  return (
    reference
      .split("|")
      .find((part) => part.startsWith("modeFacture="))
      ?.replace("modeFacture=", "") ?? null
  );
}

interface ResumeFacture {
  statut: StatutFacture;
  montantTotal: number;
  montantPaye: number;
  modeFacture: string | null;
  nbLignes: number;
}

interface FacturesDossier {
  examens: ResumeFacture | null;
  pharmacie: ResumeFacture | null;
}

function prioriteFactureATraiter(statut: StatutFacture): number {
  if (statut === "PARTIELLEMENT_PAYEE") return 4;
  if (statut === "EMISE") return 3;
  if (statut === "BROUILLON") return 2;
  if (statut === "PAYEE") return 1;
  return 0;
}

function retenirMeilleureFacture(
  courante: ResumeFacture | null,
  candidate: ResumeFacture
): ResumeFacture {
  if (!courante) return candidate;
  return prioriteFactureATraiter(candidate.statut) >= prioriteFactureATraiter(courante.statut)
    ? candidate
    : courante;
}

function aFacturePayee(facs: FacturesDossier): boolean {
  return facs.examens?.statut === "PAYEE" || facs.pharmacie?.statut === "PAYEE";
}

function aFactureEtablie(facs: FacturesDossier): boolean {
  const etablie = (statut: StatutFacture | undefined) =>
    statut === "EMISE" || statut === "PARTIELLEMENT_PAYEE" || statut === "PAYEE";
  return etablie(facs.examens?.statut) || etablie(facs.pharmacie?.statut);
}

/**
 * Réinscrit en file caisse les dossiers déjà arrivés à la caisse (transfert
 * entrant confirmé) encore sans transfert sortant confirmé.
 * Ne crée jamais de file destination pour un transfert encore EN_ATTENTE.
 */
async function synchroniserCandidatsTransfertsCaisse() {
  const salleCaisse = await prisma.salle.findUnique({ where: { code: "CAISSE" } });
  if (!salleCaisse) return;

  const dossiers = await prisma.dossierPatient.findMany({
    where: {
      statut: { in: ["OUVERT", "EN_COURS"] },
      passages: {
        some: {
          statut: { not: "ANNULE" },
          fileAttente: { salleId: salleCaisse.id },
          transferts: {
            some: {
              salleDestination: { code: "CAISSE" },
              statut: { in: ["ACCEPTE", "EN_TRAITEMENT", "TERMINE"] },
            },
          },
        },
      },
    },
    select: {
      id: true,
      examensLaboratoire: {
        where: { statut: { not: "ANNULE" } },
        select: { id: true },
      },
      passages: {
        where: { statut: { not: "ANNULE" } },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          transferts: {
            where: {
              salleOrigineId: salleCaisse.id,
              statut: { in: ["ACCEPTE", "EN_TRAITEMENT", "TERMINE"] },
            },
            select: { id: true },
            take: 1,
          },
        },
      },
    },
  });

  const dossierIds = dossiers
    .filter((d) => {
      const passage = d.passages[0];
      return passage && passage.transferts.length === 0;
    })
    .map((d) => d.id);

  if (dossierIds.length === 0) return;

  const [factures, ordonnancesAvecMed] = await Promise.all([
    prisma.facture.findMany({
      where: {
        dossierId: { in: dossierIds },
        statut: { in: ["BROUILLON", "EMISE", "PARTIELLEMENT_PAYEE", "PAYEE"] },
      },
      select: {
        dossierId: true,
        statut: true,
        numeroFacture: true,
        ventePharmacie: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.ordonnance.findMany({
      where: {
        dossierId: { in: dossierIds },
        statut: { in: ["EN_ATTENTE", "PARTIELLEMENT_DELIVREE"] },
        lignes: { some: {} },
      },
      select: { dossierId: true },
      distinct: ["dossierId"],
    }),
  ]);

  const dossiersAvecMedicaments = new Set(ordonnancesAvecMed.map((o) => o.dossierId));
  const facturesParDossier = new Map<string, FacturesDossier>();
  for (const f of factures) {
    const courant = facturesParDossier.get(f.dossierId) ?? {
      examens: null,
      pharmacie: null,
    };
    const estPh =
      Boolean(f.ventePharmacie) || estNumeroFacturePharmacie(f.numeroFacture);
    const resume = {
      statut: f.statut,
      montantTotal: 0,
      montantPaye: 0,
      modeFacture: null,
      nbLignes: 0,
    };
    if (estPh) {
      courant.pharmacie = retenirMeilleureFacture(courant.pharmacie, resume);
    } else {
      courant.examens = retenirMeilleureFacture(courant.examens, resume);
    }
    facturesParDossier.set(f.dossierId, courant);
  }

  const dossiersParId = new Map(dossiers.map((d) => [d.id, d]));
  const { assurerFileAttenteDestination } = await import("@/lib/transferts/multi-destinations");

  await prisma.$transaction(async (tx) => {
    for (const dossierId of dossierIds) {
      const dossier = dossiersParId.get(dossierId);
      const passage = dossier?.passages[0];
      if (!passage) continue;

      const facs = facturesParDossier.get(dossierId) ?? {
        examens: null,
        pharmacie: null,
      };
      const aDesMedicaments =
        dossiersAvecMedicaments.has(dossierId) || Boolean(facs.pharmacie);
      const etat = evaluerEtatFacturationDual({
        nombreExamens: dossier?.examensLaboratoire.length ?? 0,
        aDesMedicaments,
        statutFactureExamens: facs.examens?.statut ?? null,
        statutFacturePharmacie: facs.pharmacie?.statut ?? null,
        enFile: true,
      });

      if (!etat.facturationComplete && !aFactureEtablie(facs)) continue;

      await assurerFileAttenteDestination(tx, passage.id, salleCaisse.id);
    }
  });
}

/**
 * Réintègre en file caisse les patients sortis trop tôt (encaissement avant confirm),
 * tant qu'aucun transfert sortant n'a été confirmé depuis la caisse.
 */
async function reintegrerPatientsCaisseNonConfirmes() {
  const sortis = await prisma.fileAttente.findMany({
    where: {
      salle: { code: "CAISSE" },
      serviLe: { not: null },
    },
    select: {
      id: true,
      passageId: true,
      passage: {
        select: {
          transferts: {
            where: {
              OR: [
                {
                  salleOrigine: { code: "CAISSE" },
                  statut: { in: ["ACCEPTE", "EN_TRAITEMENT", "TERMINE"] },
                },
                {
                  salleDestination: { code: "CAISSE" },
                  statut: "EN_ATTENTE",
                },
              ],
            },
            select: {
              id: true,
              statut: true,
              salleOrigine: { select: { code: true } },
              salleDestination: { select: { code: true } },
            },
          },
        },
      },
    },
  });

  const aReouvrir = sortis
    .filter((f) => {
      const incomingEnAttente = f.passage.transferts.some(
        (t) => t.salleDestination.code === "CAISSE" && t.statut === "EN_ATTENTE"
      );
      if (incomingEnAttente) return false;
      const sortantConfirme = f.passage.transferts.some(
        (t) =>
          t.salleOrigine.code === "CAISSE" &&
          (t.statut === "ACCEPTE" || t.statut === "EN_TRAITEMENT" || t.statut === "TERMINE")
      );
      return !sortantConfirme;
    })
    .map((f) => f.id);
  if (aReouvrir.length === 0) return;

  await prisma.fileAttente.updateMany({
    where: { id: { in: aReouvrir } },
    data: { serviLe: null },
  });
}

export async function listerPatientsEnAttenteCaisse(options?: {
  /** Page transferts : réintégration des dossiers facturés encore à la caisse. */
  pourPageTransferts?: boolean;
  /** Si true, exclut les dossiers sans facture établie (section « factures payées »). */
  exigerFactureEtablie?: boolean;
}): Promise<PatientFileCaisse[]> {
  const pourTransferts = options?.pourPageTransferts === true;
  const exigerFactureEtablie = options?.exigerFactureEtablie === true;
  if (pourTransferts) {
    await synchroniserCandidatsTransfertsCaisse();
  }
  await reintegrerPatientsCaisseNonConfirmes();

  const files = await listerPatientsFileAttenteSalle("CAISSE");

  const dossierIds = files.map((f) => f.passage.dossier.id);
  if (dossierIds.length === 0) return [];

  const [factures, ordonnancesAvecMed] = await Promise.all([
    prisma.facture.findMany({
      where: {
        dossierId: { in: dossierIds },
        statut: { in: ["BROUILLON", "EMISE", "PARTIELLEMENT_PAYEE", "PAYEE"] },
      },
      include: {
        paiements: { orderBy: { payeLe: "desc" }, take: 1 },
        ventePharmacie: { select: { id: true } },
        lignes: { select: { id: true, libelle: true, montant: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.ordonnance.findMany({
      where: {
        dossierId: { in: dossierIds },
        statut: { in: ["EN_ATTENTE", "PARTIELLEMENT_DELIVREE"] },
        lignes: { some: {} },
      },
      select: { dossierId: true },
      distinct: ["dossierId"],
    }),
  ]);

  const dossiersAvecMedicaments = new Set(ordonnancesAvecMed.map((o) => o.dossierId));

  const facturesParDossier = new Map<string, FacturesDossier>();
  const dossiersAvecFacturePayee = new Set<string>();
  const lignesExamensFactureesParDossier = new Map<
    string,
    { libelle: string; montant: number }[]
  >();
  for (const f of factures) {
    if (f.statut === "PAYEE") dossiersAvecFacturePayee.add(f.dossierId);
    const courant = facturesParDossier.get(f.dossierId) ?? {
      examens: null,
      pharmacie: null,
    };
    const estPh =
      Boolean(f.ventePharmacie) || estNumeroFacturePharmacie(f.numeroFacture);
    const resume = {
      statut: f.statut,
      montantTotal: decimalVersNombre(f.montantTotal),
      montantPaye: decimalVersNombre(f.montantPaye),
      modeFacture: extraireModeFacture(f.paiements[0]?.reference),
      nbLignes: f.lignes.length,
    };
    if (estPh) {
      courant.pharmacie = retenirMeilleureFacture(courant.pharmacie, resume);
    } else {
      courant.examens = retenirMeilleureFacture(courant.examens, resume);
      const lignes = lignesExamensFactureesParDossier.get(f.dossierId) ?? [];
      for (const l of f.lignes) {
        lignes.push({
          libelle: l.libelle,
          montant: decimalVersNombre(l.montant),
        });
      }
      lignesExamensFactureesParDossier.set(f.dossierId, lignes);
    }
    facturesParDossier.set(f.dossierId, courant);
  }

  const resultats: PatientFileCaisse[] = [];

  for (const file of files) {
    const dossier = file.passage.dossier;
    const patient = dossier.patient;
    const transfertEntrant =
      file.passage.transferts.find((t) => t.salleDestination?.code === "CAISSE") ??
      file.passage.transferts[0];
    const transfert = transfertEntrant;
    const examens = dossier.examensLaboratoire;
    const lignesExamensPrescrits = construireLignesFactureExamens(
      examens.map((ex) => ({
        id: ex.id,
        paquetBilanId: ex.paquetBilanId,
        typeExamen: ex.typeExamen,
        paquetBilan: ex.paquetBilan,
      }))
    );
    const montantEstime = lignesExamensPrescrits.reduce((acc, l) => acc + l.montant, 0);
    const medecin =
      dossier.enregistrementsReception[0]?.medecinResponsable?.trim() || null;
    const provenance =
      transfert?.salleOrigine?.nom?.trim() ||
      transfert?.salleOrigine?.code ||
      "—";

    const facs = facturesParDossier.get(dossier.id) ?? {
      examens: null,
      pharmacie: null,
    };
    const aDesMedicaments =
      dossiersAvecMedicaments.has(dossier.id) || Boolean(facs.pharmacie);
    const estClientWalkIn = estClientWalkInPharmacie(dossier.numeroDossier);
    const nombreMedicaments =
      facs.pharmacie?.nbLignes ??
      (aDesMedicaments && examens.length === 0 ? 1 : 0);

    const aDesExamensNonFactures =
      extraireLignesExamensNonFacturees(
        lignesExamensPrescrits,
        lignesExamensFactureesParDossier.get(dossier.id) ?? []
      ).length > 0;

    const etat = evaluerEtatFacturationDual({
      nombreExamens: examens.length,
      aDesMedicaments,
      statutFactureExamens: facs.examens?.statut ?? null,
      statutFacturePharmacie: facs.pharmacie?.statut ?? null,
      enFile: true,
      aDesExamensNonFactures,
    });

    if (exigerFactureEtablie && !etat.facturationComplete && !aFactureEtablie(facs)) {
      continue;
    }

    // Reste en file jusqu'à confirmation du transfert sortant (menu ⋮), même si payé.
    const facActive = etat.facturationComplete
      ? facs.pharmacie ?? facs.examens
      : !etat.factureExamensPayee && etat.aDesExamens
        ? facs.examens
        : facs.pharmacie ?? facs.examens;

    const montantFacture = facActive?.montantTotal ?? montantEstime;
    const montantPaye = facActive?.montantPaye ?? 0;
    const reste = Math.max(0, montantFacture - montantPaye);

    resultats.push({
      fileAttenteId: file.id,
      passageId: file.passageId,
      transfertId: transfert?.id ?? "",
      dossierId: dossier.id,
      numeroPatient: numeroIdentitePersonne(dossier.numeroDossier, patient.numeroPatient),
      numeroDossier: dossier.numeroDossier,
      prenom: patient.prenom,
      nom: patient.nom,
      telephone: patient.telephone,
      sexe: patient.sexe ?? null,
      dateNaissance: patient.dateNaissance?.toISOString() ?? null,
      motif: transfert?.motif ?? file.passage.motif,
      arriveeLe: file.arriveLe.toISOString(),
      numeroOrdre: file.numeroOrdre,
      nombreExamens: examens.length,
      nombreMedicaments,
      estClientWalkIn,
      montantEstime: etat.facturationComplete
        ? 0
        : facActive
          ? reste || montantFacture
          : montantEstime,
      factureOuverte: Boolean(facActive) || etat.facturationComplete || aFacturePayee(facs),
      statutFacture: etat.facturationComplete || aFacturePayee(facs)
        ? "PAYEE"
        : (facActive?.statut ?? null),
      montantFacture,
      montantPaye,
      resteAPayer: etat.facturationComplete ? 0 : facActive ? reste : montantEstime,
      modeFacture: facActive?.modeFacture ?? null,
      provenance,
      medecinResponsable: medecin,
      aDesMedicaments,
      factureExamensPayee: etat.factureExamensPayee,
      facturePharmaciePayee: etat.facturePharmaciePayee,
      facturationComplete: etat.facturationComplete,
      aUneFacturePayee:
        dossiersAvecFacturePayee.has(dossier.id) || etat.facturationComplete,
    });
  }

  return resultats;
}

export async function obtenirStatsCaisseJour(): Promise<StatsCaisseJour> {
  const debutJour = new Date();
  debutJour.setHours(0, 0, 0, 0);
  const finJour = new Date();
  finJour.setHours(23, 59, 59, 999);

  const [patientsEnAttente, facturesDuJour, paiements] = await Promise.all([
    prisma.fileAttente.count({
      where: {
        salle: { code: "CAISSE" },
        serviLe: null,
        NOT: {
          passage: {
            transferts: {
              some: {
                salleDestination: { code: "CAISSE" },
                statut: "EN_ATTENTE",
              },
            },
          },
        },
      },
    }),
    prisma.facture.count({
      where: {
        createdAt: { gte: debutJour, lte: finJour },
      },
    }),
    prisma.paiement.findMany({
      where: {
        payeLe: { gte: debutJour, lte: finJour },
      },
      select: { montant: true },
    }),
  ]);

  const montantEncaisseDuJour = paiements.reduce(
    (acc, p) => acc + decimalVersNombre(p.montant),
    0
  );

  return {
    patientsEnAttente,
    facturesDuJour,
    encaissementsDuJour: paiements.length,
    montantEncaisseDuJour,
  };
}
