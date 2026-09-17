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
    {
      exports,
      console: { error() {}, warn() {} },
      URL,
      require: (name) => deps[name],
    },
  );
  return exports;
};
const onboarding = load("src/lib/onboarding.ts", { "@/lib/geography": load("src/lib/geography.ts") });
const admin = load("src/lib/admin-provider.ts", { "./onboarding": onboarding });
const storage = load("src/lib/provider-storage.ts");
test("Cola pendiente y listado publicado comparten las reglas exactas", () => {
  assert.equal(
    admin.matchesAdminFilter(
      { status: "pending", published: false },
      "pendientes",
    ),
    true,
  );
  assert.equal(
    admin.matchesAdminFilter(
      { status: "pending", published: true },
      "pendientes",
    ),
    false,
  );
  assert.equal(
    admin.matchesAdminFilter(
      { status: "pending", published: true },
      "publicados",
    ),
    false,
  );
  assert.equal(
    admin.matchesAdminFilter(
      { status: "approved", published: true },
      "publicados",
    ),
    true,
  );
  assert.equal(
    admin.providerState({ status: "approved", published: false }),
    "Aprobado · oculto",
  );
});
test("Moderar cambia solo los campos de la acción; aprobar publica atómicamente", () => {
  assert.equal(
    JSON.stringify(admin.moderationPatch("approve")),
    JSON.stringify({ status: "approved", published: true }),
  );
  assert.equal(
    JSON.stringify(admin.moderationPatch("reject")),
    JSON.stringify({ status: "rejected", published: false }),
  );
  assert.equal(
    JSON.stringify(admin.moderationPatch("hide")),
    JSON.stringify({ published: false }),
  );
  assert.equal(
    JSON.stringify(admin.moderationPatch("verify", true)),
    JSON.stringify({ verified: true }),
  );
  assert.equal(
    JSON.stringify(admin.moderationPatch("feature", false)),
    JSON.stringify({ featured: false }),
  );
  assert.throws(() => admin.moderationPatch("verify", "true"));
  assert.throws(() => admin.moderationPatch("delete"));
});
test("El editor no acepta flags ni dueño y valida precio y dirección", () => {
  const result = admin.validateAdminDraft(
    {
      draft: {
        ...onboarding.emptyDraft,
        businessName: "Servicio QA",
        categorySlug: "nineras",
        description: "Servicio para las familias del barrio.",
        published: true,
        user_id: "other",
      },
      address: "x".repeat(301),
      priceFrom: "-1",
    },
    false,
  );
  assert.equal(result.valid, false);
  assert(result.errors.address);
  assert(result.errors.priceFrom);
  assert.equal(result.draft.published, undefined);
  assert.equal(result.draft.user_id, undefined);
});
test("Eliminar archivos solo acepta Storage y carpeta del proveedor seleccionado", () => {
  const base = "https://example.supabase.co",
    path =
      "/storage/v1/object/public/provider-images/user/provider/cover/a.png";
  assert.equal(
    storage.providerStoragePath(base + path, "provider", base),
    "user/provider/cover/a.png",
  );
  assert.equal(storage.providerStoragePath(base + path, "other", base), null);
  assert.equal(
    storage.providerStoragePath("https://evil.test" + path, "provider", base),
    null,
  );
  assert.equal(
    storage.providerStoragePath("not a url", "provider", base),
    null,
  );
});
const id = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
function routeHarness({
  authorized = true,
  status = "pending",
  published = false,
  exists = true,
  conflict = false,
} = {}) {
  const writes = [];
  const db = {
    from() {
      return {
        update(patch) {
          writes.push(patch);
          return this;
        },
        eq() {
          return this;
        },
        select() {
          return this;
        },
        maybeSingle: async () => ({
          data: conflict ? null : { id },
          error: null,
        }),
      };
    },
  };
  class InputError extends Error {
    constructor(message, status = 400, errors) {
      super(message);
      this.status = status;
      this.errors = errors;
    }
  }
  const database = async () => {
    if (!authorized) throw new Error("No autorizado");
    return db;
  };
  const api = {
    AdminInputError: InputError,
    validateId() {},
    refreshProvider() {},
    adminFailure: (e) => ({
      status: e.message === "No autorizado" ? 403 : (e.status ?? 503),
    }),
  };
  const routes = load("src/app/api/admin/providers/[id]/route.ts", {
    "next/server": {
      NextResponse: {
        json: (data, init) => ({ status: init?.status ?? 200, data }),
      },
    },
    "@/lib/data/admin-providers": {
      adminDatabase: database,
      getAdminProvider: async () =>
        exists
          ? {
              provider: { status, published, slug: "qa" },
              updatedAt: "now",
              draft: {
                ...onboarding.emptyDraft,
                businessName: "Servicio QA",
                categorySlug: "nineras",
                description: "Cuidado infantil para las familias del barrio.",
                whatsapp: "5491123456789",
                city: "Buenos Aires",
              },
            }
          : null,
    },
    "@/lib/admin-provider": admin,
    "@/lib/onboarding": onboarding,
    "@/lib/admin-provider-api": api,
  });
  return {
    routes,
    writes,
    request: (body) =>
      routes.PATCH(
        { json: async () => body },
        { params: Promise.resolve({ id }) },
      ),
  };
}
test("API niega no-admin antes de escribir y bloquea borrado", async () => {
  const h = routeHarness({ authorized: false });
  assert.equal((await h.request({ action: "approve" })).status, 403);
  assert.equal(h.writes.length, 0);
  assert.equal((await routeHarness().routes.DELETE()).status, 409);
});
test("API exige confirmación de rechazo/verificación y no publica un pendiente por toggle", async () => {
  const h = routeHarness();
  assert.equal((await h.request({ action: "reject" })).status, 400);
  assert.equal(
    (await h.request({ action: "verify", value: true })).status,
    400,
  );
  assert.equal((await h.request({ action: "publish" })).status, 409);
  assert.equal(h.writes.length, 0);
});
test("API aprueba en una escritura y detecta conflictos sin éxito falso", async () => {
  const h = routeHarness();
  assert.equal((await h.request({ action: "approve" })).status, 200);
  assert.equal(h.writes.length, 1);
  assert.equal(h.writes[0].published, true);
  assert.equal(h.writes[0].status, "approved");
  assert.equal(
    (await routeHarness({ conflict: true }).request({ action: "approve" }))
      .status,
    409,
  );
  assert.equal(
    (await routeHarness({ exists: false }).request({ action: "approve" }))
      .status,
    404,
  );
});
