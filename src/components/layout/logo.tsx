import Link from "next/link";
import Image from "next/image";
export function Logo({ size = "navigation", priority = false }: { size?: "navigation" | "footer"; priority?: boolean }) {
  return <Link href="/" className={`brand-logo brand-logo-${size}`} aria-label="Tiki Taka inicio"><Image src="/logo2.png" alt="Tiki Taka" width={622} height={226} sizes={size === "footer" ? "110px" : "(max-width: 639px) 121px, 132px"} priority={priority} unoptimized /></Link>;
}
