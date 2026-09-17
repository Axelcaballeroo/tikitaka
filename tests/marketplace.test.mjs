import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
function loadModule(file, dependencies = {}) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    }).outputText,
    { exports, console: { error() {} }, require: (name) => dependencies[name] },
  );
  return exports;
}
const { readCatalogFilters, filterAndSortProviders } = loadModule(
  "src/lib/marketplace-filters.ts", { "@/lib/geography": loadModule("src/lib/geography.ts"), "@/lib/provider-search": loadModule("src/lib/provider-search.ts", { "@/lib/geography": loadModule("src/lib/geography.ts") }) },
);
const provider = (id, extra = {}) => ({
  id,
  name: id,
  category: "Niñeras",
  categorySlug: "nineras",
  description: "Cuidado infantil",
  zone: "Palermo",
  city: "Buenos Aires",
  rating: 4,
  reviewsCount: 2,
  priceFrom: 100,
  featured: false,
  verified: false,
  createdAt: "2026-01-01",
  ...extra,
});
const run = (items, query = "") =>
  Array.from(
    filterAndSortProviders(
      items,
      readCatalogFilters(new URLSearchParams(query)),
    ),
    (p) => p.id,
  );

test("Combina texto, ubicación y categorías reales sin distinguir tildes", () => {
  assert.deepEqual(
    run(
      [
        provider("a"),
        provider("b", { zone: "Belgrano" }),
        provider("c", { categorySlug: "robotica" }),
      ],
      "q=ninera&location=palermo&category=nineras,jardines-maternales",
    ),
    ["a"],
  );
});
test("Recomendados prioriza destacado y verificado, sin excluir normales", () => {
  assert.deepEqual(
    run([
      provider("normal", { rating: 5 }),
      provider("verificado", { verified: true }),
      provider("destacado", { featured: true }),
    ]),
    ["destacado", "verificado", "normal"],
  );
});
test("Legacy price parameters do not filter or reorder records", () => {
 const items = [provider("sin", {priceFrom:0}), provider("bajo"), provider("alto", {priceFrom:200})];
 for (const query of ["sort=price-asc", "sort=price-desc", "minPrice=150&maxPrice=250"]) assert.deepEqual(run(items,query),run(items));
 assert.equal(items[2].priceFrom,200);
});
test("Rating sin reseñas no se usa para recomendar ni filtrar", () => {
  assert.deepEqual(
    run(
      [provider("real"), provider("sin", { rating: 5, reviewsCount: 0 })],
      "rating=4",
    ),
    ["real"],
  );
});
test("URL inválida no genera orden o precio imposible", () => {
  const filters = readCatalogFilters(
    new URLSearchParams(
      "sort=unknown&minPrice=-2&maxPrice=Infinity&verified=false",
    ),
  );
  assert.equal(filters.sort, "recommended");
  assert.equal(filters.minPrice, undefined);
  assert.equal(filters.maxPrice, undefined);
  assert.equal(filters.verified, false);
});
test("Marketplace usa filtros públicos y propaga error controlado sin mocks", async () => {
  const calls = [];
  const query = {
    select() {
      return this;
    },
    eq(...args) {
      calls.push(args);
      return this;
    },
    order() {
      return this;
    },
    then(resolve) {
      return Promise.resolve({
        data: null,
        error: { message: "offline" },
      }).then(resolve);
    },
  };
  const data = loadModule("src/lib/data/providers.ts", {
    "@/lib/mock-data": { providers: [provider("mock")] },
    "@/lib/supabase/server": {
      isSupabaseConfigured: () => true,
      createServerClient: () => ({ from: () => query }),
    },
    "@/lib/supabase/admin": {},
  });
  await assert.rejects(
    data.getProviders({ allowMockFallback: false, throwOnError: true }),
    /No se pudieron cargar/,
  );
  assert.deepEqual(calls, [
    ["published", true],
    ["status", "approved"],
  ]);
  assert.equal(
    (await data.getProviders({ allowMockFallback: false })).length,
    0,
  );
});
