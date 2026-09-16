import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Ingresar",
};
export default function LoginPage() {
  return (
    <section className="container-page py-16">
      <div className="mx-auto max-w-lg">
        <Suspense
          fallback={
            <div className="h-96 animate-pulse rounded-[2rem] bg-mint" />
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </section>
  );
}
