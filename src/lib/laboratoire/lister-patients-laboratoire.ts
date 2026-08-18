import "server-only";
import { prisma } from "@/lib/prisma";
import { listerPatientsFileAttenteSalle, filtreTransfertVisibleSalle, STATUTS_TRANSFERT_VISIBLES_SALLE } from "@/lib/transferts/visibilite-salle";
import { calculerAge } from "@/features/caisse/utils-format";
import { patientCorrespondPageStatut } from "@/features/laboratoire/utils-affichage";
import { deriverStatutAnalyse } from "@/lib/laboratoire/orienter-statut-analyse";
import { classerExamensFacture } from "@/lib/laboratoire/classer-examens-facture";
import { estNumeroFacturePharmacie } from "@/lib/caisse/etat-facturation-dual";
import {
  lireOrientationAnalyseDepuisNotes,
  type IdOrientationStatutAnalyse,
} from "@/constants/laboratoire-orientations";
import type {
  DetailPatientLaboratoire,
  PatientFileLaboratoire,
  StatsLaboratoireJour,
} from "@/lib/laboratoire/types";

type StatutAnalysePersistant = Extract<
  IdOrientationStatutAnalyse,
  "VERIFIES" | "DR_APPROUVE" | "REJETES"
>;

function extraireModeFacture(reference: string | null | undefined): string | null {
  if (!reference) return null;
  return (
    reference
      .split("|")
      .find((part) => part.startsWith("modeFacture="))
      ?.replace("modeFacture=", "") ?? null
  );
}

function debutJourLocal(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

async function chargerPatParDossier(dossierIds: string[]): Promise<Map<string, string>> {
  const pats = new Map<string, string>();
  if (dossierIds.length === 0) return pats;

  const transferts = await prisma.transfert.findMany({
    where: {
      dossierId: { in: dossierIds },
      numeroTransfert: { not: null },
    },
    select: { dossierId: true, numeroTransfert: true },
    orderBy: { emisLe: "asc" },
  });

  for (const t of transferts) {
    if (t.numeroTransfert && !pats.has(t.dossierId)) {
      pats.set(t.dossierId, t.numeroTransfert);
    }
  }
  return pats;
}

function variantesNumeroPat(brut: string): string[] {
  const trim = brut.trim();
  const compact = trim.toUpperCase().replace(/[\s-]+/g, "");
  const variantes = new Set<string>([trim, compact].filter(Boolean));
  if (!compact) return [...variantes];

  const avecPat = compact.startsWith("PAT") ? compact : `PAT${compact}`;
  variantes.add(avecPat);

  const m = /^PAT(\d{4})(\d+)$/.exec(avecPat);
  if (m) {
    variantes.add(`PAT${m[1]}${m[2]}`);
    variantes.add(`PAT-${m[1]}${m[2]}`);
    variantes.add(`PAT-${m[1]}-${m[2]}`);
  }
  return [...variantes];
}

export async function listerPatientsLaboratoire(opts?: {
  numeroPermanent?: string;
  numeroPat?: string;
}): Promise<PatientFileLaboratoire[]> {
  const numeroPermanent = opts?.numeroPermanent?.trim() ?? "";
  const numeroPat = opts?.numeroPat?.trim() ?? "";
  if (numeroPermanent || numeroPat) {
    return listerParcoursLaboratoireParNumeros({ numeroPermanent, numeroPat });
  }

  const files = await listerPatientsFileAttenteSalle("LABORATOIRE");
  const dossierIds = files.map((f) => f.passage.dossier.id);

  const [factures, examensTous, transfertsSortants, pats] = await Promise.all([
    prisma.facture.findMany({
      where: {
        dossierId: { in: dossierIds },
        statut: { in: ["EMISE", "PARTIELLEMENT_PAYEE", "PAYEE"] },
      },
      include: {
        paiements: { orderBy: { payeLe: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    }),
    dossierIds.length === 0
      ? Promise.resolve([])
      : prisma.examenLaboratoire.findMany({
          where: { dossierId: { in: dossierIds } },
          include: { typeExamen: true },
        }),
    dossierIds.length === 0
      ? Promise.resolve([])
      : prisma.transfert.findMany({
          where: {
            dossierId: { in: dossierIds },
            salleOrigine: { code: "LABORATOIRE" },
            OR: [
              { statut: "EN_ATTENTE" },
              {
                statut: "REFUSE",
                recuperation: { statut: "EN_RECUPERATION" },
              },
            ],
          },
          include: {
            salleDestination: { select: { code: true, nom: true } },
            recuperation: { select: { statut: true } },
          },
          orderBy: { emisLe: "desc" },
        }),
    chargerPatParDossier(dossierIds),
  ]);

  const examensParDossier = new Map<string, typeof examensTous>();
  for (const ex of examensTous) {
    const liste = examensParDossier.get(ex.dossierId) ?? [];
    liste.push(ex);
    examensParDossier.set(ex.dossierId, liste);
  }

  const factureParDossier = new Map<
    string,
    { numeroFacture: string; statut: string; modePaiement: string | null }
  >();
  for (const f of factures) {
    if (factureParDossier.has(f.dossierId)) continue;
    factureParDossier.set(f.dossierId, {
      numeroFacture: f.numeroFacture,
      statut: f.statut,
      modePaiement: extraireModeFacture(f.paiements[0]?.reference),
    });
  }

  const sortantParDossier = new Map<string, (typeof transfertsSortants)[number][]>();
  for (const t of transfertsSortants) {
    const liste = sortantParDossier.get(t.dossierId) ?? [];
    liste.push(t);
    sortantParDossier.set(t.dossierId, liste);
  }

  const patients = files.map((file) => {
    const dossier = file.passage.dossier;
    const patient = dossier.patient;
    const transfert = file.passage.transferts[0];
    const examensBruts =
      examensParDossier.get(dossier.id) ?? dossier.examensLaboratoire;
    const examens = examensBruts.map((ex) => ({
      id: ex.id,
      libelle: ex.typeExamen.libelle,
      categorie: ex.typeExamen.categorie,
      statut: ex.statut,
      code: ex.typeExamen.code,
      notes: "notes" in ex ? (ex.notes ?? null) : null,
    }));
    const fac = factureParDossier.get(dossier.id) ?? null;
    const enreg = dossier.enregistrementsReception[0] ?? null;
    const formaterNom = (prenom?: string | null, nom?: string | null) => {
      const n = `${prenom ?? ""} ${nom ?? ""}`.trim();
      return n || null;
    };
    const sortants = sortantParDossier.get(dossier.id) ?? [];
    const sortant = sortants[0];
    const enRecuperation = sortants.some(
      (s) => s.recuperation?.statut === "EN_RECUPERATION"
    );
    const destinations = [
      ...new Set(sortants.map((s) => s.salleDestination.nom)),
    ];
    const orientation = destinations.length
      ? destinations.join(", ")
      : "Laboratoire";

    return {
      fileAttenteId: file.id,
      passageId: file.passageId,
      transfertId: transfert?.id ?? "",
      cleListe: dossier.id,
      dossierId: dossier.id,
      numeroPatient: patient.numeroPatient,
      numeroDossier: dossier.numeroDossier,
      prenom: patient.prenom,
      nom: patient.nom,
      telephone: patient.telephone,
      sexe: patient.sexe ?? null,
      dateNaissance: patient.dateNaissance?.toISOString() ?? null,
      age: calculerAge(patient.dateNaissance?.toISOString() ?? null),
      arriveeLe: file.arriveLe.toISOString(),
      numeroOrdre: file.numeroOrdre,
      provenance:
        transfert?.salleOrigine?.nom?.trim() ||
        transfert?.salleOrigine?.code ||
        "—",
      medecinResponsable: enreg?.medecinResponsable?.trim() || null,
      numeroTransfert:
        transfert?.numeroTransfert ?? pats.get(dossier.id) ?? null,
      numeroEnregistrement: patient.numeroPatient,
      heureTransfert: transfert?.emisLe?.toISOString() ?? file.arriveLe.toISOString(),
      heureEnregistrement: enreg?.enregistreLe?.toISOString() ?? null,
      enregistrePar: formaterNom(enreg?.agent?.prenom, enreg?.agent?.nom),
      transferePar: formaterNom(transfert?.emetteur?.prenom, transfert?.emetteur?.nom),
      examens,
      nombreExamens: examens.length,
      statutAnalyse: deriverStatutAnalyse(examens),
      numeroFacture: fac?.numeroFacture ?? null,
      modePaiement: fac?.modePaiement ?? null,
      statutFacture: fac?.statut ?? null,
      transfertSortantId: sortant?.id ?? null,
      statutTransfertSortant: sortant?.statut ?? null,
      codeSalleDestination: sortant?.salleDestination.code ?? null,
      codesSalleDestination: sortants.map((s) => s.salleDestination.code),
      enRecuperation,
      orientation,
    };
  });

  return patients.sort(
    (a, b) => new Date(b.arriveeLe).getTime() - new Date(a.arriveeLe).getTime()
  );
}

async function trouverDossierIdsRechercheLabo(opts: {
  numeroPermanent: string;
  numeroPat: string;
}): Promise<string[]> {
  const filtreTransfertLabo = {
    salleDestination: { code: "LABORATOIRE" as const },
    statut: { in: [...STATUTS_TRANSFERT_VISIBLES_SALLE] },
  };

  let filtrePatient: { patientId: { in: string[] } } | undefined;
  if (opts.numeroPermanent) {
    const q = opts.numeroPermanent.replace(/\s+/g, "");
    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { numeroPatient: q },
          { numeroPatient: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true },
      take: 20,
    });
    if (patients.length === 0) return [];
    filtrePatient = { patientId: { in: patients.map((p) => p.id) } };
  }

  if (opts.numeroPat) {
    const variantes = variantesNumeroPat(opts.numeroPat);
    const transfertsPat = await prisma.transfert.findMany({
      where: {
        ...(filtrePatient ? { dossier: filtrePatient } : {}),
        OR: variantes.map((v) => ({
          numeroTransfert: { equals: v, mode: "insensitive" as const },
        })),
      },
      select: { dossierId: true },
    });
    const idsPat = [...new Set(transfertsPat.map((t) => t.dossierId))];
    if (idsPat.length === 0) return [];

    const dossiersPat = await prisma.dossierPatient.findMany({
      where: {
        id: { in: idsPat },
        examensLaboratoire: { some: {} },
        transferts: { some: filtreTransfertLabo },
      },
      select: { id: true },
    });
    return dossiersPat.map((d) => d.id);
  }

  const dossiers = await prisma.dossierPatient.findMany({
    where: {
      ...filtrePatient,
      examensLaboratoire: { some: {} },
      transferts: { some: filtreTransfertLabo },
    },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  });
  return dossiers.map((d) => d.id);
}

async function listerParcoursLaboratoireParNumeros(opts: {
  numeroPermanent: string;
  numeroPat: string;
}): Promise<PatientFileLaboratoire[]> {
  const dossierIds = await trouverDossierIdsRechercheLabo(opts);
  if (dossierIds.length === 0) return [];
  return chargerPatientsLaboratoireParDossiers(dossierIds);
}

async function chargerPatientsLaboratoireParDossiers(
  dossierIds: string[]
): Promise<PatientFileLaboratoire[]> {
  const [dossiers, factures, pats, transfertsSortants] = await Promise.all([
    prisma.dossierPatient.findMany({
      where: { id: { in: dossierIds } },
      include: {
        patient: true,
        examensLaboratoire: { include: { typeExamen: true } },
        enregistrementsReception: {
          orderBy: { enregistreLe: "desc" },
          take: 1,
          include: { agent: { select: { prenom: true, nom: true } } },
        },
        passages: {
          where: { statut: { not: "ANNULE" } },
          orderBy: { createdAt: "desc" },
          include: {
            fileAttente: { include: { salle: { select: { code: true } } } },
            transferts: {
              where: { salleDestination: { code: "LABORATOIRE" } },
              orderBy: { emisLe: "desc" },
              include: {
                salleOrigine: { select: { code: true, nom: true } },
                emetteur: { select: { prenom: true, nom: true } },
              },
            },
          },
        },
      },
    }),
    prisma.facture.findMany({
      where: {
        dossierId: { in: dossierIds },
        statut: { in: ["EMISE", "PARTIELLEMENT_PAYEE", "PAYEE"] },
      },
      include: { paiements: { orderBy: { payeLe: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
    chargerPatParDossier(dossierIds),
    prisma.transfert.findMany({
      where: {
        dossierId: { in: dossierIds },
        salleOrigine: { code: "LABORATOIRE" },
      },
      include: {
        salleDestination: { select: { code: true, nom: true } },
        recuperation: { select: { statut: true } },
      },
      orderBy: { emisLe: "desc" },
    }),
  ]);

  const factureParDossier = new Map<
    string,
    { numeroFacture: string; statut: string; modePaiement: string | null }
  >();
  for (const f of factures) {
    if (factureParDossier.has(f.dossierId)) continue;
    factureParDossier.set(f.dossierId, {
      numeroFacture: f.numeroFacture,
      statut: f.statut,
      modePaiement: extraireModeFacture(f.paiements[0]?.reference),
    });
  }

  const sortantParDossier = new Map<string, (typeof transfertsSortants)[number][]>();
  for (const t of transfertsSortants) {
    const liste = sortantParDossier.get(t.dossierId) ?? [];
    liste.push(t);
    sortantParDossier.set(t.dossierId, liste);
  }

  const formaterNom = (prenom?: string | null, nom?: string | null) => {
    const n = `${prenom ?? ""} ${nom ?? ""}`.trim();
    return n || null;
  };

  const resultats: PatientFileLaboratoire[] = [];

  for (const dossier of dossiers) {
    const patient = dossier.patient;
    const passageLabo =
      dossier.passages.find(
        (p) => p.fileAttente?.salle.code === "LABORATOIRE"
      ) ??
      dossier.passages.find((p) => p.transferts.length > 0) ??
      dossier.passages[0];
    const transfert = passageLabo?.transferts[0];
    const file = passageLabo?.fileAttente;
    const examens = dossier.examensLaboratoire.map((ex) => ({
      id: ex.id,
      libelle: ex.typeExamen.libelle,
      categorie: ex.typeExamen.categorie,
      statut: ex.statut,
      code: ex.typeExamen.code,
      notes: ex.notes ?? null,
    }));
    const fac = factureParDossier.get(dossier.id) ?? null;
    const enreg = dossier.enregistrementsReception[0] ?? null;
    const arrivee =
      file?.arriveLe ?? transfert?.emisLe ?? dossier.createdAt;
    const sortants = sortantParDossier.get(dossier.id) ?? [];
    const sortant = sortants[0];
    const enRecuperation = sortants.some(
      (s) => s.recuperation?.statut === "EN_RECUPERATION"
    );
    const destinations = [
      ...new Set(sortants.map((s) => s.salleDestination.nom)),
    ];
    const orientation = destinations.length
      ? destinations.join(", ")
      : "Laboratoire";

    resultats.push({
      fileAttenteId: file?.id ?? dossier.id,
      passageId: passageLabo?.id ?? "",
      transfertId: transfert?.id ?? "",
      cleListe: dossier.id,
      dossierId: dossier.id,
      numeroPatient: patient.numeroPatient,
      numeroDossier: dossier.numeroDossier,
      prenom: patient.prenom,
      nom: patient.nom,
      telephone: patient.telephone,
      sexe: patient.sexe ?? null,
      dateNaissance: patient.dateNaissance?.toISOString() ?? null,
      age: calculerAge(patient.dateNaissance?.toISOString() ?? null),
      arriveeLe: arrivee.toISOString(),
      numeroOrdre: file?.numeroOrdre ?? 0,
      provenance:
        transfert?.salleOrigine?.nom?.trim() ||
        transfert?.salleOrigine?.code ||
        "—",
      medecinResponsable: enreg?.medecinResponsable?.trim() || null,
      numeroTransfert: transfert?.numeroTransfert ?? pats.get(dossier.id) ?? null,
      numeroEnregistrement: patient.numeroPatient,
      heureTransfert: transfert?.emisLe?.toISOString() ?? arrivee.toISOString(),
      heureEnregistrement: enreg?.enregistreLe?.toISOString() ?? null,
      enregistrePar: formaterNom(enreg?.agent?.prenom, enreg?.agent?.nom),
      transferePar: formaterNom(transfert?.emetteur?.prenom, transfert?.emetteur?.nom),
      examens,
      nombreExamens: examens.length,
      statutAnalyse: deriverStatutAnalyse(examens),
      numeroFacture: fac?.numeroFacture ?? null,
      modePaiement: fac?.modePaiement ?? null,
      statutFacture: fac?.statut ?? null,
      transfertSortantId: sortant?.id ?? null,
      statutTransfertSortant: sortant?.statut ?? null,
      codeSalleDestination: sortant?.salleDestination.code ?? null,
      codesSalleDestination: sortants.map((s) => s.salleDestination.code),
      enRecuperation,
      orientation,
    });
  }

  const ordre = new Map(dossierIds.map((id, i) => [id, i]));
  return resultats.sort(
    (a, b) => (ordre.get(a.dossierId) ?? 0) - (ordre.get(b.dossierId) ?? 0)
  );
}

function decimalLigne(valeur: { toNumber?: () => number } | number | string): number {
  if (typeof valeur === "number") return valeur;
  if (typeof valeur === "string") return Number.parseFloat(valeur) || 0;
  if (valeur && typeof valeur.toNumber === "function") return valeur.toNumber();
  return Number(valeur) || 0;
}

function dossierIdsUniquesDepuisExamens(
  examens: { dossierId: string }[]
): string[] {
  const vus = new Set<string>();
  const ids: string[] = [];
  for (const ex of examens) {
    if (vus.has(ex.dossierId)) continue;
    vus.add(ex.dossierId);
    ids.push(ex.dossierId);
  }
  return ids;
}

/** Dossiers ayant au moins un examen au statut d'analyse donné (hors file). */
export async function listerDossierIdsAvecExamensOrientation(
  orientation: StatutAnalysePersistant
): Promise<string[]> {
  if (orientation === "REJETES") {
    const examens = await prisma.examenLaboratoire.findMany({
      where: { statut: "ANNULE" },
      select: { dossierId: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
    return dossierIdsUniquesDepuisExamens(examens);
  }

  if (orientation === "DR_APPROUVE") {
    const examens = await prisma.examenLaboratoire.findMany({
      where: {
        statut: "TERMINE",
        notes: { contains: "laboOrientation=DR_APPROUVE" },
      },
      select: { dossierId: true, resultatLe: true },
      orderBy: { resultatLe: "desc" },
    });
    return dossierIdsUniquesDepuisExamens(examens);
  }

  const examens = await prisma.examenLaboratoire.findMany({
    where: {
      statut: "TERMINE",
      NOT: { notes: { contains: "laboOrientation=DR_APPROUVE" } },
    },
    select: { dossierId: true, notes: true, resultatLe: true },
    orderBy: { resultatLe: "desc" },
  });
  return dossierIdsUniquesDepuisExamens(
    examens.filter((ex) => {
      const o = lireOrientationAnalyseDepuisNotes(ex.notes);
      return !o || o === "VERIFIES";
    })
  );
}

/** Dossiers ayant au moins un examen validé biologiste (hors file d’attente). */
export async function listerDossierIdsAvecExamensDrApprouve(): Promise<string[]> {
  return listerDossierIdsAvecExamensOrientation("DR_APPROUVE");
}

async function eclaterParFactureExamens(
  patients: PatientFileLaboratoire[]
): Promise<PatientFileLaboratoire[]> {
  if (patients.length === 0) return [];

  const factures = await prisma.facture.findMany({
    where: {
      dossierId: { in: patients.map((p) => p.dossierId) },
      statut: { in: ["EMISE", "PARTIELLEMENT_PAYEE", "PAYEE"] },
    },
    include: {
      lignes: true,
      ventePharmacie: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const facturesExamensParDossier = new Map<string, typeof factures>();
  for (const f of factures) {
    if (f.ventePharmacie || estNumeroFacturePharmacie(f.numeroFacture)) continue;
    const liste = facturesExamensParDossier.get(f.dossierId) ?? [];
    liste.push(f);
    facturesExamensParDossier.set(f.dossierId, liste);
  }

  const resultats: PatientFileLaboratoire[] = [];

  for (const patient of patients) {
    const facs = facturesExamensParDossier.get(patient.dossierId) ?? [];
    if (facs.length <= 1) {
      resultats.push({ ...patient, cleListe: patient.dossierId });
      continue;
    }

    const lignesDossier: PatientFileLaboratoire[] = [];
    const idsPlaces = new Set<string>();
    for (const fac of facs) {
      const { approuves } = classerExamensFacture(
        fac.lignes.map((l) => ({
          libelle: l.libelle,
          montant: decimalLigne(l.montant),
        })),
        patient.examens.map((e) => ({
          id: e.id,
          statut: e.statut,
          libelle: e.libelle,
          notes: e.notes ?? null,
          resultatLe: null,
          aResultats: e.statut === "TERMINE",
        }))
      );
      const ids = new Set(approuves.map((a) => a.id));
      const examens = patient.examens.filter((e) => ids.has(e.id));
      if (examens.length === 0) continue;
      for (const e of examens) idsPlaces.add(e.id);
      lignesDossier.push({
        ...patient,
        cleListe: `${patient.dossierId}:${fac.id}`,
        fileAttenteId: `${patient.fileAttenteId}:${fac.id}`,
        examens,
        nombreExamens: examens.length,
        numeroFacture: fac.numeroFacture,
        statutFacture: fac.statut,
      });
    }

    const restants = patient.examens.filter(
      (e) =>
        e.statut === "TERMINE" &&
        !idsPlaces.has(e.id) &&
        (e.notes ?? "").includes("laboOrientation=DR_APPROUVE")
    );
    if (restants.length > 0) {
      if (lignesDossier.length > 0) {
        const cible = lignesDossier[0];
        cible.examens = [...cible.examens, ...restants];
        cible.nombreExamens = cible.examens.length;
      } else {
        lignesDossier.push({
          ...patient,
          cleListe: patient.dossierId,
          examens: restants,
          nombreExamens: restants.length,
        });
      }
    }

    resultats.push(...lignesDossier);
  }

  return resultats;
}

/**
 * Patients / visites d'un statut d'analyse terminé, même après sortie de file labo.
 * Les dossiers restent distincts : une autre visite du même patient (Reçus, etc.)
 * n'est pas fusionnée ici.
 */
export async function listerPatientsStatutPersistantLaboratoire(
  pageStatut: StatutAnalysePersistant,
  opts?: {
    numeroPermanent?: string;
    numeroPat?: string;
  }
): Promise<PatientFileLaboratoire[]> {
  let dossierIds = await listerDossierIdsAvecExamensOrientation(pageStatut);
  if (dossierIds.length === 0) return [];

  const numeroPermanent = opts?.numeroPermanent?.trim() ?? "";
  const numeroPat = opts?.numeroPat?.trim() ?? "";
  if (numeroPermanent || numeroPat) {
    const idsRecherche = await trouverDossierIdsRechercheLabo({
      numeroPermanent,
      numeroPat,
    });
    const autorises = new Set(idsRecherche);
    dossierIds = dossierIds.filter((id) => autorises.has(id));
  }

  const patients = await chargerPatientsLaboratoireParDossiers(dossierIds);
  if (pageStatut === "DR_APPROUVE") {
    return eclaterParFactureExamens(patients);
  }
  return patients.map((p) => ({ ...p, cleListe: p.dossierId }));
}

/**
 * Patients / visites avec examens Dr approuve, même après sortie de file labo.
 * Une ligne par dossier ; plusieurs factures examens → une ligne par facture.
 */
export async function listerPatientsDrApprouveLaboratoire(opts?: {
  numeroPermanent?: string;
  numeroPat?: string;
}): Promise<PatientFileLaboratoire[]> {
  return listerPatientsStatutPersistantLaboratoire("DR_APPROUVE", opts);
}

export async function obtenirDetailPatientLaboratoire(
  dossierId: string
): Promise<DetailPatientLaboratoire | null> {
  const patients = await listerPatientsLaboratoire();
  let base = patients.find((p) => p.dossierId === dossierId);
  if (!base) {
    const historiques = await chargerPatientsLaboratoireParDossiers([dossierId]);
    base = historiques[0] ?? undefined;
  }
  if (!base) {
    const { listerTransfertsSortantsLaboratoire } = await import(
      "@/lib/laboratoire/lister-transferts-sortants"
    );
    const sortants = await listerTransfertsSortantsLaboratoire();
    base = sortants.find((p) => p.dossierId === dossierId);
  }
  if (!base) return null;

  const patient = await prisma.patient.findFirst({
    where: { dossiers: { some: { id: dossierId } } },
    select: { photoUrl: true },
  });

  return {
    ...base,
    photoUrl: patient?.photoUrl ?? null,
  };
}

export async function obtenirStatsLaboratoire(): Promise<StatsLaboratoireJour> {
  const patients = await listerPatientsLaboratoire();
  const debut = debutJourLocal();

  const triesParArrivee = [...patients].sort(
    (a, b) =>
      new Date(b.arriveeLe).getTime() - new Date(a.arriveeLe).getTime()
  );

  const patientsRecusAujourdhui = patients.filter(
    (p) => new Date(p.arriveeLe) >= debut
  ).length;

  const analysesEnCoursListe = patients.filter((p) =>
    p.examens.some((e) => e.statut === "EN_ANALYSE")
  );

  const resultatsAValiderListe = patients.filter((p) =>
    p.examens.some((e) => e.statut === "TERMINE")
  );

  const resultatsValidesListe = patients.filter(
    (p) => p.statutAnalyse === "DR_APPROUVE"
  );

  const compteursStatutAnalyse = {
    RECUS: patients.filter((p) => patientCorrespondPageStatut(p, "RECUS")).length,
    EN_COURS: patients.filter((p) => patientCorrespondPageStatut(p, "EN_COURS"))
      .length,
    VERIFIES: (await listerDossierIdsAvecExamensOrientation("VERIFIES")).length,
    REJETES: (await listerDossierIdsAvecExamensOrientation("REJETES")).length,
    DR_APPROUVE: (await listerDossierIdsAvecExamensDrApprouve()).length,
  };

  const examensEnCours = patients.reduce(
    (acc, p) =>
      acc +
      p.examens.filter((e) => e.statut === "EN_ANALYSE" || e.statut === "PRESCRIT")
        .length,
    0
  );

  const debutIso = debut.toISOString();
  const resultatsValidesAujourdhui = await prisma.examenLaboratoire.count({
    where: {
      statut: "TERMINE",
      resultatLe: { gte: new Date(debutIso) },
    },
  });

  const LIMITE_LISTE_DASHBOARD = 40;

  return {
    dateReference: new Date().toISOString(),
    patientsRecusAujourdhui,
    patientsEnFile: patients.length,
    arriveesFileIso: patients.map((p) => p.arriveeLe),
    examensEnCours,
    analysesEnCours: analysesEnCoursListe.length,
    resultatsAValider: resultatsAValiderListe.length,
    resultatsValidesAujourdhui:
      resultatsValidesAujourdhui || resultatsValidesListe.length,
    imprimesEnvoyes: 0,
    compteursStatutAnalyse,
    derniersArrives: triesParArrivee.slice(0, 8),
    patientsTransferes: triesParArrivee.slice(0, LIMITE_LISTE_DASHBOARD),
    analysesEnCoursListe: analysesEnCoursListe.slice(0, LIMITE_LISTE_DASHBOARD),
    resultatsAValiderListe: resultatsAValiderListe.slice(
      0,
      LIMITE_LISTE_DASHBOARD
    ),
    resultatsValidesListe: resultatsValidesListe.slice(0, LIMITE_LISTE_DASHBOARD),
  };
}

/** Passe les examens PRESCRIT du dossier en EN_ANALYSE (démarrage analyses). */
export async function commencerAnalysesDossier(
  dossierId: string,
  technicienId: string
): Promise<{ misAJour: number }> {
  const enFile = await prisma.fileAttente.findFirst({
    where: {
      serviLe: null,
      salle: { code: "LABORATOIRE" },
      passage: {
        dossierId,
        transferts: { some: filtreTransfertVisibleSalle("LABORATOIRE") },
      },
    },
    select: { id: true },
  });
  if (!enFile) {
    throw new Error("Patient introuvable dans la file laboratoire.");
  }

  const result = await prisma.examenLaboratoire.updateMany({
    where: {
      dossierId,
      statut: "PRESCRIT",
    },
    data: {
      statut: "EN_ANALYSE",
      technicienId,
    },
  });

  return { misAJour: result.count };
}
