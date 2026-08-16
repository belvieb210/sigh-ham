import { NextResponse } from "next/server";

export async function POST() {  return NextResponse.json(
    {
      message:
        "Le laboratoire n'effectue pas de transfert vers d'autres salles.",
    },
    { status: 403 }
  );
}
