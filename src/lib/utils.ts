import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Fusionne les classes Tailwind de manière intelligente */
export function cn(...entrees: ClassValue[]) {
  return twMerge(clsx(entrees));
}
