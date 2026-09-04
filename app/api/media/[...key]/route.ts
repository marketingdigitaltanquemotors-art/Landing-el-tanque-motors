import { getMediaObject } from "../../../server/store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> | { key: string[] } },
) {
  const { key } = await params;
  const objectKey = key.map(decodeURIComponent).join("/");
  const object = await getMediaObject(objectKey);

  if (!object) {
    return new Response("Archivo no encontrado.", { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      "cache-control": "public, max-age=31536000, immutable",
      "content-type": object.contentType,
    },
  });
}
