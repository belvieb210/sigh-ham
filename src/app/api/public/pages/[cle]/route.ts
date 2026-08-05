import { NextRequest, NextResponse } from "next/server";
import { chargerPagePublique } from "@/lib/client/contenu-public";

interface Ctx {
  params: Promise<{ cle: string }>;
}

export async function GET(_request: NextRequest, ctx: Ctx) {
  const { cle } = await ctx.params;
  try {
    const page = await chargerPagePublique(cle);
    if (!page) {
      return NextResponse.json({ message: "Introuvable." }, { status: 404 });
    }
    return NextResponse.json({ page });
  } catch (error) {
    console.error("[GET /api/public/pages/[cle]]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}
