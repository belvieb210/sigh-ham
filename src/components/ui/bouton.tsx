"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const variantesBouton = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bleu-medical focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variante: {
        primaire:
          "bg-bleu-medical text-white shadow-md hover:bg-bleu-medical-fonce hover:shadow-lg",
        secondaire:
          "border-2 border-bleu-medical bg-transparent text-bleu-medical hover:bg-bleu-medical-clair",
        contour:
          "border border-gris-bordure bg-white text-texte-principal hover:bg-gris-tres-clair",
        fantome: "text-bleu-medical hover:bg-bleu-medical-clair",
        vert: "bg-vert-sante text-white hover:opacity-90",
        danger: "bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg",
      },
      taille: {
        petit: "h-9 px-4 text-xs",
        moyen: "h-11 px-6",
        grand: "h-12 px-8 text-base",
        icone: "h-10 w-10",
      },
    },
    defaultVariants: {
      variante: "primaire",
      taille: "moyen",
    },
  }
);

export interface PropsBouton
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof variantesBouton> {
  enTantQueEnfant?: boolean;
}

export function Bouton({
  className,
  variante,
  taille,
  enTantQueEnfant = false,
  ...props
}: PropsBouton) {
  const Comp = enTantQueEnfant ? "span" : "button";
  return (
    <Comp
      className={cn(variantesBouton({ variante, taille, className }))}
      {...props}
    />
  );
}
