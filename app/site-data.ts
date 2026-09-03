export type VehicleMedia = {
  key: string;
  url: string;
  kind: "image" | "video";
  filename: string;
  contentType: string;
  size: number;
};

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
  videoMedia?: VehicleMedia | null;
  images?: string[];
  imageMedia?: VehicleMedia[];
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
    imageMedia: [],
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
  contactAddress: "Bávaro, Punta Cana - Esquina Av. Barceló con Blvd. Turístico del Este",
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
    "Importante: Esta simulación es un cálculo de mensualidades aproximadas, no es una cotización, no incluye costo de seguro ni comisión por apertura.",
  simulatorWarning: "precios y condiciones sujetos a cambios sin previo aviso.",
  downPaymentLabel: "Enganche inicial",
  downAmountLabel: "Monto de enganche con",
  termLabel: "Plazo del préstamo (meses)",
  estimateLabel: "Pago mensual estimado*",
  simulatorButtonLabel: "Agendar cita para verlo",
  simulatorDisclaimer:
    "*Cálculo informativo. La mensualidad final depende de aprobación y condiciones de crédito.",
};

export function money(value: number) {
  return `RD$${new Intl.NumberFormat("es-DO", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
