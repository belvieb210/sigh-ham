import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiInfirmiers } from "@/lib/auth/garde-api-infirmiers";
import { genererPdfHistoriqueTraitementInfirmiers } from "@/lib/infirmiers/generer-historique-traitement-pdf";
import { listerFichesTraitementDossier } from "@/lib/infirmiers/gestion-fiche-traitement";
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
    const [detail, fiches] = await Promise.all([
      obtenirHistoriqueCompletDossierInfirmiers(dossierId),
      listerFichesTraitementDossier(dossierId),
    ]);

    if (!detail) {
      return NextResponse.json({ erreur: "Dossier introuvable." }, { status: 404 });
    }
    if (fiches.length === 0) {
      return NextResponse.json(
        { erreur: "Aucune fiche de traitement pour ce dossier." },
        { status: 404 }
      );
    }

    const hopital = await nomHopital();
    const buffer = await genererPdfHistoriqueTraitementInfirmiers({
      hopital,
      nomComplet: detail.nomComplet,
      numeroDossier: detail.numeroDossier,
      numeroPatient: detail.numeroPatient,
      telephone: detail.telephone,
      fiches,
      dateEmission: new Date().toLocaleDateString("fr-FR"),
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="historique-traitements-${detail.numeroDossier}.pdf"`,
      },
    });
  } catch (e) {
    console.error("[GET historique pdf-traitements]", e);
    return NextResponse.json(
      { erreur: e instanceof Error ? e.message : "PDF indisponible." },
      { status: 500 }
    );
  }
}
