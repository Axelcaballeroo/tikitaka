import { commercialConfig } from "@/lib/commercial-contact";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Configuración admin" };
export default function SettingsPage() {
  const contact = commercialConfig();
  const fields = [
    ["Nombre de la plataforma", "Tiki Taka"],
    ["Ciudad principal", "Buenos Aires"],
    ["WhatsApp de soporte", contact.whatsapp || "No configurado"],
    ["Email de soporte", contact.email || "No configurado"],
  ];
  return (
    <>
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[.16em] text-brand">
          Preferencias
        </p>
        <h1 className="display mt-2 text-4xl font-semibold">Configuración</h1>
        <p className="mt-3 text-sm text-muted">
          Parámetros visuales de la plataforma. La edición llegará en una
          próxima fase.
        </p>
      </div>
      <div className="mt-8 rounded-[1.75rem] bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <label key={label} className="text-sm font-extrabold">
              {label}
              <input
                value={value}
                readOnly
                className="mt-2 w-full rounded-xl border border-teal-900/10 bg-slate-50 p-3 font-normal text-muted outline-none"
              />
            </label>
          ))}
          <label className="text-sm font-extrabold sm:col-span-2">
            Mensaje legal base
            <textarea
              readOnly
              rows={5}
              value="Tiki Taka facilita el contacto entre familias y proveedores. Recomendamos validar disponibilidad, precios, documentación y condiciones directamente con el proveedor."
              className="mt-2 w-full resize-none rounded-xl border border-teal-900/10 bg-slate-50 p-3 font-normal leading-6 text-muted outline-none"
            />
          </label>
        </div>
        <button
          disabled
          className="mt-6 rounded-full bg-brand px-6 py-3 text-sm font-extrabold text-white opacity-50"
        >
          Guardar cambios
        </button>
        <p className="mt-3 text-xs text-muted">
          Configuración visual, todavía sin persistencia.
        </p>
      </div>
    </>
  );
}
