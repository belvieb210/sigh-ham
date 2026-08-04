const fs = require("fs");

const map = {
  ar: "Ar",
  de: "De",
  es: "Es",
  he: "He",
  hi: "Hi",
  kg: "Kg",
  ln: "Ln",
  lua: "Lua",
  pt: "Pt",
  sw: "Sw",
  zh: "Zh",
};

for (const [l, suf] of Object.entries(map)) {
  fs.writeFileSync(
    `src/locales/infirmiers/${l}.ts`,
    `import { infirmiersFr } from "./fr";\nexport const infirmiers${suf} = infirmiersFr;\n`
  );
}

const roots = ["fr", "en", ...Object.keys(map)];
for (const l of roots) {
  const p = `src/locales/${l}.ts`;
  let t = fs.readFileSync(p, "utf8");
  const suf = l === "fr" ? "Fr" : l === "en" ? "En" : map[l];
  const importLine = `import { infirmiers${suf} } from "./infirmiers/${l}";`;
  if (!t.includes(`infirmiers${suf}`)) {
    t = t.replace(
      /import \{ medecins\w+ \} from "\.\/medecins\/[^"]+";/,
      (m) => `${m}\n${importLine}`
    );
  }
  if (!t.includes("infirmiers: infirmiers")) {
    t = t.replace(
      /medecins: medecins\w+,/,
      (m) => `${m}\n    infirmiers: infirmiers${suf},`
    );
  }
  fs.writeFileSync(p, t);
  console.log("wired", l);
}
