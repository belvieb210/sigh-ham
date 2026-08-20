/** Généré depuis modaux.php — node scripts/extraire-options-modaux.mjs */
import type { ConfigSaisieParametre } from "@/lib/laboratoire/config-saisie-parametre";
import { avecOptionAutres } from "@/lib/laboratoire/config-saisie-parametre";

export type EntreeOptionsSaisie = ConfigSaisieParametre;

export const OPTIONS_SAISIE_PAR_FORMULAIRE: Record<
  string,
  Record<string, EntreeOptionsSaisie>
> = {
  "examForm": {},
  "bilansAnalyses": {},
  "ionogramme": {
    "SODIUM": {
      "typeSaisie": "texte"
    },
    "POTASSIUM": {
      "typeSaisie": "texte"
    },
    "CHLORIDE": {
      "typeSaisie": "texte"
    }
  },
  "spot_urines": {
    "SODIUM": {
      "typeSaisie": "texte"
    },
    "POTASSIUM": {
      "typeSaisie": "texte"
    },
    "CHLORIDE": {
      "typeSaisie": "texte"
    }
  },
  "ptt": {
    "PROTEINE TOTALES": {
      "typeSaisie": "texte"
    },
    "ALBUMINE": {
      "typeSaisie": "texte"
    },
    "GLOBULINE": {
      "typeSaisie": "texte"
    },
    "RAPPORT ALBU/GLOBU": {
      "typeSaisie": "texte"
    }
  },
  "bilans_azotes": {
    "UREE": {
      "typeSaisie": "texte"
    },
    "CREATININE": {
      "typeSaisie": "texte"
    },
    "ACIDE URIQUE": {
      "typeSaisie": "texte"
    },
    "RAPPORT UREE/CREATININE": {
      "typeSaisie": "texte"
    }
  },
  "profilLipidique": {
    "TOTAL CHOLESTEROL": {
      "typeSaisie": "texte"
    },
    "HDL CHOLESTEROL": {
      "typeSaisie": "texte"
    },
    "TRIGLYCERIDE": {
      "typeSaisie": "texte"
    },
    "LDL CHOLESTEROL": {
      "typeSaisie": "texte"
    },
    "RAPPORT CHOL/HDL": {
      "typeSaisie": "texte"
    },
    "RAPPORT LDL/HDL": {
      "typeSaisie": "texte"
    },
    "VLDL": {
      "typeSaisie": "texte"
    }
  },
  "bilirubi": {
    "BILIRUBINE TOTAL": {
      "typeSaisie": "texte"
    },
    "BILIRUBINE DIRECT": {
      "typeSaisie": "texte"
    },
    "BILIRUBINE INDIRECT": {
      "typeSaisie": "texte"
    }
  },
  "serology": {
    "RESULTAT:": {
      "typeSaisie": "resultat_valeur",
      "options": [
        "Négatif",
        "Positif",
        "Autres"
      ],
      "libelleSecondaire": "Valeurs",
      "placeholderSecondaire": "Titre/Valeur"
    },
    "__defaut__": {
      "typeSaisie": "resultat_valeur",
      "options": [
        "Négatif",
        "Positif",
        "Autres"
      ],
      "libelleSecondaire": "Valeurs",
      "placeholderSecondaire": "Titre/Valeur"
    }
  },
  "salmonella": {
    "IGG SALMONELLA TYPHI": {
      "typeSaisie": "resultat_valeur",
      "options": [
        "Négatif",
        "Positif",
        "Autres"
      ],
      "libelleSecondaire": "Valeurs",
      "placeholderSecondaire": "Titre/Valeur"
    },
    "IGM SALMONELLA TYPHI": {
      "typeSaisie": "resultat_valeur",
      "options": [
        "Négatif",
        "Positif",
        "Autres"
      ],
      "libelleSecondaire": "Valeurs",
      "placeholderSecondaire": "Titre/Valeur"
    }
  },
  "widal": {
    "S TYPHI AG O": {
      "typeSaisie": "resultat_valeur",
      "options": [
        "Négatif",
        "Positif",
        "Autres"
      ],
      "libelleSecondaire": "Valeurs",
      "placeholderSecondaire": "Titre/Valeur"
    },
    "S TYPHI AG H": {
      "typeSaisie": "resultat_valeur",
      "options": [
        "Négatif",
        "Positif",
        "Autres"
      ],
      "libelleSecondaire": "Valeurs",
      "placeholderSecondaire": "Titre/Valeur"
    },
    "S PARATYPHI AG BH": {
      "typeSaisie": "resultat_valeur",
      "options": [
        "Négatif",
        "Positif",
        "Autres"
      ],
      "libelleSecondaire": "Valeurs",
      "placeholderSecondaire": "Titre/Valeur"
    },
    "S PARATYPHI AG AH": {
      "typeSaisie": "resultat_valeur",
      "options": [
        "Négatif",
        "Positif",
        "Autres"
      ],
      "libelleSecondaire": "Valeurs",
      "placeholderSecondaire": "Titre/Valeur"
    }
  },
  "sedimentUrinaire": {
    "COULEUR": {
      "typeSaisie": "select_autres",
      "options": [
        "Incolore",
        "Jaune clair",
        "Jaune",
        "Jaune foncé",
        "Ambre",
        "Rougeâtre",
        "Rose",
        "Brun",
        "Noir",
        "Autres"
      ]
    },
    "APPARENCES": {
      "typeSaisie": "select_autres",
      "options": [
        "Claire",
        "Légèrement trouble",
        "Trouble",
        "Très trouble",
        "Autres"
      ]
    },
    "LEUCOCYTES": {
      "typeSaisie": "select_autres",
      "options": [
        "0-1",
        "1-2",
        "2-3",
        "3-5",
        "5-7",
        "8-10",
        "10-15",
        "15-20",
        "20-30",
        "Nombreux (30-50)",
        "Très nombreux(50-100)",
        "Très nombreux (˃100)",
        "Autres"
      ]
    },
    "CELLULE EPITHELIALE": {
      "typeSaisie": "select_autres",
      "options": [
        "0-1",
        "1-2",
        "2-3",
        "3-5",
        "5-7",
        "8-10",
        "10-15",
        "15-20",
        "20-30",
        "Nombreux (30-50)",
        "Très nombreux(50-100)",
        "Très nombreux (˃100)",
        "Autres"
      ]
    },
    "GLOBULE ROUGE": {
      "typeSaisie": "select_autres",
      "options": [
        "0-1",
        "1-2",
        "2-3",
        "3-5",
        "5-7",
        "8-10",
        "10-15",
        "15-20",
        "20-30",
        "Nombreux (30-50)",
        "Très nombreux(50-100)",
        "Très nombreux (˃100)",
        "Autres"
      ]
    },
    "LEVURES": {
      "typeSaisie": "select_autres",
      "options": [
        "Absent",
        "Présent",
        "+",
        "++",
        "+++",
        "Autres"
      ]
    },
    "CRISTAUX": {
      "typeSaisie": "select_autres",
      "options": [
        "Absent",
        "Present",
        "+",
        "++",
        "+++",
        "++++",
        "Autres"
      ]
    },
    "CILINDRE": {
      "typeSaisie": "select_autres",
      "options": [
        "Absent",
        "Hyalin",
        "Granuleux",
        "Hématoïde",
        "Circoïde",
        "Ciré",
        "Leucocytaire",
        "Autres"
      ]
    },
    "BACTERIES": {
      "typeSaisie": "select_autres",
      "options": [
        "Négatif",
        "Peu",
        "Modéré",
        "Nombreux",
        "+",
        "++",
        "+++",
        "Autres"
      ]
    },
    "AUTRES": {
      "typeSaisie": "select_autres",
      "options": [
        "Absent",
        "Autres"
      ]
    }
  },
  "urinesRoutines": {
    "COULEUR": {
      "typeSaisie": "select_autres",
      "options": [
        "Incolore",
        "Jaune clair",
        "Jaune",
        "Jaune foncé",
        "Ambre",
        "Orange",
        "Rouge pale",
        "Rouge foncé",
        "Rose",
        "Brun",
        "Blanchâtre",
        "Autres"
      ]
    },
    "APPARENCES": {
      "typeSaisie": "select_autres",
      "options": [
        "Claire",
        "Légèrement trouble",
        "Trouble",
        "Très trouble",
        "Autres"
      ]
    },
    "PH": {
      "typeSaisie": "select_autres",
      "options": [
        "4.5",
        "5.0",
        "5.5",
        "6.0",
        "6.5",
        "7.0",
        "7.5",
        "8.0",
        "8.5",
        "Autres"
      ]
    },
    "GRAVITE SPECIFIQUE": {
      "typeSaisie": "select_autres",
      "options": [
        "1.005",
        "1.010",
        "1.015",
        "1.020",
        "1.025",
        "1.030",
        "Autres"
      ]
    },
    "GLUCOSURIE": {
      "typeSaisie": "select_autres",
      "options": [
        "Négatif",
        "Traces",
        "+",
        "++",
        "+++",
        "++++",
        "Autres"
      ]
    },
    "PROTEINURIE": {
      "typeSaisie": "select_autres",
      "options": [
        "Négatif",
        "Traces",
        "+",
        "++",
        "+++",
        "++++",
        "Autres"
      ]
    },
    "NITRATE": {
      "typeSaisie": "select_autres",
      "options": [
        "Négatif",
        "Positif",
        "Autres"
      ]
    },
    "KETONE": {
      "typeSaisie": "select_autres",
      "options": [
        "Négatif",
        "Traces",
        "+",
        "++",
        "+++",
        "++++",
        "Autres"
      ]
    },
    "BILIRUBINE": {
      "typeSaisie": "select_autres",
      "options": [
        "Négatif",
        "Traces",
        "+",
        "++",
        "+++",
        "++++",
        "Autres"
      ]
    },
    "UROBILIRINE": {
      "typeSaisie": "select_autres",
      "options": [
        "Négatif",
        "Traces",
        "+",
        "++",
        "+++",
        "++++",
        "Autres"
      ]
    },
    "LEUCOCYTES": {
      "typeSaisie": "select_autres",
      "options": [
        "0-1",
        "1-2",
        "2-3",
        "3-5",
        "5-7",
        "8-10",
        "10-15",
        "15-20",
        "20-30",
        "Nombreux (30-50)",
        "Très nombreux(50-100)",
        "Très nombreux (˃100)",
        "Autres"
      ]
    },
    "CELLULE EPITHELIALE": {
      "typeSaisie": "select_autres",
      "options": [
        "0-1",
        "1-2",
        "2-3",
        "3-5",
        "5-7",
        "8-10",
        "10-15",
        "15-20",
        "20-30",
        "Nombreux (30-50)",
        "Très nombreux(50-100)",
        "Très nombreux (˃100)",
        "Autres"
      ]
    },
    "GLOBULE ROUGE": {
      "typeSaisie": "select_autres",
      "options": [
        "0-1",
        "1-2",
        "2-3",
        "3-5",
        "5-7",
        "8-10",
        "10-15",
        "15-20",
        "20-30",
        "Nombreux (30-50)",
        "Très nombreux(50-100)",
        "Très nombreux (˃100)",
        "Autres"
      ]
    },
    "LEVURES": {
      "typeSaisie": "select_autres",
      "options": [
        "Absent",
        "Présent",
        "+",
        "++",
        "+++",
        "Autres"
      ]
    },
    "CRISTAUX": {
      "typeSaisie": "select_autres",
      "options": [
        "Absent",
        "Present",
        "+",
        "++",
        "+++",
        "++++",
        "Autres"
      ]
    },
    "CILINDRE": {
      "typeSaisie": "select_autres",
      "options": [
        "Absent",
        "Hyalin",
        "Granuleux",
        "Hématoïde",
        "Circoïde",
        "Ciré",
        "Leucocytaire",
        "Autres"
      ]
    },
    "BACTERIES": {
      "typeSaisie": "select",
      "options": [
        "Négatif",
        "Peu",
        "Modéré",
        "Nombreux",
        "+",
        "++",
        "+++"
      ]
    },
    "AUTRES": {
      "typeSaisie": "select_autres",
      "options": [
        "Absent",
        "Présent",
        "Autres"
      ]
    }
  },
  "sellesRoutine": {
    "COULEUR": {
      "typeSaisie": "select_autres",
      "options": [
        "Jaune",
        "Brun",
        "Noir",
        "Gris",
        "Pâle",
        "Verdâtre",
        "Autres"
      ]
    },
    "ODEUR": {
      "typeSaisie": "select_autres",
      "options": [
        "Fecal",
        "Nauséabond",
        "Putride",
        "Acide",
        "Soufrée",
        "Autres"
      ]
    },
    "MUCUS": {
      "typeSaisie": "select_autres",
      "options": [
        "Absent",
        "Présence",
        "Peu",
        "Modéré",
        "Nombreux",
        "Autres"
      ]
    },
    "CONSISTANCE": {
      "typeSaisie": "select_autres",
      "options": [
        "Dures",
        "Solide Morceau dechiquetés",
        "Pâteuse",
        "Molle",
        "Liquide",
        "Diarrhéique",
        "Autres"
      ]
    },
    "SANG VISIBLE": {
      "typeSaisie": "select_autres",
      "options": [
        "Absent",
        "Présent",
        "Autres"
      ]
    },
    "LEUCOCYTES": {
      "typeSaisie": "select_autres",
      "options": [
        "0-1",
        "1-2",
        "3-5",
        "5-10",
        "10-20",
        "20-30",
        "Nombreux (30-50)",
        "Très nombreux(50-100)",
        "Très nombreux (˃100)",
        "Autres"
      ]
    },
    "GLOBULE ROUGE": {
      "typeSaisie": "select_autres",
      "options": [
        "0-1",
        "1-2",
        "3-5",
        "5-10",
        "10-20",
        "20-30",
        "Nombreux (30-50)",
        "Très nombreux(50-100)",
        "Très nombreux (˃100)",
        "Autres"
      ]
    },
    "MACROPHAGES": {
      "typeSaisie": "select",
      "options": [
        "Absent",
        "Présent"
      ]
    },
    "KYSTE": {
      "typeSaisie": "select_autres",
      "options": [
        "Antemoeba coli",
        "Antemoeba histolytica",
        "Giardia lambia",
        "Autres"
      ]
    },
    "LARVE": {
      "typeSaisie": "select_autres",
      "options": [
        "Absent",
        "Anguillule",
        "Ankylostome",
        "Strongyloides",
        "Autres"
      ]
    },
    "LEVURE": {
      "typeSaisie": "select_autres",
      "options": [
        "Absent",
        "Bourgeonnante",
        "Bourgeonnantes +",
        "Bourgeonnantes ++",
        "Bourgeonnantes +++",
        "Non bourgeonnante ++++",
        "Non bourgeonnante",
        "Non bourgeonnante +",
        "Non bourgeonnante ++",
        "Non bourgeonnante +++",
        "Autres"
      ]
    },
    "CRISTAUX CHARCOT-LEYDEN": {
      "typeSaisie": "select",
      "options": [
        "Absent",
        "Présent"
      ]
    },
    "TROPHOZOITES": {
      "typeSaisie": "select",
      "options": [
        "Absent",
        "Présent"
      ]
    },
    "OVULES": {
      "typeSaisie": "select",
      "options": [
        "Absent",
        "Présent"
      ]
    },
    "PARASITE ADULTE": {
      "typeSaisie": "select",
      "options": [
        "Absent",
        "Présent"
      ]
    },
    "AUTRES": {
      "typeSaisie": "select_autres",
      "options": [
        "Non observé",
        "Autres"
      ]
    }
  },
  "rivalta": {
    "SPECIMEN": {
      "typeSaisie": "texte"
    },
    "ASPECTS": {
      "typeSaisie": "select_autres",
      "options": [
        "Clair",
        "Trouble",
        "Purulent",
        "Hémorragique",
        "Lactescent",
        "Ictérique",
        "Autres"
      ]
    },
    "COULEUR": {
      "typeSaisie": "select_autres",
      "options": [
        "Jaune citron",
        "Blanchâtre",
        "Jaune",
        "Rose sanglante",
        "Blanc laiteux",
        "Autres"
      ]
    },
    "RESULTAT": {
      "typeSaisie": "select_autres",
      "options": [
        "Transsudat",
        "Exsudat",
        "Autres"
      ]
    }
  },
  "proteineBincesJones": {
    "SPECIMEN": {
      "typeSaisie": "select_autres",
      "options": [
        "Plasma",
        "Sérum",
        "Urine",
        "Autres"
      ]
    },
    "RESULTAT": {
      "typeSaisie": "select_autres",
      "options": [
        "Négatif",
        "Positif",
        "Traces",
        "+",
        "++",
        "+++",
        "Autres"
      ]
    }
  },
  "trypanosomiase": {
    "METHODE": {
      "typeSaisie": "select_autres",
      "options": [
        "GOUTTE FRAICHE",
        "BUFFY COAT",
        "Autres"
      ]
    },
    "SPECIMEN": {
      "typeSaisie": "select_autres",
      "options": [
        "Sang",
        "LCS",
        "Urine",
        "liquebiologique",
        "Autre fluide",
        "Autres"
      ]
    },
    "RESULTAT": {
      "typeSaisie": "select_autres",
      "options": [
        "Négatif",
        "Positif",
        "Autres"
      ]
    }
  },
  "sangOcculte": {
    "SPECIMEN": {
      "typeSaisie": "select_autres",
      "options": [
        "Selles",
        "Vomitus",
        "Autres"
      ]
    },
    "CONSISTANCE": {
      "typeSaisie": "select_autres",
      "options": [
        "Dures",
        "Solide Morceau dechiquetés",
        "Pâteuse",
        "Molle",
        "Liquide",
        "Diarrhéique",
        "Autres"
      ]
    },
    "SANG VISIBLE": {
      "typeSaisie": "select_autres",
      "options": [
        "Absent",
        "Présent",
        "Autres"
      ]
    },
    "RESULTAT": {
      "typeSaisie": "select_autres",
      "options": [
        "Négatif",
        "Traces",
        "+",
        "++",
        "+++",
        "Autres"
      ]
    }
  },
  "malaria": {
    "FALCIPARUM (PF)": {
      "typeSaisie": "resultat_valeur",
      "options": [
        "Négatif",
        "Positif",
        "Autres"
      ],
      "libelleSecondaire": "Valeurs",
      "placeholderSecondaire": "Titre/Valeur"
    },
    "MALAIAE ET AUTRES (PAN)": {
      "typeSaisie": "resultat_valeur",
      "options": [
        "Négatif",
        "Positif",
        "Autres"
      ],
      "libelleSecondaire": "Valeurs",
      "placeholderSecondaire": "Titre/Valeur"
    },
    "__defaut__": {
      "typeSaisie": "resultat_valeur",
      "options": [
        "Négatif",
        "Positif",
        "Autres"
      ],
      "libelleSecondaire": "Valeurs",
      "placeholderSecondaire": "Titre/Valeur"
    },
    "MALARIA TESTE RAPIDE": {
      "typeSaisie": "resultat_valeur",
      "options": [
        "Négatif",
        "Positif",
        "Autres"
      ],
      "libelleSecondaire": "Valeurs",
      "placeholderSecondaire": "Titre/Valeur"
    }
  },
  "malaria_ge": {
    "GOUTTE EPAISSE": {
      "typeSaisie": "select_autres",
      "options": [
        "NEGATIF",
        "POSITIF",
        "Autres"
      ]
    },
    "TROPHOZOIDE": {
      "typeSaisie": "select_autres",
      "options": [
        "NEGATIF",
        "+",
        "++",
        "+++",
        "++++",
        "Autres"
      ]
    },
    "SCHIZONTE": {
      "typeSaisie": "select_autres",
      "options": [
        "NEGATIF",
        "+",
        "++",
        "+++",
        "++++",
        "Autres"
      ]
    },
    "GAMÉTOCYTE": {
      "typeSaisie": "select_autres",
      "options": [
        "NEGATIF",
        "+",
        "++",
        "+++",
        "++++",
        "Autres"
      ]
    },
    "ETALEMENT MINCE": {
      "typeSaisie": "select_autres",
      "options": [
        "NON DETECTE",
        "DETECTE",
        "Autres"
      ]
    },
    "DENSITE PARASITAIRE": {
      "typeSaisie": "select_autres",
      "options": [
        "<20/µl",
        "800/µl",
        "2800/µl",
        "5800/µl",
        ">10001/µl",
        "Autres"
      ]
    },
    "PLASMODIUM FALCIPARUM": {
      "typeSaisie": "select_autres",
      "options": [
        "NON DETECTE",
        "Autres"
      ]
    },
    "PLASMODIUM MALARIAE": {
      "typeSaisie": "select_autres",
      "options": [
        "NON DETECTE",
        "DETECTE",
        "Autres"
      ]
    },
    "PLASMODIUM OVALE": {
      "typeSaisie": "select_autres",
      "options": [
        "NON DETECTE",
        "DETECTE",
        "Autres"
      ]
    },
    "PLASMODIUM VIVAX": {
      "typeSaisie": "select_autres",
      "options": [
        "NON DETECTE",
        "DETECTE",
        "Autres"
      ]
    }
  },
  "histopathologie": {
    "SPECIMEN": {
      "typeSaisie": "description"
    },
    "EXAMEN MACROSCOPIQUE": {
      "typeSaisie": "description"
    },
    "EXAMEN MICROSCOPIQUE": {
      "typeSaisie": "description"
    },
    "CONCLUSION": {
      "typeSaisie": "description"
    }
  },
  "chargeViral": {
    "SPECIMEN": {
      "typeSaisie": "description"
    },
    "PROCEDURE D'ESSAI": {
      "typeSaisie": "description"
    },
    "RESULTAT": {
      "typeSaisie": "description"
    },
    "INTERPRETATION": {
      "typeSaisie": "description"
    }
  },
  "frottis_sang": {
    "LIGNE LEUCOCYTAIRE (GLOBULES BLANCS)": {
      "typeSaisie": "description"
    },
    "LIGNE ERYTHROCYTAIRE (GLOBULES ROUGES)": {
      "typeSaisie": "description"
    },
    "LIGNE THROBOCYTAIRE (PLAQUETTE)": {
      "typeSaisie": "description"
    }
  },
  "frottis_secretion": {
    "HEURES DE COLLECTE": {
      "typeSaisie": "texte"
    },
    "HEURES D'EXAMINATION": {
      "typeSaisie": "texte"
    },
    "TEMPSCOMPLET": {
      "typeSaisie": "texte"
    },
    "ABSTINENCE OBSERVES": {
      "typeSaisie": "select_autres",
      "options": [
        "Oui",
        "Non",
        "Autres"
      ]
    },
    "PENDANT L OVULATION": {
      "typeSaisie": "select_autres",
      "options": [
        "Oui",
        "Non",
        "Autres"
      ]
    },
    "ODEUR": {
      "typeSaisie": "select_autres",
      "options": [
        "Absent",
        "Présent",
        "Anormal",
        "Autres"
      ]
    },
    "ENCEINTE": {
      "typeSaisie": "select_autres",
      "options": [
        "Oui",
        "Non",
        "Autres"
      ]
    },
    "COULEUR": {
      "typeSaisie": "select_autres",
      "options": [
        "Blanc",
        "Jaune",
        "Vert",
        "Gris",
        "Brun",
        "Transparent",
        "Autres"
      ]
    },
    "CONSISTANCE": {
      "typeSaisie": "select_autres",
      "options": [
        "Fluide",
        "Mucoïde",
        "Crémeux",
        "Gélatineux",
        "Autres"
      ]
    },
    "SANG VISIBLE": {
      "typeSaisie": "select_autres",
      "options": [
        "Absent",
        "Peu",
        "Modéré",
        "Abondant",
        "Autres"
      ]
    },
    "GLOBULES BLANCS": {
      "typeSaisie": "select_autres",
      "options": [
        "0-1",
        "1-2",
        "2-3",
        "3-5",
        "5-7",
        "8-10",
        "10-15",
        "15-20",
        "20-30",
        "Nombreux (30-50)",
        "Très nombreux(50-100)",
        "Très nombreux (˃100)",
        "Autres"
      ]
    },
    "GLOBULES ROUGES": {
      "typeSaisie": "select_autres",
      "options": [
        "0-1",
        "1-2",
        "2-3",
        "3-5",
        "5-7",
        "8-10",
        "10-15",
        "15-20",
        "20-30",
        "Nombreux (30-50)",
        "Très nombreux(50-100)",
        "Très nombreux (˃100)",
        "Autres"
      ]
    },
    "CELLULES EPITHELIALES": {
      "typeSaisie": "select_autres",
      "options": [
        "0-1",
        "1-2",
        "2-3",
        "3-5",
        "5-7",
        "8-10",
        "10-15",
        "15-20",
        "20-30",
        "Nombreux (30-50)",
        "Très nombreux(50-100)",
        "Très nombreux (˃100)",
        "Autres"
      ]
    },
    "LEVURES": {
      "typeSaisie": "select_autres",
      "options": [
        "Absent",
        "Présent",
        "+",
        "++",
        "+++",
        "Autres"
      ]
    },
    "CILINDRE": {
      "typeSaisie": "select_autres",
      "options": [
        "Absent",
        "Hyalin",
        "Granuleux",
        "Hématoïde",
        "Circoïde",
        "Ciré",
        "Leucocytaire",
        "Autres"
      ]
    },
    "CRISTAUX": {
      "typeSaisie": "select_autres",
      "options": [
        "Absent",
        "Present",
        "+",
        "++",
        "+++",
        "++++",
        "Autres"
      ]
    },
    "BACTERIE": {
      "typeSaisie": "select_autres",
      "options": [
        "Négatif",
        "Peu",
        "Modéré",
        "Nombreux",
        "+",
        "++",
        "+++",
        "Autres"
      ]
    },
    "PARASITES ADULTES": {
      "typeSaisie": "select_autres",
      "options": [
        "Absent",
        "Présent",
        "Autres"
      ]
    },
    "CELLULES ANORMALES": {
      "typeSaisie": "select_autres",
      "options": [
        "Absent",
        "Présent",
        "Autres"
      ]
    }
  },
  "fluide": {
    "SPECIMEN": {
      "typeSaisie": "texte"
    },
    "COULEUR": {
      "typeSaisie": "select_autres",
      "options": [
        "Blanc",
        "Jaune",
        "Vert",
        "Gris",
        "Brun",
        "Transparent",
        "Hémorragique",
        "Autres"
      ]
    },
    "APPARANCE": {
      "typeSaisie": "select_autres",
      "options": [
        "Clair",
        "Trouble",
        "Trouble léger",
        "Gélatineux",
        "Hémorragique",
        "Autres"
      ]
    },
    "VOLUME": {
      "typeSaisie": "texte"
    },
    "PROTEIN": {
      "typeSaisie": "texte"
    },
    "GLUCOSE": {
      "typeSaisie": "texte"
    },
    "GLOBULES ROUGES": {
      "typeSaisie": "select_autres",
      "options": [
        "0-1",
        "1-2",
        "2-3",
        "3-5",
        "5-7",
        "8-10",
        "10-15",
        "15-20",
        "20-30",
        "Nombreux (30-50)",
        "Très nombreux(50-100)",
        "Très nombreux (˃100)",
        "Autres"
      ]
    },
    "CELLULE MESOTHELIALES": {
      "typeSaisie": "select_autres",
      "options": [
        "0-1",
        "1-2",
        "2-3",
        "3-5",
        "5-7",
        "8-10",
        "10-15",
        "15-20",
        "20-30",
        "Nombreux (30-50)",
        "Très nombreux(50-100)",
        "Très nombreux (˃100)",
        "Autres"
      ]
    },
    "CELLULE ANORMALES": {
      "typeSaisie": "select_autres",
      "options": [
        "Absent",
        "Présent",
        "Autres"
      ]
    },
    "GLOBULES BLANCS": {
      "typeSaisie": "select_autres",
      "options": [
        "0-1",
        "1-2",
        "2-3",
        "3-5",
        "5-7",
        "8-10",
        "10-15",
        "15-20",
        "20-30",
        "Nombreux (30-50)",
        "Très nombreux(50-100)",
        "Très nombreux (˃100)",
        "Autres"
      ]
    },
    "NEUTREPHILES": {
      "typeSaisie": "select_autres",
      "options": [
        "0-1",
        "1-2",
        "2-3",
        "3-5",
        "5-7",
        "8-10",
        "10-15",
        "15-20",
        "20-30",
        "Nombreux (30-50)",
        "Très nombreux(50-100)",
        "Très nombreux (˃100)",
        "Autres"
      ]
    },
    "EOSINEPHILES": {
      "typeSaisie": "select_autres",
      "options": [
        "0-1",
        "1-2",
        "2-3",
        "3-5",
        "5-7",
        "8-10",
        "10-15",
        "15-20",
        "20-30",
        "Nombreux (30-50)",
        "Très nombreux(50-100)",
        "Très nombreux (˃100)",
        "Autres"
      ]
    },
    "LYMPHOCYTE": {
      "typeSaisie": "select_autres",
      "options": [
        "0-1",
        "1-2",
        "2-3",
        "3-5",
        "5-7",
        "8-10",
        "10-15",
        "15-20",
        "20-30",
        "Nombreux (30-50)",
        "Très nombreux(50-100)",
        "Très nombreux (˃100)",
        "Autres"
      ]
    },
    "MONOCYTE": {
      "typeSaisie": "select_autres",
      "options": [
        "0-1",
        "1-2",
        "2-3",
        "3-5",
        "5-7",
        "8-10",
        "10-15",
        "15-20",
        "20-30",
        "Nombreux (30-50)",
        "Très nombreux(50-100)",
        "Très nombreux (˃100)",
        "Autres"
      ]
    },
    "MACROPHAGES": {
      "typeSaisie": "select_autres",
      "options": [
        "0-1",
        "1-2",
        "2-3",
        "3-5",
        "5-7",
        "8-10",
        "10-15",
        "15-20",
        "20-30",
        "Nombreux (30-50)",
        "Très nombreux(50-100)",
        "Très nombreux (˃100)",
        "Autres"
      ]
    },
    "TOTAL": {
      "typeSaisie": "texte"
    }
  },
  "nfs": {
    "GR": {
      "typeSaisie": "texte"
    },
    "HGB": {
      "typeSaisie": "texte"
    },
    "HCT": {
      "typeSaisie": "texte"
    },
    "VGM": {
      "typeSaisie": "texte"
    },
    "TCMH": {
      "typeSaisie": "texte"
    },
    "CCMH": {
      "typeSaisie": "texte"
    },
    "RDW-SD": {
      "typeSaisie": "texte"
    },
    "RDW-CV": {
      "typeSaisie": "texte"
    },
    "PLT": {
      "typeSaisie": "texte"
    },
    "MPV": {
      "typeSaisie": "texte"
    },
    "PDW": {
      "typeSaisie": "texte"
    },
    "PCT": {
      "typeSaisie": "texte"
    },
    "P-LCR": {
      "typeSaisie": "texte"
    },
    "P-LCC": {
      "typeSaisie": "texte"
    },
    "GB": {
      "typeSaisie": "texte"
    },
    "NEUT%": {
      "typeSaisie": "texte"
    },
    "LYMPH%": {
      "typeSaisie": "texte"
    },
    "MONO%": {
      "typeSaisie": "texte"
    },
    "EOS%": {
      "typeSaisie": "texte"
    },
    "BASO%": {
      "typeSaisie": "texte"
    }
  },
  "nfl": {
    "GB": {
      "typeSaisie": "texte"
    },
    "NEUT%": {
      "typeSaisie": "texte"
    },
    "LYMPH%": {
      "typeSaisie": "texte"
    },
    "MONO%": {
      "typeSaisie": "texte"
    },
    "EOS%": {
      "typeSaisie": "texte"
    },
    "BASO%": {
      "typeSaisie": "texte"
    }
  },
  "hematologie": {},
  "coagulation": {},
  "microbiologie": {
    "DATE DE COLLECTE": {
      "typeSaisie": "date"
    },
    "DATE DE TRANSMISSION": {
      "typeSaisie": "date"
    },
    "DATE DE RECEPTION": {
      "typeSaisie": "date"
    },
    "DATE D'EXAMINATION": {
      "typeSaisie": "date"
    },
    "SPECIMEN": {
      "typeSaisie": "select_autres",
      "options": [
        "Urine",
        "Fèces",
        "Sang",
        "Salive",
        "Sperme",
        "Autres"
      ]
    },
    "COULEUR": {
      "typeSaisie": "select_autres",
      "options": [
        "Incolore",
        "Jaune clair",
        "Jaune foncé",
        "Brun",
        "Blanchâtre",
        "Autres"
      ]
    },
    "LEUCOCYTE": {
      "typeSaisie": "select_autres",
      "options": [
        "Négatif",
        "Traces",
        "+",
        "++",
        "+++",
        "Autres"
      ]
    },
    "CELLULE EPITHELIALE": {
      "typeSaisie": "select_autres",
      "options": [
        "Négatif",
        "Traces",
        "+",
        "++",
        "+++",
        "Autres"
      ]
    },
    "GLOBULES ROUGES": {
      "typeSaisie": "select_autres",
      "options": [
        "Négatif",
        "Traces",
        "+",
        "++",
        "+++",
        "Autres"
      ]
    },
    "CRISTAUX": {
      "typeSaisie": "select_autres",
      "options": [
        "Négatif",
        "Traces",
        "+",
        "++",
        "+++",
        "Autres"
      ]
    },
    "CYLINDRE": {
      "typeSaisie": "select_autres",
      "options": [
        "Négatif",
        "Traces",
        "+",
        "++",
        "+++",
        "Autres"
      ]
    },
    "LEVURE": {
      "typeSaisie": "select_autres",
      "options": [
        "Négatif",
        "Traces",
        "+",
        "++",
        "+++",
        "Autres"
      ]
    },
    "CULTURE": {
      "typeSaisie": "select_autres",
      "options": [
        "Négatif",
        "Positif",
        "Autres"
      ]
    },
    "DENOMBREMENT": {
      "typeSaisie": "texte"
    },
    "COLORATION DE GRAM": {
      "typeSaisie": "texte"
    },
    "GERME ISOLE": {
      "typeSaisie": "texte"
    }
  },
  "ziehl_nelsen": {
    "RESULTAT_1": {
      "typeSaisie": "select_autres",
      "options": [
        "NEGATIF",
        "POSITIF +",
        "POSITIF ++",
        "POSITIF +++",
        "POSITIF ++++",
        "Autres"
      ]
    },
    "RESULTAT_2": {
      "typeSaisie": "select_autres",
      "options": [
        "NEGATIF",
        "POSITIF +",
        "POSITIF ++",
        "POSITIF +++",
        "POSITIF ++++",
        "Autres"
      ]
    },
    "RESULTAT_3": {
      "typeSaisie": "select_autres",
      "options": [
        "NEGATIF",
        "POSITIF +",
        "POSITIF ++",
        "POSITIF +++",
        "POSITIF ++++",
        "Autres"
      ]
    },
    "DATE 1": {
      "typeSaisie": "date"
    },
    "DATE 2": {
      "typeSaisie": "date"
    },
    "DATE 3": {
      "typeSaisie": "date"
    },
    "ECHANTILLON 1": {
      "typeSaisie": "texte"
    },
    "ECHANTILLON 2": {
      "typeSaisie": "texte"
    },
    "ECHANTILLON 3": {
      "typeSaisie": "texte"
    },
    "ASPECT 1": {
      "typeSaisie": "texte"
    },
    "ASPECT 2": {
      "typeSaisie": "texte"
    },
    "ASPECT 3": {
      "typeSaisie": "texte"
    }
  },
  "coproculture": {
    "DATE DE COLLECTE": {
      "typeSaisie": "date"
    },
    "DATE DE RECEPTION": {
      "typeSaisie": "date"
    },
    "DATE FINALE": {
      "typeSaisie": "date"
    },
    "SOURCE DES SPECIMEN": {
      "typeSaisie": "texte"
    },
    "COLORATION DE GRAM": {
      "typeSaisie": "texte"
    },
    "CULTURE": {
      "typeSaisie": "select_autres",
      "options": [
        "Négatif",
        "Positif",
        "Autres"
      ]
    },
    "GERME ISOLE": {
      "typeSaisie": "texte"
    },
    "DENOBREMENT": {
      "typeSaisie": "texte"
    }
  },
  "hemoculture": {
    "DATE DE COLLECTE": {
      "typeSaisie": "date"
    },
    "DATE DE RECEPTION": {
      "typeSaisie": "date"
    },
    "DATE FINALE": {
      "typeSaisie": "date"
    },
    "SPECIMEN": {
      "typeSaisie": "texte"
    },
    "QUALITE D'ECHANTILLON": {
      "typeSaisie": "select_autres",
      "options": [
        "Normal",
        "Anormal",
        "Autres"
      ]
    },
    "VOLUME": {
      "typeSaisie": "texte"
    },
    "CULTURE FINALE": {
      "typeSaisie": "select_autres",
      "options": [
        "Négatif",
        "Positif",
        "Autres"
      ]
    },
    "GRAM": {
      "typeSaisie": "texte"
    },
    "DENOBREMENT": {
      "typeSaisie": "texte"
    },
    "GERME ISOLE": {
      "typeSaisie": "texte"
    }
  },
  "goutte_fraiche": {
    "SPECIMEN": {
      "typeSaisie": "texte"
    },
    "RESULTAT": {
      "typeSaisie": "resultat_valeur",
      "options": [
        "ABSENT",
        "PRESENT",
        "Autres"
      ],
      "libelleSecondaire": "Valeurs",
      "placeholderSecondaire": "Titre/Valeur"
    },
    "WUCHERERIA BANCROFTI": {
      "typeSaisie": "select_autres",
      "options": [
        "ABSENT",
        "PRESENT",
        "Autres"
      ]
    },
    "LOA LOA": {
      "typeSaisie": "select_autres",
      "options": [
        "ABSENT",
        "PRESENT",
        "Autres"
      ]
    },
    "ONCHOCERCUS VOLVULUS": {
      "typeSaisie": "select_autres",
      "options": [
        "ABSENT",
        "PRESENT",
        "Autres"
      ]
    },
    "DRACUNCULUS MEDINENSIS": {
      "typeSaisie": "select_autres",
      "options": [
        "ABSENT",
        "PRESENT",
        "Autres"
      ]
    },
    "TRYPANOSOMA": {
      "typeSaisie": "select_autres",
      "options": [
        "ABSENT",
        "PRESENT",
        "Autres"
      ]
    }
  },
  "microfilaire": {
    "SPECIMEN": {
      "typeSaisie": "texte"
    },
    "METHODE": {
      "typeSaisie": "select_autres",
      "options": [
        "SANG FRAIS",
        "GOUTTE FRAICHE",
        "BUFFY COAT",
        "GOUTTE FRAICHE ET BUFFY COAT>FILM MINCE",
        "Autres"
      ]
    },
    "WUCHERERIA BANCROFTI": {
      "typeSaisie": "select_autres",
      "options": [
        "NON OBSERVE",
        "OBSERVE",
        "Autres"
      ]
    },
    "FILARIOSES LYMPHATIQUES": {
      "typeSaisie": "select_autres",
      "options": [
        "NON OBSERVE",
        "OBSERVE",
        "Autres"
      ]
    },
    "LOA LOA": {
      "typeSaisie": "select_autres",
      "options": [
        "NON OBSERVE",
        "OBSERVE",
        "Autres"
      ]
    },
    "FILARIOSES CUTANEES": {
      "typeSaisie": "select_autres",
      "options": [
        "NON OBSERVE",
        "OBSERVE",
        "Autres"
      ]
    },
    "ONCHOCERCUS VOLVULUS": {
      "typeSaisie": "select_autres",
      "options": [
        "NON OBSERVE",
        "OBSERVE",
        "Autres"
      ]
    },
    "TROPISME OCULAIRE": {
      "typeSaisie": "select_autres",
      "options": [
        "NON OBSERVE",
        "OBSERVE",
        "Autres"
      ]
    },
    "DRACUNCULUS MEDINENSIS": {
      "typeSaisie": "select_autres",
      "options": [
        "NON OBSERVE",
        "OBSERVE",
        "Autres"
      ]
    },
    "CHEVILLE": {
      "typeSaisie": "select_autres",
      "options": [
        "NON OBSERVE",
        "OBSERVE",
        "Autres"
      ]
    },
    "PIED EN GENERAL": {
      "typeSaisie": "select_autres",
      "options": [
        "NON OBSERVE",
        "OBSERVE",
        "Autres"
      ]
    }
  },
  "groupage_sanguin": {
    "GROUPE SANGUIN": {
      "typeSaisie": "select_autres",
      "options": [
        "A",
        "B",
        "AB",
        "O",
        "Autres"
      ]
    },
    "RHESUS D": {
      "typeSaisie": "select_autres",
      "options": [
        "NEGATIF",
        "POSITIF",
        "Autres"
      ]
    },
    "METHODES": {
      "typeSaisie": "select_autres",
      "options": [
        "BETH-VINCEN(Directe)",
        "BETH-VINCEN(Indirecte)",
        "DIRECTE ET INDIRECTE",
        "Autres"
      ]
    }
  },
  "spermogramme": {
    "PERIODE D'ABSTINANCE": {
      "typeSaisie": "texte"
    },
    "METHODE DE COLLECTION": {
      "typeSaisie": "texte"
    },
    "COLLECTE A": {
      "typeSaisie": "texte"
    },
    "SPECIMEN COMPLET": {
      "typeSaisie": "select",
      "options": [
        "quantité incomplète",
        "quantité directe",
        "Autre"
      ]
    },
    "TEMPS DE COLLECTION": {
      "typeSaisie": "texte"
    },
    "TEMPS DE RECEPTION": {
      "typeSaisie": "texte"
    },
    "TEMPS D'EXAMINATION": {
      "typeSaisie": "texte"
    },
    "COULEUR": {
      "typeSaisie": "select",
      "options": [
        "Blanche grisâtre",
        "Blanche Jaunâtre",
        "Blanche rougeâtre",
        "Transparent",
        "Jaunâtre",
        "Rougeâtre",
        "Autre"
      ]
    },
    "VISCOSITÉ": {
      "typeSaisie": "select",
      "options": [
        "Normale",
        "Anormale",
        "Autre"
      ]
    },
    "VOLUME COLLECTE": {
      "typeSaisie": "texte"
    },
    "PH": {
      "typeSaisie": "texte"
    },
    "FRUCTOSE": {
      "typeSaisie": "texte"
    },
    "LIQUEFACTION": {
      "typeSaisie": "texte"
    },
    "CONCENTRATION DE SPERME": {
      "typeSaisie": "texte"
    },
    "NUMERATION DES SPERMATOZOIDES": {
      "typeSaisie": "texte"
    },
    "MOBILITE TOTALE": {
      "typeSaisie": "texte"
    },
    "IMMOBILE": {
      "typeSaisie": "texte"
    },
    "MOBILITE PROGRESSIVE": {
      "typeSaisie": "texte"
    },
    "MOBILITE NON PROGRESSIVE": {
      "typeSaisie": "texte"
    },
    "VIABILITE": {
      "typeSaisie": "texte"
    },
    "FORMES NORMALES": {
      "typeSaisie": "texte"
    },
    "FORMES ANORMALES": {
      "typeSaisie": "texte"
    },
    "TETES ANORMALES": {
      "typeSaisie": "texte"
    },
    "PIECES INTERMEDIAIRES": {
      "typeSaisie": "texte"
    },
    "FLAGELLE": {
      "typeSaisie": "texte"
    },
    "FORMES VIVANTES": {
      "typeSaisie": "texte"
    },
    "FORMES MORTES": {
      "typeSaisie": "texte"
    },
    "AGGLUTINATION": {
      "typeSaisie": "select",
      "options": [
        "ABSENTE",
        "PRESENTE",
        "Autre"
      ]
    },
    "TYPE D'AGGLUTINATION": {
      "typeSaisie": "select",
      "options": [
        "Tête-à-tête",
        "Queue-queue",
        "Tête-queue",
        "Mixte",
        "Autre"
      ]
    },
    "GRADE D'AGGLUTINATION": {
      "typeSaisie": "select",
      "options": [
        "1",
        "2",
        "3",
        "4",
        "Autre"
      ]
    },
    "ERYTHROCYTES": {
      "typeSaisie": "select_autres",
      "options": [
        "0-1",
        "1-2",
        "2-3",
        "3-5",
        "5-7",
        "8-10",
        "10-15",
        "15-20",
        "20-30",
        "Nombreux (30-50)",
        "Très nombreux(50-100)",
        "Très nombreux (˃100)",
        "Autres"
      ]
    },
    "LEUCOCYTES": {
      "typeSaisie": "select_autres",
      "options": [
        "0-1",
        "1-2",
        "2-3",
        "3-5",
        "5-7",
        "8-10",
        "10-15",
        "15-20",
        "20-30",
        "Nombreux (30-50)",
        "Très nombreux(50-100)",
        "Très nombreux (˃100)",
        "Autres"
      ]
    },
    "CELLULE EPITHELIALE": {
      "typeSaisie": "select_autres",
      "options": [
        "0-1",
        "1-2",
        "2-3",
        "3-5",
        "5-7",
        "8-10",
        "10-15",
        "15-20",
        "20-30",
        "Nombreux (30-50)",
        "Très nombreux(50-100)",
        "Très nombreux (˃100)",
        "Autres"
      ]
    },
    "CRISTAUX": {
      "typeSaisie": "select_autres",
      "options": [
        "Absent",
        "+",
        "++",
        "+++",
        "++++",
        "Autres"
      ]
    },
    "BACTERIES": {
      "typeSaisie": "select_autres",
      "options": [
        "Négatif",
        "Peu",
        "Modéré",
        "Nombreux",
        "+",
        "++",
        "+++",
        "Autres"
      ]
    },
    "DEPOT DESAMORPHES": {
      "typeSaisie": "resultat_valeur",
      "options": [
        "Absent",
        "+",
        "++",
        "+++",
        "++++",
        "Autres"
      ],
      "libelleSecondaire": "Valeurs",
      "placeholderSecondaire": "Titre/Valeur"
    },
    "EXPRESSION DES RESULTATS": {
      "typeSaisie": "resultat_valeur",
      "options": [
        "Absent",
        "Normospermie",
        "Oligospermie",
        "Asthenospermie",
        "Oligoasthenospermie",
        "Azoospermie",
        "Hypospermie",
        "Hyperspermie",
        "Necrospermie",
        "Cryptospermie",
        "Teratospermie",
        "Autres"
      ],
      "libelleSecondaire": "Valeurs",
      "placeholderSecondaire": "Titre/Valeur"
    }
  },
  "electrophorese": {
    "NOM VARIANTE": {
      "typeSaisie": "select_autres",
      "options": [
        "HOMOZYGOTE",
        "HETEROZYGOTE",
        "DREPANOCYTOSE",
        "Autres"
      ]
    },
    "VARIANTE VALEUR": {
      "typeSaisie": "select_autres",
      "options": [
        "AA",
        "AS",
        "SS",
        "Autres"
      ]
    },
    "HEMOGLOBINE A": {
      "typeSaisie": "texte"
    },
    "HEMOGLOBINE A2": {
      "typeSaisie": "texte"
    },
    "HEMOGLOBINE F": {
      "typeSaisie": "texte"
    },
    "HEMOGLOBINE S": {
      "typeSaisie": "texte"
    },
    "HEMOGLOBINE D,C,E…": {
      "typeSaisie": "texte"
    }
  },
  "micro_albuminurie": {
    "ALBUMINURIE": {
      "typeSaisie": "texte"
    },
    "CREATINURIE": {
      "typeSaisie": "texte"
    },
    "RAPPORT ALBU/CREAT": {
      "typeSaisie": "texte"
    }
  },
  "glycemie_gestationnelle": {
    "GLYCÉMIE À JEÛNE": {
      "typeSaisie": "texte"
    },
    "GLYCÉMIE APRÈS 1 HEURE": {
      "typeSaisie": "texte"
    },
    "GLYCÉMIE APRÈS 2 HEURES": {
      "typeSaisie": "texte"
    }
  },
  "bilans_torch": {
    "RUBEOLE IGG": {
      "typeSaisie": "resultat_valeur",
      "options": [
        "Négatif",
        "Positif",
        "Autre"
      ],
      "libelleSecondaire": "Valeurs",
      "placeholderSecondaire": "Titre/Valeur"
    },
    "RUBEOLE IGM": {
      "typeSaisie": "resultat_valeur",
      "options": [
        "Négatif",
        "Positif",
        "Autre"
      ],
      "libelleSecondaire": "Valeurs",
      "placeholderSecondaire": "Titre/Valeur"
    },
    "CYTOMEGALOVIRUS IGG": {
      "typeSaisie": "resultat_valeur",
      "options": [
        "Négatif",
        "Positif",
        "Autre"
      ],
      "libelleSecondaire": "Valeurs",
      "placeholderSecondaire": "Titre/Valeur"
    },
    "CYTOMEGALOVIRUS IGM": {
      "typeSaisie": "resultat_valeur",
      "options": [
        "Négatif",
        "Positif",
        "Autre"
      ],
      "libelleSecondaire": "Valeurs",
      "placeholderSecondaire": "Titre/Valeur"
    },
    "HERPES SIMPLEX VIRUS TYPE-1 IGG": {
      "typeSaisie": "resultat_valeur",
      "options": [
        "Négatif",
        "Positif",
        "Autre"
      ],
      "libelleSecondaire": "Valeurs",
      "placeholderSecondaire": "Titre/Valeur"
    },
    "HERPES SIMPLEX VIRUS TYPE-2 IGM": {
      "typeSaisie": "resultat_valeur",
      "options": [
        "Négatif",
        "Positif",
        "Autre"
      ],
      "libelleSecondaire": "Valeurs",
      "placeholderSecondaire": "Titre/Valeur"
    },
    "TOXOPLASMOSE IGG": {
      "typeSaisie": "resultat_valeur",
      "options": [
        "Négatif",
        "Positif",
        "Autre"
      ],
      "libelleSecondaire": "Valeurs",
      "placeholderSecondaire": "Titre/Valeur"
    },
    "TOXOPLASMOSE IGM": {
      "typeSaisie": "resultat_valeur",
      "options": [
        "Négatif",
        "Positif",
        "Autre"
      ],
      "libelleSecondaire": "Valeurs",
      "placeholderSecondaire": "Titre/Valeur"
    }
  },
  "surveillance_prostatique": {
    "PSA TOTAL": {
      "typeSaisie": "texte"
    },
    "PSA SPECIFIQUE": {
      "typeSaisie": "texte"
    },
    "PSA LIBRE": {
      "typeSaisie": "texte"
    }
  },
  "temps_saignement": {
    "TEMPS DE SAIGNEMENT": {
      "typeSaisie": "texte"
    },
    "TEMPS DE COAGULATION": {
      "typeSaisie": "texte"
    }
  },
  "tp_inr": {
    "PROTHROMBINE": {
      "typeSaisie": "texte"
    },
    "INR": {
      "typeSaisie": "texte"
    }
  },
  "reticulocyte": {
    "RET% (POURCENTAGE DE RETICULOCYTES)": {
      "typeSaisie": "texte"
    },
    "RET# (NUMERATION DES RETICULOCYTES)": {
      "typeSaisie": "texte"
    },
    "IRF (FRACTION DE RETICULOCYTES IMMATURES)": {
      "typeSaisie": "texte"
    },
    "RET-HE (EQUIVALENT DE LA CONCENTRATION EN HEMOGLOBINE DES RETICULOCYTES)": {
      "typeSaisie": "texte"
    },
    "RBC-HE (EQUIVALENCE EN HEMOGLOBINE DES RBC MATURE)": {
      "typeSaisie": "texte"
    }
  },
  "hb_hct": {
    "HEMOGLOBINE": {
      "typeSaisie": "texte"
    },
    "HEMATOCRITE": {
      "typeSaisie": "texte"
    }
  },
  "valeur_absolu_eosinophiles": {
    "GLOBULES BLANCS": {
      "typeSaisie": "texte"
    },
    "POURCENTAGE DES EOSINOPHILES": {
      "typeSaisie": "texte"
    },
    "VALEUR ABSOLU DES EOSINOPHILES": {
      "typeSaisie": "texte"
    }
  }
};

/** Alias noms paramètres catalogue ↔ modaux */
const CLES_EQUIVALENTES: Record<string, string[]> = {
  APPARANCE: ["APPARANCE", "APPARENCES"],
  APPARENCES: ["APPARANCE", "APPARENCES"],
  KETONE: ["KETONE", "ACETONE"],
  ACETONE: ["KETONE", "ACETONE"],
  NITRATE: ["NITRATE", "NITRITES"],
  NITRITES: ["NITRATE", "NITRITES"],
  "GLOBULE ROUGE": ["GLOBULE ROUGE", "GLOBULES ROUGES"],
  "GLOBULES ROUGES": ["GLOBULE ROUGE", "GLOBULES ROUGES"],
  "GRAVITE SPECIFIQUE": ["GRAVITE SPECIFIQUE", "DENSITE", "DENSITEPARASITAIRE"],
  DENSITE: ["GRAVITE SPECIFIQUE", "DENSITE"],
  "GOUTTE EPAISSE": ["GOUTTE EPAISSE", "GOUTTE ÉPAISSE"],
  "GOUTTE ÉPAISSE": ["GOUTTE EPAISSE", "GOUTTE ÉPAISSE"],
  GAMETOCYTE: ["GAMETOCYTE", "GAMÉTOCYTE"],
  "GAMÉTOCYTE": ["GAMETOCYTE", "GAMÉTOCYTE"],
};

const OPTIONS_RESULTAT_ZIEHL = avecOptionAutres([
  "NEGATIF",
  "POSITIF +",
  "POSITIF ++",
  "POSITIF +++",
  "POSITIF ++++",
]);

function clesRecherche(nom: string): string[] {
  const n = nom.trim().toUpperCase().replace(/\s+/g, " ");
  const eq = CLES_EQUIVALENTES[n] ?? [n];
  return [...new Set(eq)];
}

export function optionsSaisieDepuisModaux(
  formulaire: string | null | undefined,
  nomParametre: string
): EntreeOptionsSaisie | null {
  if (!formulaire) return null;

  const f = formulaire.trim();
  const upper = nomParametre.trim().toUpperCase();

  if (f === "ziehl_nelsen") {
    if (upper === "DATE" || upper.startsWith("DATE ")) {
      return { typeSaisie: "date" };
    }
    if (upper === "ECHANTILLON" || upper === "ASPECT") {
      return { typeSaisie: "texte" };
    }
    if (upper === "RESULTAT" || upper.startsWith("RESULTAT")) {
      return { typeSaisie: "select_autres", options: OPTIONS_RESULTAT_ZIEHL };
    }
  }

  if (/^DATE(\s|$| DE| D')/.test(upper)) {
    return { typeSaisie: "date" };
  }

  const table = OPTIONS_SAISIE_PAR_FORMULAIRE[f];
  if (!table) return null;

  for (const cle of clesRecherche(nomParametre)) {
    if (table[cle]) return normaliserEntree(table[cle]);
  }

  const upperSans = sansAccent(upper);
  for (const [k, v] of Object.entries(table)) {
    if (k.startsWith("__")) continue;
    if (sansAccent(k) === upperSans) return normaliserEntree(v);
  }

  for (const [k, v] of Object.entries(table)) {
    if (k.startsWith("__")) continue;
    if (k === upper || upper.includes(k) || k.includes(upper)) {
      return normaliserEntree(v);
    }
  }

  if (table.__defaut__) return normaliserEntree(table.__defaut__);

  return null;
}

function sansAccent(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normaliserEntree(entree: EntreeOptionsSaisie): EntreeOptionsSaisie {
  const copie = { ...entree };
  if (
    (copie.typeSaisie === "select" ||
      copie.typeSaisie === "select_autres" ||
      copie.typeSaisie === "resultat_valeur") &&
    copie.options
  ) {
    copie.options =
      copie.typeSaisie === "select_autres" || copie.typeSaisie === "resultat_valeur"
        ? avecOptionAutres(copie.options)
        : [...copie.options];
  }
  if (copie.typeSaisie === "resultat_valeur" && (!copie.options || copie.options.length === 0)) {
    copie.options = avecOptionAutres(["Négatif", "Positif"]);
  }
  return copie;
}
