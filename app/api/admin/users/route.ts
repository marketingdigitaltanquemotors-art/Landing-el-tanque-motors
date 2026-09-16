import { createPanelPasswordHash, jsonResponse, requireAdministrator } from "../../../server/auth";
import { listPanelUsers, savePanelUser } from "../../../server/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const unauthorized = await requireAdministrator(request);
  if (unauthorized) return unauthorized;

  const users = await listPanelUsers();
  return jsonResponse({ users: users.map(({ passwordHash, passwordSalt, ...user }) => user) });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdministrator(request);
  if (unauthorized) return unauthorized;

  try {
    const { username = "", password = "", role = "seller" } = (await request.json().catch(() => ({}))) as {
      username?: string;
      password?: string;
      role?: string;
    };
    const cleanUsername = String(username).trim();
    if (!/^[a-zA-Z0-9._-]{3,48}$/.test(cleanUsername)) {
      return jsonResponse({ error: "El usuario debe tener 3 a 48 caracteres: letras, números, punto, guion o guion bajo." }, { status: 400 });
    }
    if (String(password).length < 8) {
      return jsonResponse({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
    }
    if (role !== "seller" && role !== "admin") {
      return jsonResponse({ error: "Rol inválido." }, { status: 400 });
    }

    const hashes = await createPanelPasswordHash(String(password));
    const user = await savePanelUser({
      id: `panel-${crypto.randomUUID()}`,
      username: cleanUsername,
      role,
      active: true,
      createdAt: new Date().toISOString(),
      ...hashes,
    });
    const { passwordHash, passwordSalt, ...safeUser } = user;
    return jsonResponse({ user: safeUser }, { status: 201 });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "No se pudo crear el usuario." }, { status: 400 });
  }
}
