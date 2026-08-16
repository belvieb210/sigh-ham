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
import { construireLignesFactureExamens } from "@/lib/caisse/construire-lignes-facture-examens";

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
              salleOrigine: { code: "CAISSE" },
              statut: { in: ["ACCEPTE", "EN_TRAITEMENT", "TERMINE"] },
            },
            select: { id: true },
            take: 1,
          },
        },
      },
    },
  });

  const aReouvrir = sortis.filter((f) => f.passage.transferts.length === 0).map((f) => f.id);
  if (aReouvrir.length === 0) return;

  await prisma.fileAttente.updateMany({
    where: { id: { in: aReouvrir } },
    data: { serviLe: null },
  });
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

function prioriteStatutFacture(statut: StatutFacture): number {
  if (statut === "PAYEE") return 4;
  if (statut === "PARTIELLEMENT_PAYEE") return 3;
  if (statut === "EMISE") return 2;
  if (statut === "BROUILLON") return 1;
  return 0;
}

function retenirMeilleureFacture(
  courante: ResumeFacture | null,
  candidate: ResumeFacture
): ResumeFacture {
  if (!courante) return candidate;
  return prioriteStatutFacture(candidate.statut) >= prioriteStatutFacture(courante.statut)
    ? candidate
    : courante;
}

const includePassageCaisse = {
  passage: {
    include: {
      dossier: {
        include: {
          patient: true,
          examensLaboratoire: {
            where: { statut: { not: "ANNULE" as const } },
            include: { typeExamen: true, paquetBilan: true },
          },
          enregistrementsReception: {
            orderBy: { enregistreLe: "desc" as const },
            take: 1,
            select: {
              medecinResponsable: true,
              enregistreLe: true,
              agent: { select: { prenom: true, nom: true } },
            },
          },
        },
      },
      transferts: {
        orderBy: { emisLe: "desc" as const },
        include: {
          salleOrigine: { select: { code: true, nom: true } },
          salleDestination: { select: { code: true, nom: true } },
          emetteur: { select: { prenom: true, nom: true } },
        },
      },
    },
  },
} as const;

/** Tous les patients en file caisse (y compris facture payée en attente de transfert). */
async function listerFileAttenteCaissePourTransferts() {
  return prisma.fileAttente.findMany({
    where: {
      salle: { code: "CAISSE" },
      serviLe: null,
    },
    include: includePassageCaisse,
    orderBy: { numeroOrdre: "asc" },
  });
}

function aFacturePayee(facs: FacturesDossier): boolean {
  return facs.examens?.statut === "PAYEE" || facs.pharmacie?.statut === "PAYEE";
}

function aFactureEtablie(facs: FacturesDossier): boolean {
  const etablie = (statut: StatutFacture | undefined) =>
    statut === "EMISE" || statut === "PARTIELLEMENT_PAYEE" || statut === "PAYEE";
  return etablie(facs.examens?.statut) || etablie(facs.pharmacie?.statut);
}

export async function listerPatientsEnAttenteCaisse(options?: {
  /** Page transferts : file élargie + au moins une facture établie (examens ou pharmacie). */
  pourPageTransferts?: boolean;
}): Promise<PatientFileCaisse[]> {
  await reintegrerPatientsCaisseNonConfirmes();

  const pourTransferts = options?.pourPageTransferts === true;
  const files = pourTransferts
    ? await listerFileAttenteCaissePourTransferts()
    : await listerPatientsFileAttenteSalle("CAISSE");

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
        lignes: { select: { id: true } },
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
      montantTotal: decimalVersNombre(f.montantTotal),
      montantPaye: decimalVersNombre(f.montantPaye),
      modeFacture: extraireModeFacture(f.paiements[0]?.reference),
      nbLignes: f.lignes.length,
    };
    if (estPh) {
      courant.pharmacie = retenirMeilleureFacture(courant.pharmacie, resume);
    } else {
      courant.examens = retenirMeilleureFacture(courant.examens, resume);
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
    const montantEstime = construireLignesFactureExamens(
      examens.map((ex) => ({
        id: ex.id,
        paquetBilanId: ex.paquetBilanId,
        typeExamen: ex.typeExamen,
        paquetBilan: ex.paquetBilan,
      }))
    ).reduce((acc, l) => acc + l.montant, 0);
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

    const etat = evaluerEtatFacturationDual({
      nombreExamens: examens.length,
      aDesMedicaments,
      statutFactureExamens: facs.examens?.statut ?? null,
      statutFacturePharmacie: facs.pharmacie?.statut ?? null,
      enFile: true,
    });

    if (pourTransferts && !etat.facturationComplete && !aFactureEtablie(facs)) {
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
