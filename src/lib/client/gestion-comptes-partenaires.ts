import "server-only";

import { prisma } from "@/lib/prisma";
import { hasherMotDePasse } from "@/lib/auth/mot-de-passe";

const ROLE_MEDECIN_EXTERNE = "MEDECIN_EXTERNE";
const ROLE_AGENT_EGLISE = "AGENT_EGLISE";

function validerMotDePasse(mdp: string) {
  if (mdp.length < 8) {
    throw new Error("Le mot de passe doit contenir au moins 8 caractères.");
  }
}

async function assertIdentifiantLibre(identifiant: string, email?: string | null) {
  const id = identifiant.trim().toLowerCase();
  const existant = await prisma.utilisateur.findFirst({
    where: {
      OR: [
        { identifiant: id },
        ...(email?.trim()
          ? [{ email: email.trim().toLowerCase() }]
          : []),
      ],
    },
  });
  if (existant) {
    throw new Error("Identifiant ou e-mail déjà utilisé.");
  }
}

async function roleParCode(code: string) {
  const role = await prisma.role.findUnique({
    where: { code },
    include: { salle: true },
  });
  if (!role) throw new Error(`Rôle ${code} introuvable.`);
  return role;
}

async function synchroniserVitrinePartenaire(options: {
  prenom: string;
  nom: string;
  specialite: string;
  email?: string | null;
  telephone?: string | null;
  photoUrl?: string | null;
  categorie: "MEDECIN_EXTERNE" | "SERVICE_EGLISE";
  actif: boolean;
}) {
  if (!options.actif) return null;

  const email = options.email?.trim().toLowerCase() || null;
  const existante = email
    ? await prisma.medecinVitrine.findFirst({
        where: { email, categorie: options.categorie },
      })
    : null;

  const data = {
    prenom: options.prenom.trim(),
    nom: options.nom.trim(),
    specialite: options.specialite.trim() || "—",
    email,
    telephone: options.telephone?.trim() || null,
    photoUrl: options.photoUrl?.trim() || null,
    categorie: options.categorie,
    actif: true,
  };

  if (existante) {
    return prisma.medecinVitrine.update({
      where: { id: existante.id },
      data,
    });
  }

  return prisma.medecinVitrine.create({ data });
}

export type CompteMedecinExterneClient = {
  id: string;
  identifiant: string;
  email: string | null;
  prenom: string;
  nom: string;
  telephone: string | null;
  statut: string;
  medecinExterne: {
    id: string;
    specialite: string | null;
    numeroOrdre: string | null;
    telephone: string | null;
    email: string | null;
    actif: boolean;
  } | null;
};

export async function listerComptesMedecinsExternesClient(): Promise<
  CompteMedecinExterneClient[]
> {
  const rows = await prisma.utilisateur.findMany({
    where: { role: { code: ROLE_MEDECIN_EXTERNE } },
    include: { medecinExterne: true },
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
  });

  return rows.map((u) => ({
    id: u.id,
    identifiant: u.identifiant,
    email: u.email,
    prenom: u.prenom,
    nom: u.nom,
    telephone: u.telephone,
    statut: u.statut,
    medecinExterne: u.medecinExterne,
  }));
}

export async function creerCompteMedecinExterneClient(data: {
  identifiant: string;
  motDePasse: string;
  prenom: string;
  nom: string;
  specialite?: string;
  telephone?: string;
  email?: string;
  numeroOrdre?: string;
  afficherVitrine?: boolean;
}) {
  const identifiant = data.identifiant.trim().toLowerCase();
  const prenom = data.prenom.trim();
  const nom = data.nom.trim();
  if (!identifiant || !prenom || !nom) {
    throw new Error("Identifiant, prénom et nom requis.");
  }
  validerMotDePasse(data.motDePasse);
  await assertIdentifiantLibre(identifiant, data.email);

  const role = await roleParCode(ROLE_MEDECIN_EXTERNE);
  const hash = await hasherMotDePasse(data.motDePasse);
  const email = data.email?.trim().toLowerCase() || identifiant;
  const specialite = data.specialite?.trim() || "Médecine générale";

  return prisma.$transaction(async (tx) => {
    const fiche = await tx.medecinExterne.create({
      data: {
        prenom,
        nom,
        specialite,
        telephone: data.telephone?.trim() || null,
        email,
        numeroOrdre: data.numeroOrdre?.trim() || null,
        actif: true,
      },
    });

    const utilisateur = await tx.utilisateur.create({
      data: {
        identifiant,
        email,
        prenom,
        nom,
        telephone: data.telephone?.trim() || null,
        motDePasseHash: hash,
        roleId: role.id,
        statut: "ACTIF",
        medecinExterneId: fiche.id,
      },
      include: { medecinExterne: true },
    });

    return utilisateur;
  }).then(async (utilisateur) => {
    if (data.afficherVitrine) {
      await synchroniserVitrinePartenaire({
        prenom,
        nom,
        specialite,
        email,
        telephone: data.telephone,
        categorie: "MEDECIN_EXTERNE",
        actif: true,
      });
    }
    return utilisateur;
  });
}

export async function mettreAJourCompteMedecinExterneClient(
  utilisateurId: string,
  data: {
    prenom?: string;
    nom?: string;
    specialite?: string;
    telephone?: string;
    email?: string;
    numeroOrdre?: string;
    statut?: "ACTIF" | "INACTIF";
    motDePasse?: string;
    afficherVitrine?: boolean;
  }
) {
  const utilisateur = await prisma.utilisateur.findFirst({
    where: { id: utilisateurId, role: { code: ROLE_MEDECIN_EXTERNE } },
    include: { medecinExterne: true },
  });
  if (!utilisateur?.medecinExterne) {
    throw new Error("Compte médecin externe introuvable.");
  }

  if (data.motDePasse) validerMotDePasse(data.motDePasse);

  const prenom = data.prenom?.trim() ?? utilisateur.prenom;
  const nom = data.nom?.trim() ?? utilisateur.nom;
  const email =
    data.email?.trim().toLowerCase() ??
    utilisateur.email ??
    utilisateur.identifiant;
  const specialite =
    data.specialite?.trim() ?? utilisateur.medecinExterne.specialite ?? "";

  return prisma.$transaction(async (tx) => {
    await tx.medecinExterne.update({
      where: { id: utilisateur.medecinExterne!.id },
      data: {
        prenom,
        nom,
        specialite,
        telephone: data.telephone?.trim() ?? utilisateur.medecinExterne!.telephone,
        email,
        numeroOrdre:
          data.numeroOrdre?.trim() ?? utilisateur.medecinExterne!.numeroOrdre,
        actif: data.statut ? data.statut === "ACTIF" : undefined,
      },
    });

    const maj = await tx.utilisateur.update({
      where: { id: utilisateurId },
      data: {
        prenom,
        nom,
        email,
        telephone: data.telephone?.trim() ?? utilisateur.telephone,
        statut: data.statut,
        ...(data.motDePasse
          ? { motDePasseHash: await hasherMotDePasse(data.motDePasse) }
          : {}),
      },
      include: { medecinExterne: true },
    });

    if (data.afficherVitrine !== undefined) {
      if (data.afficherVitrine) {
        await synchroniserVitrinePartenaire({
          prenom,
          nom,
          specialite,
          email,
          telephone: data.telephone ?? utilisateur.telephone,
          categorie: "MEDECIN_EXTERNE",
          actif: true,
        });
      } else if (email) {
        await tx.medecinVitrine.updateMany({
          where: { email, categorie: "MEDECIN_EXTERNE" },
          data: { actif: false },
        });
      }
    }

    return maj;
  });
}

export type CompteEgliseClient = {
  id: string;
  identifiant: string;
  email: string | null;
  prenom: string;
  nom: string;
  telephone: string | null;
  statut: string;
};

export async function listerComptesEgliseClient(): Promise<CompteEgliseClient[]> {
  return prisma.utilisateur.findMany({
    where: { role: { code: ROLE_AGENT_EGLISE } },
    select: {
      id: true,
      identifiant: true,
      email: true,
      prenom: true,
      nom: true,
      telephone: true,
      statut: true,
    },
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
  });
}

export async function creerCompteEgliseClient(data: {
  identifiant: string;
  motDePasse: string;
  prenom: string;
  nom: string;
  telephone?: string;
  email?: string;
  afficherVitrine?: boolean;
}) {
  const identifiant = data.identifiant.trim().toLowerCase();
  const prenom = data.prenom.trim();
  const nom = data.nom.trim();
  if (!identifiant || !prenom || !nom) {
    throw new Error("Identifiant, prénom et nom requis.");
  }
  validerMotDePasse(data.motDePasse);
  await assertIdentifiantLibre(identifiant, data.email);

  const role = await roleParCode(ROLE_AGENT_EGLISE);
  const hash = await hasherMotDePasse(data.motDePasse);
  const email = data.email?.trim().toLowerCase() || identifiant;

  const utilisateur = await prisma.utilisateur.create({
    data: {
      identifiant,
      email,
      prenom,
      nom,
      telephone: data.telephone?.trim() || null,
      motDePasseHash: hash,
      roleId: role.id,
      statut: "ACTIF",
    },
  });

  if (data.afficherVitrine) {
    await synchroniserVitrinePartenaire({
      prenom,
      nom,
      specialite: "Service conventionné — Église",
      email,
      telephone: data.telephone,
      categorie: "SERVICE_EGLISE",
      actif: true,
    });
  }

  return utilisateur;
}

export async function mettreAJourCompteEgliseClient(
  utilisateurId: string,
  data: {
    prenom?: string;
    nom?: string;
    telephone?: string;
    email?: string;
    statut?: "ACTIF" | "INACTIF";
    motDePasse?: string;
    afficherVitrine?: boolean;
  }
) {
  const utilisateur = await prisma.utilisateur.findFirst({
    where: { id: utilisateurId, role: { code: ROLE_AGENT_EGLISE } },
  });
  if (!utilisateur) throw new Error("Compte conventionné introuvable.");

  if (data.motDePasse) validerMotDePasse(data.motDePasse);

  const prenom = data.prenom?.trim() ?? utilisateur.prenom;
  const nom = data.nom?.trim() ?? utilisateur.nom;
  const email =
    data.email?.trim().toLowerCase() ??
    utilisateur.email ??
    utilisateur.identifiant;

  const maj = await prisma.utilisateur.update({
    where: { id: utilisateurId },
    data: {
      prenom,
      nom,
      email,
      telephone: data.telephone?.trim() ?? utilisateur.telephone,
      statut: data.statut,
      ...(data.motDePasse
        ? { motDePasseHash: await hasherMotDePasse(data.motDePasse) }
        : {}),
    },
  });

  if (data.afficherVitrine !== undefined) {
    if (data.afficherVitrine) {
      await synchroniserVitrinePartenaire({
        prenom,
        nom,
        specialite: "Service conventionné — Église",
        email,
        telephone: data.telephone ?? utilisateur.telephone,
        categorie: "SERVICE_EGLISE",
        actif: true,
      });
    } else if (email) {
      await prisma.medecinVitrine.updateMany({
        where: { email, categorie: "SERVICE_EGLISE" },
        data: { actif: false },
      });
    }
  }

  return maj;
}
