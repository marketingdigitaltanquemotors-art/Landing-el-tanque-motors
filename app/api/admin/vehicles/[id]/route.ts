import { jsonResponse, requireAdmin } from "../../../../server/auth";
import { deleteVehicle, listVehicles, upsertVehicle } from "../../../../server/store";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const vehicle = await upsertVehicle({ ...(await request.json()), id });
    return jsonResponse({ vehicle });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "No se pudo actualizar el vehículo." },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const vehicles = await listVehicles();
  if (vehicles.length <= 1) {
    return jsonResponse({ error: "Debes dejar al menos un vehículo." }, { status: 400 });
  }

  await deleteVehicle(id);
  return jsonResponse({ ok: true, vehicles: await listVehicles() });
}
