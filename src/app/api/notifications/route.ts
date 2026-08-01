import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMessagerie } from "@/lib/auth/garde-api-messagerie";
import {
  listerNotifications,
  marquerToutesNotificationsLues,
  compterNotificationsNonLues,
} from "@/lib/notifications/service-notifications";
import type { TypeNotification } from "@/generated/prisma/enums";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiMessagerie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });

  try {
    const filtre = (request.nextUrl.searchParams.get("filtre") ?? "tous") as
      | "tous"
      | "non_lus"
      | "archives";
    const type = request.nextUrl.searchParams.get("type") as TypeNotification | null;
    const q = request.nextUrl.searchParams.get("q") ?? undefined;

    const [notifications, totalNonLues] = await Promise.all([
      listerNotifications(session.utilisateur.id, {
        filtre,
        type: type ?? undefined,
        q,
      }),
      compterNotificationsNonLues(session.utilisateur.id),
    ]);

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        ...n,
        creeLe: n.creeLe.toISOString(),
        luLe: n.luLe?.toISOString() ?? null,
      })),
      totalNonLues,
    });
  } catch (error) {
    console.error("[GET /api/notifications]", error);
    return NextResponse.json({ message: "Erreur notifications." }, { status: 500 });
  }
}

export async function PATCH() {
  const session = await obtenirSessionApiMessagerie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });

  await marquerToutesNotificationsLues(session.utilisateur.id);
  return NextResponse.json({ ok: true });
}
