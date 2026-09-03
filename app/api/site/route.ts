import { jsonResponse } from "../../server/auth";
import { getSiteData } from "../../server/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return jsonResponse(await getSiteData());
}
