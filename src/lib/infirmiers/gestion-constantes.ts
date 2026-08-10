import "server-only";
import { prisma } from "@/lib/prisma";
import {
  mapperConstante,
  decimalOuNull,
} from "@/lib/infirmiers/lister-patients-infirmiers";
import type { ConstanteVitaleResume } from "@/lib/infirmiers/types";

import type { FormulaireCliniqueMedecins } from "@/lib/medecins/types";

export interface DonneesConstantesSaisie {
  temperature?: number | null;
  tensionSystolique?: number | null;
  tensionDiastolique?: number | null;
  frequenceCardiaque?: number | null;
  frequenceRespiratoire?: number | null;
  poidsKg?: number | null;
  tailleCm?: number | null;
  saturationO2?: number | null;
  glycemie?: number | null;
  observations?: string | null;
  formulaireClinique?: FormulaireCliniqueMedecins | null;
}

function parseOptionnelNombre(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const n = Number.parseFloat(v.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return decimalOuNull(v as never);
}

function parseOptionnelInt(v: unknown): number | null {
  const n = parseOptionnelNombre(v);
  return n == null ? null : Math.round(n);
}

export function normaliserDonneesConstantes(
  body: Record<string, unknown>
): DonneesConstantesSaisie {
  const formulaireClinique =
    body.formulaireClinique && typeof body.formulaireClinique === "object"
      ? (body.formulaireClinique as FormulaireCliniqueMedecins)
      : null;
  const sv = formulaireClinique?.signesVitaux ?? {};
  return {
    temperature: parseOptionnelNombre(body.temperature ?? sv.temperature),
    tensionSystolique: parseOptionnelInt(body.tensionSystolique ?? sv.tensionSystolique),
    tensionDiastolique: parseOptionnelInt(body.tensionDiastolique ?? sv.tensionDiastolique),
    frequenceCardiaque: parseOptionnelInt(body.frequenceCardiaque ?? sv.frequenceCardiaque),
    frequenceRespiratoire: parseOptionnelInt(body.frequenceRespiratoire),
    poidsKg: parseOptionnelNombre(body.poidsKg ?? sv.poidsKg),
    tailleCm: parseOptionnelNombre(body.tailleCm ?? sv.tailleCm),
    saturationO2: parseOptionnelInt(body.saturationO2 ?? sv.saturationO2),
    glycemie: parseOptionnelNombre(body.glycemie),
    observations:
      typeof body.observations === "string"
        ? body.observations.trim() || null
        : null,
    formulaireClinique,
  };
}

export async function creerConstantesVitales(
  infirmierId: string,
  dossierId: string,
  donnees: DonneesConstantesSaisie
): Promise<ConstanteVitaleResume> {
  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    select: { id: true },
  });
  if (!dossier) throw new Error("Dossier patient introuvable.");

  const cree = await prisma.constantesVitales.create({
    data: {
      dossierId,
      infirmierId,
      temperature: donnees.temperature,
      tensionSystolique: donnees.tensionSystolique,
      tensionDiastolique: donnees.tensionDiastolique,
      frequenceCardiaque: donnees.frequenceCardiaque,
      frequenceRespiratoire: donnees.frequenceRespiratoire,
      poidsKg: donnees.poidsKg,
      tailleCm: donnees.tailleCm,
      saturationO2: donnees.saturationO2,
      glycemie: donnees.glycemie,
      observations: donnees.observations,
      formulaireClinique: donnees.formulaireClinique ?? undefined,
    },
    include: { infirmier: { select: { prenom: true, nom: true } } },
  });

  return mapperConstante(cree);
}

export async function mettreAJourConstantesVitales(
  id: string,
  donnees: DonneesConstantesSaisie
): Promise<ConstanteVitaleResume> {
  const existant = await prisma.constantesVitales.findUnique({ where: { id } });
  if (!existant) throw new Error("Mesure introuvable.");

  const maj = await prisma.constantesVitales.update({
    where: { id },
    data: {
      temperature: donnees.temperature,
      tensionSystolique: donnees.tensionSystolique,
      tensionDiastolique: donnees.tensionDiastolique,
      frequenceCardiaque: donnees.frequenceCardiaque,
      frequenceRespiratoire: donnees.frequenceRespiratoire,
      poidsKg: donnees.poidsKg,
      tailleCm: donnees.tailleCm,
      saturationO2: donnees.saturationO2,
      glycemie: donnees.glycemie,
      observations: donnees.observations,
      formulaireClinique: donnees.formulaireClinique ?? undefined,
    },
    include: { infirmier: { select: { prenom: true, nom: true } } },
  });

  return mapperConstante(maj);
}

export async function supprimerConstantesVitales(id: string) {
  const existant = await prisma.constantesVitales.findUnique({ where: { id } });
  if (!existant) throw new Error("Mesure introuvable.");
  await prisma.constantesVitales.delete({ where: { id } });
  return { id };
}
