"use client";

import { useState } from "react";
import { ProfileImage } from "@/components/provider/profile-image";
import {
  imageLimits,
  validateImage,
  type OnboardingImage,
} from "@/lib/onboarding";
export function OnboardingPhotos({
  cover,
  images,
  onCover,
  onImages,
  onBusy,
  endpoint = "/api/dashboard/images",
}: {
  cover: string;
  images: OnboardingImage[];
  onCover: (url: string) => void;
  onImages: (images: OnboardingImage[]) => void;
  onBusy: (busy: boolean) => void;
  endpoint?: string;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [preview, setPreview] = useState("");
  const start = (value: boolean) => {
    setBusy(value);
    onBusy(value);
  };
  const upload = async (files: FileList | null, kind: "cover" | "gallery") => {
    if (!files?.length) return;
    const selected = Array.from(files);
    if (
      kind === "gallery" &&
      images.length + selected.length > imageLimits.gallery
    ) {
      setError("Podés cargar hasta 8 fotos en la galería.");
      return;
    }
    for (const file of selected) {
      const message = validateImage(file);
      if (message) {
        setError(message);
        return;
      }
    }
    start(true);
    setError("");
    let next = [...images];
    try {
      for (const file of selected) {
        const url = URL.createObjectURL(file);
        setPreview(url);
        try {
          const data = new FormData();
          data.append("file", file);
          data.append("kind", kind);
          const response = await fetch(endpoint, {
            method: "POST",
            body: data,
          });
          const result = await response.json();
          if (!response.ok)
            throw new Error(result.error || "No pudimos subir la imagen.");
          if (kind === "cover") onCover(result.url);
          else {
            next = [...next, result.image];
            onImages(next);
          }
        } finally {
          URL.revokeObjectURL(url);
          setPreview("");
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No pudimos subir la imagen. Intentá de nuevo.",
      );
    } finally {
      start(false);
    }
  };
  const remove = async (imageId?: string) => {
    start(true);
    setError("");
    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imageId ? { imageId } : { kind: "cover" }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "No pudimos eliminar la foto.");
      if (imageId) onImages(images.filter((image) => image.id !== imageId));
      else onCover("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No pudimos eliminar la foto.",
      );
    } finally {
      start(false);
    }
  };
  return (
    <div className="space-y-7">
      <p className="text-sm leading-7 text-muted">
        Las buenas fotos ayudan a que más familias conozcan tu servicio. Podés
        continuar sin fotos y agregarlas después.
      </p>
      <p className="text-xs leading-6 text-muted">
        Portada y hasta 8 imágenes en la galería. JPG, PNG o WEBP; máximo 5 MB
        por imagen.
      </p>
      {error && (
        <p role="alert" className="onb-error">
          {error}
        </p>
      )}
      <section className="rounded-3xl border border-brand/10 p-5">
        <h3 className="text-base font-bold">Foto de portada</h3>
        <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-2xl bg-mint">
          <ProfileImage
            src={cover}
            alt="Portada de tu servicio"
            sizes="(max-width:768px) 100vw, 700px"
          />
        </div>
        <label className="mt-4 block text-sm font-bold">
          {cover ? "Cambiar portada" : "Elegir portada"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={(e) => {
              void upload(e.target.files, "cover");
              e.target.value = "";
            }}
            className="onb-input"
          />
        </label>
        {cover && (
          <button
            disabled={busy}
            type="button"
            onClick={() => remove()}
            className="mt-3 min-h-11 text-sm font-bold text-rose-700"
          >
            Eliminar portada
          </button>
        )}
      </section>
      <section>
        <h3 className="text-base font-bold">Galería ({images.length}/8)</h3>
        <label className="mt-4 block text-sm font-bold">
          Agregar fotos
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            disabled={busy || images.length >= 8}
            onChange={(e) => {
              void upload(e.target.files, "gallery");
              e.target.value = "";
            }}
            className="onb-input"
          />
        </label>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <article
              key={image.id}
              className="min-w-0 rounded-2xl border border-brand/10 p-2"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <ProfileImage
                  src={image.imageUrl}
                  alt={`Galería, foto ${index + 1}`}
                  sizes="33vw"
                />
              </div>
              <button
                disabled={busy}
                type="button"
                onClick={() => remove(image.id)}
                className="min-h-11 w-full text-xs font-bold text-rose-700"
              >
                Eliminar foto {index + 1}
              </button>
            </article>
          ))}
        </div>
      </section>
      {busy && (
        <div role="status" className="rounded-2xl bg-mint p-4">
          <p className="text-sm font-bold text-brand">Guardando foto…</p>
          {preview && (
            <div className="relative mt-3 aspect-video overflow-hidden rounded-xl">
              <ProfileImage
                src={preview}
                alt="Vista previa de la foto seleccionada"
                sizes="50vw"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
