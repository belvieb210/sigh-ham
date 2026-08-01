/**
 * Corrige les noms d'export/import dans les fichiers de locale générés.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "src", "locales");

const LANGUES = [
  { code: "sw", suffix: "Sw" },
  { code: "kg", suffix: "Kg" },
  { code: "lua", suffix: "Lua" },
  { code: "es", suffix: "Es" },
  { code: "de", suffix: "De" },
  { code: "hi", suffix: "Hi" },
  { code: "pt", suffix: "Pt" },
];

function corrigerFichier(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, "utf8");
  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }
  fs.writeFileSync(filePath, content, "utf8");
}

for (const { code, suffix } of LANGUES) {
  corrigerFichier(path.join(root, "commun", `${code}.ts`), [
    ["export const communEn", `export const commun${suffix}`],
    ["CommunEn", `Commun${suffix}`],
  ]);

  corrigerFichier(path.join(root, "pages", `${code}.ts`), [
    ["export const pagesEn", `export const pages${suffix}`],
    ["PagesEn", `Pages${suffix}`],
  ]);

  corrigerFichier(path.join(root, "reception", `${code}.ts`), [
    ["export const receptionEn", `export const reception${suffix}`],
    ["ReceptionEn", `Reception${suffix}`],
  ]);

  corrigerFichier(path.join(root, `${code}.ts`), [
    ['import { communEn } from "./commun/' + code + '"', `import { commun${suffix} } from "./commun/${code}"`],
    ['import { pagesEn } from "./pages/' + code + '"', `import { pages${suffix} } from "./pages/${code}"`],
    ['import { receptionEn } from "./reception/' + code + '"', `import { reception${suffix} } from "./reception/${code}"`],
    ["...communEn", `...commun${suffix}`],
    ["pages: pagesEn", `pages: pages${suffix}`],
    ["reception: receptionEn", `reception: reception${suffix}`],
  ]);

  console.log("Corrigé:", code);
}

console.log("Terminé.");
