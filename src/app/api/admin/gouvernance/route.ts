import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import {
  enregistrerConfigGouvernancePublique,
  lireConfigGouvernancePublique,
  listerResponsablesSuperAdmin,
  listerSallesPubliques,
} from "@/lib/admin/gouvernance-publique";
import type { CodeSalle } from "@/generated/prisma/client";

export async function GET() {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const [config, salles, responsables] = await Promise.all([
      lireConfigGouvernancePublique(),
      listerSallesPubliques(),
      listerResponsablesSuperAdmin(),
    ]);

    return NextResponse.json({ config, salles, responsables });
  } catch (error) {
    console.error("[GET /api/admin/gouvernance]", error);
    return NextResponse.json(
      { message: "Impossible de charger la gouvernance." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const salles = await listerSallesPubliques();
    const salleCodes = new Set(salles.map((salle) => salle.code));
    const services = Array.isArray(body.services)
      ? body.services
          .map((service, index) => {
            const item = service as Record<string, unknown>;
            const salleCode = String(item.salleCode ?? "").trim().toUpperCase() as CodeSalle;
            if (!salleCodes.has(salleCode)) return null;
            return {
              salleCode,
              visible: item.visible !== false,
              ordre:
                typeof item.ordre === "number" && Number.isFinite(item.ordre)
                  ? item.ordre
                  : index,
            };
          })
          .filter((service): service is NonNullable<typeof service> => service != null)
      : [];

    if (!services.length) {
      return NextResponse.json(
        { message: "Au moins un service public doit être configuré." },
        { status: 400 }
      );
    }

    const config = await enregistrerConfigGouvernancePublique({
      responsableUtilisateurId: String(body.responsableUtilisateurId ?? "").trim() || null,
      titreResponsable: String(body.titreResponsable ?? "").trim() || "Directeur général",
      bioResponsable:
        String(body.bioResponsable ?? "").trim() ||
        "Le responsable du centre pilote la qualité, l'intégrité et l'accessibilité des soins au quotidien.",
      badgeDirection1: {
        valeur: String(body.badgeDirection1Valeur ?? "").trim() || "HAM",
        libelle: String(body.badgeDirection1Libelle ?? "").trim() || "Direction",
      },
      badgeDirection2: {
        valeur: String(body.badgeDirection2Valeur ?? "").trim() || "ISO",
        libelle: String(body.badgeDirection2Libelle ?? "").trim() || "Qualité",
      },
      badgeDirection3: {
        valeur: String(body.badgeDirection3Valeur ?? "").trim() || "RDC",
        libelle: String(body.badgeDirection3Libelle ?? "").trim() || "Kinshasa",
      },
      services,
    }, session.utilisateur.id);

    return NextResponse.json({
      message: "Gouvernance publique mise à jour.",
      config,
    });
  } catch (error) {
    console.error("[POST /api/admin/gouvernance]", error);
    return NextResponse.json(
      { message: "Impossible d'enregistrer la gouvernance publique." },
      { status: 500 }
    );
  }
}
