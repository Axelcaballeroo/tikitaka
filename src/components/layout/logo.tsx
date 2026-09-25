import Link from "next/link";
import { AnimatedBrandLogo } from "./animated-brand-logo";
export function Logo({ size = "navigation", priority = false }: { size?: "navigation" | "footer"; priority?: boolean }) {
  const source = process.env.NEXT_PUBLIC_USE_TRANSPARENT_LOGO === "true" ? "/logo-transparent.png" : "/logo2.png";
  return <Link href="/" className={`brand-logo brand-logo-${size}`} aria-label="Tiki Taka inicio"><AnimatedBrandLogo source={source} fallback="/logo2.png" size={size} priority={priority} /></Link>;
}
