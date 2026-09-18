import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
function load(file, dependencies = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
    { exports, URL, console: { error() {} }, require: name => dependencies[name], ...globals });
  return exports;
}
const geo = load("src/lib/geography.ts");
const search = load("src/lib/provider-search.ts", { "@/lib/geography": geo });
const menu = load("src/lib/account-menu.ts");
const json = (data, init = {}) => ({ data, status: init.status ?? 200, headers: init.headers });
test("Suggestions only use supplied real labels, deduplicate and cap at six", () => {
  const providers = Array.from({length:10},(_,i)=>({name:`Salón ${i}`,category:"Salones",services:["Salón de fiestas"],serviceDetails:[{title:"Salón de fiestas",description:"No es una sugerencia"}]}));
  const result = Array.from(search.searchSuggestions(providers,"SAL"));
  assert.equal(result.length,6);
  assert.equal(new Set(result).size,6);
  assert(result.every(label=>providers.some(p=>[p.name,p.category,...p.services].includes(label))));
  assert.equal(search.searchSuggestions(providers,"inexistente").length,0);
  assert.equal(search.searchSuggestions(providers,"").length,0);
});
test("Suggestions preserve accents while matching supported equivalents", () => {
  assert.deepEqual(Array.from(search.searchSuggestions([{name:"Espacio",category:"Animación"}],"animadores")),["Animación"]);
  assert.deepEqual(Array.from(search.searchSuggestions([{name:"Espacio",services:["Salón de fiestas"]}],"salones de eventos")),["Salón de fiestas"]);
});
test("Account labels never use email; menus point to existing role routes", () => {
  assert.equal(menu.accountLabel({fullName:" Camila Perez ",role:"admin"}),"Hola, Camila");
  assert.equal(menu.accountLabel({fullName:"",role:"provider"}),"Mi cuenta");
  for (const role of ["admin","provider"]) for (const [,url] of menu.accountLinks(role)) assert(fs.existsSync(`src/app${url}/page.tsx`));
  assert(!menu.accountLinks("provider").some(([,url])=>url.startsWith("/admin")));
});
function session(user, profile, provider = null) {
  let selected;
  const calls=[];
  const db = {auth:{getUser:async()=>({data:{user}})},from:table=>({select:()=>({eq:(key,value)=>{selected=[key,value];calls.push([table,key,value]);return {maybeSingle:async()=>({data:table==="profiles"?profile:provider})};}})})};
  return {route:load("src/app/api/auth/session/route.ts",{"next/server":{NextResponse:{json}},"@/lib/supabase/auth-server":{createAuthServerClient:async()=>db},"@/lib/account-menu":menu},{process:{env:{NEXT_PUBLIC_SUPABASE_URL:"https://storage.example.test"}}}),selected:()=>selected,calls};
}
test("Anonymous navbar session does not read profiles and is never cached", async () => {
  const h=session(null,null),r=await h.route.GET();assert.equal(r.data.account,null);assert.equal(h.selected(),undefined);assert.equal(r.headers["Cache-Control"],"private, no-store");
});
test("Navbar role comes from verified user's profile, not editable metadata", async () => {
  for(const role of ["admin","provider"]){const h=session({id:"owner",email:"private@example.test",user_metadata:{role:"admin"}},{role,full_name:"Camila"});const r=await h.route.GET();assert.equal(r.data.account.role,role);assert.equal(h.selected()[1],"owner");assert.equal(r.data.account.email,"private@example.test");assert(!("user_metadata" in r.data.account));}
});
test("Provider cannot read another provider's services or images", async () => {
  const calls=[];
  const db={
    auth:{getUser:async()=>({data:{user:{id:"owner-a"}}})},
    from(table) {
      calls.push(table);
      return { select:()=>({eq(key,id) {
        assert.equal(key,"user_id"); assert.equal(id,"owner-a");
        return {maybeSingle:async()=>({data:{id:"provider-a",user_id:"owner-a"},error:null})};
      }}) };
    },
  };
  const account=load("src/lib/auth/account.ts",{"server-only":{},"next/navigation":{redirect:()=>{throw Error("redirect");}},"@/lib/supabase/auth-server":{createAuthServerClient:async()=>db}});
  await assert.rejects(account.getAccountServices("provider-b"),/No autorizado/);
  await assert.rejects(account.getAccountImages("provider-b"),/No autorizado/);
  assert.deepEqual(calls,["providers","providers"]);
});
function registerHarness() {
  const writes=[];let signups=0;
  const admin={from:table=>({select:()=>({eq(){return this;},maybeSingle:async()=>({data:table==="categories"?{id:"category"}:null})}),upsert:async row=>{writes.push([table,row]);return {};},insert:async row=>{writes.push([table,row]);return {};}})};
  const route=load("src/app/api/auth/register/route.ts",{"next/server":{NextResponse:{json}},"@/lib/geography":geo,"@/lib/site-url":{getSiteUrl:()=>"https://example.test"},"@/lib/utils":{slugify:()=>"service"},"@/lib/supabase/admin":{createAdminClient:()=>admin},"@supabase/supabase-js":{createClient:()=>({auth:{signUp:async()=>{signups++;return {data:{user:{id:"verified-signup-id"},session:null}};}}})}}, {process:{env:{NEXT_PUBLIC_SUPABASE_URL:"http://localhost",NEXT_PUBLIC_SUPABASE_ANON_KEY:"test-only"}}});
  return {route,writes,signups:()=>signups};
}
const registration={fullName:"QA",email:"qa@example.test",password:"test-input-only",businessName:"Servicio",categorySlug:"nineras",zone:"Zona Norte",city:"Beccar",whatsapp:"5491123456789"};
test("Register rejects invalid geography before creating any Auth user", async () => {
  const h=registerHarness();const r=await h.route.POST({json:async()=>({...registration,zone:"Zona Sur"})});assert.equal(r.status,400);assert.equal(h.signups(),0);assert.equal(h.writes.length,0);
});
test("Register binds provider to signup user, fixes provider role and preserves city", async () => {
  const h=registerHarness();const r=await h.route.POST({json:async()=>({...registration,user_id:"attacker",role:"admin",published:true})});assert.equal(r.status,200);const profile=h.writes.find(([t])=>t==="profiles")[1],provider=h.writes.find(([t])=>t==="providers")[1];assert.equal(profile.role,"provider");assert.equal(provider.user_id,"verified-signup-id");assert.equal(provider.city,"Beccar");assert.equal(provider.published,false);assert.equal(provider.status,"pending");
});
test("Server middleware protects role destinations and anonymous redirects", async () => {
  for(const [user,role,path,destination] of [[null,null,"/admin","/login"],[{id:"a"},"provider","/admin","/dashboard"],[{id:"a"},"admin","/dashboard","/admin"]]){
    const db={auth:{getUser:async()=>({data:{user}})},from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:{role}})})})})};
    const route=load("src/middleware.ts",{"@supabase/ssr":{createServerClient:()=>db},"next/server":{NextResponse:{next:()=>({}),redirect:url=>url}}},{process:{env:{NEXT_PUBLIC_SUPABASE_URL:"http://localhost",NEXT_PUBLIC_SUPABASE_ANON_KEY:"test-only"}}});
    const result=await route.middleware({url:"https://example.test"+path,nextUrl:{pathname:path},cookies:{getAll:()=>[]}});assert.equal(result.pathname,destination);
  }
});
test("Premium account rejects invalid names and hides publication without an owned provider", () => {
  for (const fullName of ["", "   ", "...", "1234", "someone@example.test"]) {
    assert.equal(menu.accountLabel({fullName,role:"provider"}),"Mi cuenta");
  }
  assert.equal(menu.accountFirstName({fullName:"  Juliana Pérez ",role:"provider"}),"Juliana");
  assert.equal(menu.accountRoleLabel("admin"),"Administradora");
  assert.equal(menu.accountRoleLabel("provider"),"Proveedor");
  assert(!menu.accountLinks("provider",false).some(([,url])=>url.includes("vista-publica")));
  assert(menu.accountLinks("provider",true).some(([,url])=>url==="/dashboard/vista-publica"));
});
test("Premium avatar accepts existing public image sources and rejects private/arbitrary URLs", () => {
  const origin="https://storage.example.test";
  const avatar=origin+"/storage/v1/object/public/provider-images/owner/logo.png";
  assert.equal(menu.safeAccountAvatar(avatar,origin),avatar);
  for (const value of ["javascript:alert(1)","https://tracker.example.test/me",origin+"/storage/v1/object/sign/private/avatar", "https://user:password@storage.example.test/storage/v1/object/public/a",null]) assert.equal(menu.safeAccountAvatar(value,origin),null);
});
test("Session reads only the owned provider image and does not create a publication link without association",async()=>{
  const logo="https://storage.example.test/storage/v1/object/public/provider-images/a/logo.png";
  const h=session({id:"owner",email:"owner@example.test"},{role:"provider",full_name:"Juliana"},{id:"a",logo,cover_image:"https://images.unsplash.com/fallback"});
  const result=await h.route.GET();assert.equal(result.data.account.avatarUrl,logo);assert.equal(result.data.account.hasProvider,true);
  assert.deepEqual(h.calls,[["profiles","id","owner"],["providers","user_id","owner"]]);
  const empty=await session({id:"owner"},{role:"provider",full_name:""}).route.GET();assert.equal(empty.data.account.hasProvider,false);assert.equal(empty.data.account.avatarUrl,null);
});
