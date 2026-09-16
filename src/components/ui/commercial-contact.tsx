export function CommercialContact({
  href,
  children,
  className,
}: {
  href: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  return href ? (
    <a
      href={href}
      className={className}
      {...(href.startsWith("https:")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {children}
    </a>
  ) : (
    <span
      role="link"
      aria-disabled="true"
      title="Contacto de Tiki Taka no disponible por el momento."
      className={`${className ?? ""} cursor-not-allowed opacity-60`}
    >
      {children}
      <span className="sr-only">: contacto no disponible</span>
    </span>
  );
}
