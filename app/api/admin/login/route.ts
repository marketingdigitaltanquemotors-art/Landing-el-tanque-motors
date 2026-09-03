import {
  createAdminCookie,
  getAdminConfigStatus,
  jsonResponse,
  verifyAdminLogin,
} from "../../../server/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return jsonResponse(getAdminConfigStatus());
}

export async function POST(request: Request) {
  const { username = "", password = "" } = (await request
    .json()
    .catch(() => ({}))) as { username?: string; password?: string };

  if (!(await verifyAdminLogin(String(username), String(password)))) {
    return jsonResponse(
      { error: "Credenciales inválidas o ADMIN_PASSWORD no configurado." },
      { status: 401 },
    );
  }

  return jsonResponse(
    { ok: true },
    { headers: { "set-cookie": await createAdminCookie(request) } },
  );
}
