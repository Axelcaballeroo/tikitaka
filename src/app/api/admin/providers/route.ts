import { NextResponse } from "next/server";
import { adminDatabase } from "@/lib/data/admin-providers";
import { adminFailure, saveAdminProvider } from "@/lib/admin-provider-api";
export async function POST(request: Request) {
  try {
    await adminDatabase();
    const body = await request.json();
    return NextResponse.json(await saveAdminProvider(body, body?.id, true));
  } catch (error) {
    return adminFailure(error);
  }
}
