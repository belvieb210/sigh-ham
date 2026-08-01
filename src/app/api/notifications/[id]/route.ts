import { NextResponse } from "next/server";
import { obtenirSessionApiMessagerie } from "@/lib/auth/garde-api-messagerie";
import {
  marquerNotificationLue,
  archiverNotification,
} from "@/lib/notifications/service-notifications";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await obtenirSessionApiMessagerie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as { action?: "lu" | "archiver" };

  if (body.action === "archiver") {
    await archiverNotification(id, session.utilisateur.id);
  } else {
    await marquerNotificationLue(id, session.utilisateur.id);
  }

  return NextResponse.json({ ok: true });
}
