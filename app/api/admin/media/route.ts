import { jsonResponse, requireAdmin } from "../../../server/auth";
import {
  completeVehicleMediaUpload,
  createVehicleMediaUpload,
  deleteMedia,
  getVehicleById,
  saveVehicleMedia,
} from "../../../server/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    if (request.headers.get("content-type")?.includes("application/json")) {
      const input = (await request.json()) as {
        action?: string;
        vehicleId?: string;
        kind?: string;
        key?: string;
        filename?: string;
        contentType?: string;
        size?: number;
      };
      const vehicleId = String(input.vehicleId || "");
      const kind = input.kind === "image" || input.kind === "video" ? input.kind : null;
      if (!vehicleId || !kind) {
        return jsonResponse({ error: "Archivo inválido." }, { status: 400 });
      }

      if (input.action === "sign") {
        const upload = await createVehicleMediaUpload(vehicleId, {
          kind,
          filename: String(input.filename || "archivo"),
          contentType: String(input.contentType || "application/octet-stream"),
          size: Number(input.size || 0),
        });
        return jsonResponse(upload, { status: 201 });
      }

      if (input.action === "complete") {
        const vehicle = await completeVehicleMediaUpload(vehicleId, {
          kind,
          key: String(input.key || ""),
          filename: String(input.filename || "archivo"),
          contentType: String(input.contentType || "application/octet-stream"),
          size: Number(input.size || 0),
        });
        return jsonResponse({ vehicle }, { status: 201 });
      }

      return jsonResponse({ error: "Acción inválida." }, { status: 400 });
    }

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
