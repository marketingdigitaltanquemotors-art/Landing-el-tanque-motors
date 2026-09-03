import { jsonResponse, requireAdmin } from "../../../server/auth";
import { saveSettings } from "../../../server/store";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const settings = await saveSettings(await request.json());
    return jsonResponse({ settings });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "No se pudo guardar la configuración." },
      { status: 400 },
    );
  }
}
