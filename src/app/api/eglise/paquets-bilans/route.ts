import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiEglise } from "@/lib/auth/garde-api-eglise";
import { listerPaquetsBilansActifs } from "@/lib/reception/lister-paquets-bilans-actifs";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiEglise();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const q = request.nextUrl.searchParams.get("q") ?? undefined;
    const paquets = await listerPaquetsBilansActifs({ q });
    return NextResponse.json({ paquets });
  } catch (error) {
    console.error("[GET /api/eglise/paquets-bilans]", error);
    return NextResponse.json(
      { message: "Impossible de charger les paquets bilans." },
      { status: 500 }
    );
  }
}
