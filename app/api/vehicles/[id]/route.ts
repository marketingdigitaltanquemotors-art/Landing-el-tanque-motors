import { jsonResponse } from "../../../server/auth";
import { getVehicleById } from "../../../server/store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  const { id } = await params;
  const vehicle = await getVehicleById(id);
  if (!vehicle) return jsonResponse({ error: "Vehículo no encontrado." }, { status: 404 });
  return jsonResponse({ vehicle });
}
