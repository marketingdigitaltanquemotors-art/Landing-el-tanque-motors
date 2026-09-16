import {
  createAdminCookie,
  getAdminConfigStatus,
  jsonResponse,
  verifyAdminLogin,
} from "../../../server/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return jsonResponse(await getAdminConfigStatus());
}

export async function POST(request: Request) {
  const { username = "", password = "" } = (await request
    .json()
    .catch(() => ({}))) as { username?: string; password?: string };

  const session = await verifyAdminLogin(String(username), String(password));
  if (!session) {
    return jsonResponse(
      { error: "Credenciales inválidas o ADMIN_PASSWORD no configurado." },
      { status: 401 },
    );
  }

  return jsonResponse(
    { ok: true, user: { username: session.username, role: session.role } },
    { headers: { "set-cookie": await createAdminCookie(request, session) } },
  );
}
