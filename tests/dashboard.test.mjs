import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const load = (path, deps = {}, env = {}) => {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    { exports, Date, process:{env}, console: { warn() {} }, require: (name) => deps[name] },
  );
  return exports;
};
const dashboard = load("src/lib/provider-dashboard.ts");
const plans = load("src/lib/plans.ts",{"./commercial-contact":load("src/lib/commercial-contact.ts",{},{NEXT_PUBLIC_TIKITAKA_EMAIL:"contact@example.test"})});
test("Plan actual depende solo de featured, nunca de verified ni PRO", () => {
  assert.equal(plans.currentPlan(false), "Tiki Taka Básico");
  assert.equal(plans.currentPlan(true), "Tiki Taka Destacado");
  assert.match(
    plans.planContact("PRO", "Negocio & QA"),
    /^mailto:contact@example.test\?/,
  );
  assert.match(plans.planContact("PRO", "Negocio & QA"), /Negocio%20%26%20QA/);
});
test("Visibilidad requiere approved y published; mensajes no confunden revisión y ocultado", () => {
  assert.equal(
    dashboard.dashboardState({ status: "approved", published: true }).visible,
    true,
  );
  assert.equal(
    dashboard.dashboardState({ status: "pending", published: true }).visible,
    false,
  );
  assert.equal(
    dashboard.dashboardState({ status: "approved", published: false }).label,
    "Oculto",
  );
  assert.equal(
    dashboard.dashboardState({ status: "rejected", published: false }).label,
    "Rechazado",
  );
});
test("Períodos calendario UTC incluyen hoy y no eventos futuros o anteriores", () => {
  const now = "2026-03-01T12:00:00Z",
    events = [
      { created_at: "2026-02-23T00:00:00Z" },
      { created_at: "2026-02-22T23:59:59Z" },
      { created_at: "2026-03-01T11:59:59Z" },
      { created_at: "2026-03-01T12:00:01Z" },
      { created_at: "invalid" },
    ];
  const week = dashboard.contactSeries(events, now, "week");
  assert.equal(week.length, 7);
  assert.equal(week[0].date, "2026-02-23");
  assert.equal(
    week.reduce((s, d) => s + d.count, 0),
    2,
  );
  const month = dashboard.contactSeries(events, now, "month");
  assert.equal(month.length, 1);
  assert.equal(month[0].count, 1);
  assert.equal(
    dashboard.contactSeries([], "2026-03-31T22:00:00Z", "month").length,
    31,
  );
  assert.equal(
    dashboard.contactSeries([], "2024-03-01T12:00:00Z", "week").length,
    7,
  );
});
test("Completitud usa diez campos reales y no convierte errores en falta de contenido", () => {
  const p = {
    businessName: "QA",
    description: "Servicio",
    whatsapp: "54911",
    categoryId: "id",
    zone: "",
    city: "Buenos Aires",
    coverImage: "img",
    schedule: "Lunes",
    coverage: "Zona",
  };
  assert.equal(dashboard.profileCompleteness(p, 1, 1).percent, 100);
  assert.equal(
    dashboard.profileCompleteness({ ...p, schedule: "  " }, 0, 1).percent,
    80,
  );
  assert.equal(dashboard.profileCompleteness(p, null, 1).percent, null);
});
function dataHarness({ fail = false, authorized = true } = {}) {
  const calls = [];
  const db = {
    from(table) {
      const call = { table, filters: [], range: [0, 499] };
      calls.push(call);
      return {
        select(_, options) {
          call.head = options?.head;
          return this;
        },
        eq(k, v) {
          call.filters.push([k, v]);
          return this;
        },
        gte() {
          return this;
        },
        lte() {
          return this;
        },
        order() {
          return this;
        },
        range(a, b) {
          call.range = [a, b];
          return this;
        },
        then(resolve) {
          let result;
          if (fail && table === "contact_events")
            result = {
              data: null,
              count: null,
              error: { message: "private error" },
            };
          else if (call.head) result = { count: 3, error: null };
          else if (table === "reviews")
            result = {
              data: Array.from({ length: 501 }, (_, i) => ({
                id: String(i),
                reviewer_name: "QA",
                rating: 4,
                created_at: "2026-09-15T00:00:00Z",
              })).slice(call.range[0], call.range[1] + 1),
              error: null,
            };
          else result = { data: [], error: null };
          return Promise.resolve(result).then(resolve);
        },
      };
    },
  };
  const data = load("src/lib/data/provider-dashboard.ts", {
    react: { cache: (fn) => fn },
    "@/lib/auth/account": {
      requireAccount: async () => {
        if (!authorized) throw new Error("No autorizado");
        return { supabase: db, provider: { id: "owner" } };
      },
    },
    "@/lib/provider-dashboard": dashboard,
  });
  return { calls, data };
}
test("Analytics deriva dueño de sesión, filtra todas las consultas y pagina reseñas", async () => {
  const h = dataHarness(),
    data = await h.data.getDashboardData("foreign-id");
  assert.equal(data.reviews.length, 501);
  assert.equal(data.totalContacts, 3);
  for (const call of h.calls)
    assert(call.filters.some(([k, v]) => k === "provider_id" && v === "owner"));
  for (const call of h.calls.filter((c) => c.table === "reviews")) {
    assert(call.filters.some(([k, v]) => k === "published" && v === true));
    assert(call.filters.some(([k, v]) => k === "status" && v === "approved"));
  }
});
test("Fallo de contactos no falsea cero ni impide mostrar reseñas", async () => {
  const h = dataHarness({ fail: true }),
    data = await h.data.getDashboardData();
  assert.equal(data.contacts, null);
  assert.equal(data.totalContacts, null);
  assert.equal(data.reviews.length, 501);
});
test("Sin sesión no se consulta ninguna métrica", async () => {
  const h = dataHarness({ authorized: false });
  await assert.rejects(h.data.getDashboardData(), /No autorizado/);
  assert.equal(h.calls.length, 0);
});
