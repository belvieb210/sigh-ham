import "server-only";
import type { Sexe } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { enregistrerAudit } from "@/lib/admin/audit";
import { estClientWalkInPharmacie } from "@/lib/pharmacie/client-walk-in";
import { sauvegarderPhotoPatient } from "@/lib/reception/photo-patient";

export type TypePersonneAdmin = "PATIENT" | "CLIENT";

export type DossierPersonneAdmin = {
  id: string;
  numeroDossier: string;
  statut: string;
  ouvertLe: string;
  salleEnregistrement: string;
};

export type PersonneAdmin = {
  id: string;
  type: TypePersonneAdmin;
  numeroPatient: string;
  prenom: string;
  nom: string;
  dateNaissance: string | null;
  age: number | null;
  sexe: Sexe | null;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  ville: string | null;
  province: string | null;
  pays: string;
  groupeSanguin: string | null;
  allergies: string | null;
  contactUrgence: string | null;
  telephoneUrgence: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  dernierDossier: (DossierPersonneAdmin & { clotureLe: string | null }) | null;
  dossiers: DossierPersonneAdmin[];
};

const selectPatient = {
  id: true,
  numeroPatient: true,
  prenom: true,
  nom: true,
  dateNaissance: true,
  age: true,
  sexe: true,
  telephone: true,
  email: true,
  adresse: true,
  ville: true,
  province: true,
  pays: true,
  groupeSanguin: true,
  allergies: true,
  contactUrgence: true,
  telephoneUrgence: true,
  photoUrl: true,
  createdAt: true,
  updatedAt: true,
  dossiers: {
    orderBy: { ouvertLe: "desc" as const },
    select: {
      id: true,
      numeroDossier: true,
      statut: true,
      ouvertLe: true,
      clotureLe: true,
      salleEnregistrement: true,
    },
  },
} as const;

function mapperPersonne(
  p: Awaited<ReturnType<typeof prisma.patient.findMany<{ select: typeof selectPatient }>>>[number]
): PersonneAdmin {
  const aDossierHopital = p.dossiers.some(
    (d) => !estClientWalkInPharmacie(d.numeroDossier)
  );
  const aDossierClient = p.dossiers.some((d) =>
    estClientWalkInPharmacie(d.numeroDossier)
  );
  const type: TypePersonneAdmin =
    aDossierHopital || !aDossierClient ? "PATIENT" : "CLIENT";
  const dernier = p.dossiers[0] ?? null;

  return {
    id: p.id,
    type,
    numeroPatient: p.numeroPatient,
    prenom: p.prenom,
    nom: p.nom,
    dateNaissance: p.dateNaissance?.toISOString() ?? null,
    age: p.age ?? null,
    sexe: p.sexe,
    telephone: p.telephone,
    email: p.email,
    adresse: p.adresse,
    ville: p.ville,
    province: p.province,
    pays: p.pays,
    groupeSanguin: p.groupeSanguin,
    allergies: p.allergies,
    contactUrgence: p.contactUrgence,
    telephoneUrgence: p.telephoneUrgence,
    photoUrl: p.photoUrl,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    dernierDossier: dernier
      ? {
          id: dernier.id,
          numeroDossier: dernier.numeroDossier,
          statut: dernier.statut,
          ouvertLe: dernier.ouvertLe.toISOString(),
          clotureLe: dernier.clotureLe?.toISOString() ?? null,
          salleEnregistrement: dernier.salleEnregistrement,
        }
      : null,
    dossiers: p.dossiers.map((d) => ({
      id: d.id,
      numeroDossier: d.numeroDossier,
      statut: d.statut,
      ouvertLe: d.ouvertLe.toISOString(),
      salleEnregistrement: d.salleEnregistrement,
    })),
  };
}

export async function listerPersonnesAdmin() {
  const patients = await prisma.patient.findMany({
    select: selectPatient,
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    take: 800,
  });
  return patients.map(mapperPersonne);
}

export async function obtenirPersonneAdmin(id: string) {
  const patient = await prisma.patient.findUnique({
    where: { id },
    select: selectPatient,
  });
  if (!patient) return null;
  return mapperPersonne(patient);
}

export async function mettreAJourPersonneAdmin(
  acteurId: string,
  id: string,
  input: {
    prenom?: string;
    nom?: string;
    dateNaissance?: string | null;
    age?: number | null;
    sexe?: Sexe | null;
    telephone?: string | null;
    email?: string | null;
    adresse?: string | null;
    ville?: string | null;
    province?: string | null;
    pays?: string | null;
    groupeSanguin?: string | null;
    allergies?: string | null;
    contactUrgence?: string | null;
    telephoneUrgence?: string | null;
  }
) {
  const existant = await prisma.patient.findUnique({
    where: { id },
    select: { id: true, numeroPatient: true, prenom: true, nom: true },
  });
  if (!existant) throw new Error("Fiche introuvable.");

  const prenom = input.prenom?.trim();
  const nom = input.nom?.trim();
  if (prenom !== undefined && !prenom) {
    throw new Error("Le prénom est requis.");
  }
  if (nom !== undefined && !nom) {
    throw new Error("Le nom est requis.");
  }

  const maj = await prisma.patient.update({
    where: { id },
    data: {
      ...(prenom !== undefined ? { prenom } : {}),
      ...(nom !== undefined ? { nom: nom.toUpperCase() } : {}),
      ...(input.dateNaissance !== undefined
        ? {
            dateNaissance: input.dateNaissance
              ? new Date(input.dateNaissance)
              : null,
          }
        : {}),
      ...(input.age !== undefined ? { age: input.age } : {}),
      ...(input.sexe !== undefined ? { sexe: input.sexe } : {}),
      ...(input.telephone !== undefined
        ? { telephone: input.telephone?.trim() || null }
        : {}),
      ...(input.email !== undefined
        ? { email: input.email?.trim() || null }
        : {}),
      ...(input.adresse !== undefined
        ? { adresse: input.adresse?.trim() || null }
        : {}),
      ...(input.ville !== undefined ? { ville: input.ville?.trim() || null } : {}),
      ...(input.province !== undefined
        ? { province: input.province?.trim() || null }
        : {}),
      ...(input.pays !== undefined
        ? { pays: input.pays?.trim() || "RD Congo" }
        : {}),
      ...(input.groupeSanguin !== undefined
        ? { groupeSanguin: input.groupeSanguin?.trim() || null }
        : {}),
      ...(input.allergies !== undefined
        ? { allergies: input.allergies?.trim() || null }
        : {}),
      ...(input.contactUrgence !== undefined
        ? { contactUrgence: input.contactUrgence?.trim() || null }
        : {}),
      ...(input.telephoneUrgence !== undefined
        ? { telephoneUrgence: input.telephoneUrgence?.trim() || null }
        : {}),
    },
    select: selectPatient,
  });

  await enregistrerAudit({
    utilisateurId: acteurId,
    type: "MODIFICATION",
    module: "ADMIN",
    entite: "Patient",
    entiteId: id,
    action: `Fiche ${existant.numeroPatient} mise à jour (${existant.prenom} ${existant.nom})`,
  });

  return mapperPersonne(maj);
}

export async function mettreAJourPhotoPersonneAdmin(
  acteurId: string,
  id: string,
  photo: File
) {
  const existant = await prisma.patient.findUnique({
    where: { id },
    select: { id: true, numeroPatient: true },
  });
  if (!existant) throw new Error("Fiche introuvable.");

  const photoUrl = await sauvegarderPhotoPatient(existant.numeroPatient, photo);
  const maj = await prisma.patient.update({
    where: { id },
    data: { photoUrl },
    select: selectPatient,
  });

  await enregistrerAudit({
    utilisateurId: acteurId,
    type: "MODIFICATION",
    module: "ADMIN",
    entite: "Patient",
    entiteId: id,
    action: `Photo mise à jour — ${existant.numeroPatient}`,
  });

  return mapperPersonne(maj);
}

export async function supprimerPersonneAdmin(acteurId: string, id: string) {
  const existant = await prisma.patient.findUnique({
    where: { id },
    select: {
      id: true,
      numeroPatient: true,
      prenom: true,
      nom: true,
      _count: {
        select: {
          conversations: true,
          recuperationsTransfert: true,
        },
      },
      dossiers: {
        select: {
          id: true,
          _count: {
            select: {
              factures: true,
              examensLaboratoire: true,
              consultations: true,
              ordonnances: true,
              transferts: true,
              passages: true,
              enregistrementsReception: true,
              constantesVitales: true,
              admissions: true,
              examensPrenuptiaux: true,
              recuperationsTransfert: true,
              conversations: true,
              ventesPharmacie: true,
              estimationsConvention: true,
              fichesTraitement: true,
            },
          },
        },
      },
    },
  });
  if (!existant) throw new Error("Fiche introuvable.");

  const aActivitePatient =
    existant._count.conversations > 0 || existant._count.recuperationsTransfert > 0;
  const aActivite = existant.dossiers.some((d) =>
    Object.values(d._count).some((n) => n > 0)
  );
  if (aActivite || aActivitePatient) {
    throw new Error(
      "Impossible de supprimer : des visites, factures ou examens existent. Utilisez « Réinitialiser complet »."
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.dossierPatient.deleteMany({ where: { patientId: id } });
    await tx.patient.delete({ where: { id } });
  });

  await enregistrerAudit({
    utilisateurId: acteurId,
    type: "SUPPRESSION",
    module: "ADMIN",
    entite: "Patient",
    entiteId: id,
    action: `Suppression de ${existant.numeroPatient} (${existant.prenom} ${existant.nom})`,
  });
}
