/** Fallback EN — catalogue examens laboratoire (locales secondaires) */

export const pagesServicesLaboratoireEn = {
  hero: {
    surtitre: "Medical testing laboratory",
    titre: "Our medical",
    titreAccent: "tests",
    description:
      "Browse our full catalog of laboratory, imaging, and specialized tests. Transparent pricing, controlled turnaround, and ISO 9001:2015 certified results.",
    garanties: [
      { id: "fiabilite", titre: "Reliable results", description: "Rigorous quality controls" },
      { id: "equipements", titre: "Modern equipment", description: "State-of-the-art technology" },
      { id: "rapidite", titre: "Speed & efficiency", description: "Optimized turnaround" },
      { id: "confidentialite", titre: "Confidentiality", description: "Protected data" },
    ],
  },
  catalogue: {
    titreTous: "All tests",
    rechercheLabel: "Search for a test",
    recherchePlaceholder: "Search for a test (e.g. CBC, Blood glucose…)",
    filtreCategorie: "Filter by category",
    filtreService: "Filter by service",
    toutesCategories: "All categories",
    tousServices: "All services",
    trierPar: "Sort by",
    triNom: "Name (A → Z)",
    triPrixAsc: "Price ascending",
    triPrixDesc: "Price descending",
    categoriesTitre: "Test categories",
    tousExamens: "All tests",
    aideTitre: "Need help?",
    aideTexte: "Our reception team will guide you to the tests suited to your prescription.",
    aucunResultat: "No test matches your search.",
  },
  cta: {
    titre: "Book an appointment for your tests",
    description: "Save time by booking online or contact our reception desk.",
    boutonServices: "View our services",
    boutonRdv: "Book an appointment",
  },
} as const;
