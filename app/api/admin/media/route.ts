import { jsonResponse, requireAdmin } from "../../../server/auth";
import { deleteMedia, getVehicleById, saveVehicleMedia } from "../../../server/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const formData = await request.formData();
    const vehicleId = String(formData.get("vehicleId") || "");
    const kind = String(formData.get("kind") || "");
    const file = formData.get("file");

    if (!(file instanceof File) || (kind !== "image" && kind !== "video")) {
      return jsonResponse({ error: "Archivo inválido." }, { status: 400 });
    }

    const vehicle = await saveVehicleMedia(vehicleId, file, kind);
    return jsonResponse({ vehicle }, { status: 201 });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "No se pudo guardar el archivo." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const vehicleId = url.searchParams.get("vehicleId");
  if (!key || !vehicleId) {
    return jsonResponse({ error: "Falta el archivo a eliminar." }, { status: 400 });
  }

  await deleteMedia(key);
  return jsonResponse({ vehicle: await getVehicleById(vehicleId) });
}
