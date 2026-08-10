import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiInfirmiers } from "@/lib/auth/garde-api-infirmiers";
import { genererPdfHistoriqueConsultationInfirmiers } from "@/lib/infirmiers/generer-historique-consultation-pdf";
import { obtenirHistoriqueCompletDossierInfirmiers } from "@/lib/infirmiers/lister-patients-infirmiers";
import { prisma } from "@/lib/prisma";

interface Ctx {
  params: Promise<{ dossierId: string }>;
}

async function nomHopital(): Promise<string> {
  try {
    const param = await prisma.parametreSysteme.findUnique({
      where: { cle: "nom_etablissement" },
    });
    return param?.valeur?.trim() || "HAM Laboratoire";
  } catch {
    return "HAM Laboratoire";
  }
}

export async function GET(_request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiInfirmiers();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const { dossierId } = await ctx.params;
    const detail = await obtenirHistoriqueCompletDossierInfirmiers(dossierId);
    if (!detail || detail.constantes.length === 0) {
      return NextResponse.json(
        { erreur: "Aucune consultation enregistrée pour ce dossier." },
        { status: 404 }
      );
    }

    const hopital = await nomHopital();
    const buffer = await genererPdfHistoriqueConsultationInfirmiers({
      hopital,
      numeroDossier: detail.numeroDossier,
      numeroPatient: detail.numeroPatient,
      nomComplet: detail.nomComplet,
      telephone: detail.telephone,
      age: detail.age,
      sexe: detail.sexe,
      constantes: detail.constantes,
      dateEmission: new Date().toLocaleDateString("fr-FR"),
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="historique-consultation-${detail.numeroDossier}.pdf"`,
      },
    });
  } catch (e) {
    console.error("[GET historique pdf-consultations]", e);
    return NextResponse.json(
      { erreur: e instanceof Error ? e.message : "PDF indisponible." },
      { status: 500 }
    );
  }
}
