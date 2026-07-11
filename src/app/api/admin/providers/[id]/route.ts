import { NextResponse } from "next/server";
import { deleteProvider, updateProviderFlags } from "@/lib/data/requests";
import { requireAdminApi } from "@/lib/auth/profile";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { try { await requireAdminApi(); const { id } = await params; const body = await request.json(); await updateProviderFlags(id, { verified: body.verified, featured: body.featured, published: body.published, status: body.status }); return NextResponse.json({ ok: true }); } catch (error) { const message = error instanceof Error ? error.message : "No se pudo actualizar."; return NextResponse.json({ error: message }, { status: message === "No autorizado" ? 403 : 500 }); } }
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) { try { await requireAdminApi(); const { id } = await params; await deleteProvider(id); return NextResponse.json({ ok: true }); } catch (error) { const message = error instanceof Error ? error.message : "No se pudo eliminar."; return NextResponse.json({ error: message }, { status: message === "No autorizado" ? 403 : 500 }); } }
