"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const weekdayHours = [
  "8:30 AM",
  "9:30 AM",
  "10:30 AM",
  "11:30 AM",
  "12:30 PM",
  "1:30 PM",
  "2:30 PM",
  "3:30 PM",
  "4:30 PM",
  "5:30 PM",
];

const saturdayHours = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
];

function getDayInfo(value: string) {
  if (!value) return { isSunday: false, hours: [] as string[] };
  const date = new Date(`${value}T12:00:00`);
  const day = date.getDay();

  if (day === 0) {
    return { isSunday: true, hours: [] as string[] };
  }

  return {
    isSunday: false,
    hours: day === 6 ? saturdayHours : weekdayHours,
  };
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("es-DO", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildCalendarDays(baseDate: Date) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const days: Array<{ label: number; value: string; disabled: boolean } | null> = [];
  const now = new Date();
  const todayValue = formatDateValue(
    new Date(now.getFullYear(), now.getMonth(), now.getDate()),
  );

  for (let i = 0; i < startOffset; i += 1) {
    days.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const current = new Date(year, month, day);
    const value = formatDateValue(current);
    const isSunday = current.getDay() === 0;
    const isPast = value < todayValue;

    days.push({
      label: day,
      value,
      disabled: isSunday || isPast,
    });
  }

  return days;
}

function parseHourLabel(value: string) {
  const [time, meridiem] = value.split(" ");
  const [rawHour, rawMinute] = time.split(":").map(Number);
  let hour = rawHour;

  if (meridiem === "PM" && hour !== 12) {
    hour += 12;
  }

  if (meridiem === "AM" && hour === 12) {
    hour = 0;
  }

  return { hour, minute: rawMinute };
}

export default function SchedulePage() {
  const searchParams = useSearchParams();
  const vehicle = searchParams.get("vehicle") ?? "Vehículo";
  const year = searchParams.get("year") ?? "";
  const price = Number(searchParams.get("price") ?? 0);
  const down = Number(searchParams.get("down") ?? 20);
  const months = Number(searchParams.get("months") ?? 48);
  const monthly = Number(searchParams.get("monthly") ?? 0);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [monthView, setMonthView] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [name, setName] = useState("");
  const [gmail, setGmail] = useState("");
  const [phone, setPhone] = useState("");
  const [timeline, setTimeline] = useState("");
  const [initial, setInitial] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const dayInfo = useMemo(() => getDayInfo(date), [date]);
  const calendarDays = useMemo(() => buildCalendarDays(monthView), [monthView]);
  const availableHours = useMemo(() => {
    if (!date) return [];

    const now = new Date();
    const todayValue = formatDateValue(
      new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    );

    if (date !== todayValue) {
      return dayInfo.hours;
    }

    return dayInfo.hours.filter((hourLabel) => {
      const { hour, minute } = parseHourLabel(hourLabel);
      const optionTime = new Date(now);
      optionTime.setHours(hour, minute, 0, 0);
      return optionTime.getTime() > now.getTime();
    });
  }, [date, dayInfo.hours]);
  const showForm = Boolean(date && time && !dayInfo.isSunday);

  function handleDateChange(value: string) {
    setDate(value);
    setTime("");
    setSubmitted(false);
    setFormError("");
  }

  function moveMonth(direction: number) {
    setMonthView(
      (current) => new Date(current.getFullYear(), current.getMonth() + direction, 1),
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      setFormError("Completa tu nombre y número de teléfono.");
      setSubmitted(false);
      return;
    }

    if (!timeline) {
      setFormError("Selecciona tu periodo estimado de compra.");
      setSubmitted(false);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          vehicle,
          year,
          price,
          down,
          months,
          monthly,
          date,
          time,
          name,
          gmail,
          phone,
          initial,
          timeline,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || "No se pudo registrar la cita.");
      }

      setFormError("");
      setSubmitted(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No se pudo registrar la cita.");
      setSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="schedule-page">
      <section className="schedule-shell">
        <div className="schedule-header">
          <p className="eyebrow">AGENDA TU CITA</p>
          <h1>Elige el día y la hora para verlo.</h1>
          <p className="schedule-copy">
            Selecciona tu horario disponible y después llena tus datos para
            apartar tu cita.
          </p>
        </div>

        <div className="schedule-layout">
          <section className="schedule-card">
            <p className="eyebrow">HORARIOS DISPONIBLES</p>
            <h2>Agenda tu visita</h2>

            <div className="schedule-field">
              Día disponible
              <div className="calendar-card">
                <div className="calendar-top">
                  <strong>{monthLabel(monthView)}</strong>
                  <div className="calendar-nav">
                    <button
                      type="button"
                      onClick={() => moveMonth(-1)}
                      aria-label="Mes anterior"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => moveMonth(1)}
                      aria-label="Mes siguiente"
                    >
                      →
                    </button>
                  </div>
                </div>
                <div className="calendar-weekdays">
                  <span>Lun</span>
                  <span>Mar</span>
                  <span>Mié</span>
                  <span>Jue</span>
                  <span>Vie</span>
                  <span>Sáb</span>
                  <span>Dom</span>
                </div>
                <div className="calendar-grid">
                  {calendarDays.map((item, index) =>
                    item ? (
                      <button
                        key={`${item.value}-${index}`}
                        type="button"
                        className={`calendar-day${date === item.value ? " active" : ""}`}
                        disabled={item.disabled}
                        onClick={() => handleDateChange(item.value)}
                      >
                        {item.label}
                      </button>
                    ) : (
                      <span
                        key={`empty-${index}`}
                        className="calendar-day calendar-day-empty"
                      />
                    ),
                  )}
                </div>
              </div>
            </div>

            {dayInfo.isSunday && (
              <div className="schedule-alert">
                Los domingos no laboramos. Elige de lunes a sábado.
              </div>
            )}

            <div className="schedule-field">
              Hora disponible
              <div className="time-pills">
                {availableHours.length ? (
                  availableHours.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      className={`time-pill${time === hour ? " active" : ""}`}
                      onClick={() => setTime(hour)}
                    >
                      {hour}
                    </button>
                  ))
                ) : (
                  <div className="time-placeholder">
                    {date
                      ? "Ya no quedan horas disponibles para ese día."
                      : "Selecciona un día disponible para ver las horas."}
                  </div>
                )}
              </div>
            </div>

            <div className="schedule-hours">
              <div>
                <strong>Lunes a viernes</strong>
                <span>8:30 AM a 5:30 PM</span>
              </div>
              <div>
                <strong>Sábados</strong>
                <span>9:00 AM a 4:00 PM</span>
              </div>
            </div>
          </section>
        </div>

        {showForm && (
          <section className="schedule-card contact-card">
            <p className="eyebrow">CONFIRMA TU CITA</p>
            <h2>Completa tus datos</h2>
            <form className="schedule-form" onSubmit={handleSubmit}>
              <div className="schedule-grid">
                <label className="schedule-field">
                  Nombre
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </label>
                <label className="schedule-field">
                  Gmail
                  <input
                    type="email"
                    value={gmail}
                    onChange={(e) => setGmail(e.target.value)}
                    required
                  />
                </label>
                <label className="schedule-field">
                  Número de teléfono
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </label>
                <label className="schedule-field">
                  Ingresa tu inicial
                  <input
                    type="text"
                    value={initial}
                    onChange={(e) => setInitial(e.target.value)}
                    placeholder="Ejemplo: RD$97,000"
                    required
                  />
                </label>
              </div>

              <div className="schedule-check-group">
                <p className="schedule-check-title">
                  ¿Tienes un periodo de tiempo en el que planeas comprar tu
                  vehículo?
                </p>
                <div className="schedule-check-options">
                  {[
                    "Ya mismo",
                    "Próximos 15-30 días",
                    "De 1 a 3 meses",
                    "Más de 3 meses",
                  ].map((option) => (
                    <label className="schedule-check" key={option}>
                      <input
                        type="radio"
                        name="purchase-window"
                        required
                        checked={timeline === option}
                        onChange={() => setTimeline(option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formError && <div className="schedule-alert">{formError}</div>}

              <button className="btn schedule-submit" type="submit" disabled={submitting}>
                {submitting ? "Registrando..." : "Confirmar cita"} <span>↗</span>
              </button>
            </form>

            {submitted && (
              <div className="success schedule-success">
                ✓ Tu cita quedó registrada para el {date} a las {time}. Te
                contactaremos con la confirmación.
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}
