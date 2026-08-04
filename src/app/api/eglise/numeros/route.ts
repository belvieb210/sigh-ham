import { NextResponse } from "next/server";
import { obtenirSessionApiEglise } from "@/lib/auth/garde-api-eglise";
import { apercuNumerosPatient } from "@/lib/reception/numeros";

export async function GET() {
  const session = await obtenirSessionApiEglise();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }
  try {
    return NextResponse.json(await apercuNumerosPatient());
  } catch (error) {
    console.error("[GET /api/eglise/numeros]", error);
    return NextResponse.json(
      { message: "Impossible de générer les numéros." },
      { status: 500 }
    );
  }
}
