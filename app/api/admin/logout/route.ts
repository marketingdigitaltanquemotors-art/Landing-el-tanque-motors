import { clearAdminCookie, jsonResponse } from "../../../server/auth";

export async function POST() {
  return jsonResponse({ ok: true }, { headers: { "set-cookie": clearAdminCookie() } });
}
