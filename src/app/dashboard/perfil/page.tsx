import { ProfileForm } from "@/components/dashboard/profile-form";
import { requireAccount } from "@/lib/auth/account";
import { getCategories } from "@/lib/data/categories";
export default async function ProfilePage() { const [{ provider }, categories] = await Promise.all([requireAccount(), getCategories()]); if (!provider) return <p>No encontramos tu perfil.</p>; return <><p className="text-xs font-extrabold uppercase tracking-[.16em] text-brand">Configuración</p><h1 className="display mt-2 text-4xl font-semibold">Mi perfil</h1><p className="mt-3 text-muted">Esta información aparecerá en tu perfil público cuando sea aprobado.</p><ProfileForm provider={provider} categories={categories} /></>; }
