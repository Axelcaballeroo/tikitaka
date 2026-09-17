"use client";
import { geographicDraft } from "@/lib/geography";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminProvider } from "@/lib/admin-provider";
import { validateAdminDraft } from "@/lib/admin-provider";
import { emptyDraft, type OnboardingDraft } from "@/lib/onboarding";
import type { Category } from "@/types";
import {
  BusinessStep,
  ContactStep,
  ServicesStep,
} from "@/components/onboarding/onboarding-fields";
import { OnboardingPhotos } from "@/components/onboarding/onboarding-photos";
import { OnboardingPreview } from "@/components/onboarding/onboarding-preview";
export function ProviderEditor({
  record,
  categories,
}: {
  record?: AdminProvider;
  categories: Category[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(() => geographicDraft(record?.draft ?? emptyDraft)),
    [address, setAddress] = useState(record?.address ?? ""),
    [priceFrom, setPrice] = useState(record?.priceFrom ?? ""),
    [cover, setCover] = useState(record?.coverImage ?? ""),
    [images, setImages] = useState(record?.images ?? []),
    [tab, setTab] = useState("Datos"),
    [busy, setBusy] = useState(false),
    [photoBusy, setPhotoBusy] = useState(false),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [message, setMessage] = useState("");
  const id = useRef(record?.provider.id ?? ""),
    lock = useRef(false);
  const update = (
    key: keyof OnboardingDraft,
    value: OnboardingDraft[keyof OnboardingDraft],
  ) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors({});
  };
  const save = async (publish = false) => {
    if (lock.current) return;
    const body = {
      draft,
      address,
      priceFrom,
      intent: publish ? "publish" : "save",
    };
    const check = validateAdminDraft(
      body,
      publish || record?.provider.published === true,
    );
    if (!check.valid) {
      setErrors(check.errors);
      setTab(
        Object.keys(check.errors).some((key) => key.startsWith("service"))
          ? "Servicios"
          : "Datos",
      );
      setMessage("Revisá los campos indicados.");
      return;
    }
    lock.current = true;
    setBusy(true);
    setMessage("");
    if (!id.current) id.current = crypto.randomUUID();
    try {
      const response = await fetch(
        record ? `/api/admin/providers/${id.current}` : "/api/admin/providers",
        {
          method: record ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, id: id.current }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        setErrors(result.errors ?? {});
        throw new Error(result.error);
      }
      if (!record) {
        router.replace(`/admin/proveedores/${id.current}/editar`);
        router.refresh();
      } else {
        setMessage(publish ? "Proveedor publicado." : "Cambios guardados.");
        router.refresh();
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No pudimos guardar.");
    } finally {
      setBusy(false);
      lock.current = false;
    }
  };
  const props = { draft, categories, errors, update };
  return (
    <>
      <Link
        href={
          record
            ? `/admin/proveedores/${record.provider.id}`
            : "/admin/proveedores"
        }
        className="text-sm font-bold text-brand"
      >
        ← Volver
      </Link>
      <h1 className="display mt-5 text-3xl font-semibold">
        {record ? "Editar proveedor" : "Nuevo proveedor"}
      </h1>
      <p className="mt-3 text-sm text-muted">
        {record
          ? "Actualizá su información y revisá cómo se verá."
          : "Guardá el borrador para cargar su portada y galería. No hace falta crear una cuenta para el negocio."}
      </p>
      <div className="my-6 flex flex-wrap gap-2">
        {["Datos", "Servicios", "Fotos", "Vista previa"].map((t) => (
          <button
            key={t}
            disabled={busy || photoBusy}
            className={tab === t ? "onb-primary" : "onb-secondary"}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {message && (
        <p role="status" className="mb-5 rounded-xl bg-mint p-4 text-sm">
          {message}
        </p>
      )}
      <fieldset
        disabled={busy || photoBusy}
        className="min-w-0 rounded-3xl border border-brand/10 bg-white p-5 md:p-7"
      >
        {tab === "Datos" && (
          <div className="space-y-8">
            <BusinessStep {...props} />
            <ContactStep {...props} />
            <label className="block text-sm font-bold">
              Dirección (opcional, uso administrativo)
              <input
                className="onb-input mt-2"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                maxLength={300}
              />
              {errors.address && (
                <span role="alert" className="onb-error">
                  {errors.address}
                </span>
              )}
            </label>
            <label className="block text-sm font-bold">
              Precio general desde (ARS, opcional)
              <input
                className="onb-input mt-2"
                value={priceFrom}
                inputMode="decimal"
                onChange={(e) => setPrice(e.target.value)}
              />
              {errors.priceFrom && (
                <span role="alert" className="onb-error">
                  {errors.priceFrom}
                </span>
              )}
            </label>
          </div>
        )}
        {tab === "Servicios" && <ServicesStep {...props} />}{" "}
        {tab === "Fotos" &&
          (record ? (
            <OnboardingPhotos
              cover={cover}
              images={images}
              onCover={setCover}
              onImages={setImages}
              onBusy={setPhotoBusy}
              endpoint={`/api/dashboard/images?adminProviderId=${record.provider.id}`}
            />
          ) : (
            <p className="text-sm text-muted">
              Guardá el borrador para empezar a cargar fotos. Las fotos se
              guardan al subirlas.
            </p>
          ))}
        {tab === "Vista previa" && (
          <OnboardingPreview
            administrative
            draft={draft}
            categories={categories}
            cover={cover}
            images={images}
          />
        )}
      </fieldset>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          disabled={busy || photoBusy}
          className="onb-primary"
          onClick={() => save()}
        >
          {busy
            ? "Guardando…"
            : record
              ? "Guardar cambios"
              : "Guardar borrador"}
        </button>
        {record && !record.provider.published && (
          <button
            disabled={busy || photoBusy || !cover}
            className="onb-secondary"
            onClick={() => save(true)}
          >
            Publicar ahora
          </button>
        )}
        {record && (
          <Link
            className="onb-secondary"
            href={`/admin/proveedores/${record.provider.id}`}
          >
            Volver al detalle
          </Link>
        )}
      </div>
      {record && !cover && (
        <p className="mt-3 text-xs text-muted">
          Cargá una portada en Fotos para publicar desde esta pantalla.
        </p>
      )}
    </>
  );
}
