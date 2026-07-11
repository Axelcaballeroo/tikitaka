export function SectionTitle({ eyebrow, title, text, align = "left" }: { eyebrow?: string; title: string; text?: string; align?: "left" | "center" }) {
  return <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
    {eyebrow && <p className="mb-3 text-xs font-extrabold uppercase tracking-[.2em] text-brand">{eyebrow}</p>}
    <h2 className="display text-3xl font-semibold leading-tight md:text-5xl">{title}</h2>
    {text && <p className="mt-4 leading-7 text-muted">{text}</p>}
  </div>;
}
