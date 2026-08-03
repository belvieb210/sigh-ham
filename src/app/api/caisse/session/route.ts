import { NextResponse } from "next/server";
import { obtenirSessionApiCaisse } from "@/lib/auth/garde-api-caisse";
import {
  cloturerSessionCaisse,
  obtenirSessionCaisseActive,
  ouvrirSessionCaisse,
} from "@/lib/caisse/session-caisse";

export async function GET(request: Request) {
  const sessionAuth = await obtenirSessionApiCaisse();
  if (!sessionAuth) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const auto = searchParams.get("auto") === "1";
    let session = await obtenirSessionCaisseActive(sessionAuth.utilisateur.id);
    if (!session && auto) {
      session = await ouvrirSessionCaisse(sessionAuth.utilisateur.id);
    }
    return NextResponse.json({ session });
  } catch (e) {
    console.error("[api/caisse/session GET]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger la session caisse." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const sessionAuth = await obtenirSessionApiCaisse();
  if (!sessionAuth) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const corps = (await request.json().catch(() => ({}))) as {
      action?: "ouvrir" | "cloturer";
      soldeOuverture?: number;
      soldeCloture?: number;
      numeroCaisse?: string;
    };

    if (corps.action === "cloturer") {
      const fermee = await cloturerSessionCaisse(
        sessionAuth.utilisateur.id,
        corps.soldeCloture
      );
      return NextResponse.json({
        session: null,
        cloturee: fermee,
        message: fermee ? "Session clôturée." : "Aucune session ouverte.",
      });
    }

    const session = await ouvrirSessionCaisse(sessionAuth.utilisateur.id, {
      soldeOuverture: corps.soldeOuverture,
      numeroCaisse: corps.numeroCaisse,
    });
    return NextResponse.json({ session, message: "Session ouverte." });
  } catch (e) {
    console.error("[api/caisse/session POST]", e);
    return NextResponse.json(
      { erreur: "Impossible de gérer la session caisse." },
      { status: 500 }
    );
  }
}
