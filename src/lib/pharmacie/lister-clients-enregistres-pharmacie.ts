import "server-only";
import { calculerAge } from "@/features/caisse/utils-format";
import { prisma } from "@/lib/prisma";

export interface ClientEnregistrePharmacie {
  dossierId: string;
  numeroDossier: string;
  numeroPatient: string;
  prenom: string;
  nom: string;
  nomComplet: string;
  telephone: string;
  age: number | null;
  sexe: string | null;
  adresse: string | null;
  enregistreLe: string;
  heure: string;
  venteEnCours: boolean;
}

function formaterHeure(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

/** Clients walk-in enregistrés via la pharmacie (dossiers PH-). */
export async function listerClientsEnregistresPharmacie(): Promise<
  ClientEnregistrePharmacie[]
> {
  const limite = new Date();
  limite.setDate(limite.getDate() - 90);

  const dossiers = await prisma.dossierPatient.findMany({
    where: {
      numeroDossier: { startsWith: "PH-" },
      motifOuverture: "Vente pharmacie",
      createdAt: { gte: limite },
    },
    include: {
      patient: true,
      ventesPharmacie: {
        where: {
          statut: { in: ["BROUILLON", "TRANSMISE", "PAYEE", "DELIVREE"] },
        },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return dossiers.map((d) => {
    const patient = d.patient;
    return {
      dossierId: d.id,
      numeroDossier: d.numeroDossier,
      numeroPatient: patient.numeroPatient,
      prenom: patient.prenom,
      nom: patient.nom,
      nomComplet: `${patient.prenom} ${patient.nom}`.trim(),
      telephone: patient.telephone ?? "—",
      age: calculerAge(patient.dateNaissance?.toISOString() ?? null),
      sexe: patient.sexe,
      adresse: patient.adresse,
      enregistreLe: d.createdAt.toISOString(),
      heure: formaterHeure(d.createdAt.toISOString()),
      venteEnCours: d.ventesPharmacie.length > 0,
    };
  });
}
