import { NextResponse } from "next/server";
import { obtenirSessionApiMessagerie } from "@/lib/auth/garde-api-messagerie";
import { apercuNotificationsNonLues } from "@/lib/notifications/service-notifications";

export async function GET() {
  const session = await obtenirSessionApiMessagerie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });

  try {
    void import("@/lib/notifications/alertes-stock").then(({ balayerAlertesStockSiNecessaire }) =>
      balayerAlertesStockSiNecessaire().catch(console.error)
    );
    const apercu = await apercuNotificationsNonLues(session.utilisateur.id);
    return NextResponse.json(apercu);
  } catch (error) {
    console.error("[GET /api/notifications/non-lues]", error);
    return NextResponse.json({ total: 0, derniere: null });
  }
}
