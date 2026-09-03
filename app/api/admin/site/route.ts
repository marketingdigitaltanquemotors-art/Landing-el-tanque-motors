import { jsonResponse, requireAdmin } from "../../../server/auth";
import { getSiteData, listSubmissions } from "../../../server/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  const [site, submissions] = await Promise.all([getSiteData(), listSubmissions()]);
  return jsonResponse({ ...site, submissions });
}
