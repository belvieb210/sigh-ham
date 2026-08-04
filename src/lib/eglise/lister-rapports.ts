import "server-only";
import { prisma } from "@/lib/prisma";

export async function listerRapportsPrenuptiaux() {
  const rows = await prisma.examenPrenuptial.findMany({
    where: { rapportPdfUrl: { not: null } },
    orderBy: { termineLe: "desc" },
    include: {
      dossier: {
        include: {
          patient: {
            select: {
              prenom: true,
              nom: true,
              numeroPatient: true,
              sexe: true,
            },
          },
        },
      },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    dossierId: r.dossierId,
    numeroDossier: r.dossier.numeroDossier,
    numeroPatient: r.dossier.patient.numeroPatient,
    patient: [r.dossier.patient.prenom, r.dossier.patient.nom]
      .filter(Boolean)
      .join(" "),
    sexe: r.dossier.patient.sexe,
    paroisse: r.paroisse,
    conjointNom: r.conjointNom,
    dateMariage: r.dateMariage?.toISOString() ?? null,
    statut: r.statut,
    rapportPdfUrl: r.rapportPdfUrl,
    certificatUrl: r.certificatUrl,
    termineLe: r.termineLe?.toISOString() ?? null,
  }));
}

export async function listerCertificatsPrenuptiaux() {
  const rows = await prisma.examenPrenuptial.findMany({
    where: {
      OR: [{ rapportPdfUrl: { not: null } }, { certificatUrl: { not: null } }],
    },
    orderBy: { planifieLe: "desc" },
    include: {
      dossier: {
        include: {
          patient: {
            select: {
              prenom: true,
              nom: true,
              numeroPatient: true,
              sexe: true,
            },
          },
        },
      },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    dossierId: r.dossierId,
    numeroDossier: r.dossier.numeroDossier,
    numeroPatient: r.dossier.patient.numeroPatient,
    patient: [r.dossier.patient.prenom, r.dossier.patient.nom]
      .filter(Boolean)
      .join(" "),
    sexe: r.dossier.patient.sexe,
    paroisse: r.paroisse,
    conjointNom: r.conjointNom,
    dateMariage: r.dateMariage?.toISOString() ?? null,
    statut: r.statut,
    rapportPdfUrl: r.rapportPdfUrl,
    certificatUrl: r.certificatUrl,
    peutEmettre: Boolean(r.rapportPdfUrl) && !r.certificatUrl,
  }));
}
