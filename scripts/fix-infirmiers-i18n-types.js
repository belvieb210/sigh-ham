const fs = require("fs");

let t = fs.readFileSync("src/locales/infirmiers/fr.ts", "utf8");
t = t.replace("} as const;", "};");
fs.writeFileSync("src/locales/infirmiers/fr.ts", t);

let e = fs.readFileSync("src/locales/infirmiers/en.ts", "utf8");
e = e.replace(/import type \{ InfirmiersFr \} from "\.\/fr";\r?\n\r?\n/, "");
e = e.replace(
  "export const infirmiersEn: InfirmiersFr =",
  "export const infirmiersEn ="
);
fs.writeFileSync("src/locales/infirmiers/en.ts", e);
console.log("ok");
