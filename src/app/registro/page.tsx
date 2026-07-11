import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { getCategories } from "@/lib/data/categories";
export const metadata: Metadata = { title: "Registro de proveedor" };
export const dynamic = "force-dynamic";
export default async function RegisterPage() { const categories = await getCategories(); return <section className="container-page py-16"><div className="mx-auto max-w-3xl"><RegisterForm categories={categories} /></div></section>; }
