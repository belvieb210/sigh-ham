/**
 * Synchronise messagerie, notificationsCentre et pages.messagerie/notifications
 * depuis reception/fr.ts (langue source) vers les langues incomplètes.
 * Exclut zh (blocs dédiés) et fr/en déjà maintenus à la main.
 *
 * Usage: node scripts/sync-i18n-messagerie-notifications.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const receptionDir = path.join(__dirname, "..", "src", "locales", "reception");

/** Langues recevant la structure FR tant qu'elles n'ont pas leur propre traduction. */
const LANGUES = ["ar", "de", "es", "he", "hi", "kg", "ln", "lua", "pt", "sw"];

function extraireBloc(source, cleRacine) {
  const motif = new RegExp(`\\n  ${cleRacine}: \\{`);
  const match = motif.exec(source);
  if (!match) return null;
  const debut = match.index + 1;
  let i = source.indexOf("{", debut);
  let depth = 0;
  const start = i;
  for (; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") {
      depth--;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return null;
}

function remplacerBloc(contenu, cleRacine, nouveauBloc) {
  const motif = new RegExp(`\\n  ${cleRacine}: \\{`);
  const match = motif.exec(contenu);
  if (!match) {
    console.warn(`  Clé ${cleRacine} introuvable`);
    return contenu;
  }
  const debut = match.index + 1;
  let i = contenu.indexOf("{", debut);
  let depth = 0;
  for (; i < contenu.length; i++) {
    if (contenu[i] === "{") depth++;
    else if (contenu[i] === "}") {
      depth--;
      if (depth === 0) {
        return contenu.slice(0, debut) + `  ${cleRacine}: ${nouveauBloc}` + contenu.slice(i + 1);
      }
    }
  }
  return contenu;
}

function remplacerPagesSousBloc(contenu, pageCle, nouveauBlocInterne) {
  const pagesMatch = contenu.match(/\n  pages: \{/);
  if (!pagesMatch) return contenu;
  const pagesStart = pagesMatch.index;
  const sousMotif = new RegExp(`\\n    ${pageCle}: \\{`);
  const sousMatch = sousMotif.exec(contenu.slice(pagesStart));
  if (!sousMatch) return contenu;
  const absStart = pagesStart + sousMatch.index + 1;
  let i = contenu.indexOf("{", absStart);
  let depth = 0;
  for (; i < contenu.length; i++) {
    if (contenu[i] === "{") depth++;
    else if (contenu[i] === "}") {
      depth--;
      if (depth === 0) {
        const avant = contenu.slice(0, absStart);
        const apres = contenu.slice(i + 1);
        return `${avant}    ${pageCle}: ${nouveauBlocInterne}${apres}`;
      }
    }
  }
  return contenu;
}

const frSource = fs.readFileSync(path.join(receptionDir, "fr.ts"), "utf8");
const blocs = {
  messagerie: extraireBloc(frSource, "messagerie"),
  notificationsCentre: extraireBloc(frSource, "notificationsCentre"),
  pageMessagerie: extraireBloc(
    frSource.slice(frSource.indexOf("pages: {")),
    "messagerie"
  ),
  pageNotifications: extraireBloc(
    frSource.slice(frSource.indexOf("pages: {")),
    "notifications"
  ),
};

if (!blocs.messagerie || !blocs.notificationsCentre) {
  console.error("Impossible d'extraire les blocs depuis fr.ts");
  process.exit(1);
}

for (const lang of LANGUES) {
  const filePath = path.join(receptionDir, `${lang}.ts`);
  if (!fs.existsSync(filePath)) continue;
  let contenu = fs.readFileSync(filePath, "utf8");
  contenu = remplacerBloc(contenu, "messagerie", blocs.messagerie);
  contenu = remplacerBloc(contenu, "notificationsCentre", blocs.notificationsCentre);
  if (blocs.pageMessagerie) {
    contenu = remplacerPagesSousBloc(contenu, "messagerie", blocs.pageMessagerie);
  }
  if (blocs.pageNotifications) {
    contenu = remplacerPagesSousBloc(contenu, "notifications", blocs.pageNotifications);
  }
  fs.writeFileSync(filePath, contenu, "utf8");
  console.log(`✓ ${lang}.ts synchronisé (source fr)`);
}

console.log("\nTerminé — repli structurel depuis fr.ts (plus depuis en.ts).");
