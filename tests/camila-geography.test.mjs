import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
function load(file, deps = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, { exports, require: name => deps[name] });
  return exports;
}
const geo = load("src/lib/geography.ts");
const search = load("src/lib/provider-search.ts", { "@/lib/geography": geo });
const catalog = load("src/lib/marketplace-filters.ts", { "@/lib/geography": geo, "@/lib/provider-search": search });
const onboarding = load("src/lib/onboarding.ts", { "@/lib/geography": geo });
test("Cuatro zonas; Beccar pertenece a Norte, nunca a Sur", () => {
  assert.equal(geo.zones.length, 4);
  assert(geo.localitiesFor("Zona Norte").includes("Beccar"));
  assert(!geo.localitiesFor("Zona Sur").includes("Beccar"));
  assert(!geo.validGeography("Zona Sur", "Beccar"));
});
test("Legacy se interpreta sin mutar ni inventar ubicación", () => {
  const raw = { zone: "Beccar", city: "Buenos Aires" };
  assert.equal(geo.resolveGeography(raw).zone, "Zona Norte");
  assert.equal(raw.zone, "Beccar");
  assert.equal(geo.resolveGeography({ zone: "Palermo", city: "Buenos Aires" }).zone, "Capital Federal");
  for (const value of [{ zone: "Rosario", city: "Santa Fe" }, { zone: "Palermo", city: "Beccar" }]) {
    assert.equal(geo.resolveGeography(value).resolved, false);
    assert.equal(geo.geographicDraft(value), value);
  }
});
test("Filtros usan location/localidad, aceptan zona y links legacy", () => {
  for (const query of ["location=Zona+Norte&localidad=Beccar", "zona=Zona+Norte&localidad=Beccar", "location=Beccar"]) {
    const result = catalog.readCatalogFilters(new URLSearchParams(query));
    assert.equal(result.location, "Zona Norte");
    assert.equal(result.localidad, "Beccar");
  }
});
test("Filtro por zona y localidad incluye registros actuales y legacy", () => {
  const items = [{id:"old",zone:"Beccar",city:"Buenos Aires"}, {id:"new",zone:"Zona Norte",city:"Beccar"}, {id:"other",zone:"Zona Norte",city:"Tigre"}];
  const result = catalog.filterAndSortProviders(items.map(p=>({...p,name:p.id,featured:false,verified:false,reviewsCount:0})), catalog.readCatalogFilters(new URLSearchParams("location=Zona+Norte&localidad=Beccar")));
  assert.deepEqual(Array.from(result, p => p.id).sort(), ["new", "old"]);
});
test("Texto sin ubicación reconoce salones de eventos y servicios reales", () => {
  assert(search.matchesProviderSearch({name:"Uno",category:"Salones de fiestas"}, "salones de eventos"));
  assert(search.matchesProviderSearch({name:"Dos",serviceDetails:[{title:"Salón",description:"Organizamos eventos"}]}, "salones de eventos"));
  assert(!search.matchesProviderSearch({name:"Otro",description:"Organizamos eventos al aire libre"}, "salones de eventos"));
  assert(search.matchesProviderSearch({category:"Animación"}, "animadores"));
  assert(search.matchesProviderSearch({category:"Niñeras"}, "ninera"));
  assert(!search.matchesProviderSearch({name:"Salón de fiestas"}, "inexistentezz"));
});
test("Nuevos borradores rechazan pares incompatibles incluso antes del envío", () => {
  assert(!onboarding.validateDraft({...onboarding.emptyDraft,businessName:"Servicio",categorySlug:"nineras",description:"Un servicio infantil de prueba.",zone:"Zona Sur",city:"Beccar"}).valid);
  assert(onboarding.validateDraft({...onboarding.emptyDraft,businessName:"Servicio",categorySlug:"nineras",description:"Un servicio infantil de prueba.",zone:"Zona Norte",city:"Beccar"}).valid);
});
test("Moderar legacy conserva datos y no ejecuta una normalización implícita", () => {
  const draft = {...onboarding.emptyDraft,businessName:"Servicio",categorySlug:"nineras",description:"Servicio infantil con atención personalizada.",whatsapp:"5491123456789",zone:"Palermo",city:"Buenos Aires"};
  const result = onboarding.validateDraft(draft,true,false);
  assert(result.valid);
  assert.equal(result.draft.zone,"Palermo");
  assert.equal(result.draft.city,"Buenos Aires");
  assert(!onboarding.validateDraft({...draft,zone:"",city:""},true,false).valid);
});
