"use client";

import { useEffect, useRef, useState } from "react";
import { ProfileImage } from "@/components/provider/profile-image";
export function ProviderGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const gallery = [...new Set(images.filter(Boolean))];
  const [active, setActive] = useState<number | null>(null);
  return (
    <>
      {!gallery.length ? (
        <div className="grid min-h-60 place-items-center rounded-[2rem] bg-mint p-8 text-center">
          <div>
            <span aria-hidden className="text-5xl text-brand/40">
              ▧
            </span>
            <p className="mt-4 text-sm text-muted">
              Este proveedor todavía no agregó fotos.
            </p>
          </div>
        </div>
      ) : (
        <div
          className={`profile-gallery ${gallery.length === 1 ? "profile-gallery-single" : ""}`}
        >
          {gallery.slice(0, 3).map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Abrir foto ${index + 1} de ${name}`}
              className={`relative min-w-0 overflow-hidden bg-mint ${index === 0 ? "profile-gallery-cover" : ""}`}
            >
              <ProfileImage
                src={src}
                alt={`${name}, foto ${index + 1}`}
                priority={index === 0}
                sizes={
                  gallery.length === 1
                    ? "(max-width: 1200px) 100vw, 1180px"
                    : index === 0
                      ? "(max-width: 767px) 100vw, 65vw"
                      : "(max-width: 767px) 50vw, 35vw"
                }
              />
              <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-brand">
                {index === 0
                  ? `Ver ${gallery.length === 1 ? "foto" : `${gallery.length} fotos`}`
                  : "↗"}
              </span>
            </button>
          ))}
        </div>
      )}
      {gallery.length > 3 && (
        <section className="mt-7">
          <h2 className="display text-2xl font-medium">Fotos</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {gallery.slice(3).map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => setActive(index + 3)}
                aria-label={`Abrir foto ${index + 4} de ${name}`}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-mint"
              >
                <ProfileImage
                  src={src}
                  alt={`${name}, foto ${index + 4}`}
                  sizes="(max-width: 639px) 50vw, 25vw"
                />
              </button>
            ))}
          </div>
        </section>
      )}
      {active !== null && (
        <PhotoViewer
          images={gallery}
          name={name}
          active={active}
          setActive={setActive}
          close={() => setActive(null)}
        />
      )}
    </>
  );
}
function PhotoViewer({
  images,
  name,
  active,
  setActive,
  close,
}: {
  images: string[];
  name: string;
  active: number;
  setActive: (index: number) => void;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previous;
    };
  }, []);
  const move = (direction: number) =>
    setActive((active + direction + images.length) % images.length);
  return (
    <dialog
      ref={ref}
      aria-label={`Fotos de ${name}`}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          move(1);
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          move(-1);
        }
      }}
      className="profile-photo-dialog"
    >
      <div className="flex items-center justify-between gap-3 p-4">
        <p className="min-w-0 text-sm font-bold" aria-live="polite">
          Foto {active + 1} de {images.length}
        </p>
        <button
          autoFocus
          type="button"
          onClick={close}
          aria-label="Cerrar fotos"
          className="h-11 w-11 rounded-full bg-mint text-xl text-brand"
        >
          ×
        </button>
      </div>
      <div className="relative h-[60dvh] min-h-52 bg-cream">
        <ProfileImage
          src={images[active]}
          alt={`${name}, foto ${active + 1}`}
          contain
          sizes="90vw"
        />
      </div>
      {images.length > 1 && (
        <div className="flex justify-between p-4">
          <button
            type="button"
            onClick={() => move(-1)}
            className="rounded-full border border-brand/20 px-5 py-3 text-sm font-bold text-brand"
          >
            ← Anterior
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            className="rounded-full border border-brand/20 px-5 py-3 text-sm font-bold text-brand"
          >
            Siguiente →
          </button>
        </div>
      )}
    </dialog>
  );
}
