import type { LeadSubmission } from "../site-data";

const META_PIXEL_ID = "1026193607099709";
const META_GRAPH_VERSION = process.env.META_GRAPH_API_VERSION || "v21.0";
let missingTokenWarned = false;

type MetaScheduleInput = {
  submission: LeadSubmission;
  request: Request;
};

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ");
}

function normalizePhone(value: string) {
  return value.trim().replace(/[^0-9]/g, "");
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    undefined
  );
}

function getEventSourceUrl(request: Request) {
  return (
    request.headers.get("origin") ||
    request.headers.get("referer") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    undefined
  );
}

async function buildUserData(submission: LeadSubmission, request: Request) {
  const userData: Record<string, string> = {};
  const email = normalizeText(submission.gmail);
  const phone = normalizePhone(submission.phone);
  const nameParts = normalizeText(submission.name).split(" ").filter(Boolean);

  if (email) userData.em = await sha256(email);
  if (phone) userData.ph = await sha256(phone);
  if (nameParts[0]) userData.fn = await sha256(nameParts[0]);
  if (nameParts.length > 1) userData.ln = await sha256(nameParts.slice(1).join(" "));

  const clientIp = getClientIp(request);
  const clientUserAgent = request.headers.get("user-agent");
  if (clientIp) userData.client_ip_address = clientIp;
  if (clientUserAgent) userData.client_user_agent = clientUserAgent;
  return userData;
}

export async function sendMetaSchedule({ submission, request }: MetaScheduleInput) {
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;
  if (!accessToken) {
    if (!missingTokenWarned) {
      missingTokenWarned = true;
      console.warn("[meta-capi] META_CONVERSIONS_API_TOKEN no está configurado.");
    }
    return;
  }

  const eventId = submission.id;
  const eventSourceUrl = getEventSourceUrl(request);
  const customData = {
    content_name: `${submission.vehicle} ${submission.year}`.trim(),
    content_category: "appointment",
  };
  const event = {
    event_name: "Schedule",
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: "website",
    ...(eventSourceUrl ? { event_source_url: eventSourceUrl } : {}),
    user_data: await buildUserData(submission, request),
    custom_data: customData,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: [event] }),
        signal: controller.signal,
        cache: "no-store",
      },
    );
    if (!response.ok) {
      console.error(`[meta-capi] Meta rechazó Schedule (HTTP ${response.status}).`);
    }
  } catch (error) {
    console.error(
      `[meta-capi] No se pudo enviar Schedule: ${error instanceof Error ? error.name : "error"}.`,
    );
  } finally {
    clearTimeout(timeout);
  }
}
