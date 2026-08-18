import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      nom?: string;
      email?: string;
      telephone?: string;
      sujet?: string;
      message?: string;
    };

    const nom = String(body.nom ?? "").trim();
    const email = String(body.email ?? "").trim();
    const sujet = String(body.sujet ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!nom || !email || !sujet || !message) {
      return NextResponse.json(
        { message: "nom, email, sujet et message sont requis." },
        { status: 400 }
      );
    }

    await prisma.messageContact.create({
      data: {
        nom,
        email,
        telephone: body.telephone ? String(body.telephone).trim() : null,
        sujet,
        message,
      },
    });

    const { enregistrerAudit } = await import("@/lib/admin/audit");
    await enregistrerAudit({
      type: "CREATION",
      module: "CLIENT",
      entite: "MessageContact",
      action: `Contact public — ${nom} (${sujet})`,
      details: { email },
    });

    return NextResponse.json({ succes: true }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/public/contact]", error);
    return NextResponse.json(
      { message: "Impossible d'enregistrer le message." },
      { status: 500 }
    );
  }
}
