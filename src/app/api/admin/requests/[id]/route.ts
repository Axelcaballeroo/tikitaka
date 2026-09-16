import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/profile";
import { adminFailure } from "@/lib/admin-provider-api";
async function retired() {
  try {
    await requireAdminApi();
    return NextResponse.json(
      {
        error:
          "Las solicitudes históricas se conservan para consulta. Gestioná el proveedor desde Proveedores.",
      },
      { status: 409 },
    );
  } catch (e) {
    return adminFailure(e);
  }
}
export const PATCH = retired;
export const DELETE = retired;
