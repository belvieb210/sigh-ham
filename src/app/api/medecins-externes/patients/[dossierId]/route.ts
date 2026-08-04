import { NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import { assertDossierDuMedecinExterne, exigerMedecinExterneId } from "@/lib/medecins-externes/assurer-fiche";
import { prisma } from "@/lib/prisma";
import { calculerAge } from "@/features/caisse/utils-format";

export async function GET(_req: Request, ctx: { params: Promise<{ dossierId: string }> }) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  try {
    const { dossierId } = await ctx.params;
    const medecinExterneId = exigerMedecinExterneId(session.utilisateur.medecinExterneId);
    await assertDossierDuMedecinExterne(dossierId, medecinExterneId);
    const dossier = await prisma.dossierPatient.findUnique({
      where: { id: dossierId },
      include: {
        patient: true,
        constantesVitales: { orderBy: { mesureLe: "desc" }, take: 1 },
      },
    });
    if (!dossier) return NextResponse.json({ erreur: "Introuvable." }, { status: 404 });
    const c = dossier.constantesVitales[0];
    return NextResponse.json({
      patient: {
        dossierId: dossier.id,
        numeroDossier: dossier.numeroDossier,
        nomComplet: `${dossier.patient.prenom} ${dossier.patient.nom}`.trim(),
        numeroPatient: dossier.patient.numeroPatient,
        age: calculerAge(dossier.patient.dateNaissance ? dossier.patient.dateNaissance.toISOString() : null),
        sexe: dossier.patient.sexe,
        telephone: dossier.patient.telephone,
        constantes: c
          ? {
              temperature: c.temperature != null ? Number(c.temperature) : null,
              tensionSystolique: c.tensionSystolique,
              tensionDiastolique: c.tensionDiastolique,
              frequenceCardiaque: c.frequenceCardiaque,
              saturationO2: c.saturationO2 != null ? Number(c.saturationO2) : null,
            }
          : null,
      },
    });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "DOSSIER_NON_AUTORISE") return NextResponse.json({ erreur: "Accès refusé." }, { status: 403 });
    return NextResponse.json({ erreur: "Erreur." }, { status: 500 });
  }
}
