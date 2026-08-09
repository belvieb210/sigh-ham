import "server-only";
import { prisma } from "@/lib/prisma";
import type { FactureCaisseDetail, LigneFacturable } from "@/lib/caisse/types";

function decimalVersNombre(valeur: { toNumber?: () => number } | number | string): number {
  if (typeof valeur === "number") return valeur;
  if (typeof valeur === "string") return Number.parseFloat(valeur) || 0;
  if (valeur && typeof valeur.toNumber === "function") return valeur.toNumber();
  return Number(valeur) || 0;
}

async function prochainNumeroFacturePharmacie() {
  const n = await prisma.facture.count({
    where: { numeroFacture: { startsWith: "FAC-PH-" } },
  });
  return `FAC-PH-${String(n + 1).padStart(6, "0")}`;
}

export interface SectionPharmacieDossier {
  aDesMedicaments: boolean;
  ordonnanceId: string | null;
  lignes: LigneFacturable[];
  facture: FactureCaisseDetail | null;
}

function mapperFacturePharmacie(
  facture: {
    id: string;
    numeroFacture: string;
    statut: FactureCaisseDetail["statut"];
    montantTotal: { toNumber?: () => number } | number | string;
    montantPaye: { toNumber?: () => number } | number | string;
    devise: string;
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
      mode: FactureCaisseDetail["historiquePaiements"][0]["mode"];
      reference: string | null;
      payeLe: Date;
      caissier: { prenom: string; nom: string };
    }[];
  } | null
): FactureCaisseDetail | null {
  if (!facture) return null;

  const lignes = facture.lignes.map((l) => ({
    id: l.id,
    libelle: l.libelle,
    quantite: l.quantite,
    prixUnitaire: decimalVersNombre(l.prixUnitaire),
    montant: decimalVersNombre(l.montant),
    source: "FACTURE" as const,
  }));

  const aUneAvanceExplicite = facture.paiements.some((p) =>
    p.reference?.split("|").some((part) => part === "modeFacture=AVANCE")
  );
  const aUneAvance =
    facture.statut !== "PAYEE" &&
    facture.statut !== "ANNULEE" &&
    (aUneAvanceExplicite || facture.statut === "PARTIELLEMENT_PAYEE");

  return {
    id: facture.id,
    numeroFacture: facture.numeroFacture,
    statut: facture.statut,
    montantTotal: decimalVersNombre(facture.montantTotal),
    montantPaye: decimalVersNombre(facture.montantPaye),
    devise: facture.devise,
    lignes,
    historiquePaiements: facture.paiements.map((p) => ({
      id: p.id,
      numeroRecu: facture.numeroFacture.replace(/^FAC-/, "REC-"),
      montant: decimalVersNombre(p.montant),
      mode: p.mode,
      typeFacture:
        p.reference
          ?.split("|")
          .find((part) => part.startsWith("modeFacture="))
          ?.replace("modeFacture=", "") ?? null,
      reference: p.reference,
      payeLe: p.payeLe.toISOString(),
      caissier: `${p.caissier.prenom} ${p.caissier.nom}`.trim(),
      statut:
        facture.statut === "PAYEE" || decimalVersNombre(p.montant) > 0
          ? ("PAYE" as const)
          : ("PARTIEL" as const),
    })),
    aUneAvance,
    isPharmacie: true,
  };
}

/** Charge les médicaments ordonnés et la facture pharmacie ouverte le cas échéant. */
export async function obtenirSectionPharmacieDossier(
  dossierId: string,
  facturePharmacieId?: string
): Promise<SectionPharmacieDossier> {
  const ordonnances = await prisma.ordonnance.findMany({
    where: {
      dossierId,
      statut: { in: ["EN_ATTENTE", "PARTIELLEMENT_DELIVREE"] },
      lignes: { some: {} },
    },
    include: {
      lignes: { include: { medicament: true }, orderBy: { medicament: { nom: "asc" } } },
      ventes: {
        where: { statut: { in: ["BROUILLON", "TRANSMISE", "PAYEE"] } },
        orderBy: { creeLe: "desc" },
        take: 1,
      },
    },
    orderBy: { prescritLe: "desc" },
  });

  const ordonnance = ordonnances.find((o) => o.lignes.length > 0) ?? null;

  let facturePharmacie = facturePharmacieId
    ? await prisma.facture.findFirst({
        where: {
          id: facturePharmacieId,
          dossierId,
          ventePharmacie: { isNot: null },
        },
        include: {
          lignes: true,
          paiements: {
            orderBy: { payeLe: "desc" },
            include: { caissier: { select: { prenom: true, nom: true } } },
          },
        },
      })
    : null;

  if (!facturePharmacie) {
    facturePharmacie = await prisma.facture.findFirst({
      where: {
        dossierId,
        statut: { notIn: ["ANNULEE", "PAYEE"] },
        ventePharmacie: { isNot: null },
      },
      include: {
        lignes: true,
        paiements: {
          orderBy: { payeLe: "desc" },
          include: { caissier: { select: { prenom: true, nom: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  const factureMappee = mapperFacturePharmacie(facturePharmacie);

  if (factureMappee && factureMappee.lignes.length > 0) {
    return {
      aDesMedicaments: true,
      ordonnanceId: ordonnance?.id ?? null,
      lignes: factureMappee.lignes.filter(
        (l) => l.montant > 0 && l.libelle !== "Frais divers"
      ),
      facture: factureMappee,
    };
  }

  if (!ordonnance || ordonnance.lignes.length === 0) {
    return {
      aDesMedicaments: false,
      ordonnanceId: null,
      lignes: [],
      facture: null,
    };
  }

  const venteExistante = ordonnance.ventes[0];
  if (venteExistante?.statut === "PAYEE") {
    return {
      aDesMedicaments: false,
      ordonnanceId: ordonnance.id,
      lignes: [],
      facture: null,
    };
  }

  const lignes: LigneFacturable[] = ordonnance.lignes.map((l) => {
    const prix = decimalVersNombre(l.medicament.prixUnitaire);
    return {
      id: l.id,
      libelle: `${l.medicament.nom}${l.medicament.dosage ? ` ${l.medicament.dosage}` : ""}`,
      quantite: l.quantite,
      prixUnitaire: prix,
      montant: prix * l.quantite,
      source: "FACTURE" as const,
    };
  });

  return {
    aDesMedicaments: lignes.length > 0,
    ordonnanceId: ordonnance.id,
    lignes,
    facture: null,
  };
}

/** Crée vente + facture pharmacie depuis l'ordonnance (encaissement caisse). */
export async function preparerFacturePharmacieDossier(
  dossierId: string,
  caissierId: string,
  options?: { factureId?: string; devise?: string }
) {
  const section = await obtenirSectionPharmacieDossier(
    dossierId,
    options?.factureId
  );

  if (!section.aDesMedicaments) {
    throw new Error("Ce patient n'a pas de médicaments à facturer.");
  }

  if (section.facture?.id && section.facture.statut !== "ANNULEE") {
    if (options?.devise && section.facture.devise !== options.devise) {
      await prisma.facture.update({
        where: { id: section.facture.id },
        data: { devise: options.devise === "USD" ? "USD" : "CDF" },
      });
    }
    return obtenirSectionPharmacieDossier(dossierId, section.facture.id);
  }

  if (!section.ordonnanceId) {
    throw new Error("Ordonnance pharmacie introuvable.");
  }

  const ordonnance = await prisma.ordonnance.findUnique({
    where: { id: section.ordonnanceId },
    include: { lignes: { include: { medicament: true } } },
  });
  if (!ordonnance?.lignes.length) {
    throw new Error("Ordonnance sans médicaments.");
  }

  const numeroFacture = await prochainNumeroFacturePharmacie();
  const devise = options?.devise === "USD" ? "USD" : "CDF";

  let montant = 0;
  const lignesData = ordonnance.lignes.map((l) => {
    const prix = decimalVersNombre(l.medicament.prixUnitaire);
    montant += prix * l.quantite;
    return {
      medicamentId: l.medicamentId,
      quantite: l.quantite,
      prixUnitaire: prix,
      remise: 0,
      libelle: `${l.medicament.nom}${l.medicament.dosage ? ` ${l.medicament.dosage}` : ""}`,
      montant: prix * l.quantite,
    };
  });

  const numeroVente = `VTE-${Date.now().toString(36).toUpperCase()}`;

  const facture = await prisma.$transaction(async (tx) => {
    const vente = await tx.ventePharmacie.create({
      data: {
        numero: numeroVente,
        dossierId,
        type: "ORDONNANCE",
        ordonnanceId: ordonnance.id,
        pharmacienId: caissierId,
        montantTotal: montant,
        statut: "BROUILLON",
        lignes: {
          create: lignesData.map(({ medicamentId, quantite, prixUnitaire, remise }) => ({
            medicamentId,
            quantite,
            prixUnitaire,
            remise,
          })),
        },
      },
    });

    const factureCreee = await tx.facture.create({
      data: {
        numeroFacture,
        dossierId,
        statut: "EMISE",
        montantTotal: montant,
        montantPaye: 0,
        devise,
        emiseLe: new Date(),
        lignes: {
          create: lignesData.map((l) => ({
            libelle: l.libelle,
            quantite: l.quantite,
            prixUnitaire: l.prixUnitaire,
            montant: l.montant,
          })),
        },
      },
    });

    await tx.ventePharmacie.update({
      where: { id: vente.id },
      data: {
        statut: "TRANSMISE",
        factureId: factureCreee.id,
        transmiseLe: new Date(),
      },
    });

    return factureCreee;
  });

  return obtenirSectionPharmacieDossier(dossierId, facture.id);
}
