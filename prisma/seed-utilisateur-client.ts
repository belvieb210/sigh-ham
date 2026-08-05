/**
 * Compte agent Service Client + seed contenu CMS (campagnes, hero, pages, services).
 * Usage : npx tsx prisma/seed-utilisateur-client.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hasherMotDePasse } from "../src/lib/auth/mot-de-passe";
import { CAMPAGNES_PUBLICATIONS } from "../src/constants/campagnes";
import { DIAPOSITIVES_HERO_ACCUEIL } from "../src/constants/hero-accueil";
import { CONTENU_A_PROPOS } from "../src/constants/a-propos";
import { CONTENU_SERVICES } from "../src/constants/services";
import { CONTENU_CAMPAGNES } from "../src/constants/campagnes";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const COMPTE = {
  identifiant: "client@gmail.com",
  email: "client@gmail.com",
  motDePasse: "Belvie210@!!",
  prenom: "Grace",
  nom: "Mwamba",
};

async function assurerSalleEtRole() {
  const salle = await prisma.salle.upsert({
    where: { code: "CLIENT" },
    update: { nom: "Service Client", ordre: 11, actif: true },
    create: {
      code: "CLIENT",
      nom: "Service Client",
      ordre: 11,
      actif: true,
    },
  });

  await prisma.role.upsert({
    where: { code: "AGENT_CLIENT" },
    update: { nom: "Agent service client", salleId: salle.id },
    create: {
      code: "AGENT_CLIENT",
      nom: "Agent service client",
      salleId: salle.id,
    },
  });

  return salle;
}

async function seedCampagnes() {
  for (const c of CAMPAGNES_PUBLICATIONS) {
    await prisma.campagnePublique.upsert({
      where: { slug: c.slug },
      update: {
        titre: c.titre,
        extrait: c.extrait,
        description: c.description,
        periode: c.periode,
        dateDebut: new Date(c.dateDebut),
        dateFin: new Date(c.dateFin),
        categorie: c.categorie,
        typePublication: c.typePublication,
        publie: c.publie,
        misEnAvant: c.misEnAvant,
        imageUrl: c.imageUrl ?? null,
        lieu: c.lieu ?? null,
        couleurFond: c.couleurFond,
        couleurIllustration: c.couleurIllustration,
        couleurAccent: c.couleurAccent,
        icone: c.icone,
        datePublication: c.datePublication
          ? new Date(c.datePublication)
          : null,
      },
      create: {
        slug: c.slug,
        titre: c.titre,
        extrait: c.extrait,
        description: c.description,
        periode: c.periode,
        dateDebut: new Date(c.dateDebut),
        dateFin: new Date(c.dateFin),
        categorie: c.categorie,
        typePublication: c.typePublication,
        publie: c.publie,
        misEnAvant: c.misEnAvant,
        imageUrl: c.imageUrl ?? null,
        lieu: c.lieu ?? null,
        couleurFond: c.couleurFond,
        couleurIllustration: c.couleurIllustration,
        couleurAccent: c.couleurAccent,
        icone: c.icone,
        datePublication: c.datePublication
          ? new Date(c.datePublication)
          : null,
      },
    });
  }
  console.log(`✓ ${CAMPAGNES_PUBLICATIONS.length} campagnes publiques`);
}

async function seedHero() {
  const count = await prisma.diapositiveHero.count();
  if (count > 0) {
    console.log(`✓ Hero déjà peuplé (${count} diapos)`);
    return;
  }
  for (const d of DIAPOSITIVES_HERO_ACCUEIL) {
    await prisma.diapositiveHero.create({
      data: {
        url: d.url,
        alt: d.alt,
        ordre: d.ordre,
        actif: d.publie,
      },
    });
  }
  console.log(`✓ ${DIAPOSITIVES_HERO_ACCUEIL.length} diapositives hero`);
}

async function seedPages() {
  const pages = [
    {
      cle: "accueil",
      titre: "Accueil",
      contenu: { note: "Sections pilotées par campagnes + hero + services" },
    },
    {
      cle: "a-propos",
      titre: "À propos",
      contenu: CONTENU_A_PROPOS,
    },
    {
      cle: "services",
      titre: "Services",
      contenu: {
        hero: CONTENU_SERVICES.hero,
        impact: CONTENU_SERVICES.impact,
        specialites: CONTENU_SERVICES.specialites,
        parcours: CONTENU_SERVICES.parcours,
        engagements: CONTENU_SERVICES.engagements,
        cta: CONTENU_SERVICES.cta,
      },
    },
    {
      cle: "contact",
      titre: "Contact",
      contenu: {
        note: "Coordonnées via branding / constantes navigation",
      },
    },
    {
      cle: "campagnes",
      titre: "Campagnes",
      contenu: {
        hero: CONTENU_CAMPAGNES.hero,
        impact: CONTENU_CAMPAGNES.impact,
        parcours: CONTENU_CAMPAGNES.parcours,
        cta: CONTENU_CAMPAGNES.cta,
      },
    },
  ];

  for (const p of pages) {
    await prisma.pagePublique.upsert({
      where: { cle: p.cle },
      update: { titre: p.titre, contenu: p.contenu, publie: true },
      create: {
        cle: p.cle,
        titre: p.titre,
        contenu: p.contenu,
        publie: true,
      },
    });
  }
  console.log(`✓ ${pages.length} pages publiques`);
}

async function seedServicesVitrine() {
  for (let i = 0; i < CONTENU_SERVICES.services.length; i++) {
    const s = CONTENU_SERVICES.services[i];
    await prisma.serviceVitrine.upsert({
      where: { slug: s.id },
      update: {
        titre: s.titre,
        description: s.description,
        imageUrl: "imageUrl" in s ? (s.imageUrl as string | undefined) ?? null : null,
        categorie: s.categorie,
        pointsJson: s.points,
        badge: "badge" in s ? ((s as { badge?: string }).badge ?? null) : null,
        href: s.href ?? null,
        icone: s.icone,
        ordre: i,
        actif: true,
      },
      create: {
        slug: s.id,
        titre: s.titre,
        description: s.description,
        imageUrl: "imageUrl" in s ? (s.imageUrl as string | undefined) ?? null : null,
        categorie: s.categorie,
        pointsJson: s.points,
        badge: "badge" in s ? ((s as { badge?: string }).badge ?? null) : null,
        href: s.href ?? null,
        icone: s.icone,
        ordre: i,
        actif: true,
      },
    });
  }
  console.log(`✓ ${CONTENU_SERVICES.services.length} services vitrine`);
}

async function seedMedecinsVitrine() {
  const count = await prisma.medecinVitrine.count();
  if (count > 0) {
    console.log(`✓ Médecins vitrine déjà peuplés (${count})`);
    return;
  }
  const direction = CONTENU_A_PROPOS.direction.responsable;
  await prisma.medecinVitrine.create({
    data: {
      prenom: direction.nom.split(" ")[0] ?? "Olivier",
      nom: direction.nom.split(" ").slice(1).join(" ") || "Bokulu",
      specialite: direction.fonction,
      bio: direction.biographie,
      photoUrl: direction.photoUrl,
      ordre: 0,
      actif: true,
    },
  });
  for (let i = 0; i < CONTENU_A_PROPOS.equipe.membres.length; i++) {
    const m = CONTENU_A_PROPOS.equipe.membres[i];
    const parts = m.nom.split(" ");
    await prisma.medecinVitrine.create({
      data: {
        prenom: parts[0] ?? m.nom,
        nom: parts.slice(1).join(" ") || m.nom,
        specialite: m.fonction,
        photoUrl: m.photoUrl,
        ordre: i + 1,
        actif: true,
      },
    });
  }
  console.log(
    `✓ ${CONTENU_A_PROPOS.equipe.membres.length + 1} fiches médecins vitrine`
  );
}

async function seedGalerie() {
  const count = await prisma.mediaGalerie.count();
  if (count > 0) {
    console.log(`✓ Galerie déjà peuplée (${count})`);
    return;
  }
  const images = [
    { url: "/images/a-propos/labo-1.jpg", legende: "Laboratoire" },
    { url: "/images/a-propos/labo-2.jpg", legende: "Équipements" },
    { url: "/images/a-propos/labo-3.jpg", legende: "Analyses" },
    { url: "/images/a-propos/labo-4.jpg", legende: "Accueil" },
  ];
  for (let i = 0; i < images.length; i++) {
    await prisma.mediaGalerie.create({
      data: {
        url: images[i].url,
        legende: images[i].legende,
        album: "etablissement",
        ordre: i,
        type: "image",
        actif: true,
      },
    });
  }
  console.log(`✓ ${images.length} médias galerie`);
}

async function main() {
  console.log("🌱 Seed Service Client — CMS");

  await assurerSalleEtRole();

  const role = await prisma.role.findUnique({
    where: { code: "AGENT_CLIENT" },
    include: { salle: true },
  });
  if (!role || role.salle?.code !== "CLIENT") {
    throw new Error("Rôle AGENT_CLIENT / salle CLIENT introuvable");
  }

  const hash = await hasherMotDePasse(COMPTE.motDePasse);
  await prisma.utilisateur.upsert({
    where: { identifiant: COMPTE.identifiant },
    update: {
      email: COMPTE.email,
      motDePasseHash: hash,
      prenom: COMPTE.prenom,
      nom: COMPTE.nom,
      roleId: role.id,
      statut: "ACTIF",
    },
    create: {
      identifiant: COMPTE.identifiant,
      email: COMPTE.email,
      motDePasseHash: hash,
      prenom: COMPTE.prenom,
      nom: COMPTE.nom,
      roleId: role.id,
      statut: "ACTIF",
    },
  });
  console.log(`✓ Compte ${COMPTE.identifiant}`);

  await seedCampagnes();
  await seedHero();
  await seedPages();
  await seedServicesVitrine();
  await seedMedecinsVitrine();
  await seedGalerie();

  console.log("✅ Seed Service Client terminé");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
