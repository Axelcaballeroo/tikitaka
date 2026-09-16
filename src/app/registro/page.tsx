import { safeReturnPath } from "@/lib/onboarding";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { getCategories } from "@/lib/data/categories";
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Registro de proveedor",
};
export const dynamic = "force-dynamic";
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeReturnPath(
    typeof params.next === "string" ? params.next : null,
  );
  const categories = await getCategories();
  return (
    <section className="container-page py-16">
      <div className="mx-auto max-w-3xl">
        <RegisterForm categories={categories} nextPath={nextPath} />
      </div>
    </section>
  );
}
