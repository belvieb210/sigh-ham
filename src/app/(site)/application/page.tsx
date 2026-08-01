"use client";

import { useTranslation } from "react-i18next";
import { PageEnConstruction } from "@/components/layout/page-en-construction";

export default function PageApplication() {
  const { t } = useTranslation();

  return (
    <PageEnConstruction
      titre={t("meta.application.title")}
      description={t("meta.application.description")}
    />
  );
}
