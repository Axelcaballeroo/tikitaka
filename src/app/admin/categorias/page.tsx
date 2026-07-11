import type { Metadata } from "next";
import { CategoriesAdmin } from "@/components/admin/categories-admin";
import { getCategories } from "@/lib/data/categories";
import { getProviders } from "@/lib/data/providers";
export const metadata: Metadata = { title: "Categorías admin" };
export const dynamic = "force-dynamic";
export default async function CategoriesPage() { const [categories, providers] = await Promise.all([getCategories(), getProviders({ admin: true, includeUnpublished: true })]); return <CategoriesAdmin categories={categories} providers={providers} />; }
