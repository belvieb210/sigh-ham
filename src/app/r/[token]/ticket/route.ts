import { NextResponse } from "next/server";
import { construireHtmlRecuIntrouvable } from "@/lib/caisse/html-recu-public";
import { construireHtmlTicketThermique } from "@/lib/caisse/html-ticket-thermique";
import { chargerRecuPublicParToken } from "@/lib/caisse/recu-public";
import { cheminRecuPublic } from "@/lib/caisse/token-recu-public";

export const dynamic = "force-dynamic";

interface ContexteRoute {
  params: Promise<{ token: string }>;
}

export async function GET(request: Request, context: ContexteRoute) {
  const { token: tokenBrut } = await context.params;
  const token = decodeURIComponent(tokenBrut);
  const detail = await chargerRecuPublicParToken(token);

  if (!detail) {
    return new NextResponse(construireHtmlRecuIntrouvable(), {
      status: 404,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-store",
      },
    });
  }

  const origin = new URL(request.url).origin;
  // QR → page reçue digitale (pas le ticket), URL courte pour un QR aéré
  const urlRecu = `${origin}${cheminRecuPublic(token)}`;
  const html = await construireHtmlTicketThermique(detail, urlRecu);

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    },
  });
}
