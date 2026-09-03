import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSettings, getVehicleById } from "../../server/store";
import VehicleClient from "./VehicleClient";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }> | { id: string };

async function resolveParams(params: Params) {
  return params instanceof Promise ? params : Promise.resolve(params);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await resolveParams(params);
  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    return {
      title: "Vehículo no encontrado | El Tanque Motors",
      description: "Este vehículo ya no está disponible en El Tanque Motors.",
    };
  }

  const title = `${vehicle.name} ${vehicle.year} | El Tanque Motors`;
  const description = `${vehicle.name} ${vehicle.year}, ${vehicle.km}, ${vehicle.transmission}. Precio ${new Intl.NumberFormat(
    "es-DO",
    {
      style: "currency",
      currency: "DOP",
      maximumFractionDigits: 0,
    },
  ).format(vehicle.price)}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: vehicle.images?.[0]
        ? [{ url: vehicle.images[0], alt: `${vehicle.name} ${vehicle.year}` }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: vehicle.images?.[0] ? [vehicle.images[0]] : undefined,
    },
  };
}

export default async function VehiclePage({ params }: { params: Params }) {
  const { id } = await resolveParams(params);
  const [vehicle, settings] = await Promise.all([getVehicleById(id), getSettings()]);

  if (!vehicle) notFound();

  return <VehicleClient vehicle={vehicle} settings={settings} />;
}
