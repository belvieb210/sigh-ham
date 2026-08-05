import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import { assertPermissionAdmin } from "@/lib/admin/permissions";
import {
  listerSessionsActives,
  revoquerSession,
  revoquerSessionsUtilisateur,
} from "@/lib/admin/sessions";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const utilisateurId =
      request.nextUrl.searchParams.get("utilisateurId") ?? undefined;
    const sessions = await listerSessionsActives({ utilisateurId });
    return NextResponse.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        utilisateurId: s.utilisateurId,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        createdAt: s.createdAt.toISOString(),
        expireLe: s.expireLe.toISOString(),
        utilisateur: s.utilisateur,
      })),
    });
  } catch (error) {
    console.error("[GET /api/admin/sessions]", error);
    return NextResponse.json(
      { message: "Impossible de charger les sessions." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    await assertPermissionAdmin(
      session.utilisateur.id,
      "admin.sessions.revoke"
    );
    const body = (await request.json()) as {
      sessionId?: string;
      utilisateurId?: string;
    };
    const acteur = {
      id: session.utilisateur.id,
      role: session.utilisateur.role,
    };

    if (body.sessionId) {
      await revoquerSession(acteur, body.sessionId);
      return NextResponse.json({ message: "Session révoquée." });
    }
    if (body.utilisateurId) {
      const count = await revoquerSessionsUtilisateur(
        acteur,
        body.utilisateurId
      );
      return NextResponse.json({
        message: `${count} session(s) révoquée(s).`,
        count,
      });
    }
    return NextResponse.json(
      { message: "sessionId ou utilisateurId requis." },
      { status: 400 }
    );
  } catch (error) {
    console.error("[DELETE /api/admin/sessions]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Révocation impossible.",
      },
      { status: 400 }
    );
  }
}
