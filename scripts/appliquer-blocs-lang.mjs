/**
 * Applique blocs messagerie / notificationsCentre traduits + corrige pages.messagerie.
 * Usage: node scripts/appliquer-blocs-lang.mjs sw kg
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const receptionDir = path.join(__dirname, "..", "src", "locales", "reception");
const blocsDir = path.join(receptionDir, "blocs");

const CONFIG = {
  sw: {
    importMessagerie: 'import { messagerieSw } from "./blocs/messagerie-sw";',
    importNotif: 'import { notificationsCentreSw } from "./blocs/notifications-sw";',
    messagerie: "messagerieSw",
    notificationsCentre: "notificationsCentreSw",
    pagesMessagerie: `{
      titre: "Ujumbe",
      description: "Wasiliana na timu za idara mbalimbali kwa usalama.",
      fil: "Ujumbe",
    }`,
    pagesNotifications: `{
      titre: "Arifa",
      description: "Tahadhari, vikumbusho na ujumbe wa mfumo kwa mapokezi.",
      fil: "Arifa",
    }`,
    navNotif: "Arifa",
    layoutNotif: "Arifa",
  },
  kg: {
    importMessagerie: 'import { messagerieKg } from "./blocs/messagerie-kg";',
    importNotif: 'import { notificationsCentreKg } from "./blocs/notifications-kg";',
    messagerie: "messagerieKg",
    notificationsCentre: "notificationsCentreKg",
    pagesMessagerie: `{
      titre: "Bansangu",
      description: "Yitukila na bantu ya bitini na bokono.",
      fil: "Bansangu",
    }`,
    pagesNotifications: `{
      titre: "Bansangu ya kebula",
      description: "Bansangu, bantadila mpe bansangu ya système na réception.",
      fil: "Bansangu ya kebula",
    }`,
    navNotif: "Bansangu ya kebula",
    layoutNotif: "Bansangu ya kebula",
  },
  ln: {
    importMessagerie: 'import { messagerieLn } from "./blocs/messagerie-ln";',
    importNotif: 'import { notificationsCentreLn } from "./blocs/notifications-ln";',
    messagerie: "messagerieLn",
    notificationsCentre: "notificationsCentreLn",
    pagesMessagerie: `{
      titre: "Mesaje",
      description: "Yokani na ba équipe ya bitini na libateli.",
      fil: "Mesaje",
    }`,
    pagesNotifications: `{
      titre: "Ba sango",
      description: "Ba alerte, ba rappel mpe ba message système na réception.",
      fil: "Ba sango",
    }`,
    navNotif: "Ba sango",
    layoutNotif: "Ba sango",
  },
};

function remplacerPetitBloc(contenu, cle, nouveauBloc) {
  const motif = new RegExp(`\\n    ${cle}: \\{`);
  const match = motif.exec(contenu);
  if (!match) return contenu;
  const debut = match.index + 1;
  let i = contenu.indexOf("{", debut);
  let depth = 0;
  for (; i < contenu.length; i++) {
    if (contenu[i] === "{") depth++;
    else if (contenu[i] === "}") {
      depth--;
      if (depth === 0) {
        return contenu.slice(0, debut) + `    ${cle}: ${nouveauBloc}` + contenu.slice(i + 1);
      }
    }
  }
  return contenu;
}

function remplacerBlocRacine(contenu, cle, remplacement) {
  const motif = new RegExp(`\\n  ${cle}: \\{`);
  const match = motif.exec(contenu);
  if (!match) {
    const motifRef = new RegExp(`\\n  ${cle}: ${remplacement},?`);
    if (motifRef.test(contenu)) return contenu;
    throw new Error(`Bloc racine ${cle} introuvable`);
  }
  const debut = match.index + 1;
  let i = contenu.indexOf("{", debut);
  let depth = 0;
  for (; i < contenu.length; i++) {
    if (contenu[i] === "{") depth++;
    else if (contenu[i] === "}") {
      depth--;
      if (depth === 0) {
        return contenu.slice(0, debut) + `  ${cle}: ${remplacement.replace(/,$/, "")},` + contenu.slice(i + 1);
      }
    }
  }
  throw new Error(`Fin bloc ${cle} introuvable`);
}

const langs = process.argv.slice(2).filter((l) => CONFIG[l]);
if (!langs.length) {
  console.error("Usage: node scripts/appliquer-blocs-lang.mjs sw kg");
  process.exit(1);
}

for (const lang of langs) {
  const cfg = CONFIG[lang];
  const filePath = path.join(receptionDir, `${lang}.ts`);
  let contenu = fs.readFileSync(filePath, "utf8");

  if (!contenu.includes(cfg.importMessagerie.slice(0, 30))) {
    contenu = contenu.replace(
      'import type { ReceptionFr } from "./fr";',
      `import type { ReceptionFr } from "./fr";\n${cfg.importMessagerie}\n${cfg.importNotif}`
    );
  }

  contenu = remplacerPetitBloc(contenu, "messagerie", cfg.pagesMessagerie);
  contenu = remplacerPetitBloc(contenu, "notifications", cfg.pagesNotifications);
  contenu = remplacerBlocRacine(contenu, "messagerie", cfg.messagerie);
  contenu = remplacerBlocRacine(contenu, "notificationsCentre", cfg.notificationsCentre);
  contenu = contenu.replace(
    /(\n  nav: \{[\s\S]*?\n    notifications: )"[^"]*"/,
    `$1"${cfg.navNotif}"`
  );
  if (cfg.layoutNotif) {
    contenu = contenu.replace(
      /(\n  layout: \{[\s\S]*?\n    notifications: )"[^"]*"/,
      `$1"${cfg.layoutNotif}"`
    );
  }

  fs.writeFileSync(filePath, contenu, "utf8");
  console.log(`✓ ${lang}.ts blocs traduits appliqués`);
}
