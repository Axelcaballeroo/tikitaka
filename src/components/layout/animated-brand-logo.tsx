"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export function AnimatedBrandLogo({ source: preferred, fallback, size, priority }: { source: string; fallback: string; size: "navigation" | "footer"; priority: boolean }) {
  const [entering, setEntering] = useState(false);
  const [source, setSource] = useState(preferred);
  useEffect(() => {
    if (size !== "navigation" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (sessionStorage.getItem("tikitaka:brand-entered")) return;
      sessionStorage.setItem("tikitaka:brand-entered", "1");
      setEntering(true);
      const timer = window.setTimeout(() => setEntering(false), 900);
      return () => window.clearTimeout(timer);
    } catch { return; }
  }, [size]);
  return <Image className={entering ? "brand-logo-enter" : undefined} src={source} onError={() => { if (source !== fallback) setSource(fallback); }} alt="Tiki Taka" width={622} height={226} sizes={size === "footer" ? "110px" : "(max-width: 639px) 121px, 132px"} priority={priority} unoptimized />;
}
