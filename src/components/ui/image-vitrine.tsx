"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Affiche une image vitrine CMS (/uploads, MinIO, ou chemin local)
 * sans casser next/image sur les hôtes non listés.
 */
export function estUrlImageLocaleOuUpload(src: string): boolean {
  if (!src) return true;
  if (src.startsWith("/") || src.startsWith("data:")) return true;
  try {
    const u = new URL(src);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return true;
  }
}

export function ImageVitrine({
  src,
  alt = "",
  fill,
  width,
  height,
  className,
  sizes,
  priority,
}: {
  src: string;
  alt?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) return null;

  const locale = estUrlImageLocaleOuUpload(src);

  if (locale || process.env.NODE_ENV === "development") {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={className}
        sizes={sizes}
        priority={priority}
        unoptimized
      />
    );
  }

  /* URLs distantes (MinIO, CDN) : <img> évite le blocage remotePatterns */
  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn("absolute inset-0 h-full w-full object-cover", className)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}
