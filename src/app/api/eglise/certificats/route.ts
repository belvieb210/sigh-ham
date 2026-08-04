import { NextResponse } from "next/server";
import { obtenirSessionApiEglise } from "@/lib/auth/garde-api-eglise";
import { listerCertificatsPrenuptiaux } from "@/lib/eglise/lister-rapports";

export async function GET() {
  const session = await obtenirSessionApiEglise();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const certificats = await listerCertificatsPrenuptiaux();
    return NextResponse.json({ certificats });
  } catch (error) {
    console.error("[GET /api/eglise/certificats]", error);
    return NextResponse.json(
      { message: "Impossible de charger les certificats." },
      { status: 500 }
    );
  }
}
