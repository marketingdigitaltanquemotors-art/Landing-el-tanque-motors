import { jsonResponse, requireAdmin } from "../../../server/auth";
import { listVehicles, upsertVehicle } from "../../../server/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  return jsonResponse({ vehicles: await listVehicles() });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const vehicle = await upsertVehicle(await request.json());
    return jsonResponse({ vehicle }, { status: 201 });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "No se pudo crear el vehículo." },
      { status: 400 },
    );
  }
}
