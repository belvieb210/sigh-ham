import { NextResponse } from "next/server";
import { obtenirSessionApiReception } from "@/lib/auth/garde-api-reception";
import { apercuNumerosPatient } from "@/lib/reception/numeros";

export async function GET() {
  const session = await obtenirSessionApiReception();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const numeros = await apercuNumerosPatient();
    return NextResponse.json(numeros);
  } catch (error) {
    console.error("[GET /api/reception/numeros]", error);
    return NextResponse.json(
      { message: "Impossible de générer les numéros." },
      { status: 500 }
    );
  }
}
