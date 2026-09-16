import { listPanelUsers, PanelUser } from "./store";

const ADMIN_COOKIE = "tanque_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

export type PanelRole = "admin" | "seller";
export type PanelSession = { id: string; username: string; role: PanelRole };

function getAdminUsername() { return process.env.ADMIN_USERNAME || "admin"; }
function getAdminPassword() { return process.env.ADMIN_PASSWORD || ""; }
function getSigningSecret() { return process.env.ADMIN_SESSION_SECRET || getAdminPassword(); }

function base64UrlEncode(value: ArrayBuffer | string) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

async function digest(value: string) {
  return base64UrlEncode(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

async function sign(payload: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(getSigningSecret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64UrlEncode(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}

function parseCookies(request: Request) {
  const header = request.headers.get("cookie") || "";
  return Object.fromEntries(header.split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
    const index = part.indexOf("=");
    return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
  }));
}

export function isAdminConfigured() { return Boolean(getAdminPassword()); }

export async function getAdminConfigStatus() {
  let hasPanelUser = false;
  try { hasPanelUser = (await listPanelUsers()).some((user) => user.active); } catch { /* legacy access stays available */ }
  return { configured: isAdminConfigured() || hasPanelUser, username: getAdminUsername() };
}

export async function verifyAdminLogin(username: string, password: string): Promise<PanelSession | null> {
  if (isAdminConfigured() && username.trim() === getAdminUsername() && password === getAdminPassword()) {
    return { id: "environment-admin", username: getAdminUsername(), role: "admin" };
  }
  try {
    const user = (await listPanelUsers()).find((item: PanelUser) => item.active && item.username.toLowerCase() === username.trim().toLowerCase());
    if (!user || !constantTimeEqual(user.passwordHash, await digest(`${user.passwordSalt}:${password}`))) return null;
    return { id: user.id, username: user.username, role: user.role };
  } catch { return null; }
}

export async function createPanelPasswordHash(password: string) {
  const passwordSalt = crypto.randomUUID();
  return { passwordSalt, passwordHash: await digest(`${passwordSalt}:${password}`) };
}

export async function createAdminCookie(request: Request, session: PanelSession) {
  const payload = base64UrlEncode(JSON.stringify({ ...session, iat: Math.floor(Date.now() / 1000) }));
  const token = `${payload}.${await sign(payload)}`;
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${ADMIN_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
}

export function clearAdminCookie() { return `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`; }

export async function getPanelSession(request: Request): Promise<PanelSession | null> {
  if (!getSigningSecret()) return null;
  const token = parseCookies(request)[ADMIN_COOKIE];
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !constantTimeEqual(signature, await sign(payload))) return null;
  try {
    const decoded = JSON.parse(base64UrlDecode(payload)) as PanelSession & { iat?: number };
    const age = Math.floor(Date.now() / 1000) - Number(decoded.iat || 0);
    if (!decoded.id || !decoded.username || (decoded.role !== "admin" && decoded.role !== "seller")) return null;
    return age >= 0 && age <= SESSION_TTL_SECONDS ? { id: decoded.id, username: decoded.username, role: decoded.role } : null;
  } catch { return null; }
}

export async function isAdminRequest(request: Request) { return Boolean(await getPanelSession(request)); }

export function jsonResponse(body: unknown, init?: ResponseInit) {
  return Response.json(body, { ...init, headers: { "content-type": "application/json; charset=utf-8", ...(init?.headers || {}) } });
}

export function unauthorizedResponse() { return jsonResponse({ error: "No autorizado. Inicia sesión en el panel." }, { status: 401 }); }

export async function requireAdmin(request: Request) { return (await isAdminRequest(request)) ? null : unauthorizedResponse(); }

export async function requireAdministrator(request: Request) {
  return (await getPanelSession(request))?.role === "admin" ? null : jsonResponse({ error: "Solo un administrador puede realizar esta acción." }, { status: 403 });
}
