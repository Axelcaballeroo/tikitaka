import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const load = (path, deps = {}) => {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    }).outputText,
    { exports, console: { error() {} }, require: (name) => deps[name] },
  );
  return exports;
};
const dependencies = {
  "@/lib/mock-data": { providers: [] },
  "@/lib/supabase/admin": {},
  "@/lib/supabase/server": {},
};
const { mapPublicProvider } = load("src/lib/data/providers.ts", dependencies);
const { similarProviders, profileJsonLd } = load(
  "src/lib/provider-profile.ts",
  {
    "@/lib/utils": { money: (value) => `$${value}` },
    "@/lib/marketplace-filters": {
      normalizeSearch: (value) => value.toLowerCase(),
    },
  },
);
const row = (extra = {}) => ({
  id: "one",
  business_name: "Proveedor QA",
  slug: "qa",
  description: null,
  zone: null,
  city: null,
  whatsapp: null,
  price_from: null,
  rating: 4.9,
  reviews_count: 80,
  verified: false,
  featured: false,
  published: true,
  status: "approved",
  cover_image: null,
  schedule: null,
  coverage: null,
  documents: [],
  created_at: "2026-01-01",
  categories: { name: "Niñeras", slug: "nineras" },
  provider_images: [],
  provider_services: [],
  reviews: [],
  ...extra,
});
const plain = (value) => JSON.parse(JSON.stringify(value));
test("Perfil vacío no inventa fotos, descripción, horarios, FAQs ni reseñas", () => {
  const p = mapPublicProvider(row());
  for (const key of ["image", "description", "schedule", "zone", "city"])
    assert.equal(p[key], "");
  for (const key of [
    "gallery",
    "coverage",
    "faqs",
    "reviews",
    "serviceDetails",
  ])
    assert.equal(p[key].length, 0);
  assert.equal(p.rating, 0);
  assert.equal(p.reviewsCount, 0);
});
test("Galería única respeta portada y sort_order sin repetir fotografías", () => {
  const p = mapPublicProvider(
    row({
      cover_image: "cover",
      provider_images: [
        { image_url: "second", sort_order: 2 },
        { image_url: "cover", sort_order: 0 },
        { image_url: "first", sort_order: 1 },
      ],
    }),
  );
  assert.deepEqual(plain(p.gallery), ["cover", "first", "second"]);
});
test("Servicios conservan descripción y precio nulo o cero sin calcular paquetes", () => {
  const p = mapPublicProvider(
    row({
      provider_services: [
        {
          title: "Consulta",
          description: "Descripción real",
          price_from: null,
        },
        { title: "Inicial", description: null, price_from: 0 },
      ],
    }),
  );
  assert.deepEqual(plain(p.serviceDetails), [
    { title: "Consulta", description: "Descripción real", priceFrom: null },
    { title: "Inicial", description: "", priceFrom: 0 },
  ]);
});
test("Solo reseñas publicadas y aprobadas entran en promedio y cantidad", () => {
  const review = (id, rating, published, status) => ({
    id,
    rating,
    published,
    status,
    reviewer_name: "Familia",
    reviewer_avatar: null,
    comment: null,
    created_at: "2026-01-01",
  });
  const p = mapPublicProvider(
    row({
      reviews: [
        review("a", 4, true, "approved"),
        review("b", 2, true, "approved"),
        review("c", 5, false, "approved"),
        review("d", 5, true, "pending"),
      ],
    }),
  );
  assert.equal(p.rating, 3);
  assert.equal(p.reviewsCount, 2);
  assert.equal(p.reviews[0].avatar, "");
  assert.equal(p.reviews[0].comment, "");
});
test("Similares excluye actual y privados; prioriza categoría, zona y flags", () => {
  const current = mapPublicProvider(row({ zone: "Palermo" }));
  const candidate = (id, extra = {}) => ({
    ...current,
    id,
    slug: id,
    ...extra,
  });
  const list = [
    candidate("private", { published: false }),
    candidate("pending", { status: "pending" }),
    current,
    candidate("other", { categorySlug: "robotica", featured: true }),
    candidate("category", { zone: "Belgrano" }),
    candidate("near", { verified: true }),
  ];
  assert.deepEqual(
    Array.from(similarProviders(current, list), (p) => p.id),
    ["near", "category", "other"],
  );
});
test("JSON-LD omite información ausente y usa reseñas públicas calculadas", () => {
  const p = mapPublicProvider(row());
  const data = profileJsonLd(p, "https://example.test");
  for (const key of [
    "image",
    "description",
    "telephone",
    "priceRange",
    "address",
    "aggregateRating",
  ])
    assert(!(key in data));
  assert.equal(data.url, "https://example.test/proveedores/qa");
});
test("Query de perfil exige visibilidad y moderación; distingue ausencia y error", async () => {
  const filters = [];
  const query = {
    select() {
      return this;
    },
    eq(...args) {
      filters.push(args);
      return this;
    },
    maybeSingle() {
      return Promise.resolve({ data: null, error: null });
    },
  };
  const dataModule = load("src/lib/data/providers.ts", {
    ...dependencies,
    "@/lib/supabase/server": {
      createServerClient: () => ({ from: () => query }),
    },
  });
  assert.equal(await dataModule.getProviderBySlug("hidden"), null);
  assert.deepEqual(filters, [
    ["slug", "hidden"],
    ["published", true],
    ["status", "approved"],
    ["reviews.published", true],
    ["reviews.status", "approved"],
  ]);
  query.maybeSingle = () =>
    Promise.resolve({ data: null, error: { message: "internal secret" } });
  await assert.rejects(
    dataModule.getProviderBySlug("hidden"),
    (error) => error.message === "No se pudo cargar el perfil",
  );
});
