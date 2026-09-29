import { requireAdmin } from "../../../../server/auth";
import { createAppointmentsPdf } from "../../../../server/pdf";
import { listSubmissions } from "../../../../server/store";

export const dynamic = "force-dynamic";

const statusLabels = {
  pending: "Pendiente",
  attended: "Si, vino",
  no_show: "No vino",
  rescheduled: "Pospuso",
} as const;

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function addWrapped(lines: string[], label: string, value: string, width = 108) {
  const text = `${label}: ${value || "Sin dato"}`;
  for (let index = 0; index < text.length; index += width) {
    lines.push(text.slice(index, index + width));
  }
}

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const url = new URL(request.url);
  const vehicleFilter = url.searchParams.get("vehicle") || "todos";
  const dateFilter = url.searchParams.get("date") || "";
  const submissions = (await listSubmissions()).filter((submission) =>
    (vehicleFilter === "todos" || submission.vehicle === vehicleFilter) &&
    (!dateFilter || submission.date === dateFilter),
  );

  const lines = [
    "EL TANQUE MOTORS - REPORTE DE CITAS",
    `Generado: ${new Date().toLocaleString("es-DO")}`,
    `Filtros: Vehiculo = ${vehicleFilter === "todos" ? "Todos" : vehicleFilter}; Fecha = ${dateFilter ? formatDate(dateFilter) : "Todas"}`,
    `Total de citas: ${submissions.length}`,
    "",
  ];

  submissions.forEach((submission, index) => {
    lines.push(`CITA ${index + 1} ------------------------------------------------------------`);
    addWrapped(lines, "Fecha", formatDate(submission.date));
    addWrapped(lines, "Hora", submission.time);
    addWrapped(lines, "Vehiculo", `${submission.vehicle} ${submission.year}`);
    addWrapped(lines, "Nombre", submission.name);
    addWrapped(lines, "Gmail", submission.gmail);
    addWrapped(lines, "Telefono", submission.phone);
    addWrapped(lines, "ID de cita", submission.id);
    addWrapped(lines, "Creada", submission.createdAt);
    addWrapped(lines, "Inicial", String(submission.initial));
    addWrapped(lines, "Enganche", String(submission.down));
    addWrapped(lines, "Meses", String(submission.months));
    addWrapped(lines, "Periodo", submission.timeline);
    addWrapped(lines, "Precio", String(submission.price));
    addWrapped(lines, "Cuota mensual", String(submission.monthly));
    addWrapped(lines, "Estado", statusLabels[submission.appointmentStatus] || submission.appointmentStatus);
    if (submission.rescheduledDate) addWrapped(lines, "Nueva fecha", formatDate(submission.rescheduledDate));
    addWrapped(lines, "Comentario", submission.appointmentComment);
    lines.push("");
  });

  const pdf = createAppointmentsPdf(lines);
  return new Response(pdf, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="reporte-citas-${new Date().toISOString().slice(0, 10)}.pdf"`,
      "cache-control": "no-store",
    },
  });
}
