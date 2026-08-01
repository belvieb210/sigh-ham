import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "locales", "reception");

const OLD = `    types: {
      DIRECT: "Message privé",
      GROUPE: "Groupe de travail",
      CANAL_SALLE: "Canal de service",
    },`;

const NEW = `    types: {
      DIRECT: "Message privé",
      GROUPE: "Groupe de travail",
      CANAL_SALLE: "Canal de service",
      DIFFUSION: "Annonce institutionnelle",
    },`;

for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".ts") || f === "fr.ts" || f === "en.ts" || f === "ar.ts") continue;
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, "utf8");
  if (c.includes(OLD)) {
    c = c.replace(OLD, NEW);
    fs.writeFileSync(p, c);
    console.log("patched", f);
  }
}
