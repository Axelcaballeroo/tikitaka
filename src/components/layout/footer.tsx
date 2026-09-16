import { commercialContact } from "@/lib/commercial-contact";
import { CommercialContact } from "@/components/ui/commercial-contact";
import Link from "next/link";
import { Logo } from "./logo";

const columns = [
  {
    title: "Para familias",
    links: [
      ["Explorar", "/servicios"],
      ["Categorías", "/#categorias"],
      ["Cómo funciona", "/como-funciona"],
      ["Favoritos", "/favoritos"],
    ],
  },
  {
    title: "Para proveedores",
    links: [
      ["Publicar servicio", "/publicar"],
      ["Planes", "/planes"],
      ["Ingresar", "/login"],
    ],
  },
  {
    title: "Tiki Taka",
    links: [
      ["Nosotros", "/#nosotros"],
      ["Contacto", "commercial"],
    ],
  },
];
export function Footer() {
  return (
    <footer className="border-t border-brand/10 bg-white py-12 md:py-16">
      <div className="container-page grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-7 text-muted">
            Para acompañarte en cada pequeño gran momento de la vida en familia.
          </p>
          <div aria-hidden className="mt-5 flex gap-2">
            {["bg-brand", "bg-sun", "bg-lilac", "bg-blush"].map((color) => (
              <span key={color} className={`h-2 w-8 rounded-full ${color}`} />
            ))}
          </div>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h2 className="text-sm font-extrabold">{column.title}</h2>
            <nav
              aria-label={column.title}
              className="mt-3 grid justify-items-start"
            >
              {column.links.map(([label, href]) =>
                href === "commercial" ? (
                  <CommercialContact
                    key={href}
                    href={commercialContact()}
                    className="py-2.5 text-sm text-muted"
                  >
                    {label}
                  </CommercialContact>
                ) : (
                  <Link
                    key={href}
                    href={href}
                    className="py-2.5 text-sm text-muted transition hover:text-brand"
                  >
                    {label}
                  </Link>
                ),
              )}
            </nav>
          </div>
        ))}
      </div>
      <div className="container-page mt-10 border-t border-brand/10 pt-6 text-xs leading-6 text-muted">
        <p>
          Tiki Taka — Todo lo que una familia necesita para sus hijos, en un
          solo lugar.
        </p>
        <p className="mt-2">© {new Date().getFullYear()} Tiki Taka.</p>
      </div>
    </footer>
  );
}
