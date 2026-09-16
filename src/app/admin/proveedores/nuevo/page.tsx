import { ProviderEditor } from "@/components/admin/provider-editor";
import { getAdminCategories } from "@/lib/data/admin-providers";
export const dynamic = "force-dynamic";
export default async function NewProvider() {
  return <ProviderEditor categories={await getAdminCategories()} />;
}
