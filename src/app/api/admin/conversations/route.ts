import { NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const conversations = await prisma.conversation.findMany({
      where: { archivee: false },
      orderBy: { updatedAt: "desc" },
      take: 40,
      select: {
        id: true,
        type: true,
        sujet: true,
        updatedAt: true,
        _count: { select: { messages: true, participants: true } },
        messages: {
          orderBy: { envoyeLe: "desc" },
          take: 1,
          select: { contenu: true, envoyeLe: true },
        },
      },
    });

    return NextResponse.json({
      conversations: conversations.map((c) => ({
        id: c.id,
        type: c.type,
        sujet: c.sujet,
        updatedAt: c.updatedAt.toISOString(),
        messages: c._count.messages,
        participants: c._count.participants,
        dernierMessage: c.messages[0]?.contenu?.slice(0, 120) ?? null,
      })),
    });
  } catch (error) {
    console.error("[GET /api/admin/conversations]", error);
    return NextResponse.json(
      { message: "Impossible de charger les conversations." },
      { status: 500 }
    );
  }
}
