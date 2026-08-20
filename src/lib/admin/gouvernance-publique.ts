import "server-only";
import { prisma } from "@/lib/prisma";
import { lireParametre, upsertParametres } from "@/lib/admin/parametres";
import { nomAffichageGouvernance } from "@/lib/admin/nom-affichage-gouvernance";
import type { CodeSalle } from "@/generated/prisma/client";

const CLE_GOUVERNANCE_PUBLIQUE = "site.gouvernancePublique";
const CODES_SALLES_EXCLUES = ["ADMIN", "CLIENT", "MESSAGERIE"] as const;

type BadgeConfig = {
  valeur: string;
  libelle: string;
};

type ServiceGouvernanceConfig = {
  salleCode: CodeSalle;
  visible: boolean;
  ordre: number;
};

type GouvernancePubliqueConfig = {
  responsableUtilisateurId: string | null;
  titreResponsable: string;
  bioResponsable: string;
  badgeDirection1: BadgeConfig;
  badgeDirection2: BadgeConfig;
  badgeDirection3: BadgeConfig;
  services: ServiceGouvernanceConfig[];
};

type SallePublique = {
  id: string;
  code: CodeSalle;
  nom: string;
  ordre: number;
  actif: boolean;
};

function estCodeSallePublique(code: CodeSalle) {
  return !(CODES_SALLES_EXCLUES as readonly string[]).includes(code);
}

function configParDefaut(salles: SallePublique[]): GouvernancePubliqueConfig {
  return {
    responsableUtilisateurId: null,
    titreResponsable: "Directeur général",
    bioResponsable:
      "Le responsable du centre pilote la qualité, l'intégrité et l'accessibilité des soins au quotidien.",
    badgeDirection1: { valeur: "HAM", libelle: "Direction" },
    badgeDirection2: { valeur: "ISO", libelle: "Qualité" },
    badgeDirection3: { valeur: "RDC", libelle: "Kinshasa" },
    services: salles
      .filter((salle) => estCodeSallePublique(salle.code))
      .map((salle, index) => ({
        salleCode: salle.code,
        visible: salle.actif,
        ordre: salle.ordre || index,
      })),
  };
}

function normaliserBadge(raw: unknown, fallback: BadgeConfig): BadgeConfig {
  const valeur =
    raw && typeof raw === "object" && "valeur" in raw ? String(raw.valeur ?? "").trim() : "";
  const libelle =
    raw && typeof raw === "object" && "libelle" in raw ? String(raw.libelle ?? "").trim() : "";
  return {
    valeur: valeur || fallback.valeur,
    libelle: libelle || fallback.libelle,
  };
}

function normaliserConfig(raw: string, salles: SallePublique[]): GouvernancePubliqueConfig {
  const defaut = configParDefaut(salles);
  try {
    const parsed = JSON.parse(raw) as Partial<GouvernancePubliqueConfig>;
    const servicesMap = new Map(
      (parsed.services ?? [])
        .filter((service) => service && estCodeSallePublique(service.salleCode))
        .map((service) => [
          service.salleCode,
          {
            salleCode: service.salleCode,
            visible: service.visible !== false,
            ordre:
              typeof service.ordre === "number" && Number.isFinite(service.ordre)
                ? service.ordre
                : 0,
          },
        ])
    );

    const services = defaut.services.map((service) => servicesMap.get(service.salleCode) ?? service);

    return {
      responsableUtilisateurId:
        typeof parsed.responsableUtilisateurId === "string" &&
        parsed.responsableUtilisateurId.trim()
          ? parsed.responsableUtilisateurId
          : null,
      titreResponsable:
        typeof parsed.titreResponsable === "string" && parsed.titreResponsable.trim()
          ? parsed.titreResponsable.trim()
          : defaut.titreResponsable,
      bioResponsable:
        typeof parsed.bioResponsable === "string" && parsed.bioResponsable.trim()
          ? parsed.bioResponsable.trim()
          : defaut.bioResponsable,
      badgeDirection1: normaliserBadge(parsed.badgeDirection1, defaut.badgeDirection1),
      badgeDirection2: normaliserBadge(parsed.badgeDirection2, defaut.badgeDirection2),
      badgeDirection3: normaliserBadge(parsed.badgeDirection3, defaut.badgeDirection3),
      services: services.sort((a, b) => a.ordre - b.ordre),
    };
  } catch {
    return defaut;
  }
}

export async function listerSallesPubliques() {
  return prisma.salle.findMany({
    where: { actif: true },
    select: { id: true, code: true, nom: true, ordre: true, actif: true },
    orderBy: [{ ordre: "asc" }, { nom: "asc" }],
  });
}

export async function lireConfigGouvernancePublique() {
  const salles = await listerSallesPubliques();
  const brut = await lireParametre(CLE_GOUVERNANCE_PUBLIQUE, "");
  return normaliserConfig(brut, salles);
}

export async function enregistrerConfigGouvernancePublique(
  config: GouvernancePubliqueConfig,
  updatedById?: string
) {
  await upsertParametres(
    [
      {
        cle: CLE_GOUVERNANCE_PUBLIQUE,
        categorie: "general",
        description: "Configuration publique de la gouvernance et des services affichés dans À propos.",
        valeur: JSON.stringify(config),
      },
    ],
    updatedById
  );
  return config;
}

export async function listerResponsablesSuperAdmin() {
  return prisma.utilisateur.findMany({
    where: { role: { code: "SUPER_ADMIN" } },
    select: {
      id: true,
      prenom: true,
      nom: true,
      email: true,
      telephone: true,
      photoUrl: true,
      role: {
        select: {
          code: true,
          nom: true,
          salle: { select: { code: true, nom: true } },
        },
      },
    },
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
  });
}

function photoParDefaut() {
  return "/images/equipe/personnel-1.png";
}

function fonctionInterne(roleCode: string, roleNom: string, salleNom: string) {
  if (roleCode === "SUPER_ADMIN" || roleCode === "ADMIN") {
    return salleNom.trim() || "Direction";
  }
  const nom = roleNom.trim().toLowerCase();
  if (nom.includes("super admin") || nom === "administrateur") {
    return salleNom.trim() || "Direction";
  }
  return roleNom.trim() || salleNom.trim();
}

export async function chargerGouvernancePubliquePourSite() {
  const [config, partenaires] = await Promise.all([
    lireConfigGouvernancePublique(),
    prisma.medecinVitrine.findMany({
      where: {
        actif: true,
        categorie: { in: ["MEDECIN_EXTERNE", "SERVICE_EGLISE"] },
      },
      include: {
        salle: {
          select: { id: true, code: true, nom: true, ordre: true, actif: true },
        },
      },
      orderBy: [{ ordre: "asc" }, { nom: "asc" }],
    }),
  ]);

  const salleCodesVisibles = config.services.filter((service) => service.visible).map((service) => service.salleCode);

  const [responsable, utilisateursInternes] = await Promise.all([
    config.responsableUtilisateurId
      ? prisma.utilisateur.findUnique({
          where: { id: config.responsableUtilisateurId },
          include: {
            role: { include: { salle: true } },
          },
        })
      : null,
    prisma.utilisateur.findMany({
      where: {
        statut: "ACTIF",
        role: {
          salle: {
            code: { in: salleCodesVisibles },
          },
        },
      },
      include: {
        role: {
          include: {
            salle: true,
          },
        },
        medecinExterne: true,
      },
      orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    }),
  ]);

  const servicesConfigMap = new Map(config.services.map((service) => [service.salleCode, service]));
  const groupes = new Map<
    CodeSalle,
    {
      salle: { id: string; code: CodeSalle; nom: string; ordre: number };
      membres: Array<{
        id: string;
        nom: string;
        fonction: string;
        photoUrl: string;
        telephone?: string;
        email?: string;
        bio?: string;
        categorie: string;
        masquerContactsPublic: boolean;
        ordre: number;
      }>;
    }
  >();

  for (const utilisateur of utilisateursInternes) {
    const salle = utilisateur.role.salle;
    if (!salle || !estCodeSallePublique(salle.code)) continue;
    const serviceConfig = servicesConfigMap.get(salle.code);
    if (!serviceConfig?.visible) continue;
    const groupe = groupes.get(salle.code) ?? {
      salle: { id: salle.id, code: salle.code, nom: salle.nom, ordre: serviceConfig.ordre },
      membres: [],
    };

    const estPartenaire = utilisateur.role.code === "MEDECIN_EXTERNE" || utilisateur.role.code === "AGENT_EGLISE";
    const fonction =
      utilisateur.role.code === "MEDECIN_EXTERNE"
        ? utilisateur.medecinExterne?.specialite?.trim() || "Médecin externe"
        : utilisateur.role.code === "AGENT_EGLISE"
          ? "Service conventionné — Église"
          : fonctionInterne(utilisateur.role.code, utilisateur.role.nom, salle.nom);

    // Le responsable public n'apparaît pas aussi dans « Notre équipe »
    if (
      config.responsableUtilisateurId &&
      utilisateur.id === config.responsableUtilisateurId
    ) {
      continue;
    }
    // Ne pas exposer le compte SUPER_ADMIN dans l'équipe publique
    if (utilisateur.role.code === "SUPER_ADMIN") {
      continue;
    }

    groupe.membres.push({
      id: utilisateur.id,
      nom: nomAffichageGouvernance(utilisateur.prenom, utilisateur.nom),
      fonction,
      photoUrl: utilisateur.photoUrl ?? photoParDefaut(),
      telephone: estPartenaire ? undefined : utilisateur.telephone ?? undefined,
      email: estPartenaire ? undefined : utilisateur.email ?? undefined,
      categorie: utilisateur.role.code,
      masquerContactsPublic: estPartenaire,
      ordre: 0,
    });
    groupes.set(salle.code, groupe);
  }

  for (const partenaire of partenaires) {
    if (!partenaire.salle || !estCodeSallePublique(partenaire.salle.code)) continue;
    const serviceConfig = servicesConfigMap.get(partenaire.salle.code);
    if (!serviceConfig?.visible) continue;
    const groupe = groupes.get(partenaire.salle.code) ?? {
      salle: {
        id: partenaire.salle.id,
        code: partenaire.salle.code,
        nom: partenaire.salle.nom,
        ordre: serviceConfig.ordre,
      },
      membres: [],
    };
    const cleMembre = partenaire.email?.trim().toLowerCase()
      ? `email:${partenaire.email.trim().toLowerCase()}`
      : `nom:${partenaire.prenom}:${partenaire.nom}:${partenaire.categorie}`;
    const dejaPresent = groupe.membres.some((membre) => membre.id === cleMembre);
    if (dejaPresent) {
      continue;
    }
    groupe.membres.push({
      id: cleMembre,
      nom: `${partenaire.prenom} ${partenaire.nom}`.trim(),
      fonction: partenaire.specialite?.trim() || (partenaire.categorie === "SERVICE_EGLISE" ? "Service conventionné — Église" : "Médecin externe"),
      photoUrl: partenaire.photoUrl ?? photoParDefaut(),
      telephone: undefined,
      email: undefined,
      bio: partenaire.bio ?? undefined,
      categorie: partenaire.categorie,
      masquerContactsPublic: true,
      ordre: partenaire.ordre,
    });
    groupes.set(partenaire.salle.code, groupe);
  }

  const services = [...groupes.values()]
    .map((groupe) => ({
      ...groupe,
      membres: groupe.membres.sort((a, b) => {
        if (a.ordre !== b.ordre) return a.ordre - b.ordre;
        return a.nom.localeCompare(b.nom, "fr");
      }),
    }))
    .sort((a, b) => a.salle.ordre - b.salle.ordre || a.salle.nom.localeCompare(b.salle.nom, "fr"));

  return {
    responsable: responsable
      ? {
          id: responsable.id,
          nom: nomAffichageGouvernance(responsable.prenom, responsable.nom),
          fonction: config.titreResponsable || "Directeur général",
          photoUrl: responsable.photoUrl ?? photoParDefaut(),
          telephone: responsable.telephone ?? undefined,
          email: responsable.email ?? undefined,
          biographie: config.bioResponsable,
          badges: [
            config.badgeDirection1,
            config.badgeDirection2,
            config.badgeDirection3,
          ].filter((badge) => badge.valeur || badge.libelle),
        }
      : null,
    services,
    config,
  };
}
