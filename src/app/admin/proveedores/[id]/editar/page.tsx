import { notFound } from "next/navigation";
import { ProviderEditor } from "@/components/admin/provider-editor";
import {
  getAdminProvider,
  getAdminCategories,
} from "@/lib/data/admin-providers";
export const dynamic = "force-dynamic";
export default async function EditProvider({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [record, categories] = await Promise.all([
    getAdminProvider(id),
    getAdminCategories(),
  ]);
  if (!record) notFound();
  return <ProviderEditor key={id} record={record} categories={categories} />;
}
