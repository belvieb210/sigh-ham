import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const src = path.join(root, "src", "features");

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (name.endsWith(".tsx")) acc.push(p);
  }
  return acc;
}

function stripMobileLists(content) {
  let next = content;
  // Listes / cartes mobile (2xl:hidden)
  next = next.replace(
    /<ul className="[^"]*2xl:hidden[^"]*"[\s\S]*?<\/ul>\s*/g,
    ""
  );
  next = next.replace(
    /<div className="space-y-3 2xl:hidden">[\s\S]*?<\/div>\s*/g,
    ""
  );
  next = next.replace(
    /<div className={`space-y-3 2xl:hidden[^`]*`}[\s\S]*?<\/div>\s*/g,
    ""
  );
  return next;
}

function fixTableWrappers(content) {
  let next = content;
  next = next.replace(
    /className="hidden overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm 2xl:block"/g,
    'className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm"'
  );
  next = next.replace(
    /className="hidden overflow-hidden rounded-xl border border-gris-bordure bg-white 2xl:block"/g,
    'className="overflow-hidden rounded-xl border border-gris-bordure bg-white"'
  );
  next = next.replace(/className="hidden overflow-hidden 2xl:block"/g, 'className="overflow-hidden"');
  // Déplier les tableaux masqués xl
  next = next.replace(/<div className="hidden xl:block">\s*/g, "");
  next = next.replace(/<div className="hidden overflow-hidden 2xl:block">\s*/g, "");
  return next;
}

function compactTableClasses(content) {
  return content
    .replace(
      /<table className="w-full table-fixed text-left text-sm">/g,
      '<table className="tableau-sigh">'
    )
    .replace(
      /<table className="min-w-full text-left text-sm">/g,
      '<table className="tableau-sigh">'
    );
}

const files = walk(src).filter((f) => {
  const c = fs.readFileSync(f, "utf8");
  return c.includes("2xl:hidden") || c.includes("2xl:block") || c.includes('hidden xl:block');
});

let changed = 0;
for (const file of files) {
  const original = fs.readFileSync(file, "utf8");
  let next = original;
  next = stripMobileLists(next);
  next = fixTableWrappers(next);
  next = compactTableClasses(next);
  if (next !== original) {
    fs.writeFileSync(file, next, "utf8");
    changed++;
    console.log("updated:", path.relative(root, file));
  }
}

function compactPadding(content) {
  return content
    .replace(/px-5 py-3\.5/g, "px-2 py-1.5")
    .replace(/px-3 py-3\.5/g, "px-2 py-1.5")
    .replace(/px-3 py-3/g, "px-2 py-1.5")
    .replace(/px-4 py-3/g, "px-2 py-1.5")
    .replace(/px-4 py-2\.5/g, "px-2 py-1.5")
    .replace(/className="w-10 px-/g, 'className="w-8 px-');
}

const targetFiles = walk(src).filter((f) => {
  const c = fs.readFileSync(f, "utf8");
  return (
    c.includes("tableau-sigh") &&
    (c.includes("px-3 py-3") ||
      c.includes("px-4 py-3") ||
      c.includes("px-5 py-3.5") ||
      c.includes("px-4 py-2.5"))
  );
});

let paddingChanged = 0;
for (const file of targetFiles) {
  const original = fs.readFileSync(file, "utf8");
  const next = compactPadding(original);
  if (next !== original) {
    fs.writeFileSync(file, next, "utf8");
    paddingChanged++;
    console.log("compact:", path.relative(root, file));
  }
}
console.log(`Padding compact: ${paddingChanged} file(s).`);
