import "server-only";
import type { StatutRendezVous } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { RendezVousMedecins } from "@/lib/medecins/types";

export const SERVICE_RDV_MEDECINS = "Médecins";

const STATUTS_VALIDES = new Set<StatutRendezVous>([
  "DEMANDE",
  "CONFIRME",
  "ANNULE",
  "TERMINE",
  "ABSENT",
]);

function mapperRdv(r: {
  id: string;
  prenom: string;
  nom: string;
  telephone: string;
  email: string | null;
  service: string;
  motif: string | null;
  dateSouhaitee: Date;
  statut: string;
  notes: string | null;
  createdAt: Date;
}): RendezVousMedecins {
  return {
    id: r.id,
    prenom: r.prenom,
    nom: r.nom,
    telephone: r.telephone,
    email: r.email,
    service: r.service,
    motif: r.motif,
    dateSouhaitee: r.dateSouhaitee.toISOString(),
    statut: r.statut,
    notes: r.notes,
    createdAt: r.createdAt.toISOString(),
  };
}

export async function listerRendezVousMedecins(): Promise<RendezVousMedecins[]> {
  const rows = await prisma.demandeRendezVous.findMany({
    where: { service: SERVICE_RDV_MEDECINS },
    orderBy: [{ dateSouhaitee: "asc" }, { createdAt: "desc" }],
    take: 100,
  });
  return rows.map(mapperRdv);
}

export async function creerRendezVousMedecins(input: {
  prenom: string;
  nom: string;
  telephone: string;
  email?: string | null;
  motif?: string | null;
  dateSouhaitee: string;
  notes?: string | null;
}): Promise<RendezVousMedecins> {
  const prenom = input.prenom.trim();
  const nom = input.nom.trim();
  const telephone = input.telephone.trim();
  if (!prenom || !nom || !telephone) throw new Error("CHAMPS_REQUIS");

  const date = new Date(input.dateSouhaitee);
  if (Number.isNaN(date.getTime())) throw new Error("DATE_INVALIDE");

  const r = await prisma.demandeRendezVous.create({
    data: {
      prenom,
      nom,
      telephone,
      email: input.email?.trim() || null,
      service: SERVICE_RDV_MEDECINS,
      motif: input.motif?.trim() || null,
      dateSouhaitee: date,
      notes: input.notes?.trim() || null,
      statut: "DEMANDE",
    },
  });

  return mapperRdv(r);
}

export async function changerStatutRendezVousMedecins(
  id: string,
  statut: string
): Promise<RendezVousMedecins> {
  if (!STATUTS_VALIDES.has(statut as StatutRendezVous)) {
    throw new Error("STATUT_INVALIDE");
  }

  const existante = await prisma.demandeRendezVous.findFirst({
    where: { id, service: SERVICE_RDV_MEDECINS },
    select: { id: true },
  });
  if (!existante) throw new Error("RDV_INTROUVABLE");

  const r = await prisma.demandeRendezVous.update({
    where: { id },
    data: { statut: statut as StatutRendezVous },
  });

  return mapperRdv(r);
}
