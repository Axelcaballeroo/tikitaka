// Read-only audit. Never creates accounts, writes rows or executes SQL.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd());
const { createClient } = require("@supabase/supabase-js");
const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
];
const report = {
  checkedAt: new Date().toISOString(),
  env: Object.fromEntries(
    [
      ...required,
      "NEXT_PUBLIC_TIKITAKA_WHATSAPP",
      "NEXT_PUBLIC_TIKITAKA_EMAIL",
    ].map((k) => [k, Boolean(process.env[k]?.trim())]),
  ),
};
const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
  anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !anon || !key)
  throw new Error("Falta configuración Supabase. No se muestran secretos.");
const db = createClient(url, key, { auth: { persistSession: false } }),
  publicDb = createClient(url, anon, { auth: { persistSession: false } });
async function all(table, select, client = db) {
  let rows = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client
      .from(table)
      .select(select)
      .order("id")
      .range(offset, offset + 499);
    if (error) return { error: error.code ?? "query-error" };
    rows = rows.concat(data ?? []);
    if (!data || data.length < 500) return rows;
  }
}
const response = await fetch(url + "/rest/v1/", {
  headers: {
    apikey: key,
    Authorization: "Bearer " + key,
    Accept: "application/openapi+json",
  },
});
const schema = await response.json();
const tables = {
  profiles: ["id", "email", "full_name", "role"],
  categories: ["id", "name", "slug", "active", "image_url"],
  providers: [
    "id",
    "user_id",
    "category_id",
    "business_name",
    "slug",
    "description",
    "zone",
    "city",
    "province",
    "address",
    "whatsapp",
    "email",
    "price_from",
    "rating",
    "reviews_count",
    "verified",
    "featured",
    "published",
    "status",
    "cover_image",
    "logo",
    "schedule",
    "coverage",
    "documents",
    "created_at",
    "updated_at",
  ],
  provider_images: [
    "id",
    "provider_id",
    "image_url",
    "sort_order",
    "created_at",
  ],
  provider_services: [
    "id",
    "provider_id",
    "title",
    "description",
    "price_from",
    "created_at",
  ],
  reviews: [
    "id",
    "provider_id",
    "reviewer_name",
    "reviewer_avatar",
    "rating",
    "comment",
    "published",
    "status",
    "created_at",
  ],
  contact_events: ["id", "provider_id", "source", "page", "created_at"],
  provider_requests: [
    "id",
    "business_name",
    "category",
    "zone",
    "whatsapp",
    "email",
    "message",
    "status",
    "verified",
    "featured",
    "created_at",
  ],
  favorites: ["id", "user_id", "provider_id"],
};
report.schema = Object.fromEntries(
  Object.entries(tables).map(([table, fields]) => [
    table,
    {
      missing: fields.filter(
        (f) => !schema.definitions?.[table]?.properties?.[f],
      ),
    },
  ]),
);
const [
  providers,
  profiles,
  reviews,
  publicProviders,
  publicEvents,
  publicProfiles,
  publicRequests,
] = await Promise.all([
  all("providers", "id,user_id,slug,status,published,rating,reviews_count"),
  all("profiles", "id,role"),
  all("reviews", "id,provider_id,rating,status,published"),
  all("providers", "id,status,published", publicDb),
  all("contact_events", "id", publicDb),
  all("profiles", "id", publicDb),
  all("provider_requests", "id", publicDb),
]);
const users = [];
let usersError = false;
for (let page = 1; ; page++) {
  const { data, error } = await db.auth.admin.listUsers({ page, perPage: 100 });
  if (error) {
    usersError = true;
    break;
  }
  users.push(
    ...data.users.map((u) => ({
      id: u.id,
      confirmed: Boolean(u.email_confirmed_at),
    })),
  );
  if (data.users.length < 100) break;
}
report.ownership = Array.isArray(providers)
  ? providers.map((p) => ({
      id: p.id,
      slug: p.slug,
      userId: p.user_id,
      classification: !p.user_id
        ? "B_without_owner"
        : usersError || !Array.isArray(profiles)
          ? "UNVERIFIED"
          : users.some((u) => u.id === p.user_id) &&
              profiles.some((x) => x.id === p.user_id && x.role === "provider")
            ? "A_valid_owner"
            : "C_invalid_owner",
    }))
  : providers;
report.accounts = {
  authUsers: usersError ? "unavailable" : users.length,
  profiles: Array.isArray(profiles) ? profiles.length : profiles,
  roles: Array.isArray(profiles)
    ? profiles.reduce((a, p) => ((a[p.role] = (a[p.role] ?? 0) + 1), a), {})
    : {},
};
report.anonymous = {
  providers: Array.isArray(publicProviders)
    ? publicProviders.length
    : publicProviders,
  privateProvidersExposed: Array.isArray(publicProviders)
    ? publicProviders.filter((p) => !p.published || p.status !== "approved")
        .length
    : null,
  events: Array.isArray(publicEvents) ? publicEvents.length : publicEvents,
  profiles: Array.isArray(publicProfiles)
    ? publicProfiles.length
    : publicProfiles,
  requests: Array.isArray(publicRequests)
    ? publicRequests.length
    : publicRequests,
};
report.ratingMismatches =
  Array.isArray(providers) && Array.isArray(reviews)
    ? providers.flatMap((p) => {
        const rs = reviews.filter(
          (r) =>
            r.provider_id === p.id && r.published && r.status === "approved",
        );
        const rating = rs.length
          ? Number(
              (
                rs.reduce((s, r) => s + Number(r.rating), 0) / rs.length
              ).toFixed(2),
            )
          : 0;
        return Number(p.rating) !== rating || p.reviews_count !== rs.length
          ? [
              {
                id: p.id,
                slug: p.slug,
                storedRating: p.rating,
                actualRating: rating,
                storedCount: p.reviews_count,
                actualCount: rs.length,
              },
            ]
          : [];
      })
    : null;
const { data: bucket, error: bucketError } =
  await db.storage.getBucket("provider-images");
report.storage = bucketError
  ? { error: "bucket-unavailable" }
  : {
      exists: true,
      public: bucket.public,
      fileSizeLimit: bucket.file_size_limit,
      allowedMimeTypes: bucket.allowed_mime_types,
    };
report.siteUrl = (() => {
  try {
    const site = new URL(process.env.NEXT_PUBLIC_SITE_URL || "");
    return {
      valid: site.protocol === "https:" || site.protocol === "http:",
      localhost: ["localhost", "127.0.0.1"].includes(site.hostname),
      https: site.protocol === "https:",
    };
  } catch {
    return { valid: false };
  }
})();
let clientLeak = false;
function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, item.name);
    if (item.isDirectory()) scan(target);
    else if (fs.readFileSync(target).includes(Buffer.from(key)))
      clientLeak = true;
  }
}
scan(".next/static");
report.serviceRoleInClientBuild = clientLeak;
fs.mkdirSync(".reports", { recursive: true });
fs.writeFileSync(
  ".reports/preproduction-audit.json",
  JSON.stringify(report, null, 2),
);
console.log(
  JSON.stringify(
    {
      ...report,
      ownership: Array.isArray(report.ownership)
        ? report.ownership.reduce(
            (a, p) => (
              (a[p.classification] = (a[p.classification] ?? 0) + 1),
              a
            ),
            {},
          )
        : report.ownership,
      ratingMismatches: Array.isArray(report.ratingMismatches)
        ? report.ratingMismatches.length
        : report.ratingMismatches,
    },
    null,
    2,
  ),
);
