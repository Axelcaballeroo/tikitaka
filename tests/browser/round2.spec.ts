import { test, expect } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  // Public QA remains read-only even when the local app reads real Supabase data.
  await context.route("**/*", route => ["GET", "HEAD"].includes(route.request().method()) ? route.continue() : route.abort());
});
test("Live search: debounce, no Enter, URL, clear and Back/Forward", async ({ page }) => {
  await page.goto("/servicios");
  await page.waitForLoadState("networkidle");
  const requests: string[] = [];
  page.on("request",request=>requests.push(request.url()));
  const input = page.getByRole("combobox", { name: "¿Qué estás buscando?" });
  await expect(page.getByRole("heading",{level:1})).toHaveText("Encontrá lo que necesites en un solo click");
  await expect(page.getByText("Personas, lugares y propuestas para cada momento de tu familia.")).toHaveCount(0);
  const before=await page.locator("[data-provider-id]").count();
  await input.fill("sal");
  await expect(page).not.toHaveURL(/q=sal$/, { timeout: 100 });
  await input.fill("salones de eventos");
  await expect(page).toHaveURL(/q=salones\+de\+eventos/);
  await expect(page.locator("[data-provider-id]")).toHaveCount(4);
  await expect(input).toBeFocused();
  // Newly visible profile links may prefetch; typing must not refetch the catalog.
  expect(requests.filter(url=>(new URL(url).pathname==="/servicios"&&url.includes("_rsc="))||url.includes("/rest/v1/"))).toEqual([]);
  await page.getByRole("button",{name:"Limpiar búsqueda",exact:true}).click();
  await expect(page.locator("[data-provider-id]")).toHaveCount(before);
  await page.goBack();await expect(input).toHaveValue("salones de eventos");
  await expect(page.locator("[data-provider-id]")).toHaveCount(4);
  await page.goForward();await expect(input).toHaveValue("");
  await input.fill("salon");await expect(page).toHaveURL(/q=salon/);
  await input.fill("");await expect(page.locator("[data-provider-id]")).toHaveCount(before);
});
test("Suggestions support arrows, Enter, Escape, click and shared links", async ({ page }) => {
  await page.goto("/servicios");
  const input=page.getByRole("combobox",{name:"¿Qué estás buscando?"});
  await input.fill("sal");
  const options=page.getByRole("option").filter({hasText:/sal/i});
  await expect(page.getByRole("listbox")).toBeVisible();
  const suggestion=await page.getByRole("listbox").getByRole("option").first().innerText();
  await input.press("ArrowDown");await expect(input).toHaveAttribute("aria-activedescendant",/.+/);
  await input.press("Enter");await expect(input).toHaveValue(suggestion.replace(/^↗\s*/,""));
  await page.reload();await expect(input).toHaveValue(suggestion.replace(/^↗\s*/,""));
  await input.fill("sal");await input.press("ArrowUp");await input.press("Escape");await expect(page.getByRole("listbox")).toHaveCount(0);
  await input.fill("salo");await expect(options.first()).toBeVisible();
  await page.getByRole("listbox").getByRole("option").first().click();await expect(page.getByRole("listbox")).toHaveCount(0);
});
test("Pending search combines with reactive filters, sort and locality", async ({ page }) => {
  await page.goto("/servicios");
  await page.getByRole("combobox",{name:"¿Qué estás buscando?"}).fill("salon");
  await page.getByLabel("Zona",{exact:true}).selectOption("Zona Norte");
  await expect(page).toHaveURL(/q=salon/);
  await page.getByLabel("Localidad",{exact:true}).selectOption("Beccar");
  await expect(page).toHaveURL(/localidad=Beccar/);
  expect(new URL(page.url()).searchParams.get("zona")).toBe("Zona Norte");
  expect(new URL(page.url()).searchParams.get("q")).toBe("salon");
  const category=await page.getByLabel("Categoría",{exact:true}).locator("option").nth(1).getAttribute("value");
  await page.getByLabel("Categoría",{exact:true}).selectOption(category!);
  await page.getByLabel("Ordenar por",{exact:true}).selectOption("recent");
  expect(new URL(page.url()).searchParams.get("category")).toBe(category);
  expect(new URL(page.url()).searchParams.get("sort")).toBe("recent");
  expect(new URL(page.url()).searchParams.get("q")).toBe("salon");
  expect(new URL(page.url()).searchParams.get("localidad")).toBe("Beccar");
  await page.getByLabel("Zona",{exact:true}).selectOption("Zona Sur");
  await expect(page.getByLabel("Localidad",{exact:true})).toHaveValue("");
  await expect(page.getByLabel("Localidad",{exact:true})).not.toContainText("Beccar");
});
test("Back during pending debounce cancels stale input", async ({ page }) => {
  await page.goto("/servicios");const input=page.getByRole("combobox",{name:"¿Qué estás buscando?"});
  await input.fill("salon");await expect(page).toHaveURL(/q=salon/);
  await input.fill("pending-query");await page.goBack();await page.waitForTimeout(400);
  await expect(input).toHaveValue("");expect(new URL(page.url()).searchParams.has("q")).toBe(false);
});
for(const width of [375,430,768,1024,1440]) test(`Responsive ${width}: Hero, search, dropdown, filters, plans and registration`,async({page})=>{
  await page.setViewportSize({width,height:950});
  for(const path of ["/","/servicios","/planes","/registro"]){
    await page.goto(path);await page.waitForLoadState("networkidle");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),path).toBe(true);
    await expect(page.getByRole("link",{name:"Iniciar sesión",exact:true}).first()).toBeVisible();
    if(path==="/"){
      const photo=page.locator(".hero-baby");await expect(photo).toBeVisible();
      expect(await photo.getAttribute("src")).toContain("gordo.jpeg");
      expect(await photo.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
      await page.getByRole("searchbox").fill("salon");await page.waitForTimeout(400);expect(new URL(page.url()).pathname).toBe("/");
    }
    if(path==="/servicios"){
      await page.getByRole("combobox",{name:"¿Qué estás buscando?"}).fill("sal");await expect(page.getByRole("listbox")).toBeVisible();
      const box=await page.getByRole("listbox").boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(width);
      await page.keyboard.press("Escape");
      if(width<1024){await page.getByRole("button",{name:/Filtros/}).click();await expect(page.getByRole("dialog")).toBeVisible();}
      await page.getByLabel("Zona",{exact:true}).last().selectOption("Zona Norte");await page.getByLabel("Localidad",{exact:true}).last().selectOption("Beccar");
    }
    if(path==="/planes")for(const name of ["Tiki Taka Gratis","Tiki Taka PRO","Tiki Taka Negocios"])await expect(page.getByRole("heading",{name,exact:true})).toBeVisible();
    await page.screenshot({path:`.qa-private/round2-${width}-${path.replaceAll("/","")||"home"}.png`,fullPage:true});
  }
});
