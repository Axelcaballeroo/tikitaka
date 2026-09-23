import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { getCategories } from "@/lib/data/categories";
import { PublishIntro } from "@/components/onboarding/publish-intro";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
export const metadata: Metadata = {
  title: "Publicá tu servicio infantil",
  description:
    "Mostrá tu servicio en Tiki Taka y conectá con familias que ya están buscando.",
  alternates: { canonical: "/publicar" },
};
export const dynamic = "force-dynamic";
export default async function PublishPage() {
  const supabase = await createAuthServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  if (!user) return <PublishIntro />;
  const { data: profile } = await supabase!
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role === "admin")
    return (
      <section className="container-page py-16">
        <div className="mx-auto max-w-xl rounded-3xl bg-mint p-8">
          <h1 className="display text-3xl">
            Gestioná las solicitudes desde tu panel
          </h1>
          <Link href="/admin/proveedores" className="onb-primary mt-6">
            Ir al panel de administración
          </Link>
        </div>
      </section>
    );
  if (!profile || !["provider", "customer"].includes(profile.role)) redirect("/login?error=profile");
  const { data: provider, error } = await supabase!.from("providers").select("id").eq("user_id", user.id).maybeSingle();
  if (error) throw new Error("No pudimos cargar tu publicación.");
  if (provider) redirect("/dashboard");
  const categories = await getCategories().catch(() => []);
  return (
    <div className="onboarding-page container-page py-8 md:py-12">
      <OnboardingWizard userId={user.id} categories={categories} />
    </div>
  );
}
