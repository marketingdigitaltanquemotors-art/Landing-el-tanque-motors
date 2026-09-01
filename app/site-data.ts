export type Vehicle = {
  id: string;
  name: string;
  year: string;
  km: string;
  fuel: string;
  transmission: string;
  price: number;
  features: string;
  video?: string;
  videoStorageKey?: string;
  images?: string[];
};

export type SiteSettings = {
  announcement: string;
  heading: string;
  heroText: string;
  homeEyebrow: string;
  homeTitle: string;
  homeDescription: string;
  businessDescription: string;
  contactPhone: string;
  contactAddress: string;
  contactHours: string;
  homeCtaLabel: string;
  vehicleHeroEyebrow: string;
  vehicleAvailabilityText: string;
  quickQuoteEyebrow: string;
  quickQuoteText: string;
  quickQuoteButtonLabel: string;
  galleryEyebrow: string;
  featuresLabel: string;
  priceLabel: string;
  trustMonthsValue: string;
  trustMonthsLabel: string;
  trustDownValue: string;
  trustDownLabel: string;
  trustWarrantyValue: string;
  trustWarrantyLabel: string;
  benefitsEyebrow: string;
  benefitsTitle: string;
  benefitFinanceTitle: string;
  benefitFinanceText: string;
  benefitWarrantyTitle: string;
  benefitWarrantyText: string;
  benefitTradeInTitle: string;
  benefitTradeInText: string;
  benefitsCta: string;
  financeEyebrow: string;
  financeTitleLine1: string;
  financeTitleAccent: string;
  financeCopy: string;
  financeBullet1: string;
  financeBullet2: string;
  financeBullet3: string;
  financeButtonLabel: string;
  modalEyebrow: string;
  modalTitle: string;
  modalText: string;
  selectedVehicleLabel: string;
  simulatorEyebrow: string;
  simulatorTitlePrefix: string;
  simulatorImportant: string;
  simulatorWarning: string;
  downPaymentLabel: string;
  downAmountLabel: string;
  termLabel: string;
  estimateLabel: string;
  simulatorButtonLabel: string;
  simulatorDisclaimer: string;
};

export type AdminCredentials = {
  username: string;
  password: string;
};

export type LeadSubmission = {
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
  createdAt: string;
};

export const defaultVehicles: Vehicle[] = [
  {
    id: "mazda-cx5-2024",
    name: "Mazda CX-5",
    year: "2024",
    km: "28,400 km",
    fuel: "Gasolina",
    transmission: "Automático",
    price: 485000,
    features:
      "Motor 2.5 L\nCámara de reversa\nAsientos de piel\nPantalla con Apple CarPlay",
    images: [],
  },
];

export const defaultSettings: SiteSettings = {
  announcement: "SOLO PARA PERSONAS INTERESADAS EN COMPRAR VEHÍCULOS SEMINUEVOS",
  heading: "Maneja lo que siempre quisiste.",
  heroText:
    "Conoce este vehículo, descubre cada característica y encuentra un financiamiento flexible con una garantía que sí responde.",
  homeEyebrow: "BIENVENIDO A EL TANQUE MOTORS",
  homeTitle: "Seminuevos listos para estrenar.",
  homeDescription:
    "Conoce nuestras unidades disponibles, compártelas fácilmente y encuentra el vehículo ideal con respaldo, financiamiento y atención personalizada.",
  businessDescription:
    "En El Tanque Motors te ayudamos a encontrar seminuevos seleccionados, con proceso claro y opciones de financiamiento pensadas para tu compra.",
  contactPhone: "809-747-9704",
  contactAddress: "Bávaro, Punta Cana – Esquina Av. Barceló con Blvd. Turístico del Este",
  contactHours: "Lunes a viernes de 8:30 AM a 5:30 PM · Sábados de 9:00 AM a 4:00 PM",
  homeCtaLabel: "Contactanos",
  vehicleHeroEyebrow: "TU PRÓXIMO VEHÍCULO ESTÁ AQUÍ",
  vehicleAvailabilityText: "ULTIMA UNIDAD DISPONIBLE",
  quickQuoteEyebrow: "COTÍZALO AQUÍ MISMO",
  quickQuoteText:
    "Ingresa tu enganche, plazo y obtén una simulación APROXIMADA** de tus planes de pagos para este vehículo.",
  quickQuoteButtonLabel: "Cotiza aquí mismo",
  galleryEyebrow: "CONOCE ALGUNOS ASPECTOS DEL VEHÍCULO",
  featuresLabel: "Características del vehículo",
  priceLabel: "Precio especial",
  trustMonthsValue: "60",
  trustMonthsLabel: "meses de\nfinanciamiento",
  trustDownValue: "20%",
  trustDownLabel: "de enganche\ndesde",
  trustWarrantyValue: "✓",
  trustWarrantyLabel: "GARANTÍA EL\nTANQUE MOTORS",
  benefitsEyebrow: "BENEFICIOS DE COMPRAR CON EL TANQUE MOTORS",
  benefitsTitle: "Beneficios de comprar seminuevos",
  benefitFinanceTitle: "Financiamiento accesible",
  benefitFinanceText:
    "Opciones financieras y de arrendamiento que se ajustan a las necesidades de nuestros clientes.",
  benefitWarrantyTitle: "Calidad y garantía",
  benefitWarrantyText:
    "Vehículos seleccionados con respaldo para darte mayor confianza en tu compra.",
  benefitTradeInTitle: "Toma de auto",
  benefitTradeInText:
    "Posibilidad de tomar tu auto usado como parte del proceso para facilitar el cambio a tu nuevo vehículo.",
  benefitsCta: "Agenda una cita para conocerlo en la agencia y obtén una oferta increíble.",
  financeEyebrow: "FINANCIAMIENTO A TU MEDIDA",
  financeTitleLine1: "No pares.",
  financeTitleAccent: "Nosotros te impulsamos.",
  financeCopy: "Ajusta tu enganche y encuentra un pago mensual pensado para ti.",
  financeBullet1: "Enganche desde el 20%",
  financeBullet2: "Plazos de hasta 60 meses",
  financeBullet3: "GARANTÍA EL TANQUE MOTORS",
  financeButtonLabel: "Cotiza aquí",
  modalEyebrow: "EL TANQUE MOTORS",
  modalTitle: "Agenda hoy mismo tu cita",
  modalText:
    "Al presentarte obtén: hasta 60 meses de financiamiento y GARANTÍA EL TANQUE MOTORS.",
  selectedVehicleLabel: "Vehículo seleccionado",
  simulatorEyebrow: "SIMULADOR DE PAGO",
  simulatorTitlePrefix: "Simulador de pago",
  simulatorImportant:
    "Importante: Esta simulación es un calculo de mensualidades aproximadas, no es una cotización, no incluye costo de seguro ni comisión por apertura.",
  simulatorWarning: "precios y condiciones sujetos a cambios sin previo aviso.",
  downPaymentLabel: "Enganche inicial",
  downAmountLabel: "Monto de enganche con",
  termLabel: "Plazo del préstamo (meses)",
  estimateLabel: "Pago mensual estimado*",
  simulatorButtonLabel: "Agendar cita para verlo",
  simulatorDisclaimer:
    "*Cálculo informativo. La mensualidad final depende de aprobación y condiciones de crédito.",
};

export const storageKeys = {
  vehicles: "tanqueMotors.vehicles",
  activeVehicleId: "tanqueMotors.activeVehicleId",
  settings: "tanqueMotors.settings",
  adminCredentials: "tanqueMotors.adminCredentials",
  submissions: "tanqueMotors.submissions",
  mediaDb: "tanqueMotors.mediaDb",
  mediaStore: "vehicleMedia",
};

function canUseStorage() {
  return typeof window !== "undefined";
}

export function loadVehicles() {
  if (!canUseStorage()) return defaultVehicles;
  const raw = window.localStorage.getItem(storageKeys.vehicles);
  if (!raw) return defaultVehicles;

  try {
    const parsed = JSON.parse(raw) as Vehicle[];
    if (!Array.isArray(parsed) || !parsed.length) return defaultVehicles;
    return parsed.map((vehicle, index) => ({
      ...defaultVehicles[0],
      ...vehicle,
      id: vehicle.id || `vehiculo-${index + 1}`,
      video:
        vehicle.videoStorageKey || vehicle.video?.startsWith("blob:")
          ? undefined
          : vehicle.video,
      images: Array.isArray(vehicle.images) ? vehicle.images : [],
    }));
  } catch {
    return defaultVehicles;
  }
}

export function saveVehicles(vehicles: Vehicle[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(storageKeys.vehicles, JSON.stringify(vehicles));
}

function openMediaDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(storageKeys.mediaDb, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storageKeys.mediaStore)) {
        db.createObjectStore(storageKeys.mediaStore);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("No se pudo abrir la base de videos."));
  });
}

async function withMediaStore<T>(
  mode: IDBTransactionMode,
  handler: (store: IDBObjectStore) => IDBRequest<T>,
) {
  const db = await openMediaDb();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(storageKeys.mediaStore, mode);
    const store = transaction.objectStore(storageKeys.mediaStore);
    const request = handler(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error("No se pudo completar la operación del video."));
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(new Error("No se pudo guardar el video."));
    };
  });
}

export async function saveVehicleVideo(vehicleId: string, file: File) {
  if (!canUseStorage()) {
    throw new Error("El navegador no permite guardar videos en este momento.");
  }

  const key = `video:${vehicleId}`;
  await withMediaStore("readwrite", (store) => store.put(file, key));
  return key;
}

export async function loadVehicleVideoUrl(storageKey: string) {
  if (!canUseStorage()) return undefined;
  const file = await withMediaStore<File | Blob | undefined>("readonly", (store) =>
    store.get(storageKey),
  );

  if (!file) return undefined;
  return URL.createObjectURL(file);
}

export async function deleteVehicleVideo(storageKey?: string) {
  if (!canUseStorage() || !storageKey) return;
  await withMediaStore("readwrite", (store) => store.delete(storageKey));
}

export async function hydrateVehiclesWithMedia(vehicles: Vehicle[]) {
  const hydrated = await Promise.all(
    vehicles.map(async (vehicle) => {
      if (!vehicle.videoStorageKey) return vehicle;
      const resolvedVideo = await loadVehicleVideoUrl(vehicle.videoStorageKey);
      return {
        ...vehicle,
        video: resolvedVideo,
      };
    }),
  );

  return hydrated;
}

export function loadActiveVehicleId() {
  if (!canUseStorage()) return defaultVehicles[0].id;
  return (
    window.localStorage.getItem(storageKeys.activeVehicleId) ?? defaultVehicles[0].id
  );
}

export function saveActiveVehicleId(id: string) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(storageKeys.activeVehicleId, id);
}

export function loadSettings() {
  if (!canUseStorage()) return defaultSettings;
  const raw = window.localStorage.getItem(storageKeys.settings);
  if (!raw) return defaultSettings;

  try {
    const parsed = { ...defaultSettings, ...(JSON.parse(raw) as SiteSettings) };

    if (parsed.contactPhone === "809-000-0000") {
      parsed.contactPhone = defaultSettings.contactPhone;
    }

    if (parsed.contactAddress === "Santo Domingo, República Dominicana") {
      parsed.contactAddress = defaultSettings.contactAddress;
    }

    return parsed;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: SiteSettings) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(storageKeys.settings, JSON.stringify(settings));
}

export function loadAdminCredentials() {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(storageKeys.adminCredentials);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AdminCredentials;
    if (!parsed.username || !parsed.password) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAdminCredentials(credentials: AdminCredentials) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(
    storageKeys.adminCredentials,
    JSON.stringify(credentials),
  );
}

export function clearAdminCredentials() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(storageKeys.adminCredentials);
}

export function loadSubmissions() {
  if (!canUseStorage()) return [] as LeadSubmission[];
  const raw = window.localStorage.getItem(storageKeys.submissions);
  if (!raw) return [] as LeadSubmission[];

  try {
    const parsed = JSON.parse(raw) as LeadSubmission[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as LeadSubmission[];
  }
}

export function saveSubmissions(submissions: LeadSubmission[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(
    storageKeys.submissions,
    JSON.stringify(submissions),
  );
}

export function addSubmission(submission: LeadSubmission) {
  const current = loadSubmissions();
  saveSubmissions([submission, ...current]);
}
