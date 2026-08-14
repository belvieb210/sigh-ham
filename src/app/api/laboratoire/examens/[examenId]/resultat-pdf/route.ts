import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiLaboratoire } from "@/lib/auth/garde-api-laboratoire";
import {
  genererBufferPdfResultatExamen,
  genererBufferPdfResultatsMultiExamens,
} from "@/lib/laboratoire/pdf-resultats/generer-resultat-examen-pdf";

interface Ctx {
  params: Promise<{ examenId: string }>;
}

export async function GET(request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiLaboratoire();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const { examenId } = await ctx.params;
  if (!examenId?.trim()) {
    return NextResponse.json({ erreur: "examenId requis." }, { status: 400 });
  }

  const dossierId = request.nextUrl.searchParams.get("dossierId")?.trim();
  if (!dossierId) {
    return NextResponse.json({ erreur: "dossierId requis." }, { status: 400 });
  }

  const examIdsParam = request.nextUrl.searchParams.get("examIds")?.trim();
  const examIds = examIdsParam
    ? examIdsParam.split(",").map((id) => id.trim()).filter(Boolean)
    : [examenId.trim()];

  try {
    const pdf =
      examIds.length > 1
        ? await genererBufferPdfResultatsMultiExamens(dossierId, examIds, request)
        : await genererBufferPdfResultatExamen(dossierId, examenId.trim(), request);

    if (!pdf || pdf.buffer.length < 100) {
      return NextResponse.json(
        { erreur: "Résultat introuvable ou PDF vide." },
        { status: 404 }
      );
    }

    return new NextResponse(new Uint8Array(pdf.buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${pdf.nomFichier}"`,
      },
    });
  } catch (e) {
    console.error("[GET /api/laboratoire/examens/[examenId]/resultat-pdf]", e);
    return NextResponse.json(
      { erreur: e instanceof Error ? e.message : "PDF indisponible." },
      { status: 500 }
    );
  }
}
