import type { MetadataRoute } from "next";
import { getSiteData } from "./server/store";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://el-tanque-motors.com";
  const { vehicles } = await getSiteData();

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...vehicles.map((vehicle) => ({
      url: `${siteUrl}/vehiculo/${vehicle.id}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
  ];
}
