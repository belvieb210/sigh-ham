import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiPharmacie } from "@/lib/auth/garde-api-pharmacie";
import { prisma } from "@/lib/prisma";
import { stockDisponibleMedicament } from "@/lib/pharmacie/stock-fefo";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiPharmacie();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  try {
    const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
    const limite = Math.min(
      20,
      Math.max(1, Number.parseInt(request.nextUrl.searchParams.get("limite") ?? "12", 10) || 12)
    );
    const meds = await prisma.medicament.findMany({
      where: {
        actif: true,
        ...(q
          ? {
              OR: [
                { nom: { contains: q, mode: "insensitive" } },
                { code: { contains: q, mode: "insensitive" } },
                { forme: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { nom: "asc" },
      take: limite,
    });
    const medicaments = [];
    for (const m of meds) {
      medicaments.push({
        id: m.id,
        code: m.code,
        nom: m.nom,
        forme: m.forme,
        dosage: m.dosage,
        prixUnitaire: Number(m.prixUnitaire),
        stockDisponible: await stockDisponibleMedicament(m.id),
        actif: m.actif,
      });
    }
    return NextResponse.json({ medicaments });
  } catch (e) {
    console.error("[api/pharmacie/medicaments]", e);
    return NextResponse.json({ erreur: "Erreur." }, { status: 500 });
  }
}
