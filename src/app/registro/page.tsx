import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Crear cuenta",
};
export const dynamic = "force-dynamic";
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; tipo?: string }>;
}) {
  const params = await searchParams;
  const initialType = params.tipo === "provider" || params.next === "/publicar" ? "provider" : params.tipo === "customer" ? "customer" : null;
  return (
    <section className="container-page py-16">
      <div className="mx-auto max-w-3xl">
        <RegisterForm initialType={initialType} customerEnabled={process.env.CUSTOMER_ACCOUNTS_ENABLED === "true"} />
      </div>
    </section>
  );
}
