/**
 * Répare pages.messagerie / pages.notifications (petits blocs)
 * et supprime le bloc messagerie géant incorrectement imbriqué dans pages.
 * Usage: node scripts/reparer-locales-reception.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const receptionDir = path.join(__dirname, "..", "src", "locales", "reception");

const LANGUES = ["ar", "de", "en", "es", "fr", "he", "hi", "kg", "ln", "lua", "pt", "sw", "zh"];

function extraireBloc(source, cleRacine, depuis = 0) {
  const motif = new RegExp(`\\n  ${cleRacine}: \\{`);
  const match = motif.exec(source.slice(depuis));
  if (!match) return null;
  const debut = depuis + match.index + 1;
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

function remplacerBloc(contenu, cleRacine, nouveauBloc, indent = "  ") {
  const motif = new RegExp(`\\n${indent}${cleRacine}: \\{`);
  const match = motif.exec(contenu);
  if (!match) return { contenu, ok: false };
  const debut = match.index + 1;
  let i = contenu.indexOf("{", debut);
  let depth = 0;
  for (; i < contenu.length; i++) {
    if (contenu[i] === "{") depth++;
    else if (contenu[i] === "}") {
      depth--;
      if (depth === 0) {
        return {
          contenu:
            contenu.slice(0, debut) + `${indent}${cleRacine}: ${nouveauBloc}` + contenu.slice(i + 1),
          ok: true,
        };
      }
    }
  }
  return { contenu, ok: false };
}

const enSource = fs.readFileSync(path.join(receptionDir, "en.ts"), "utf8");
const frSource = fs.readFileSync(path.join(receptionDir, "fr.ts"), "utf8");

const pagesIdx = enSource.indexOf("\n  pages: {");
const blocsEn = {
  messagerie: extraireBloc(enSource, "messagerie", pagesIdx),
  notifications: extraireBloc(enSource, "notifications", pagesIdx),
  messagerieRoot: extraireBloc(enSource, "messagerie"),
  notificationsCentre: extraireBloc(enSource, "notificationsCentre"),
};

const blocsFr = {
  messagerie: extraireBloc(frSource, "messagerie", frSource.indexOf("\n  pages: {")),
  notifications: extraireBloc(frSource, "notifications", frSource.indexOf("\n  pages: {")),
  messagerieRoot: extraireBloc(frSource, "messagerie"),
  notificationsCentre: extraireBloc(frSource, "notificationsCentre"),
};

for (const lang of LANGUES) {
  const filePath = path.join(receptionDir, `${lang}.ts`);
  let contenu = fs.readFileSync(filePath, "utf8");

  const blocsPages = lang === "fr" ? blocsFr : blocsEn;
  const blocsRoot = lang === "fr" ? blocsFr : blocsEn;

  if (blocsPages.messagerie) {
    const r = remplacerBloc(contenu, "messagerie", blocsPages.messagerie, "    ");
    contenu = r.contenu;
  }
  if (blocsPages.notifications) {
    const r = remplacerBloc(contenu, "notifications", blocsPages.notifications, "    ");
    contenu = r.contenu;
  }
  if (blocsRoot.messagerieRoot) {
    const r = remplacerBloc(contenu, "messagerie", blocsRoot.messagerieRoot, "  ");
    contenu = r.contenu;
  }
  if (blocsRoot.notificationsCentre) {
    const r = remplacerBloc(contenu, "notificationsCentre", blocsRoot.notificationsCentre, "  ");
    contenu = r.contenu;
  }

  fs.writeFileSync(filePath, contenu, "utf8");
  console.log(`✓ ${lang}.ts réparé`);
}

console.log("\nStructure pages.messagerie + root messagerie normalisée.");
