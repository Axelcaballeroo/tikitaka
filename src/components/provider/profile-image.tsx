"use client";

import Image from "next/image";
import { useState } from "react";
export function ProfileImage({
  src,
  alt,
  priority = false,
  sizes = "100vw",
  contain = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  contain?: boolean;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src)
    return (
      <div className="absolute inset-0 grid place-items-center bg-mint p-5 text-center text-sm text-muted">
        <span>
          <span aria-hidden className="mb-3 block text-3xl text-brand/60">
            ▧
          </span>
          Imagen no disponible
        </span>
      </div>
    );
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      onError={() => setFailed(src)}
      className={contain ? "object-contain" : "object-cover"}
    />
  );
}
