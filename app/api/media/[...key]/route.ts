import { getMediaSignedUrl } from "../../../server/store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> | { key: string[] } },
) {
  const { key } = await params;
  const objectKey = key.map(decodeURIComponent).join("/");
  const signedUrl = await getMediaSignedUrl(objectKey);

  if (!signedUrl) {
    return new Response("Archivo no encontrado.", { status: 404 });
  }

  return new Response(null, {
    status: 302,
    headers: {
      location: signedUrl,
      "cache-control": "public, max-age=3600",
    },
  });
}