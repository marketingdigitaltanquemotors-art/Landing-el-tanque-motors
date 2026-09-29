import { jsonResponse, requireAdministrator } from "../../../../server/auth";
import { deleteSubmission, updateSubmissionStatus } from "../../../../server/store";

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  const unauthorized = await requireAdministrator(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const input = (await request.json()) as {
      appointmentStatus?: string;
      rescheduledDate?: string;
      appointmentComment?: string;
    };
    await updateSubmissionStatus(
      id,
      input.appointmentStatus as Parameters<typeof updateSubmissionStatus>[1],
      input.rescheduledDate,
      input.appointmentComment,
    );
    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "No se pudo actualizar la cita." },
      { status: 400 },
    );
  }
}
