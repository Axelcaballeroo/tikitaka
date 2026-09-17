"use client";
import { useId, useState } from "react";
import { geographicDraft, localitiesFor, zones } from "@/lib/geography";

type Value = { zone: string; city: string };
type Props = {
  value: Value; onChange: (value: Value) => void; required?: boolean;
  zoneName?: string; cityName?: string; errors?: Record<string, string>;
};
export function GeographyFields({ value, onChange, required = false, zoneName = "zone", cityName = "city", errors = {} }: Props) {
  const id = useId();
  const localities = localitiesFor(value.zone);
  const knownZone = zones.some(zone => zone === value.zone);
  const legacy = (value.zone && !knownZone) || (value.city && !localities.includes(value.city));
  return <>
    <label className="geography-field"><span>Zona</span><select aria-label="Zona" name={zoneName} required={required} value={knownZone ? value.zone : ""} aria-invalid={!!errors.zone} aria-describedby={errors.zone ? `${id}-zone-error` : undefined} onChange={e => onChange({ zone: e.target.value, city: "" })}>
      <option value="">{required ? "Seleccioná una zona" : "Todas las zonas"}</option>{zones.map(zone => <option key={zone}>{zone}</option>)}
    </select>{errors.zone && <small id={`${id}-zone-error`} role="alert">{errors.zone}</small>}</label>
    <label className="geography-field"><span>Localidad</span><select aria-label="Localidad" name={cityName} required={required} disabled={!knownZone} value={localities.includes(value.city) ? value.city : ""} aria-invalid={!!errors.city} aria-describedby={errors.city ? `${id}-city-error` : undefined} onChange={e => onChange({ zone: value.zone, city: e.target.value })}>
      <option value="">{!knownZone ? "Primero seleccioná una zona" : required ? "Seleccioná una localidad" : "Todas las localidades"}</option>{localities.map(city => <option key={city}>{city}</option>)}
    </select>{errors.city && <small id={`${id}-city-error`} role="alert">{errors.city}</small>}</label>
    {legacy && <p className="geography-legacy" role="status">Ubicación anterior: {[value.zone, value.city].filter(Boolean).join(" · ")}. Seleccioná la zona y localidad correspondientes.</p>}
  </>;
}
/** Uncontrolled server-action form wrapper; names match the existing columns. */
export function ProviderGeographyFields({ zone, city }: Value) {
  const [value, setValue] = useState(() => geographicDraft({ zone, city }));
  return <GeographyFields value={value} onChange={setValue} required />;
}
