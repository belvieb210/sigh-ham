import { NextResponse } from "next/server";
import {
  construireDocumentHtmlRecuPublic,
  construireHtmlRecuIntrouvable,
} from "@/lib/caisse/html-recu-public";
import { chargerRecuPublicParToken } from "@/lib/caisse/recu-public";

export const dynamic = "force-dynamic";

interface ContexteRoute {
  params: Promise<{ token: string }>;
}

export async function GET(_request: Request, context: ContexteRoute) {
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

  // Page scan QR / consultation navigateur (téléphone ou PC)
  const html = construireDocumentHtmlRecuPublic(detail, { token });

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    },
  });
}
