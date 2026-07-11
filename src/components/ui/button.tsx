import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = { href: string; children: React.ReactNode; variant?: "primary" | "secondary" | "ghost"; className?: string };
export function ButtonLink({ href, children, variant = "primary", className }: Props) {
  return <Link href={href} className={cn("inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-extrabold transition hover:-translate-y-0.5", variant === "primary" && "bg-brand text-white shadow-lg shadow-teal-900/10 hover:bg-brand-dark", variant === "secondary" && "border-2 border-brand bg-white text-brand hover:bg-mint", variant === "ghost" && "text-ink hover:bg-mint", className)}>{children}</Link>;
}
