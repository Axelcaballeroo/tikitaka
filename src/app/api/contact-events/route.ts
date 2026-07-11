import { NextResponse } from "next/server";
import { CONTACT_EVENT_SOURCES, createContactEvent, type ContactEventSource } from "@/lib/data/contact-events";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }); }
  const payload = body as Record<string, unknown>;
  const providerId = typeof payload.providerId === "string" ? payload.providerId : "";
  const source = typeof payload.source === "string" ? payload.source : "";
  const page = typeof payload.page === "string" ? payload.page : "";
  if (!UUID.test(providerId) || !CONTACT_EVENT_SOURCES.includes(source as ContactEventSource) || page.length > 200) return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  try {
    await createContactEvent({ providerId, source: source as ContactEventSource, page });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.warn("[Tiki Taka] No se pudo registrar el contacto:", error instanceof Error ? error.message : error);
    return new NextResponse(null, { status: 204 });
  }
}
