import { jsonResponse, requireAdministrator } from "../../../../server/auth";
import { deleteSubmission } from "../../../../server/store";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  const unauthorized = await requireAdministrator(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    await deleteSubmission(id);
    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "No se pudo eliminar la cita." },
      { status: 400 },
    );
  }
}
