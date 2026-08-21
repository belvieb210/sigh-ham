import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { Prisma as PrismaNs } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { resoudreFormulaireExamen } from "@/lib/laboratoire/formulaire-depuis-categorie";
import { nomsParametresDepuisFormulaire } from "@/lib/laboratoire/parametres-modele-formulaire";

function decimalVersNombre(
  v: { toNumber?: () => number; toString?: () => string } | number | null | undefined
): number | null {
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (typeof v.toNumber === "function") return v.toNumber();
  return Number(v.toString?.() ?? v) || 0;
}

export type ParametreTypeExamenDto = {
  id: string;
  nom: string;
  unite: string | null;
  rangeUsuelle: string | null;
  obligatoire: boolean;
  ordre: number;
};

export type ParametreTypeExamenInput = {
  id?: string | null;
  nom: string;
  unite?: string | null;
  rangeUsuelle?: string | null;
  obligatoire?: boolean;
};

export type TypeExamenDto = {
  id: string;
  code: string;
  libelle: string;
  categorie: string;
  prix: number;
  delaiHeures: number;
  actif: boolean;
  packPrenuptial: boolean;
  formulaire: string | null;
  serviceLabo: string | null;
  specimen: string | null;
  uniteDefaut: string | null;
  rangeUsuelle: string | null;
  description: string | null;
  parametres: ParametreTypeExamenDto[];
};

const INCLUDE_PARAMETRES = {
  parametres: { orderBy: { ordre: "asc" as const } },
} as const;

function texteOuNull(v: string | null | undefined) {
  const t = v?.trim() ?? "";
  return t ? t : null;
}

function normaliserParametres(liste?: ParametreTypeExamenInput[]) {
  if (!liste) return [];
  const vus = new Set<string>();
  const result: ParametreTypeExamenInput[] = [];
  for (const p of liste) {
    const nom = p.nom.trim();
    if (!nom) continue;
    const cle = nom.toLowerCase();
    if (vus.has(cle)) throw new Error("PARAMETRE_DUPLIQUE");
    vus.add(cle);
    result.push({
      id: p.id?.trim() || null,
      nom,
      unite: texteOuNull(p.unite),
      rangeUsuelle: texteOuNull(p.rangeUsuelle),
      obligatoire: p.obligatoire ?? true,
    });
  }
  return result;
}

async function synchroniserParametres(
  tx: Prisma.TransactionClient,
  typeExamenId: string,
  liste: ParametreTypeExamenInput[]
) {
  const existants = await tx.parametreTypeExamen.findMany({
    where: { typeExamenId },
    select: { id: true },
  });
  const idsConnus = new Set(existants.map((e) => e.id));
  const idsGardes = new Set(
    liste
      .map((p) => p.id)
      .filter((id): id is string => typeof id === "string" && idsConnus.has(id))
  );
  const aSupprimer = existants.filter((e) => !idsGardes.has(e.id)).map((e) => e.id);
  if (aSupprimer.length > 0) {
    await tx.parametreTypeExamen.deleteMany({ where: { id: { in: aSupprimer } } });
  }
  for (let i = 0; i < liste.length; i += 1) {
    const p = liste[i]!;
    const data = {
      nom: p.nom,
      unite: p.unite ?? null,
      rangeUsuelle: p.rangeUsuelle ?? null,
      obligatoire: p.obligatoire ?? true,
      ordre: i,
    };
    if (p.id && idsConnus.has(p.id)) {
      await tx.parametreTypeExamen.update({ where: { id: p.id }, data });
    } else {
      await tx.parametreTypeExamen.create({
        data: { typeExamenId, ...data },
      });
    }
  }
}

export function mapperTypeExamen(e: {
  id: string;
  code: string;
  libelle: string;
  categorie: string;
  prix: { toNumber?: () => number } | number;
  delaiHeures: number;
  actif: boolean;
  packPrenuptial: boolean;
  formulaire?: string | null;
  serviceLabo?: string | null;
  specimen?: string | null;
  uniteDefaut?: string | null;
  rangeUsuelle?: string | null;
  description?: string | null;
  parametres?: {
    id: string;
    nom: string;
    unite: string | null;
    rangeUsuelle: string | null;
    obligatoire: boolean;
    ordre: number;
  }[];
}): TypeExamenDto {
  return {
    id: e.id,
    code: e.code,
    libelle: e.libelle,
    categorie: e.categorie,
    prix: decimalVersNombre(e.prix) ?? 0,
    delaiHeures: e.delaiHeures,
    actif: e.actif,
    packPrenuptial: e.packPrenuptial,
    formulaire: e.formulaire ?? null,
    serviceLabo: e.serviceLabo ?? null,
    specimen: e.specimen ?? null,
    uniteDefaut: e.uniteDefaut ?? null,
    rangeUsuelle: e.rangeUsuelle ?? null,
    description: e.description ?? null,
    parametres: (e.parametres ?? []).map((p) => ({
      id: p.id,
      nom: p.nom,
      unite: p.unite,
      rangeUsuelle: p.rangeUsuelle,
      obligatoire: p.obligatoire,
      ordre: p.ordre,
    })),
  };
}

export type MedicamentDto = {
  id: string;
  code: string;
  nom: string;
  categorie: string | null;
  forme: string | null;
  dosage: string | null;
  prixAchat: number | null;
  prixUnitaire: number;
  stockMinimum: number;
  stockMaximum: number | null;
  emplacement: string | null;
  actif: boolean;
  firme: string | null;
  telephoneFirme: string | null;
  classeMedicamenteuse: string | null;
  voieAdministration: string | null;
  expirationLe: string | null;
  recuPar: string | null;
  autresInformations: string | null;
  description: string | null;
  stockActuel: number;
  expirationProche: string | null;
  alerteStock: boolean;
  alerteExpiration: boolean;
  joursAvantExpiration: number | null;
};

function dateVersChamp(d: Date | null | undefined): string | null {
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const j = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${j}`;
}

function champVersDate(v: string | null | undefined): Date | null {
  const t = v?.trim() ?? "";
  if (!t) return null;
  const d = new Date(`${t}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function joursCalendairesRestants(expiration: Date) {
  const auj = new Date();
  auj.setHours(0, 0, 0, 0);
  const exp = new Date(expiration);
  exp.setHours(0, 0, 0, 0);
  return Math.round((exp.getTime() - auj.getTime()) / 86_400_000);
}

export function mapperMedicament(m: {
  id: string;
  code: string;
  nom: string;
  categorie: string | null;
  forme: string | null;
  dosage: string | null;
  prixAchat: { toNumber?: () => number } | number | null;
  prixUnitaire: { toNumber?: () => number } | number;
  stockMinimum: number;
  stockMaximum?: number | null;
  emplacement: string | null;
  actif: boolean;
  firme?: string | null;
  telephoneFirme?: string | null;
  classeMedicamenteuse?: string | null;
  voieAdministration?: string | null;
  expirationLe?: Date | null;
  recuPar?: string | null;
  autresInformations?: string | null;
  description?: string | null;
  stocks?: { quantite: number }[];
  lots?: { expirationLe: Date; quantite: number }[];
}): MedicamentDto {
  const stockActuel =
    m.stocks?.[0]?.quantite ??
    (m.lots ?? []).reduce((s, l) => s + (l.quantite ?? 0), 0);
  const dates = [
    ...(m.lots ?? [])
      .filter((l) => (l.quantite ?? 0) > 0)
      .map((l) => l.expirationLe),
    ...(m.expirationLe ? [m.expirationLe] : []),
  ];
  let prochaine: Date | null = null;
  for (const d of dates) {
    if (!prochaine || d < prochaine) prochaine = d;
  }
  const joursAvantExpiration = prochaine ? joursCalendairesRestants(prochaine) : null;
  return {
    id: m.id,
    code: m.code,
    nom: m.nom,
    categorie: m.categorie,
    forme: m.forme,
    dosage: m.dosage,
    prixAchat: decimalVersNombre(m.prixAchat),
    prixUnitaire: decimalVersNombre(m.prixUnitaire) ?? 0,
    stockMinimum: m.stockMinimum,
    stockMaximum: m.stockMaximum ?? null,
    emplacement: m.emplacement,
    actif: m.actif,
    firme: m.firme ?? null,
    telephoneFirme: m.telephoneFirme ?? null,
    classeMedicamenteuse: m.classeMedicamenteuse ?? null,
    voieAdministration: m.voieAdministration ?? null,
    expirationLe: dateVersChamp(m.expirationLe),
    recuPar: m.recuPar ?? null,
    autresInformations: m.autresInformations ?? null,
    description: m.description ?? null,
    stockActuel,
    expirationProche: dateVersChamp(prochaine),
    alerteStock:
      (m.stocks != null || m.lots != null) && stockActuel <= m.stockMinimum,
    alerteExpiration:
      joursAvantExpiration != null && joursAvantExpiration <= 5,
    joursAvantExpiration,
  };
}

export async function listerTypesExamen(opts?: {
  q?: string;
  actif?: boolean;
}) {
  const where: Prisma.TypeExamenWhereInput = {};
  if (opts?.actif != null) where.actif = opts.actif;
  if (opts?.q?.trim()) {
    const q = opts.q.trim();
    where.OR = [
      { code: { contains: q } },
      { libelle: { contains: q } },
      { categorie: { contains: q } },
    ];
  }
  const rows = await prisma.typeExamen.findMany({
    where,
    include: INCLUDE_PARAMETRES,
    orderBy: [{ actif: "desc" }, { libelle: "asc" }],
  });
  return rows.map(mapperTypeExamen);
}

type DonneesTypeExamen = {
  code: string;
  libelle: string;
  categorie: string;
  prix: number;
  delaiHeures?: number;
  actif?: boolean;
  packPrenuptial?: boolean;
  formulaire?: string | null;
  serviceLabo?: string | null;
  specimen?: string | null;
  uniteDefaut?: string | null;
  rangeUsuelle?: string | null;
  description?: string | null;
  parametres?: ParametreTypeExamenInput[];
};

function parametresDepuisModeleFormulaire(
  formulaire: string | null
): ParametreTypeExamenInput[] {
  return nomsParametresDepuisFormulaire(formulaire).map((nom) => ({
    nom,
    obligatoire: true,
  }));
}

export async function creerTypeExamen(data: DonneesTypeExamen) {
  const code = data.code.trim().toUpperCase();
  const libelle = data.libelle.trim();
  const categorie = data.categorie.trim();
  if (!code || !libelle || !categorie) throw new Error("CHAMPS_REQUIS");
  if (!Number.isFinite(data.prix) || data.prix < 0) throw new Error("PRIX_INVALIDE");
  const formulaire =
    texteOuNull(data.formulaire) ?? resoudreFormulaireExamen(null, categorie);
  let parametres = normaliserParametres(data.parametres);
  if (parametres.length === 0 && formulaire) {
    parametres = normaliserParametres(
      parametresDepuisModeleFormulaire(formulaire)
    );
  }

  try {
    const cree = await prisma.typeExamen.create({
      data: {
        code,
        libelle,
        categorie,
        prix: data.prix,
        delaiHeures: data.delaiHeures ?? 24,
        actif: data.actif ?? true,
        packPrenuptial: data.packPrenuptial ?? false,
        formulaire,
        serviceLabo: texteOuNull(data.serviceLabo),
        specimen: texteOuNull(data.specimen),
        uniteDefaut: texteOuNull(data.uniteDefaut),
        rangeUsuelle: texteOuNull(data.rangeUsuelle),
        description: texteOuNull(data.description),
        parametres: {
          create: parametres.map((p, i) => ({
            nom: p.nom,
            unite: p.unite ?? null,
            rangeUsuelle: p.rangeUsuelle ?? null,
            obligatoire: p.obligatoire ?? true,
            ordre: i,
          })),
        },
      },
      include: INCLUDE_PARAMETRES,
    });
    return mapperTypeExamen(cree);
  } catch (e) {
    if (
      e instanceof PrismaNs.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new Error("CODE_DUPLIQUE");
    }
    throw e;
  }
}

export async function mettreAJourTypeExamen(
  id: string,
  data: Partial<DonneesTypeExamen>
) {
  const existant = await prisma.typeExamen.findUnique({
    where: { id },
    include: { parametres: { select: { id: true } } },
  });
  if (!existant) throw new Error("INTROUVABLE");

  const categorieCible = data.categorie?.trim() || existant.categorie;
  const formulaireExplicite =
    data.formulaire !== undefined
      ? texteOuNull(data.formulaire)
      : texteOuNull(existant.formulaire);
  const formulaireResolu =
    formulaireExplicite ?? resoudreFormulaireExamen(null, categorieCible);

  const payload: Prisma.TypeExamenUpdateInput = {};
  if (data.code != null) payload.code = data.code.trim().toUpperCase();
  if (data.libelle != null) payload.libelle = data.libelle.trim();
  if (data.categorie != null) payload.categorie = data.categorie.trim();
  if (data.prix != null) {
    if (!Number.isFinite(data.prix) || data.prix < 0) throw new Error("PRIX_INVALIDE");
    payload.prix = data.prix;
  }
  if (data.delaiHeures != null) payload.delaiHeures = data.delaiHeures;
  if (data.actif != null) payload.actif = data.actif;
  if (data.packPrenuptial != null) payload.packPrenuptial = data.packPrenuptial;
  if (data.formulaire !== undefined) {
    payload.formulaire = formulaireExplicite ?? formulaireResolu;
  } else if (!existant.formulaire && formulaireResolu) {
    payload.formulaire = formulaireResolu;
  }
  if (data.serviceLabo !== undefined) payload.serviceLabo = texteOuNull(data.serviceLabo);
  if (data.specimen !== undefined) payload.specimen = texteOuNull(data.specimen);
  if (data.uniteDefaut !== undefined) payload.uniteDefaut = texteOuNull(data.uniteDefaut);
  if (data.rangeUsuelle !== undefined) payload.rangeUsuelle = texteOuNull(data.rangeUsuelle);
  if (data.description !== undefined) payload.description = texteOuNull(data.description);

  let parametres =
    data.parametres !== undefined ? normaliserParametres(data.parametres) : null;
  if (
    parametres &&
    parametres.length === 0 &&
    existant.parametres.length === 0 &&
    formulaireResolu
  ) {
    parametres = normaliserParametres(
      parametresDepuisModeleFormulaire(formulaireResolu)
    );
  } else if (
    parametres === null &&
    existant.parametres.length === 0 &&
    formulaireResolu
  ) {
    parametres = normaliserParametres(
      parametresDepuisModeleFormulaire(formulaireResolu)
    );
  }

  try {
    const maj = await prisma.$transaction(async (tx) => {
      await tx.typeExamen.update({ where: { id }, data: payload });
      if (parametres) {
        await synchroniserParametres(tx, id, parametres);
      }
      return tx.typeExamen.findUniqueOrThrow({
        where: { id },
        include: INCLUDE_PARAMETRES,
      });
    });
    return mapperTypeExamen(maj);
  } catch (e) {
    if (e instanceof Error && e.message === "PARAMETRE_DUPLIQUE") throw e;
    if (
      e instanceof PrismaNs.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new Error("CODE_DUPLIQUE");
    }
    throw e;
  }
}

/** Suppression définitive — refusée si des prescriptions / bilans y font référence. */
export async function supprimerTypeExamen(id: string) {
  const existant = await prisma.typeExamen.findUnique({
    where: { id },
    select: {
      id: true,
      _count: {
        select: {
          examens: true,
          paquetsBilan: true,
        },
      },
    },
  });
  if (!existant) throw new Error("INTROUVABLE");
  if (existant._count.examens > 0 || existant._count.paquetsBilan > 0) {
    throw new Error("EXAMEN_EN_USAGE");
  }

  await prisma.typeExamen.delete({ where: { id } });
}

export async function listerMedicaments(opts?: {
  q?: string;
  actif?: boolean;
}) {
  const where: Prisma.MedicamentWhereInput = {};
  if (opts?.actif != null) where.actif = opts.actif;
  if (opts?.q?.trim()) {
    const q = opts.q.trim();
    where.OR = [
      { code: { contains: q } },
      { nom: { contains: q } },
      { categorie: { contains: q } },
      { forme: { contains: q } },
      { firme: { contains: q } },
      { classeMedicamenteuse: { contains: q } },
    ];
  }
  const rows = await prisma.medicament.findMany({
    where,
    include: {
      stocks: { take: 1, select: { quantite: true } },
      lots: {
        where: { quantite: { gt: 0 } },
        select: { expirationLe: true, quantite: true },
        orderBy: { expirationLe: "asc" },
      },
    },
    orderBy: [{ actif: "desc" }, { nom: "asc" }],
  });
  return rows.map(mapperMedicament);
}

type DonneesMedicament = {
  code: string;
  nom: string;
  categorie?: string | null;
  forme?: string | null;
  dosage?: string | null;
  prixAchat?: number | null;
  prixUnitaire: number;
  stockMinimum?: number;
  stockMaximum?: number | null;
  emplacement?: string | null;
  actif?: boolean;
  firme?: string | null;
  telephoneFirme?: string | null;
  classeMedicamenteuse?: string | null;
  voieAdministration?: string | null;
  expirationLe?: string | null;
  recuPar?: string | null;
  autresInformations?: string | null;
  description?: string | null;
};

function texteBody(
  body: Record<string, unknown>,
  cle: string
): string | null | undefined {
  if (!(cle in body)) return undefined;
  const v = body[cle];
  if (v == null || v === "") return null;
  return String(v);
}

function nombreBody(
  body: Record<string, unknown>,
  cle: string
): number | null | undefined {
  if (!(cle in body)) return undefined;
  const v = body[cle];
  if (v == null || v === "") return null;
  return Number(v);
}

/** Champs de fiche catalogue : absents du body = non mis à jour (PATCH { actif } reste sûr). */
export function extraireFicheMedicament(body: Record<string, unknown>) {
  return {
    firme: texteBody(body, "firme"),
    telephoneFirme: texteBody(body, "telephoneFirme"),
    classeMedicamenteuse: texteBody(body, "classeMedicamenteuse"),
    voieAdministration: texteBody(body, "voieAdministration"),
    expirationLe: texteBody(body, "expirationLe"),
    recuPar: texteBody(body, "recuPar"),
    autresInformations: texteBody(body, "autresInformations"),
    description: texteBody(body, "description"),
    stockMaximum: nombreBody(body, "stockMaximum"),
  };
}

export async function creerMedicament(data: DonneesMedicament) {
  const code = data.code.trim().toUpperCase();
  const nom = data.nom.trim();
  if (!code || !nom) throw new Error("CHAMPS_REQUIS");
  if (!Number.isFinite(data.prixUnitaire) || data.prixUnitaire < 0) {
    throw new Error("PRIX_INVALIDE");
  }

  try {
    const cree = await prisma.medicament.create({
      data: {
        code,
        nom,
        categorie: data.categorie?.trim() || null,
        forme: data.forme?.trim() || null,
        dosage: data.dosage?.trim() || null,
        prixAchat:
          data.prixAchat != null && Number.isFinite(data.prixAchat)
            ? data.prixAchat
            : null,
        prixUnitaire: data.prixUnitaire,
        stockMinimum: data.stockMinimum ?? 10,
        stockMaximum:
          data.stockMaximum != null && Number.isFinite(data.stockMaximum)
            ? data.stockMaximum
            : null,
        emplacement: data.emplacement?.trim() || null,
        actif: data.actif ?? true,
        firme: data.firme?.trim() || null,
        telephoneFirme: data.telephoneFirme?.trim() || null,
        classeMedicamenteuse: data.classeMedicamenteuse?.trim() || null,
        voieAdministration: data.voieAdministration?.trim() || null,
        expirationLe: champVersDate(data.expirationLe),
        recuPar: data.recuPar?.trim() || null,
        autresInformations: data.autresInformations?.trim() || null,
        description: data.description?.trim() || null,
      },
    });
    return mapperMedicament(cree);
  } catch (e) {
    if (
      e instanceof PrismaNs.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new Error("CODE_DUPLIQUE");
    }
    throw e;
  }
}

export async function mettreAJourMedicament(
  id: string,
  data: Partial<DonneesMedicament>
) {
  const existant = await prisma.medicament.findUnique({ where: { id } });
  if (!existant) throw new Error("INTROUVABLE");

  const payload: Prisma.MedicamentUpdateInput = {};
  if (data.code != null) payload.code = data.code.trim().toUpperCase();
  if (data.nom != null) payload.nom = data.nom.trim();
  if (data.categorie !== undefined) payload.categorie = data.categorie?.trim() || null;
  if (data.forme !== undefined) payload.forme = data.forme?.trim() || null;
  if (data.dosage !== undefined) payload.dosage = data.dosage?.trim() || null;
  if (data.prixAchat !== undefined) {
    payload.prixAchat =
      data.prixAchat != null && Number.isFinite(data.prixAchat)
        ? data.prixAchat
        : null;
  }
  if (data.prixUnitaire != null) {
    if (!Number.isFinite(data.prixUnitaire) || data.prixUnitaire < 0) {
      throw new Error("PRIX_INVALIDE");
    }
    payload.prixUnitaire = data.prixUnitaire;
  }
  if (data.stockMinimum != null) payload.stockMinimum = data.stockMinimum;
  if (data.stockMaximum !== undefined) {
    payload.stockMaximum =
      data.stockMaximum != null && Number.isFinite(data.stockMaximum)
        ? data.stockMaximum
        : null;
  }
  if (data.emplacement !== undefined) {
    payload.emplacement = data.emplacement?.trim() || null;
  }
  if (data.actif != null) payload.actif = data.actif;
  if (data.firme !== undefined) payload.firme = data.firme?.trim() || null;
  if (data.telephoneFirme !== undefined) {
    payload.telephoneFirme = data.telephoneFirme?.trim() || null;
  }
  if (data.classeMedicamenteuse !== undefined) {
    payload.classeMedicamenteuse = data.classeMedicamenteuse?.trim() || null;
  }
  if (data.voieAdministration !== undefined) {
    payload.voieAdministration = data.voieAdministration?.trim() || null;
  }
  if (data.expirationLe !== undefined) {
    payload.expirationLe = champVersDate(data.expirationLe);
  }
  if (data.recuPar !== undefined) payload.recuPar = data.recuPar?.trim() || null;
  if (data.autresInformations !== undefined) {
    payload.autresInformations = data.autresInformations?.trim() || null;
  }
  if (data.description !== undefined) {
    payload.description = data.description?.trim() || null;
  }

  try {
    const maj = await prisma.medicament.update({ where: { id }, data: payload });
    return mapperMedicament(maj);
  } catch (e) {
    if (
      e instanceof PrismaNs.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new Error("CODE_DUPLIQUE");
    }
    throw e;
  }
}

function messageErreurCatalogue(code: string): string | null {
  switch (code) {
    case "CHAMPS_REQUIS":
      return "Champs obligatoires manquants.";
    case "PRIX_INVALIDE":
      return "Prix invalide.";
    case "CODE_DUPLIQUE":
      return "Ce code existe déjà.";
    case "PARAMETRE_DUPLIQUE":
      return "Deux paramètres portent le même nom.";
    case "INTROUVABLE":
      return "Élément introuvable.";
    case "EXAMEN_EN_USAGE":
      return "Impossible de supprimer : cet examen est déjà prescrit ou présent dans un bilan. Excluez-le du catalogue à la place.";
    default:
      return null;
  }
}

export { messageErreurCatalogue };
