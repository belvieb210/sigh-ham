import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import { listerPaquetsBilansActifs } from "@/lib/reception/lister-paquets-bilans-actifs";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const q = request.nextUrl.searchParams.get("q") ?? undefined;
    const paquets = await listerPaquetsBilansActifs({ q });
    return NextResponse.json({ paquets });
  } catch (error) {
    console.error("[GET /api/medecins-externes/paquets-bilans]", error);
    return NextResponse.json(
      { message: "Impossible de charger les paquets bilans." },
      { status: 500 }
    );
  }
}
