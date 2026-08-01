/**
 * Duplique les fichiers de locale EN vers de nouvelles langues.
 * Usage: node scripts/generer-locales-langues.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "src", "locales");

const LANGUES = [
  { code: "sw", suffix: "Sw", label: "Swahili" },
  { code: "kg", suffix: "Kg", label: "Kikongo" },
  { code: "lua", suffix: "Lua", label: "Tshiluba" },
  { code: "es", suffix: "Es", label: "Spanish" },
  { code: "de", suffix: "De", label: "German" },
  { code: "hi", suffix: "Hi", label: "Hindi" },
  { code: "pt", suffix: "Pt", label: "Portuguese" },
];

function remplacerContenu(content, suffix) {
  return content
    .replace(/\bEn\b/g, suffix)
    .replace(/\ben\b/g, suffix.toLowerCase())
    .replace(/Translations EN/g, `Translations ${suffix.toUpperCase()}`)
    .replace(/English/g, suffix);
}

function copierFichier(srcRel, destRel, suffix) {
  const src = path.join(root, srcRel);
  const dest = path.join(root, destRel);
  if (!fs.existsSync(src)) {
    console.warn("Source introuvable:", srcRel);
    return;
  }
  const content = remplacerContenu(fs.readFileSync(src, "utf8"), suffix);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content, "utf8");
  console.log("Créé:", destRel);
}

for (const { code, suffix, label } of LANGUES) {
  copierFichier("commun/en.ts", `commun/${code}.ts`, suffix);
  copierFichier("pages/en.ts", `pages/${code}.ts`, suffix);
  copierFichier("reception/en.ts", `reception/${code}.ts`, suffix);
  copierFichier("en.ts", `${code}.ts`, suffix);
  console.log(`--- ${label} (${code}) ---`);
}

console.log("\nFichiers générés. Traduisez le contenu dans chaque fichier.");
