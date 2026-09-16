import type { NextConfig } from "next";

const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null;
const nextConfig: NextConfig = {
  images: { remotePatterns: [
    { protocol: "https", hostname: "images.unsplash.com" },
    ...(storageUrl ? [{ protocol: storageUrl.protocol === "http:" ? "http" as const : "https" as const, hostname: storageUrl.hostname, port: storageUrl.port, pathname: "/storage/v1/object/public/**" }] : []),
  ] },
};
export default nextConfig;
