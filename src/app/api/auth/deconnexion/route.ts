import { NextResponse } from "next/server";
import { detruireSessionCourante, lireSessionDepuisCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await lireSessionDepuisCookie();

    if (session) {
      await prisma.journalAudit.create({
        data: {
          utilisateurId: session.utilisateurId,
          type: "DECONNEXION",
          module: session.utilisateur.role.salle?.code,
          entite: "Utilisateur",
          entiteId: session.utilisateurId,
          action: "Déconnexion",
        },
      });
    }

    await detruireSessionCourante();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Erreur lors de la déconnexion." }, { status: 500 });
  }
}
