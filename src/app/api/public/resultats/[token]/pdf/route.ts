import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireOrientationAnalyseDepuisNotes } from "@/constants/laboratoire-orientations";
import {
  genererBufferPdfResultatExamen,
  genererBufferPdfResultatsMultiExamens,
} from "@/lib/laboratoire/pdf-resultats/generer-resultat-examen-pdf";
import { verifierTokenResultatPublic } from "@/lib/resultats-public/token-resultat-public";

interface Ctx {
  params: Promise<{ token: string }>;
}

export async function GET(request: NextRequest, ctx: Ctx) {
  const { token } = await ctx.params;
  const payload = verifierTokenResultatPublic(token);
  if (!payload) {
    return NextResponse.json(
      { erreur: "Lien expiré ou invalide." },
      { status: 403 }
    );
  }

  const facture = await prisma.facture.findFirst({
    where: { id: payload.factureId, dossierId: payload.dossierId },
    select: { id: true, statut: true },
  });
  if (!facture || ["BROUILLON", "ANNULEE"].includes(facture.statut)) {
    return NextResponse.json({ erreur: "Accès refusé." }, { status: 403 });
  }

  const examens = await prisma.examenLaboratoire.findMany({
    where: {
      id: { in: payload.examIds },
      dossierId: payload.dossierId,
    },
    select: {
      id: true,
      statut: true,
      notes: true,
      resultats: { select: { id: true }, take: 1 },
    },
  });

  const idsValides = examens
    .filter(
      (ex) =>
        ex.statut === "TERMINE" &&
        lireOrientationAnalyseDepuisNotes(ex.notes) === "DR_APPROUVE" &&
        ex.resultats.length > 0
    )
    .map((ex) => ex.id);

  if (idsValides.length === 0) {
    return NextResponse.json(
      { erreur: "Résultats indisponibles." },
      { status: 404 }
    );
  }

  try {
    const pdf =
      idsValides.length > 1
        ? await genererBufferPdfResultatsMultiExamens(
            payload.dossierId,
            idsValides,
            request
          )
        : await genererBufferPdfResultatExamen(
            payload.dossierId,
            idsValides[0]!,
            request
          );

    if (!pdf || pdf.buffer.length < 100) {
      return NextResponse.json(
        { erreur: "PDF indisponible." },
        { status: 404 }
      );
    }

    return new NextResponse(new Uint8Array(pdf.buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${pdf.nomFichier}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    console.error("[GET /api/public/resultats/[token]/pdf]", e);
    return NextResponse.json(
      { erreur: "Génération du PDF impossible." },
      { status: 500 }
    );
  }
}
