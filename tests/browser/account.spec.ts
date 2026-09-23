import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";

test.skip(process.env.QA_MEMORY_AUTH !== "1", "Requires isolated loopback Auth fixture; never run account writes against production.");
test.beforeEach(async ({ page, request, baseURL, context }) => {
  expect(baseURL).toMatch(/^http:\/\/(localhost|127\.0\.0\.1):3101$/);
  const response=await request.post("http://localhost:54329/_qa/dashboard",{data:{reset:true,contacts:true}});
  expect(response.ok()).toBe(true);
  await context.route("**/*", route => {
    const url=new URL(route.request().url());
    return !["localhost","127.0.0.1"].includes(url.hostname) && !["GET","HEAD"].includes(route.request().method()) ? route.abort() : route.continue();
  });
  await page.goto("/login");
});
test("customer: personal account, family menu and server-side guards", async ({ page }) => {
  await page.getByLabel("Email",{exact:true}).fill("familia@example.test");
  await page.locator("input[type=password]").fill(randomUUID());
  await page.getByRole("button",{name:/Ingresar/}).click();
  await expect(page).toHaveURL(/\/cuenta$/);
  await expect(page.getByRole("heading",{name:/Hola, Axel/})).toBeVisible();
  await expect(page.getByText(/(?:Aún|Todavía) no guardaste/)).toBeVisible();
  for(const width of [375,430,768,1024,1440]) {
    await page.setViewportSize({width,height:950});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    await page.screenshot({path:`.qa-private/customer-account-${width}.png`,fullPage:true});
  }
  await page.getByRole("button",{name:/Hola, Axel/}).click();
  const menu=page.getByRole("menu",{name:"Mi cuenta",exact:true});
  await expect(menu.getByRole("menuitem",{name:"Mi cuenta",exact:true})).toBeVisible();
  await expect(menu.getByRole("menuitem",{name:"Mis favoritos",exact:true})).toBeVisible();
  await expect(menu.getByRole("menuitem",{name:"Publicar mi servicio",exact:true})).toBeVisible();
  await page.goto("/dashboard");await expect(page).toHaveURL(/\/publicar$/);
  await page.goto("/admin");await expect(page).toHaveURL(/\/cuenta$/);
});
test("favorites persist for one account and never leak after an account switch", async ({ page, request }) => {
  const login = async (email:string) => {
    await page.goto("/login");
    await page.getByLabel("Email",{exact:true}).fill(email);
    await page.locator("input[type=password]").fill(randomUUID());
    await page.getByRole("button",{name:/Ingresar/}).click();
    await expect(page).not.toHaveURL(/\/login/);
  };
  await login("familia@example.test");
  await Promise.all([page.waitForResponse(response=>response.url().includes("/api/favorites")&&response.request().method()==="GET"),page.goto("/servicios")]);
  const save=page.getByRole("button",{name:/Guardar en favoritos: Peque Taller QA/}).first();
  await Promise.all([page.waitForResponse(response=>response.url().includes("/api/favorites")&&response.request().method()==="POST"),save.click()]);
  await expect(page.getByRole("button",{name:/Quitar de favoritos: Peque Taller QA/}).first()).toBeVisible();
  await page.goto("/favoritos",{waitUntil:"domcontentloaded"});
  await expect(page.getByText("Peque Taller QA",{exact:true}).first()).toBeVisible();
  await page.goto("/logout");
  await login("qa@example.test");
  await page.goto("/favoritos");
  await expect(page.getByText(/(?:Aún|Todavía) no guardaste/)).toBeVisible();
  await page.goto("/logout");
  await login("familia@example.test");
  await page.goto("/favoritos");
  await expect(page.getByText("Peque Taller QA",{exact:true}).first()).toBeVisible();
  const state=await(await request.get("http://localhost:54329/_qa/state")).json();
  expect(state.rows.favorites).toHaveLength(1);
  expect(state.rows.favorites[0].user_id).toBe("66666666-6666-4666-a666-666666666666");
});
test("registration selector keeps family fields personal and provider onboarding separate", async ({ page }) => {
  await page.goto("/registro");
  await page.getByRole("button",{name:/Soy familia/}).click();
  await expect(page.getByRole("heading",{name:"Creá tu cuenta de familia"})).toBeVisible();
  await expect(page.getByLabel("Nombre del negocio",{exact:true})).toHaveCount(0);
  await expect(page.getByLabel("Categoría",{exact:true})).toHaveCount(0);
  await expect(page.getByRole("button",{name:"Crear cuenta →"})).toBeEnabled();
  await page.getByRole("button",{name:/Soy proveedor/}).click();
  await expect(page.getByRole("heading",{name:"Creá tu cuenta de proveedor"})).toBeVisible();
});
for(const role of ["admin","provider"] as const) test(`${role}: verified account menu, redirects, responsive panel, logout`, async({page})=>{
  await page.getByLabel("Email",{exact:true}).fill(role==="admin"?"cami@example.test":"qa@example.test");
  await page.locator("input[type=password]").fill(randomUUID());
  await page.getByRole("button",{name:/Ingresar/}).click();
  await expect(page).toHaveURL(new RegExp(`/${role==="admin"?"admin":"dashboard"}$`));
  const greeting=role==="admin"?"Hola, Camila":"Hola, QA";
  await page.goto(role==="admin"?"/dashboard":"/admin");
  await expect(page).toHaveURL(new RegExp(`/${role==="admin"?"admin":"cuenta"}$`));
  if(role==="provider") await page.goto("/dashboard");
  for(const width of [375,430,768,1024,1440]){
    await page.setViewportSize({width,height:950});
    await expect(page.getByRole("button",{name:new RegExp(greeting)})).toBeVisible();
    await page.getByRole("button",{name:new RegExp(greeting)}).click();
    const menu=page.getByRole("menu",{name:"Mi cuenta",exact:true});await expect(menu).toBeVisible();
    await expect(menu.getByRole("menuitem",{name:role==="admin"?"Camila OS":"Mi negocio",exact:true})).toBeVisible();
    const box=await menu.boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(width);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    await page.waitForTimeout(180);
    await page.screenshot({path:`.qa-private/round2-${role}-${width}.png`,fullPage:true});
    await page.keyboard.press("Escape");await expect(menu).toHaveCount(0);
    await expect(page.getByRole("button",{name:new RegExp(greeting)})).toBeFocused();
  }
  if(role==="admin") {
    await page.goto("/");
    await page.getByRole("button",{name:new RegExp(greeting)}).click();
    await page.getByRole("menuitem",{name:"Cerrar sesión",exact:true}).click();
    await expect(page.getByRole("link",{name:"Iniciar sesión",exact:true}).first()).toBeVisible();
    await expect(page.getByRole("button",{name:new RegExp(greeting)})).toHaveCount(0);
  }
});
test("Publicar creates one provider account without duplicating a provider",async({page,request})=>{
  await page.goto("/publicar");
  await page.getByRole("link",{name:"Crear cuenta y publicar →"}).click();
  const email=`qa-${randomUUID()}@example.test`;
  const password=randomUUID();
  await expect(page.getByRole("button",{name:/Soy proveedor/})).toHaveAttribute("aria-pressed","true");
  await page.getByLabel("Nombre completo",{exact:true}).fill("Nueva Proveedora");
  await page.getByLabel("Email",{exact:true}).fill(email);
  await page.getByLabel("Contraseña",{exact:true}).fill(password);
  await page.getByRole("button",{name:"Crear cuenta →"}).click();
  await expect(page.getByText(/Cuenta creada/)).toBeVisible();
  const state=await(await request.get("http://localhost:54329/_qa/state")).json();
  const profile=state.rows.profiles.find((p:{email:string})=>p.email===email);
  expect(profile.role).toBe("provider");
  const owned=state.rows.providers.filter((p:{user_id:string})=>p.user_id===profile.id);
  expect(owned).toHaveLength(0);
});
