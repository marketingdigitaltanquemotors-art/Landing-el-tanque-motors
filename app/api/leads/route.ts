import { jsonResponse } from "../../server/auth";
import { addSubmission } from "../../server/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const submission = await addSubmission({
      vehicle: String(body.vehicle || ""),
      year: String(body.year || ""),
      price: Number(body.price || 0),
      down: Number(body.down || 0),
      months: Number(body.months || 0),
      monthly: Number(body.monthly || 0),
      date: String(body.date || ""),
      time: String(body.time || ""),
      name: String(body.name || ""),
      gmail: String(body.gmail || ""),
      phone: String(body.phone || ""),
      initial: String(body.initial || ""),
      timeline: String(body.timeline || ""),
    });
    return jsonResponse({ submission }, { status: 201 });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "No se pudo registrar la cita." },
      { status: 400 },
    );
  }
}
