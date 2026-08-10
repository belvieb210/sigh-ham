import "server-only";
import { prisma } from "@/lib/prisma";
import { uploaderFichier } from "@/lib/stockage/fichiers";

export interface LigneTraitementInput {
  effectueLe?: string | null;
  medicament: string;
  doseQuantite?: string | null;
  nomTraiteur?: string | null;
}

export interface CommentaireTraitementInput {
  texte: string;
}

export interface FichierTraitementInput {
  nom: string;
  url: string;
  typeMime?: string | null;
}

export interface DonneesFicheTraitement {
  medecinPrescripteur?: string | null;
  telPrescripteur?: string | null;
  numeroRecu?: string | null;
  poidsKg?: number | null;
  sexe?: string | null;
  debutTraitementLe: string;
  finTraitementLe: string;
  lignes: LigneTraitementInput[];
  commentaires: CommentaireTraitementInput[];
  fichiers?: FichierTraitementInput[];
}

function decimalVersNombre(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (typeof v === "object" && v !== null && "toNumber" in v) {
    return (v as { toNumber: () => number }).toNumber();
  }
  return Number(v) || null;
}

function mapperFiche(f: Awaited<ReturnType<typeof prisma.ficheTraitement.findFirst>> & {
  dossier: { numeroDossier: string; patient: { numeroPatient: string; prenom: string; nom: string; telephone: string | null; dateNaissance: Date | null; sexe: string | null } };
  infirmier: { prenom: string; nom: string };
  lignes: { id: string; effectueLe: Date | null; medicament: string; doseQuantite: string | null; nomTraiteur: string | null; ordre: number }[];
  commentaires: { id: string; texte: string; ordre: number }[];
  fichiers: { id: string; nom: string; url: string; typeMime: string | null; ordre: number }[];
}) {
  if (!f) throw new Error("Fiche introuvable.");
  const finEffective = new Date(f.finTraitementLe);
  finEffective.setDate(finEffective.getDate() + f.joursProlongation);
  return {
    id: f.id,
    dossierId: f.dossierId,
    numeroDossier: f.dossier.numeroDossier,
    numeroPatient: f.dossier.patient.numeroPatient,
    nomComplet: `${f.dossier.patient.prenom} ${f.dossier.patient.nom}`.trim(),
    telephone: f.dossier.patient.telephone,
    medecinPrescripteur: f.medecinPrescripteur,
    telPrescripteur: f.telPrescripteur,
    numeroRecu: f.numeroRecu,
    poidsKg: decimalVersNombre(f.poidsKg),
    sexe: f.sexe,
    debutTraitementLe: f.debutTraitementLe.toISOString(),
    finTraitementLe: f.finTraitementLe.toISOString(),
    finEffectiveLe: finEffective.toISOString(),
    joursProlongation: f.joursProlongation,
    statut: f.statut,
    pdfUrl: f.pdfUrl,
    clotureLe: f.clotureLe?.toISOString() ?? null,
    infirmierNom: `${f.infirmier.prenom} ${f.infirmier.nom}`.trim(),
    lignes: f.lignes.map((l) => ({
      id: l.id,
      effectueLe: l.effectueLe?.toISOString() ?? null,
      medicament: l.medicament,
      doseQuantite: l.doseQuantite,
      nomTraiteur: l.nomTraiteur,
    })),
    commentaires: f.commentaires.map((c) => ({ id: c.id, texte: c.texte })),
    fichiers: f.fichiers.map((fi) => ({
      id: fi.id,
      nom: fi.nom,
      url: fi.url,
      typeMime: fi.typeMime,
    })),
  };
}

const includeFiche = {
  dossier: {
    include: {
      patient: {
        select: {
          numeroPatient: true,
          prenom: true,
          nom: true,
          telephone: true,
          dateNaissance: true,
          sexe: true,
        },
      },
    },
  },
  infirmier: { select: { prenom: true, nom: true } },
  lignes: { orderBy: { ordre: "asc" as const } },
  commentaires: { orderBy: { ordre: "asc" as const } },
  fichiers: { orderBy: { ordre: "asc" as const } },
};

export async function listerFichesTraitementActives() {
  const fiches = await prisma.ficheTraitement.findMany({
    where: { statut: "EN_COURS" },
    include: includeFiche,
    orderBy: { finTraitementLe: "asc" },
  });
  return fiches.map((f) => mapperFiche(f as Parameters<typeof mapperFiche>[0]));
}

export async function obtenirFicheTraitement(id: string) {
  const f = await prisma.ficheTraitement.findUnique({
    where: { id },
    include: includeFiche,
  });
  if (!f) throw new Error("Fiche introuvable.");
  return mapperFiche(f as Parameters<typeof mapperFiche>[0]);
}

export async function listerFichesTraitementDossier(dossierId: string) {
  const fiches = await prisma.ficheTraitement.findMany({
    where: { dossierId },
    include: includeFiche,
    orderBy: { createdAt: "desc" },
  });
  return fiches.map((f) => mapperFiche(f as Parameters<typeof mapperFiche>[0]));
}

export async function creerFicheTraitement(
  infirmierId: string,
  dossierId: string,
  donnees: DonneesFicheTraitement
) {
  if (donnees.lignes.length === 0) {
    throw new Error("Ajoutez au moins une ligne de traitement.");
  }

  const fiche = await prisma.ficheTraitement.create({
    data: {
      dossierId,
      infirmierId,
      medecinPrescripteur: donnees.medecinPrescripteur?.trim() || null,
      telPrescripteur: donnees.telPrescripteur?.trim() || null,
      numeroRecu: donnees.numeroRecu?.trim() || null,
      poidsKg: donnees.poidsKg,
      sexe: donnees.sexe?.trim() || null,
      debutTraitementLe: new Date(donnees.debutTraitementLe),
      finTraitementLe: new Date(donnees.finTraitementLe),
      statut: "EN_COURS",
      lignes: {
        create: donnees.lignes.map((l, i) => ({
          medicament: l.medicament.trim(),
          doseQuantite: l.doseQuantite?.trim() || null,
          nomTraiteur: l.nomTraiteur?.trim() || null,
          effectueLe: l.effectueLe ? new Date(l.effectueLe) : null,
          ordre: i,
        })),
      },
      commentaires: {
        create: donnees.commentaires
          .filter((c) => c.texte.trim())
          .map((c, i) => ({ texte: c.texte.trim(), ordre: i })),
      },
      fichiers: {
        create: (donnees.fichiers ?? []).map((fi, i) => ({
          nom: fi.nom,
          url: fi.url,
          typeMime: fi.typeMime ?? null,
          ordre: i,
        })),
      },
    },
    include: includeFiche,
  });

  return mapperFiche(fiche as Parameters<typeof mapperFiche>[0]);
}

export async function mettreAJourFicheTraitement(
  id: string,
  donnees: DonneesFicheTraitement
) {
  await prisma.ligneTraitement.deleteMany({ where: { ficheId: id } });
  await prisma.commentaireTraitement.deleteMany({ where: { ficheId: id } });

  const fiche = await prisma.ficheTraitement.update({
    where: { id },
    data: {
      medecinPrescripteur: donnees.medecinPrescripteur?.trim() || null,
      telPrescripteur: donnees.telPrescripteur?.trim() || null,
      numeroRecu: donnees.numeroRecu?.trim() || null,
      poidsKg: donnees.poidsKg,
      sexe: donnees.sexe?.trim() || null,
      debutTraitementLe: new Date(donnees.debutTraitementLe),
      finTraitementLe: new Date(donnees.finTraitementLe),
      lignes: {
        create: donnees.lignes.map((l, i) => ({
          medicament: l.medicament.trim(),
          doseQuantite: l.doseQuantite?.trim() || null,
          nomTraiteur: l.nomTraiteur?.trim() || null,
          effectueLe: l.effectueLe ? new Date(l.effectueLe) : null,
          ordre: i,
        })),
      },
      commentaires: {
        create: donnees.commentaires
          .filter((c) => c.texte.trim())
          .map((c, i) => ({ texte: c.texte.trim(), ordre: i })),
      },
    },
    include: includeFiche,
  });

  return mapperFiche(fiche as Parameters<typeof mapperFiche>[0]);
}

export async function cloturerFicheTraitement(id: string, utilisateurId: string) {
  const fiche = await prisma.ficheTraitement.update({
    where: { id },
    data: {
      statut: "CLOTURE",
      clotureLe: new Date(),
      clotureParId: utilisateurId,
    },
    include: includeFiche,
  });
  return mapperFiche(fiche as Parameters<typeof mapperFiche>[0]);
}

export async function prolongerFicheTraitement(id: string, jours: number) {
  if (jours < 1) throw new Error("Nombre de jours invalide.");
  const fiche = await prisma.ficheTraitement.update({
    where: { id },
    data: { joursProlongation: { increment: jours } },
    include: includeFiche,
  });
  return mapperFiche(fiche as Parameters<typeof mapperFiche>[0]);
}

export async function attacherFichierFicheTraitement(
  ficheId: string,
  buffer: Buffer,
  nomFichier: string,
  typeMime: string
) {
  const upload = await uploaderFichier(buffer, nomFichier, typeMime, {
    sousDossier: "fiches-traitement",
  });
  const count = await prisma.fichierTraitement.count({ where: { ficheId } });
  await prisma.fichierTraitement.create({
    data: {
      ficheId,
      nom: nomFichier,
      url: upload.url,
      typeMime,
      ordre: count,
    },
  });
  return upload.url;
}

export { calculerAlerteFinTraitement } from "@/lib/infirmiers/fiche-traitement-utils";

export function normaliserDonneesFicheTraitement(
  corps: Record<string, unknown>
): DonneesFicheTraitement {
  const lignesBrutes = Array.isArray(corps.lignes) ? corps.lignes : [];
  const commentairesBruts = Array.isArray(corps.commentaires) ? corps.commentaires : [];
  const fichiersBruts = Array.isArray(corps.fichiers) ? corps.fichiers : [];

  const poidsRaw = corps.poidsKg;
  let poidsKg: number | null = null;
  if (poidsRaw != null && poidsRaw !== "") {
    const n = Number(poidsRaw);
    poidsKg = Number.isFinite(n) ? n : null;
  }

  return {
    medecinPrescripteur:
      typeof corps.medecinPrescripteur === "string" ? corps.medecinPrescripteur : null,
    telPrescripteur:
      typeof corps.telPrescripteur === "string" ? corps.telPrescripteur : null,
    numeroRecu: typeof corps.numeroRecu === "string" ? corps.numeroRecu : null,
    poidsKg,
    sexe: typeof corps.sexe === "string" ? corps.sexe : null,
    debutTraitementLe:
      typeof corps.debutTraitementLe === "string" ? corps.debutTraitementLe : "",
    finTraitementLe:
      typeof corps.finTraitementLe === "string" ? corps.finTraitementLe : "",
    lignes: lignesBrutes.map((l) => {
      const ligne = l as Record<string, unknown>;
      return {
        effectueLe:
          typeof ligne.effectueLe === "string" ? ligne.effectueLe : null,
        medicament: typeof ligne.medicament === "string" ? ligne.medicament : "",
        doseQuantite:
          typeof ligne.doseQuantite === "string" ? ligne.doseQuantite : null,
        nomTraiteur:
          typeof ligne.nomTraiteur === "string" ? ligne.nomTraiteur : null,
      };
    }),
    commentaires: commentairesBruts.map((c) => {
      const com = c as Record<string, unknown>;
      return {
        texte: typeof com.texte === "string" ? com.texte : "",
      };
    }),
    fichiers: fichiersBruts.map((f) => {
      const fi = f as Record<string, unknown>;
      return {
        nom: typeof fi.nom === "string" ? fi.nom : "fichier",
        url: typeof fi.url === "string" ? fi.url : "",
        typeMime: typeof fi.typeMime === "string" ? fi.typeMime : null,
      };
    }),
  };
}
