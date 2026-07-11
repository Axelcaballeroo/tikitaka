import type { Metadata } from "next";
import { Fredoka, Manrope } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import "./globals.css";
import { getSiteUrl } from "@/lib/site-url";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "Tiki Taka | Marketplace infantil en Buenos Aires", template: "%s | Tiki Taka" },
  description: "Encontrá servicios infantiles de confianza: niñeras, jardines, cumpleaños, clases y mucho más.",
  openGraph: { title: "Tiki Taka", description: "Servicios de confianza para tus hijos, en un solo lugar.", type: "website", locale: "es_AR" },
  twitter: { card: "summary_large_image", title: "Tiki Taka", description: "Servicios infantiles de confianza en Buenos Aires." },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${manrope.variable} ${fredoka.variable} antialiased`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
