import Link from "next/link";
import type { Category } from "@/types";
export function CategoryCard({ category }: { category: Category }) { return <Link href={`/categorias/${category.slug}`} className="group rounded-[1.75rem] border border-teal-900/5 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-900/8">
  <span className={`grid h-12 w-12 place-items-center rounded-2xl text-xl ${category.color}`}>{category.icon}</span><h3 className="mt-5 font-extrabold">{category.name}</h3><p className="mt-2 text-sm leading-6 text-muted">{category.description}</p><span className="mt-4 inline-block text-sm font-extrabold text-brand transition group-hover:translate-x-1">Ver servicios →</span>
</Link>; }
