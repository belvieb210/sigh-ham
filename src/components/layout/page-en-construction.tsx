"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

interface PropsPageEnConstruction {
  titre: string;
  description: string;
}

export function PageEnConstruction({ titre, description }: PropsPageEnConstruction) {
  const { t } = useTranslation();

  return (
    <div className="conteneur-principal py-20 text-center">
      <h1 className="titre-section">{titre}</h1>
      <p className="mx-auto mt-4 max-w-lg text-texte-secondaire">{description}</p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 text-bleu-medical hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("construction.retourAccueil")}
      </Link>
    </div>
  );
}
