import {
  LeadSubmission,
  SiteSettings,
  Vehicle,
  VehicleMedia,
  defaultSettings,
  defaultVehicles,
  slugify,
} from "../site-data";

type RuntimeEnv = {
  DB?: D1Database;
  MEDIA?: R2Bucket;
};

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
};

type MediaRow = {
  key: string;
  vehicle_id: string;
  kind: "image" | "video";
  filename: string | null;
  content_type: string | null;
  size: number | null;
  sort_order: number;
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

let runtimeEnv: Promise<RuntimeEnv> | null = null;
let schemaReady: Promise<void> | null = null;

async function getRuntimeEnv() {
  if (!runtimeEnv) {
    runtimeEnv = import("cloudflare:workers")
      .then((module) => module.env as RuntimeEnv)
      .catch(() => ({}));
  }
  return runtimeEnv;
}

async function getDb() {
  const currentEnv = await getRuntimeEnv();
  if (!currentEnv.DB) {
    throw new Error("Falta configurar el binding D1 DB.");
  }
  return currentEnv.DB;
}

async function getBucket() {
  const currentEnv = await getRuntimeEnv();
  if (!currentEnv.MEDIA) {
    throw new Error("Falta configurar el bucket R2 MEDIA.");
  }
  return currentEnv.MEDIA;
}

function mediaUrl(key: string) {
  return `/api/media/${key.split("/").map(encodeURIComponent).join("/")}`;
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

async function ensureSchema() {
  if (schemaReady) return schemaReady;

  schemaReady = (async () => {
    const db = await getDb();
    await db.batch([
      db.prepare(
        `CREATE TABLE IF NOT EXISTS settings (
          id TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )`,
      ),
      db.prepare(
        `CREATE TABLE IF NOT EXISTS vehicles (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          year TEXT NOT NULL,
          km TEXT NOT NULL,
          fuel TEXT NOT NULL,
          transmission TEXT NOT NULL,
          price INTEGER NOT NULL DEFAULT 0,
          features TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )`,
      ),
      db.prepare(
        `CREATE TABLE IF NOT EXISTS media (
          key TEXT PRIMARY KEY,
          vehicle_id TEXT NOT NULL,
          kind TEXT NOT NULL CHECK (kind IN ('image', 'video')),
          filename TEXT,
          content_type TEXT,
          size INTEGER,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
        )`,
      ),
      db.prepare(
        `CREATE TABLE IF NOT EXISTS submissions (
          id TEXT PRIMARY KEY,
          vehicle TEXT NOT NULL,
          year TEXT NOT NULL,
          price INTEGER NOT NULL DEFAULT 0,
          down INTEGER NOT NULL DEFAULT 20,
          months INTEGER NOT NULL DEFAULT 48,
          monthly INTEGER NOT NULL DEFAULT 0,
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          name TEXT NOT NULL,
          gmail TEXT NOT NULL,
          phone TEXT NOT NULL,
          initial TEXT NOT NULL,
          timeline TEXT NOT NULL,
          created_at TEXT NOT NULL
        )`,
      ),
      db.prepare("CREATE INDEX IF NOT EXISTS idx_media_vehicle ON media(vehicle_id)"),
      db.prepare("CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(created_at)"),
      db.prepare("CREATE INDEX IF NOT EXISTS idx_submissions_vehicle_date ON submissions(vehicle, date)"),
    ]);

    const now = new Date().toISOString();
    await db
      .prepare(
        `INSERT INTO settings (id, value, updated_at)
        VALUES ('site', ?1, ?2)
        ON CONFLICT(id) DO NOTHING`,
      )
      .bind(JSON.stringify(defaultSettings), now)
      .run();

    const count = await db
      .prepare("SELECT COUNT(*) AS total FROM vehicles")
      .first<{ total: number }>();

    if (!count?.total) {
      const vehicle = defaultVehicles[0];
      await db
        .prepare(
          `INSERT INTO vehicles (
            id, name, year, km, fuel, transmission, price, features, sort_order, created_at, updated_at
          ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 0, ?9, ?9)`,
        )
        .bind(
          vehicle.id,
          vehicle.name,
          vehicle.year,
          vehicle.km,
          vehicle.fuel,
          vehicle.transmission,
          vehicle.price,
          vehicle.features,
          now,
        )
        .run();
    }

    await db.prepare("PRAGMA optimize").run();
  })().catch((error) => {
    schemaReady = null;
    throw error;
  });

  return schemaReady;
}

function isMissingBinding(error: unknown) {
  return error instanceof Error && error.message.startsWith("Falta configurar");
}

export async function getSettings() {
  let row: { value: string } | null = null;

  try {
    await ensureSchema();
    const db = await getDb();
    row = await db
      .prepare("SELECT value FROM settings WHERE id = 'site'")
      .first<{ value: string }>();
  } catch (error) {
    if (isMissingBinding(error)) return defaultSettings;
    throw error;
  }

  if (!row?.value) return defaultSettings;

  try {
    return { ...defaultSettings, ...(JSON.parse(row.value) as SiteSettings) };
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings: SiteSettings) {
  await ensureSchema();
  const now = new Date().toISOString();
  const db = await getDb();
  await db
    .prepare(
      `INSERT INTO settings (id, value, updated_at)
      VALUES ('site', ?1, ?2)
      ON CONFLICT(id) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    )
    .bind(JSON.stringify({ ...defaultSettings, ...settings }), now)
    .run();
  return getSettings();
}

export async function listVehicles() {
  let vehicles: D1Result<VehicleRow>;
  let media: D1Result<MediaRow>;

  try {
    await ensureSchema();
    const db = await getDb();
    vehicles = await db
      .prepare("SELECT * FROM vehicles ORDER BY sort_order ASC, created_at ASC")
      .all<VehicleRow>();
    media = await db
      .prepare("SELECT * FROM media ORDER BY sort_order ASC, created_at ASC")
      .all<MediaRow>();
  } catch (error) {
    if (isMissingBinding(error)) return defaultVehicles;
    throw error;
  }

  return vehicles.results.map((vehicle) => toVehicle(vehicle, media.results));
}

export async function getVehicleById(id: string) {
  let vehicle: VehicleRow | null = null;
  let media: D1Result<MediaRow>;

  try {
    await ensureSchema();
    const db = await getDb();
    vehicle = await db
      .prepare("SELECT * FROM vehicles WHERE id = ?1")
      .bind(id)
      .first<VehicleRow>();
    media = await db
      .prepare("SELECT * FROM media WHERE vehicle_id = ?1 ORDER BY sort_order ASC, created_at ASC")
      .bind(id)
      .all<MediaRow>();
  } catch (error) {
    if (isMissingBinding(error)) {
      return defaultVehicles.find((item) => item.id === id) || null;
    }
    throw error;
  }

  if (!vehicle) return null;
  return toVehicle(vehicle, media.results);
}

export async function getSiteData() {
  const [settings, vehicles] = await Promise.all([getSettings(), listVehicles()]);
  return { settings, vehicles };
}

export async function upsertVehicle(input: Partial<Vehicle> & { id?: string }) {
  await ensureSchema();
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
  };

  const db = await getDb();
  const count = await db
    .prepare("SELECT COUNT(*) AS total FROM vehicles")
    .first<{ total: number }>();
  const sortOrder = current ? undefined : Number(count?.total || 0);

  await db
    .prepare(
      `INSERT INTO vehicles (
        id, name, year, km, fuel, transmission, price, features, sort_order, created_at, updated_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?10)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        year = excluded.year,
        km = excluded.km,
        fuel = excluded.fuel,
        transmission = excluded.transmission,
        price = excluded.price,
        features = excluded.features,
        updated_at = excluded.updated_at`,
    )
    .bind(
      vehicle.id,
      vehicle.name,
      vehicle.year,
      vehicle.km,
      vehicle.fuel,
      vehicle.transmission,
      vehicle.price,
      vehicle.features,
      sortOrder ?? 0,
      now,
    )
    .run();

  return getVehicleById(vehicle.id);
}

export async function deleteVehicle(id: string) {
  await ensureSchema();
  const db = await getDb();
  const bucket = await getBucket();
  const media = await db
    .prepare("SELECT key FROM media WHERE vehicle_id = ?1")
    .bind(id)
    .all<{ key: string }>();

  await Promise.all(media.results.map((item) => bucket.delete(item.key)));
  await db.prepare("DELETE FROM media WHERE vehicle_id = ?1").bind(id).run();
  await db.prepare("DELETE FROM vehicles WHERE id = ?1").bind(id).run();
}

export async function saveVehicleMedia(vehicleId: string, file: File, kind: "image" | "video") {
  await ensureSchema();
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
  const bucket = await getBucket();
  const db = await getDb();
  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType },
  });

  const maxSort = await db
    .prepare("SELECT COALESCE(MAX(sort_order), -1) AS sortOrder FROM media WHERE vehicle_id = ?1")
    .bind(vehicleId)
    .first<{ sortOrder: number }>();

  await db
    .prepare(
      `INSERT INTO media (
        key, vehicle_id, kind, filename, content_type, size, sort_order, created_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`,
    )
    .bind(
      key,
      vehicleId,
      kind,
      file.name,
      contentType,
      file.size,
      Number(maxSort?.sortOrder ?? -1) + 1,
      new Date().toISOString(),
    )
    .run();

  return getVehicleById(vehicleId);
}

export async function deleteMedia(key: string) {
  await ensureSchema();
  const bucket = await getBucket();
  const db = await getDb();
  await bucket.delete(key);
  await db.prepare("DELETE FROM media WHERE key = ?1").bind(key).run();
}

export async function getMediaObject(key: string) {
  await ensureSchema();
  const db = await getDb();
  const allowed = await db
    .prepare("SELECT key FROM media WHERE key = ?1")
    .bind(key)
    .first<{ key: string }>();
  if (!allowed) return null;
  const bucket = await getBucket();
  return bucket.get(key);
}

export async function addSubmission(input: Omit<LeadSubmission, "id" | "createdAt">) {
  await ensureSchema();
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

  const db = await getDb();
  await db
    .prepare(
      `INSERT INTO submissions (
        id, vehicle, year, price, down, months, monthly, date, time, name, gmail, phone, initial, timeline, created_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)`,
    )
    .bind(
      submission.id,
      submission.vehicle,
      submission.year,
      submission.price,
      submission.down,
      submission.months,
      submission.monthly,
      submission.date,
      submission.time,
      submission.name,
      submission.gmail,
      submission.phone,
      submission.initial,
      submission.timeline,
      submission.createdAt,
    )
    .run();

  return submission;
}

export async function listSubmissions() {
  let rows: D1Result<LeadRow>;

  try {
    await ensureSchema();
    const db = await getDb();
    rows = await db
      .prepare("SELECT * FROM submissions ORDER BY created_at DESC")
      .all<LeadRow>();
  } catch (error) {
    if (isMissingBinding(error)) return [];
    throw error;
  }

  return rows.results.map((row) => ({
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
}
