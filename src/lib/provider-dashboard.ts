export type DashboardContact = { created_at: string; source: string };
export type ContactPeriod = "week" | "month30" | "month";
export function contactPeriods(now: Date) {
  const end = new Date(now);
  end.setUTCHours(0, 0, 0, 0);
  const week = new Date(end);
  week.setUTCDate(week.getUTCDate() - 6);
  const month30 = new Date(end);
  month30.setUTCDate(month30.getUTCDate() - 29);
  const month = new Date(end);
  month.setUTCDate(1);
  return { week, month30, month };
}
export function contactSeries(
  events: DashboardContact[],
  nowIso: string,
  period: ContactPeriod,
) {
  const now = new Date(nowIso),
    start = contactPeriods(now)[period];
  const counts = new Map<string, number>();
  for (const e of events) {
    const time = Date.parse(e.created_at);
    if (
      !Number.isFinite(time) ||
      time < start.getTime() ||
      time > now.getTime()
    )
      continue;
    const key = new Date(time).toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const days = [];
  for (
    const day = new Date(start);
    day.getTime() <= now.getTime();
    day.setUTCDate(day.getUTCDate() + 1)
  ) {
    const date = day.toISOString().slice(0, 10);
    days.push({ date, count: counts.get(date) ?? 0 });
  }
  return days;
}
export function dashboardState(p: { status: string; published: boolean }) {
  if (p.status === "rejected")
    return {
      label: "Rechazado",
      title: "Tu perfil fue rechazado.",
      text: "Podés corregir tu información y volver a enviarla desde Publicar mi servicio.",
      visible: false,
    };
  if (p.status === "pending")
    return {
      label: "Pendiente",
      title: "Tu perfil está en revisión.",
      text: "Mientras el equipo lo revisa, podés completar tu información. Todavía no aparece públicamente.",
      visible: false,
    };
  if (p.status === "approved" && p.published)
    return {
      label: "Publicado",
      title: "Tu perfil está publicado.",
      text: "Las familias pueden encontrarte en Tiki Taka y contactarte por WhatsApp.",
      visible: true,
    };
  return {
    label: "Oculto",
    title: "Tu perfil no está visible actualmente.",
    text: "Podés editar tu información o contactar a Tiki Taka para consultar su publicación.",
    visible: false,
  };
}
export function profileCompleteness(
  p: {
    businessName: string;
    description: string;
    whatsapp: string;
    categoryId: string | null;
    zone: string;
    city: string;
    coverImage: string;
    schedule: string;
    coverage: string;
  },
  images: number | null,
  services: number | null,
) {
  const present = (s: string) => Boolean(s.trim());
  const checks = [
    {
      label: "Nombre del negocio",
      done: present(p.businessName),
      href: "/dashboard/perfil",
    },
    {
      label: "Descripción",
      done: present(p.description),
      href: "/dashboard/perfil",
    },
    { label: "WhatsApp", done: present(p.whatsapp), href: "/dashboard/perfil" },
    {
      label: "Categoría",
      done: Boolean(p.categoryId),
      href: "/dashboard/perfil",
    },
    {
      label: "Zona o ciudad",
      done: present(p.zone) || present(p.city),
      href: "/dashboard/perfil",
    },
    {
      label: "Foto de portada",
      done: present(p.coverImage),
      href: "/dashboard/fotos",
    },
    {
      label: "Fotos de galería",
      done: images === null ? null : images > 0,
      href: "/dashboard/fotos",
    },
    {
      label: "Servicios",
      done: services === null ? null : services > 0,
      href: "/dashboard/servicios",
    },
    { label: "Horarios", done: present(p.schedule), href: "/dashboard/perfil" },
    {
      label: "Cobertura",
      done: present(p.coverage),
      href: "/dashboard/perfil",
    },
  ];
  return {
    checks,
    percent: checks.some((c) => c.done === null)
      ? null
      : Math.round((checks.filter((c) => c.done).length / checks.length) * 100),
  };
}
