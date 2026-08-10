import "server-only";
import { calculerAge } from "@/features/caisse/utils-format";
import { prisma } from "@/lib/prisma";

function decimal(n: { toNumber?: () => number } | number | null | undefined) {
  if (n == null) return 0;
  if (typeof n === "number") return n;
  if (typeof n.toNumber === "function") return n.toNumber();
  return Number(n);
}

function formaterHeure(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export interface PaiementValidePharmacie {
  id: string;
  numero: string;
  dossierId: string;
  numeroDossier: string;
  numeroPatient: string;
  prenom: string;
  nom: string;
  nomComplet: string;
  telephone: string;
  age: number | null;
  sexe: string | null;
  type: string;
  statut: string;
  montantTotal: number;
  nbMedicaments: number;
  payeeLe: string | null;
  heurePaiement: string;
  delivreeLe: string | null;
  factureId: string | null;
  ordonnanceId: string | null;
  estClientWalkIn: boolean;
}

/** Ventes pharmacie dont le paiement a été validé à la caisse (PAYEE ou DELIVREE). */
export async function listerPaiementsValidesPharmacie(): Promise<PaiementValidePharmacie[]> {
  const ventes = await prisma.ventePharmacie.findMany({
    where: { statut: { in: ["PAYEE", "DELIVREE"] } },
    include: {
      dossier: {
        include: {
          patient: {
            select: {
              prenom: true,
              nom: true,
              numeroPatient: true,
              telephone: true,
              dateNaissance: true,
              sexe: true,
            },
          },
        },
      },
      lignes: { select: { id: true } },
    },
    orderBy: { payeeLe: "desc" },
    take: 300,
  });

  return ventes.map((v) => {
    const patient = v.dossier.patient;
    const payeeIso = v.payeeLe?.toISOString() ?? null;
    return {
      id: v.id,
      numero: v.numero,
      dossierId: v.dossierId,
      numeroDossier: v.dossier.numeroDossier,
      numeroPatient: patient.numeroPatient,
      prenom: patient.prenom,
      nom: patient.nom,
      nomComplet: `${patient.prenom} ${patient.nom}`.trim(),
      telephone: patient.telephone ?? "—",
      age: calculerAge(patient.dateNaissance?.toISOString() ?? null),
      sexe: patient.sexe,
      type: v.type,
      statut: v.statut,
      montantTotal: decimal(v.montantTotal),
      nbMedicaments: v.lignes.length,
      payeeLe: payeeIso,
      heurePaiement: formaterHeure(payeeIso),
      delivreeLe: v.delivreeLe?.toISOString() ?? null,
      factureId: v.factureId,
      ordonnanceId: v.ordonnanceId,
      estClientWalkIn: v.dossier.numeroDossier.startsWith("PH-"),
    };
  });
}
