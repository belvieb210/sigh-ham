import { NextResponse } from "next/server";
import { obtenirSessionApiEglise } from "@/lib/auth/garde-api-eglise";
import { listerRapportsPrenuptiaux } from "@/lib/eglise/lister-rapports";

export async function GET() {
  const session = await obtenirSessionApiEglise();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const rapports = await listerRapportsPrenuptiaux();
    return NextResponse.json({ rapports });
  } catch (error) {
    console.error("[GET /api/eglise/rapports]", error);
    return NextResponse.json(
      { message: "Impossible de charger les rapports." },
      { status: 500 }
    );
  }
}
