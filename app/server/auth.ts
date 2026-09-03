const ADMIN_COOKIE = "tanque_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function getAdminUsername() {
  return process.env.ADMIN_USERNAME || "admin";
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function getSigningSecret() {
  return process.env.ADMIN_SESSION_SECRET || getAdminPassword();
}

function base64UrlEncode(value: ArrayBuffer | string) {
  const bytes =
    typeof value === "string"
      ? new TextEncoder().encode(value)
      : new Uint8Array(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function sign(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSigningSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return base64UrlEncode(signature);
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let i = 0; i < left.length; i += 1) {
    result |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return result === 0;
}

function parseCookies(request: Request) {
  const header = request.headers.get("cookie") || "";
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      }),
  );
}

export function isAdminConfigured() {
  return Boolean(getAdminPassword());
}

export function getAdminConfigStatus() {
  return {
    configured: isAdminConfigured(),
    username: getAdminUsername(),
  };
}

export async function verifyAdminLogin(username: string, password: string) {
  return (
    isAdminConfigured() &&
    username.trim() === getAdminUsername() &&
    password === getAdminPassword()
  );
}

export async function createAdminCookie(request: Request) {
  const payload = base64UrlEncode(
    JSON.stringify({ sub: "admin", iat: Math.floor(Date.now() / 1000) }),
  );
  const token = `${payload}.${await sign(payload)}`;
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${ADMIN_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
}

export function clearAdminCookie() {
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export async function isAdminRequest(request: Request) {
  if (!isAdminConfigured()) return false;
  const token = parseCookies(request)[ADMIN_COOKIE];
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (!constantTimeEqual(signature, await sign(payload))) return false;

  try {
    const decoded = JSON.parse(base64UrlDecode(payload)) as { iat?: number; sub?: string };
    const age = Math.floor(Date.now() / 1000) - Number(decoded.iat || 0);
    return decoded.sub === "admin" && age >= 0 && age <= SESSION_TTL_SECONDS;
  } catch {
    return false;
  }
}

export function jsonResponse(body: unknown, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init?.headers || {}),
    },
  });
}

export function unauthorizedResponse() {
  return jsonResponse(
    { error: "No autorizado. Inicia sesión en el panel." },
    { status: 401 },
  );
}

export async function requireAdmin(request: Request) {
  if (await isAdminRequest(request)) return null;
  return unauthorizedResponse();
}
