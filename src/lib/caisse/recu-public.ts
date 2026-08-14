import "server-only";
import { prisma } from "@/lib/prisma";
import { estNumeroFacturePharmacie } from "@/lib/caisse/etat-facturation-dual";
import {
  resoudreFactureExamensPourQr,
  resoudreFacturePharmaciePourQr,
} from "@/lib/caisse/resoudre-facture-qr-dossier";
import { verifierTokenRecuFacture } from "@/lib/caisse/token-recu-public";

export interface DetailRecuPublic {
  factureId: string;
  numeroFacture: string;
  statut: string;
  montantTotal: number;
  montantPaye: number;
  devise: string;
  emiseLe: string | null;
  modePaiement: string | null;
  modeFacture: string | null;
  patient: {
    prenom: string;
    nom: string;
    numeroPatient: string;
    telephone: string | null;
    dateNaissance: string | null;
    sexe: string | null;
  };
  dossier: {
    numeroDossier: string;
  };
  lignes: Array<{
    libelle: string;
    quantite: number;
    montant: number;
    type?: "examen" | "medicament";
  }>;
  examens: Array<{
    libelle: string;
    code: string | null;
    statut: string;
  }>;
  /** Lignes médicaments d'une facture pharmacie distincte (même dossier). */
  lignesMedicaments?: Array<{
    libelle: string;
    quantite: number;
    montant: number;
  }>;
  isPharmacie: boolean;
}

function decimalVersNombre(valeur: { toNumber?: () => number } | number | string): number {
  if (typeof valeur === "number") return valeur;
  if (typeof valeur === "string") return Number.parseFloat(valeur) || 0;
  if (valeur && typeof valeur.toNumber === "function") return valeur.toNumber();
  return Number(valeur) || 0;
}

export async function chargerRecuPublicParToken(
  token: string
): Promise<DetailRecuPublic | null> {
  const factureId = verifierTokenRecuFacture(token);
  if (!factureId) return null;

  const facture = await prisma.facture.findFirst({
    where: {
      id: factureId,
      statut: { in: ["PAYEE", "PARTIELLEMENT_PAYEE", "EMISE"] },
    },
    include: {
      lignes: { orderBy: { id: "asc" } },
      paiements: { orderBy: { payeLe: "desc" }, take: 1 },
      ventePharmacie: true,
      dossier: {
        include: {
          patient: true,
          examensLaboratoire: {
            where: { statut: { not: "ANNULE" } },
            include: { typeExamen: true },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!facture) return null;

  const dernierPaiement = facture.paiements[0] ?? null;
  const modeFacture =
    dernierPaiement?.reference
      ?.split("|")
      .find((part) => part.startsWith("modeFacture="))
      ?.replace("modeFacture=", "") ?? null;

  const lignesPositives = facture.lignes.filter(
    (l) => decimalVersNombre(l.montant) > 0
  );

  const examensParLibelle = new Map(
    facture.dossier.examensLaboratoire.map((ex) => [
      ex.typeExamen.libelle.trim().toLowerCase(),
      ex,
    ])
  );

  const examens = lignesPositives.map((l) => {
    const match = examensParLibelle.get(l.libelle.trim().toLowerCase());
    return {
      libelle: l.libelle,
      code: match?.typeExamen.code ?? null,
      statut: match?.statut ?? "FACTURE",
    };
  });

  const facturePharmacie =
    !estNumeroFacturePharmacie(facture.numeroFacture) && !facture.ventePharmacie
      ? await resoudreFacturePharmaciePourQr(facture.dossierId)
      : null;

  const lignesMedicaments =
    facturePharmacie?.lignes
      .filter((l) => decimalVersNombre(l.montant) > 0)
      .map((l) => ({
        libelle: l.libelle,
        quantite: l.quantite,
        montant: decimalVersNombre(l.montant),
      })) ?? [];

  return {
    factureId: facture.id,
    numeroFacture: facture.numeroFacture,
    statut: facture.statut,
    montantTotal: decimalVersNombre(facture.montantTotal),
    montantPaye: decimalVersNombre(facture.montantPaye),
    devise: facture.devise,
    emiseLe: facture.emiseLe?.toISOString() ?? null,
    modePaiement: dernierPaiement?.mode ?? null,
    modeFacture,
    patient: {
      prenom: facture.dossier.patient.prenom,
      nom: facture.dossier.patient.nom,
      numeroPatient: facture.dossier.patient.numeroPatient,
      telephone: facture.dossier.patient.telephone,
      dateNaissance: facture.dossier.patient.dateNaissance?.toISOString() ?? null,
      sexe: facture.dossier.patient.sexe ?? null,
    },
    dossier: {
      numeroDossier: facture.dossier.numeroDossier,
    },
    lignes: lignesPositives.map((l) => ({
      libelle: l.libelle,
      quantite: l.quantite,
      montant: decimalVersNombre(l.montant),
      type: estNumeroFacturePharmacie(facture.numeroFacture)
        ? ("medicament" as const)
        : ("examen" as const),
    })),
    examens,
    lignesMedicaments: lignesMedicaments.length > 0 ? lignesMedicaments : undefined,
    isPharmacie: estNumeroFacturePharmacie(facture.numeroFacture),
  };
}

/** Facture utilisée pour le QR du PDF laboratoire (examens, pas pharmacie seule). */
export async function resoudreFactureIdPourQrPdfLabo(
  dossierId: string
): Promise<string | null> {
  const facture = await resoudreFactureExamensPourQr(dossierId);
  return facture?.id ?? null;
}
