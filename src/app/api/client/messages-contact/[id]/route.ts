import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiClient,
  reponseNonAutoriseClient,
} from "@/lib/auth/garde-api-client";
import { prisma } from "@/lib/prisma";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();
  const { id } = await ctx.params;

  try {
    const body = (await request.json()) as { lu?: boolean };
    const message = await prisma.messageContact.update({
      where: { id },
      data: { lu: body.lu !== false },
    });
    return NextResponse.json({ message });
  } catch (error) {
    console.error("[PATCH /api/client/messages-contact/[id]]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();
  const { id } = await ctx.params;

  try {
    await prisma.messageContact.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/client/messages-contact/[id]]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}
