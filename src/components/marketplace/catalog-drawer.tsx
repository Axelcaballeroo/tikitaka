"use client";

import { useEffect, useRef } from "react";
export function CatalogDrawer({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="catalog-drawer-title"
      className="catalog-drawer"
    >
      <div
        className="flex max-h-[90dvh] flex-col bg-cream"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-brand/10 px-6 py-4">
          <h2 id="catalog-drawer-title" className="text-lg font-extrabold">
            {title}
          </h2>
          <button
            autoFocus
            type="button"
            aria-label="Cerrar panel"
            onClick={onClose}
            className="h-11 w-11 rounded-full bg-mint text-xl text-brand"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
        <div className="border-t border-brand/10 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 w-full rounded-full bg-brand px-5 py-3 text-sm font-extrabold text-white"
          >
            Ver resultados
          </button>
        </div>
      </div>
    </dialog>
  );
}
