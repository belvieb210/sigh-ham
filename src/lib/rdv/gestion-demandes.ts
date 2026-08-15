import "server-only";
import type { DemandeRendezVous, StatutRendezVous } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const STATUTS_RDV = [
  "DEMANDE",
  "CONFIRME",
  "ANNULE",
  "TERMINE",
  "ABSENT",
] as const;

export type StatutRdvCode = (typeof STATUTS_RDV)[number];

const LIBELLES_PRESTATION: Record<string, string> = {
  analyses: "Analyses de laboratoire",
  consultation: "Consultation médicale",
  imagerie: "Imagerie médicale",
  depistage: "Dépistage",
  prelevement: "Prélèvement",
};

export function libelleServiceDepuisPrestation(typePrestation: string): string {
  return LIBELLES_PRESTATION[typePrestation] ?? typePrestation;
}

export type DemandeRdvDto = {
  id: string;
  reference: string;
  prenom: string;
  nom: string;
  telephone: string;
  email: string | null;
  service: string;
  typePrestation: string | null;
  creneau: string | null;
  motif: string | null;
  dateNaissance: string | null;
  premiereVisite: boolean | null;
  dateSouhaitee: string;
  statut: string;
  notes: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
};

export function mapperDemandeRdv(r: DemandeRendezVous): DemandeRdvDto {
  return {
    id: r.id,
    reference: r.reference,
    prenom: r.prenom,
    nom: r.nom,
    telephone: r.telephone,
    email: r.email,
    service: r.service,
    typePrestation: r.typePrestation,
    creneau: r.creneau,
    motif: r.motif,
    dateNaissance: r.dateNaissance?.toISOString().slice(0, 10) ?? null,
    premiereVisite: r.premiereVisite,
    dateSouhaitee: r.dateSouhaitee.toISOString(),
    statut: r.statut,
    notes: r.notes,
    source: r.source,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function genererReferenceRdv(date = new Date()): string {
  const datePart = [
    date.getFullYear(),
    pad2(date.getMonth() + 1),
    pad2(date.getDate()),
  ].join("");
  const aleatoire = Math.floor(1000 + Math.random() * 9000);
  return `HAM-RDV-${datePart}-${aleatoire}`;
}

function combinerDateCreneau(dateIso: string, creneau: string): Date {
  const [y, m, d] = dateIso.split("-").map(Number);
  const [h, min] = creneau.split(":").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1, h ?? 0, min ?? 0, 0, 0);
  if (Number.isNaN(date.getTime())) throw new Error("DATE_INVALIDE");
  return date;
}

function splitNomComplet(nomComplet: string): { prenom: string; nom: string } {
  const parts = nomComplet.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { prenom: "—", nom: "—" };
  if (parts.length === 1) return { prenom: parts[0], nom: parts[0] };
  return { prenom: parts[0], nom: parts.slice(1).join(" ") };
}

export async function creerDemandeRdvDepuisFormulaire(input: {
  typePrestation: string;
  date: string;
  creneau: string;
  nomComplet: string;
  email: string;
  telephone: string;
  dateNaissance?: string;
  motif?: string;
  premiereVisite?: boolean;
  medecinId?: string;
  medecinNom?: string;
}): Promise<{ demande: DemandeRdvDto; reference: string }> {
  const { prenom, nom } = splitNomComplet(input.nomComplet);
  const dateSouhaitee = combinerDateCreneau(input.date, input.creneau);
  let reference = genererReferenceRdv();

  for (let i = 0; i < 5; i++) {
    try {
      const row = await prisma.demandeRendezVous.create({
        data: {
          reference,
          prenom,
          nom,
          telephone: input.telephone.trim(),
          email: input.email.trim() || null,
          service: libelleServiceDepuisPrestation(input.typePrestation),
          typePrestation: input.typePrestation,
          creneau: input.creneau,
          motif: input.motif?.trim() || null,
          dateNaissance: input.dateNaissance
            ? new Date(input.dateNaissance)
            : null,
          premiereVisite: input.premiereVisite ?? null,
          dateSouhaitee,
          notes: input.medecinNom?.trim()
            ? `Médecin souhaité : ${input.medecinNom.trim()}${input.medecinId ? ` (ref. ${input.medecinId})` : ""}`
            : null,
          source: "SITE_PUBLIC",
          statut: "DEMANDE",
        },
      });
      return { demande: mapperDemandeRdv(row), reference: row.reference };
    } catch {
      reference = genererReferenceRdv();
    }
  }
  throw new Error("REFERENCE_COLLISION");
}

export async function listerDemandesRdv(options?: {
  statut?: string;
  q?: string;
  take?: number;
}): Promise<DemandeRdvDto[]> {
  const take = options?.take ?? 200;
  const q = options?.q?.trim();
  const statut = options?.statut?.trim();

  const rows = await prisma.demandeRendezVous.findMany({
    where: {
      ...(statut && STATUTS_RDV.includes(statut as StatutRdvCode)
        ? { statut: statut as StatutRendezVous }
        : {}),
      ...(q
        ? {
            OR: [
              { reference: { contains: q, mode: "insensitive" } },
              { prenom: { contains: q, mode: "insensitive" } },
              { nom: { contains: q, mode: "insensitive" } },
              { telephone: { contains: q } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ dateSouhaitee: "asc" }, { createdAt: "desc" }],
    take,
  });
  return rows.map(mapperDemandeRdv);
}

export async function obtenirDemandeRdv(
  id: string
): Promise<DemandeRdvDto | null> {
  const row = await prisma.demandeRendezVous.findUnique({ where: { id } });
  return row ? mapperDemandeRdv(row) : null;
}

export async function mettreAJourDemandeRdv(
  id: string,
  data: { statut?: string; notes?: string | null }
): Promise<DemandeRdvDto> {
  if (data.statut && !STATUTS_RDV.includes(data.statut as StatutRdvCode)) {
    throw new Error("STATUT_INVALIDE");
  }
  const existante = await prisma.demandeRendezVous.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existante) throw new Error("RDV_INTROUVABLE");

  const row = await prisma.demandeRendezVous.update({
    where: { id },
    data: {
      ...(data.statut
        ? { statut: data.statut as StatutRendezVous }
        : {}),
      ...(data.notes !== undefined
        ? { notes: data.notes?.trim() || null }
        : {}),
    },
  });
  return mapperDemandeRdv(row);
}

export async function creerDemandeRdvManuelle(input: {
  prenom: string;
  nom: string;
  telephone: string;
  email?: string | null;
  motif?: string | null;
  dateSouhaitee: string;
  notes?: string | null;
  typePrestation?: string;
  creneau?: string;
  service?: string;
}): Promise<DemandeRdvDto> {
  const prenom = input.prenom.trim();
  const nom = input.nom.trim();
  const telephone = input.telephone.trim();
  if (!prenom || !nom || !telephone) throw new Error("CHAMPS_REQUIS");

  const date = new Date(input.dateSouhaitee);
  if (Number.isNaN(date.getTime())) throw new Error("DATE_INVALIDE");

  const typePrestation = input.typePrestation ?? "consultation";
  const reference = genererReferenceRdv();

  const row = await prisma.demandeRendezVous.create({
    data: {
      reference,
      prenom,
      nom,
      telephone,
      email: input.email?.trim() || null,
      service:
        input.service?.trim() ||
        libelleServiceDepuisPrestation(typePrestation),
      typePrestation,
      creneau: input.creneau ?? null,
      motif: input.motif?.trim() || null,
      dateSouhaitee: date,
      notes: input.notes?.trim() || null,
      source: "MANUEL",
      statut: "DEMANDE",
    },
  });
  return mapperDemandeRdv(row);
}

export async function compterDemandesRdvParStatut() {
  const maintenant = new Date();
  const debutJour = new Date(
    maintenant.getFullYear(),
    maintenant.getMonth(),
    maintenant.getDate()
  );
  const finJour = new Date(debutJour);
  finJour.setDate(finJour.getDate() + 1);

  const [nouvelles, confirmees, aujourdhui] = await Promise.all([
    prisma.demandeRendezVous.count({ where: { statut: "DEMANDE" } }),
    prisma.demandeRendezVous.count({ where: { statut: "CONFIRME" } }),
    prisma.demandeRendezVous.count({
      where: {
        dateSouhaitee: { gte: debutJour, lt: finJour },
      },
    }),
  ]);
  return { nouvelles, confirmees, aujourdhui };
}
