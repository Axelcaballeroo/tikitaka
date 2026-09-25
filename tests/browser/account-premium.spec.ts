import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

test.skip(process.env.QA_MEMORY_AUTH !== "1", "Navbar UI fixtures run only against the isolated local app.");
test.beforeEach(async ({ baseURL }) => {
  expect(baseURL).toMatch(/^http:\/\/(localhost|127\.0\.0\.1):3101$/);
});
const profiles = {
  admin: { fullName: "Camila Pérez", role: "admin", email: "camila@example.test", avatarUrl: null, hasProvider: false },
  provider: { fullName: "Juliana Gómez", role: "provider", email: "juliana@example.test", avatarUrl: null, hasProvider: true },
  customer: { fullName: "Axel Familia", role: "customer", email: "axel@example.test", avatarUrl: null, hasProvider: false },
};
for (const state of ["anonymous", "admin", "provider", "customer"] as const) {
  test(`Premium ${state}: 375/430/768/1024/1440, keyboard, outside and stable navbar`, async ({ page, baseURL }) => {
    expect(baseURL).toMatch(/^http:\/\/(localhost|127\.0\.0\.1):3101$/);
    await page.route("**/api/auth/session", route => route.fulfill({ json: { account: state === "anonymous" ? null : profiles[state] } }));
    for (const width of [375, 430, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 950 });
      await page.goto("/");
      const header = page.getByRole("banner");
      await expect(header).toBeVisible();
      expect((await header.boundingBox())!.height).toBe(81);
      if (state === "anonymous") {
        await expect(header.getByRole("link", { name: "Iniciar sesión", exact: true })).toBeVisible();
        await expect(header.locator(".account-avatar")).toHaveCount(0);
        if (width >= 640) {
          await expect(header.getByRole("link", { name: /Favoritos/ })).toBeVisible();
          await expect(header.getByRole("link", { name: "Publicá tu servicio", exact: true })).toBeVisible();
        }
      } else {
        const name = state === "admin" ? "Camila" : state === "provider" ? "Juliana" : "Axel";
        const role = state === "admin" ? "Administradora" : state === "provider" ? "Familia y proveedor" : "Mi cuenta";
        const trigger = header.getByRole("button", { name: `Hola, ${name}, ${role}` });
        await expect(trigger).toBeVisible();
        await expect(trigger.locator(".account-avatar")).toHaveText(name[0]);
        await expect(trigger).toHaveAttribute("aria-haspopup", "menu");
        const heightBefore = (await header.boundingBox())!.height;
        await trigger.focus(); await trigger.press("ArrowDown");
        const menu = page.getByRole("menu", { name: "Mi cuenta" });
        await expect(menu.getByRole("menuitem").first()).toBeFocused();
        await page.keyboard.press("End"); await expect(menu.getByRole("menuitem", { name: "Cerrar sesión" })).toBeFocused();
        await page.keyboard.press("Home"); await expect(menu.getByRole("menuitem").first()).toBeFocused();
        await page.keyboard.press("ArrowDown"); await expect(menu.getByRole("menuitem").nth(1)).toBeFocused();
        await expect(page.locator(".account-summary-name")).toHaveText(name);
        await expect(page.locator(".account-summary .account-role")).toHaveText(role);
        await expect(page.locator(".account-email")).toHaveText(profiles[state].email);
        if (state === "provider") await expect(menu.getByRole("menuitem", { name: "Mi negocio" })).toBeVisible();
        if (state === "customer") {
          await expect(menu.getByRole("menuitem", { name: "Mi cuenta", exact: true })).toBeVisible();
          await expect(menu.getByRole("menuitem", { name: "Mis favoritos", exact: true })).toBeVisible();
          await expect(menu.getByText("Mi panel", { exact: true })).toHaveCount(0);
        }
        await page.waitForTimeout(220);
        const box = (await page.locator(".account-dropdown").boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(width);
        expect((await header.boundingBox())!.height).toBe(heightBefore);
        await page.screenshot({ path: `.qa-private/account-premium-${state}-${width}.png` });
        await page.keyboard.press("Escape"); await expect(menu).toHaveCount(0); await expect(trigger).toBeFocused();
        await trigger.click(); await page.locator("main").first().click({ position: { x: 2, y: 80 } }); await expect(menu).toHaveCount(0);
        await trigger.focus(); await trigger.press("ArrowUp"); await expect(menu.getByRole("menuitem", { name: "Cerrar sesión" })).toBeFocused();
        await page.keyboard.press("Tab"); await expect(menu).toHaveCount(0);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      if (state === "anonymous") await page.screenshot({ path: `.qa-private/account-premium-anonymous-${width}.png` });
    }
  });
}
test("Premium fallback: no full_name, no association, long name and broken image", async ({ page }) => {
  let account = { ...profiles.provider, fullName: "", hasProvider: false, avatarUrl: "https://images.unsplash.com/qa-avatar-missing" };
  await page.route("**/api/auth/session", route => route.fulfill({ json: { account } }));
  await page.route("**/_next/image?*", route => new URL(route.request().url()).searchParams.get("url")?.includes("qa-avatar") ? route.fulfill({ status: 404, body: "" }) : route.continue());
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Mi cuenta, Mi cuenta" });
  await expect(trigger.locator(".account-avatar")).toHaveText("TK");
  await trigger.click();
  await expect(page.getByRole("menuitem", { name: "Publicar mi servicio" })).toBeVisible();
  await expect(page.locator(".account-summary-name")).toHaveText("Mi cuenta");
  await page.screenshot({ path: ".qa-private/account-premium-no-name.png" });
  account = { ...account, fullName: "MaríadelosÁngelesExtraordinariamenteLargo Apellido", avatarUrl: "", email: "un-correo-muy-largo-para-verificar-el-ajuste@example.test" };
  await page.setViewportSize({ width: 375, height: 950 }); await page.reload();
  await page.locator(".account-trigger").click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
test("Premium real-image presentation retains image source and falls back to initial", async ({ page }) => {
  const account = { ...profiles.provider, avatarUrl: "https://images.unsplash.com/qa-avatar-present" };
  await page.route("**/api/auth/session", route => route.fulfill({ json: { account } }));
  await page.route("**/_next/image?*", route => new URL(route.request().url()).searchParams.get("url")?.includes("qa-avatar")
    ? route.fulfill({ contentType: "image/png", body: readFileSync("public/logo1.png") }) : route.continue());
  await page.goto("/");
  const image = page.locator(".account-trigger .account-avatar img");
  await expect(image).toBeVisible();
  expect(await image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await image.dispatchEvent("error"); await expect(page.locator(".account-trigger .account-avatar")).toHaveText("J");
});
test("Brand motion plays once, falls back safely and respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const logo=page.getByRole("banner").getByRole("img",{name:"Tiki Taka"});
  await expect(logo).toHaveAttribute("src",/\/logo-transparent\.png$/);
  await page.waitForTimeout(950);
  await expect(logo).not.toHaveClass(/brand-logo-enter/);
  await page.reload();
  await expect(logo).not.toHaveClass(/brand-logo-enter/);
  await page.evaluate(()=>sessionStorage.removeItem("tikitaka:brand-entered"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(logo).not.toHaveClass(/brand-logo-enter/);
});
test("Transparent logo keeps the current official logo as technical fallback", async ({ page }) => {
  await page.route("**/logo-transparent.png", route => route.fulfill({ status: 404, body: "" }));
  await page.goto("/");
  await expect(page.getByRole("banner").getByRole("img",{name:"Tiki Taka"})).toHaveAttribute("src",/\/logo2\.png$/);
});
