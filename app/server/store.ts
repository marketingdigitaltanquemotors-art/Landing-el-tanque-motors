import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  LeadSubmission,
  SiteSettings,
  Vehicle,
  VehicleMedia,
  defaultSettings,
  defaultVehicles,
  slugify,
} from "../site-data";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type VehicleRow = {
  id: string;
  name: string;
  year: string;
  km: string;
  fuel: string;
  transmission: string;
  price: number;
  features: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

type MediaRow = {
  key: string;
  vehicle_id: string;
  kind: "image" | "video";
  filename: string | null;
  content_type: string | null;
  size: number | null;
  sort_order: number;
  created_at?: string;
};

type LeadRow = {
  id: string;
  vehicle: string;
  year: string;
  price: number;
  down: number;
  months: number;
  monthly: number;
  date: string;
  time: string;
  name: string;
  gmail: string;
  phone: string;
  initial: string;
  timeline: string;
  created_at: string;
};

type StoredMediaObject = {
  body: ReadableStream<Uint8Array>;
  contentType: string;
};

const SETTINGS_TABLE = "site_settings";
const VEHICLES_TABLE = "vehicles";
const MEDIA_TABLE = "vehicle_media";
const SUBMISSIONS_TABLE = "lead_submissions";
const DEFAULT_BUCKET = "vehicle-media";

let supabaseClient: SupabaseClient | null = null;
let defaultsReady: Promise<void> | null = null;

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;

  if (!url || !serviceRoleKey) {
    throw new Error("Falta configurar Supabase en Vercel.");
  }

  return { url, serviceRoleKey, bucket };
}

function getSupabase() {
  if (!supabaseClient) {
    const { url, serviceRoleKey } = getSupabaseConfig();
    supabaseClient = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseClient;
}

function getStorageBucket() {
  return getSupabaseConfig().bucket;
}

function isMissingSupabaseConfig(error: unknown) {
  return error instanceof Error && error.message === "Falta configurar Supabase en Vercel.";
}

function mediaUrl(key: string) {
  return `/api/media/${key.split("/").map(encodeURIComponent).join("/")}`;
}

function requireNoError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function toMedia(row: MediaRow): VehicleMedia {
  return {
    key: row.key,
    url: mediaUrl(row.key),
    kind: row.kind,
    filename: row.filename || "archivo",
    contentType: row.content_type || "application/octet-stream",
    size: row.size || 0,
  };
}

function toVehicle(row: VehicleRow, mediaRows: MediaRow[]): Vehicle {
  const media = mediaRows
    .filter((item) => item.vehicle_id === row.id)
    .sort((left, right) => left.sort_order - right.sort_order)
    .map(toMedia);
  const imageMedia = media.filter((item) => item.kind === "image");
  const videoMedia = media.find((item) => item.kind === "video") || null;

  return {
    id: row.id,
    name: row.name,
    year: row.year,
    km: row.km,
    fuel: row.fuel,
    transmission: row.transmission,
    price: Number(row.price || 0),
    features: row.features,
    images: imageMedia.map((item) => item.url),
    imageMedia,
    video: videoMedia?.url,
    videoStorageKey: videoMedia?.key,
    videoMedia,
  };
}

async function ensureDefaults() {
  if (defaultsReady) return defaultsReady;

  defaultsReady = (async () => {
    const supabase = getSupabase();
    const now = new Date().toISOString();

    const { error: settingsError } = await supabase.from(SETTINGS_TABLE).upsert(
      {
        id: "site",
        value: defaultSettings as unknown as JsonValue,
        updated_at: now,
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
    requireNoError(settingsError);

    const { count, error: countError } = await supabase
      .from(VEHICLES_TABLE)
      .select("id", { count: "exact", head: true });
    requireNoError(countError);

    if (!count) {
      const vehicle = defaultVehicles[0];
      const { error: vehicleError } = await supabase.from(VEHICLES_TABLE).insert({
        id: vehicle.id,
        name: vehicle.name,
        year: vehicle.year,
        km: vehicle.km,
        fuel: vehicle.fuel,
        transmission: vehicle.transmission,
        price: vehicle.price,
        features: vehicle.features,
        sort_order: 0,
        created_at: now,
        updated_at: now,
      });
      requireNoError(vehicleError);
    }
  })().catch((error) => {
    defaultsReady = null;
    throw error;
  });

  return defaultsReady;
}

export async function getSettings() {
  try {
    await ensureDefaults();
    const { data, error } = await getSupabase()
      .from(SETTINGS_TABLE)
      .select("value")
      .eq("id", "site")
      .maybeSingle<{ value: SiteSettings }>();
    requireNoError(error);

    return { ...defaultSettings, ...(data?.value || {}) };
  } catch (error) {
    if (isMissingSupabaseConfig(error)) return defaultSettings;
    throw error;
  }
}

export async function saveSettings(settings: SiteSettings) {
  await ensureDefaults();
  const { error } = await getSupabase().from(SETTINGS_TABLE).upsert({
    id: "site",
    value: { ...defaultSettings, ...settings } as unknown as JsonValue,
    updated_at: new Date().toISOString(),
  });
  requireNoError(error);

  return getSettings();
}

export async function listVehicles() {
  try {
    await ensureDefaults();
    const supabase = getSupabase();
    const [{ data: vehicles, error: vehiclesError }, { data: media, error: mediaError }] =
      await Promise.all([
        supabase
          .from(VEHICLES_TABLE)
          .select("*")
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
        supabase
          .from(MEDIA_TABLE)
          .select("*")
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
      ]);
    requireNoError(vehiclesError);
    requireNoError(mediaError);

    return ((vehicles || []) as VehicleRow[]).map((vehicle) =>
      toVehicle(vehicle, (media || []) as MediaRow[]),
    );
  } catch (error) {
    if (isMissingSupabaseConfig(error)) return defaultVehicles;
    throw error;
  }
}

export async function getVehicleById(id: string) {
  try {
    await ensureDefaults();
    const supabase = getSupabase();
    const [{ data: vehicle, error: vehicleError }, { data: media, error: mediaError }] =
      await Promise.all([
        supabase.from(VEHICLES_TABLE).select("*").eq("id", id).maybeSingle<VehicleRow>(),
        supabase
          .from(MEDIA_TABLE)
          .select("*")
          .eq("vehicle_id", id)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
      ]);
    requireNoError(vehicleError);
    requireNoError(mediaError);

    if (!vehicle) return null;
    return toVehicle(vehicle, (media || []) as MediaRow[]);
  } catch (error) {
    if (isMissingSupabaseConfig(error)) {
      return defaultVehicles.find((item) => item.id === id) || null;
    }
    throw error;
  }
}

export async function getSiteData() {
  const [settings, vehicles] = await Promise.all([getSettings(), listVehicles()]);
  return { settings, vehicles };
}

export async function upsertVehicle(input: Partial<Vehicle> & { id?: string }) {
  await ensureDefaults();
  const supabase = getSupabase();
  const now = new Date().toISOString();
  const fallbackName = input.name?.trim() || "Nuevo vehículo";
  const id = input.id?.trim() || `${slugify(fallbackName) || "vehiculo"}-${Date.now()}`;
  const current = input.id ? await getVehicleById(input.id) : null;

  const vehicle = {
    id,
    name: fallbackName,
    year: input.year?.trim() || current?.year || "2024",
    km: input.km?.trim() || current?.km || "0 km",
    fuel: input.fuel?.trim() || current?.fuel || "Gasolina",
    transmission: input.transmission?.trim() || current?.transmission || "Automático",
    price: Math.max(0, Math.round(Number(input.price || current?.price || 0))),
    features: input.features?.trim() || current?.features || "Motor\nPantalla\nCámara\nAsientos",
    updated_at: now,
  };

  if (current) {
    const { error } = await supabase.from(VEHICLES_TABLE).update(vehicle).eq("id", id);
    requireNoError(error);
  } else {
    const { count, error: countError } = await supabase
      .from(VEHICLES_TABLE)
      .select("id", { count: "exact", head: true });
    requireNoError(countError);

    const { error } = await supabase.from(VEHICLES_TABLE).insert({
      ...vehicle,
      sort_order: Number(count || 0),
      created_at: now,
    });
    requireNoError(error);
  }

  return getVehicleById(vehicle.id);
}

export async function deleteVehicle(id: string) {
  await ensureDefaults();
  const supabase = getSupabase();
  const bucket = getStorageBucket();
  const { data: media, error: mediaError } = await supabase
    .from(MEDIA_TABLE)
    .select("key")
    .eq("vehicle_id", id);
  requireNoError(mediaError);

  const keys = ((media || []) as Pick<MediaRow, "key">[]).map((item) => item.key);
  if (keys.length) {
    const { error } = await supabase.storage.from(bucket).remove(keys);
    requireNoError(error);
  }

  const { error } = await supabase.from(VEHICLES_TABLE).delete().eq("id", id);
  requireNoError(error);
}

export async function saveVehicleMedia(vehicleId: string, file: File, kind: "image" | "video") {
  await ensureDefaults();
  const vehicle = await getVehicleById(vehicleId);
  if (!vehicle) throw new Error("Vehículo no encontrado.");

  const contentType = file.type || "application/octet-stream";
  if (kind === "image" && !contentType.startsWith("image/")) {
    throw new Error("Solo se permiten imágenes.");
  }
  if (kind === "video" && contentType !== "video/mp4") {
    throw new Error("Solo se permiten videos MP4.");
  }
  if (kind === "image" && file.size > 8 * 1024 * 1024) {
    throw new Error("Cada imagen debe pesar menos de 8 MB.");
  }
  if (kind === "video" && file.size > 120 * 1024 * 1024) {
    throw new Error("El video debe pesar menos de 120 MB.");
  }

  if (kind === "video" && vehicle.videoStorageKey) {
    await deleteMedia(vehicle.videoStorageKey);
  }

  const safeName = slugify(file.name.replace(/\.[^.]+$/, "")) || kind;
  const key = `vehicles/${vehicleId}/${kind}/${crypto.randomUUID()}-${safeName}`;
  const supabase = getSupabase();
  const bucket = getStorageBucket();
  const body = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage.from(bucket).upload(key, body, {
    contentType,
    upsert: false,
  });
  requireNoError(uploadError);

  const { data: maxSort, error: sortError } = await supabase
    .from(MEDIA_TABLE)
    .select("sort_order")
    .eq("vehicle_id", vehicleId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle<Pick<MediaRow, "sort_order">>();
  requireNoError(sortError);

  const { error: mediaError } = await supabase.from(MEDIA_TABLE).insert({
    key,
    vehicle_id: vehicleId,
    kind,
    filename: file.name,
    content_type: contentType,
    size: file.size,
    sort_order: Number(maxSort?.sort_order ?? -1) + 1,
    created_at: new Date().toISOString(),
  });
  requireNoError(mediaError);

  return getVehicleById(vehicleId);
}

export async function deleteMedia(key: string) {
  await ensureDefaults();
  const supabase = getSupabase();
  const bucket = getStorageBucket();
  const { error: storageError } = await supabase.storage.from(bucket).remove([key]);
  requireNoError(storageError);

  const { error: mediaError } = await supabase.from(MEDIA_TABLE).delete().eq("key", key);
  requireNoError(mediaError);
}

export async function getMediaObject(key: string): Promise<StoredMediaObject | null> {
  await ensureDefaults();
  const supabase = getSupabase();
  const { data: allowed, error: mediaError } = await supabase
    .from(MEDIA_TABLE)
    .select("key, content_type")
    .eq("key", key)
    .maybeSingle<Pick<MediaRow, "key" | "content_type">>();
  requireNoError(mediaError);
  if (!allowed) return null;

  const { data, error } = await supabase.storage.from(getStorageBucket()).download(key);
  requireNoError(error);
  if (!data) return null;

  return {
    body: data.stream() as ReadableStream<Uint8Array>,
    contentType: allowed.content_type || data.type || "application/octet-stream",
  };
}

export async function addSubmission(input: Omit<LeadSubmission, "id" | "createdAt">) {
  await ensureDefaults();
  const required = [input.vehicle, input.date, input.time, input.name, input.phone, input.timeline];
  if (required.some((value) => !String(value || "").trim())) {
    throw new Error("Faltan datos obligatorios.");
  }

  const submission: LeadSubmission = {
    ...input,
    id: `lead-${crypto.randomUUID()}`,
    vehicle: input.vehicle.trim(),
    year: input.year.trim(),
    price: Math.max(0, Math.round(Number(input.price || 0))),
    down: Math.max(0, Math.round(Number(input.down || 0))),
    months: Math.max(0, Math.round(Number(input.months || 0))),
    monthly: Math.max(0, Math.round(Number(input.monthly || 0))),
    name: input.name.trim(),
    gmail: input.gmail.trim(),
    phone: input.phone.trim(),
    initial: input.initial.trim(),
    timeline: input.timeline.trim(),
    createdAt: new Date().toISOString(),
  };

  const { error } = await getSupabase().from(SUBMISSIONS_TABLE).insert({
    id: submission.id,
    vehicle: submission.vehicle,
    year: submission.year,
    price: submission.price,
    down: submission.down,
    months: submission.months,
    monthly: submission.monthly,
    date: submission.date,
    time: submission.time,
    name: submission.name,
    gmail: submission.gmail,
    phone: submission.phone,
    initial: submission.initial,
    timeline: submission.timeline,
    created_at: submission.createdAt,
  });
  requireNoError(error);

  return submission;
}

export async function listSubmissions() {
  try {
    await ensureDefaults();
    const { data, error } = await getSupabase()
      .from(SUBMISSIONS_TABLE)
      .select("*")
      .order("created_at", { ascending: false });
    requireNoError(error);

    return ((data || []) as LeadRow[]).map((row) => ({
      id: row.id,
      vehicle: row.vehicle,
      year: row.year,
      price: Number(row.price || 0),
      down: Number(row.down || 0),
      months: Number(row.months || 0),
      monthly: Number(row.monthly || 0),
      date: row.date,
      time: row.time,
      name: row.name,
      gmail: row.gmail,
      phone: row.phone,
      initial: row.initial,
      timeline: row.timeline,
      createdAt: row.created_at,
    }));
  } catch (error) {
    if (isMissingSupabaseConfig(error)) return [];
    throw error;
  }
}
