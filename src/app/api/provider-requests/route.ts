import { NextResponse } from "next/server";
import { createProviderRequest } from "@/lib/data/requests";

export async function POST(request: Request) {
  try {
    const body = await request.json(); const fields = ["businessName", "category", "zone", "whatsapp", "email", "message"] as const;
    if (fields.some((field) => typeof body[field] !== "string" || !body[field].trim())) return NextResponse.json({ error: "Completá todos los campos." }, { status: 400 });
    if (!/^\S+@\S+\.\S+$/.test(body.email)) return NextResponse.json({ error: "Ingresá un email válido." }, { status: 400 });
    const data = await createProviderRequest(Object.fromEntries(fields.map((field) => [field, body[field].trim()])) as Parameters<typeof createProviderRequest>[0]);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) { console.error("[Tiki Taka] No se pudo crear la solicitud:", error); return NextResponse.json({ error: "No pudimos enviar tu solicitud. Intentá nuevamente en unos minutos." }, { status: 503 }); }
}
