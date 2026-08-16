export type ExamenPaquetOpt = {
  id: string;
  code: string;
  libelle: string;
  prix: number;
  categorie: string;
};

function normaliser(texte: string) {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function categoriesExamensUniques(examens: ExamenPaquetOpt[]): string[] {
  const set = new Set<string>();
  for (const e of examens) {
    if (e.categorie?.trim()) set.add(e.categorie.trim());
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
}

export function filtrerExamensPaquet(
  examens: ExamenPaquetOpt[],
  options: { recherche: string; categorie: string }
) {
  const terme = normaliser(options.recherche.trim());
  return examens.filter((ex) => {
    if (options.categorie !== "tous" && ex.categorie !== options.categorie) {
      return false;
    }
    if (!terme) return true;
    return (
      normaliser(ex.libelle).includes(terme) ||
      normaliser(ex.code).includes(terme) ||
      normaliser(ex.categorie).includes(terme)
    );
  });
}
