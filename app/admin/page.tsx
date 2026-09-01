"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  clearAdminCredentials,
  AdminCredentials,
  deleteVehicleVideo,
  LeadSubmission,
  SiteSettings,
  Vehicle,
  defaultSettings,
  defaultVehicles,
  hydrateVehiclesWithMedia,
  loadActiveVehicleId,
  loadAdminCredentials,
  loadSettings,
  loadSubmissions,
  loadVehicles,
  saveVehicleVideo,
  saveActiveVehicleId,
  saveAdminCredentials,
  saveSettings,
  saveVehicles,
} from "../site-data";

function money(value: number) {
  return `RD$${new Intl.NumberFormat("es-DO", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
}

function createVehicle(name = "Nuevo vehículo"): Vehicle {
  const stamp = Date.now();
  return {
    id: `${slugify(name) || "vehiculo"}-${stamp}`,
    name,
    year: "2024",
    km: "0 km",
    fuel: "Gasolina",
    transmission: "Automático",
    price: 0,
    features: "Motor\nPantalla\nCámara\nAsientos",
    images: [],
  };
}

export default function AdminPage() {
  const [ready, setReady] = useState(false);
  const [credentials, setCredentials] = useState<AdminCredentials | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [setupUser, setSetupUser] = useState("");
  const [setupPass, setSetupPass] = useState("");
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [vehicles, setVehicles] = useState<Vehicle[]>(defaultVehicles);
  const [activeVehicleId, setActiveVehicleId] = useState(defaultVehicles[0].id);
  const [selectedVehicleId, setSelectedVehicleId] = useState(defaultVehicles[0].id);
  const [message, setMessage] = useState("");
  const [credentialUser, setCredentialUser] = useState("");
  const [credentialPass, setCredentialPass] = useState("");
  const [submissions, setSubmissions] = useState<LeadSubmission[]>([]);
  const [vehicleFilter, setVehicleFilter] = useState("todos");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    async function hydrateAdmin() {
      const storedCredentials = loadAdminCredentials();
      const storedVehicles = loadVehicles();
      const hydratedVehicles = await hydrateVehiclesWithMedia(storedVehicles);
      const storedActiveId = loadActiveVehicleId();
      const storedSettings = loadSettings();
      const storedSubmissions = loadSubmissions();
      const resolvedActiveId =
        hydratedVehicles.find((vehicle) => vehicle.id === storedActiveId)?.id ??
        hydratedVehicles[0].id;

      setCredentials(storedCredentials);
      setSettings(storedSettings);
      setVehicles(hydratedVehicles);
      setActiveVehicleId(resolvedActiveId);
      setSelectedVehicleId(resolvedActiveId);
      setCredentialUser(storedCredentials?.username ?? "");
      setCredentialPass(storedCredentials?.password ?? "");
      setSubmissions(storedSubmissions);
      setReady(true);
    }

    hydrateAdmin();
  }, []);

  const selectedVehicle =
    vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? vehicles[0];

  useEffect(() => {
    if (!ready) return;
    saveVehicles(vehicles);
  }, [ready, vehicles]);

  useEffect(() => {
    if (!ready) return;
    saveSettings(settings);
  }, [ready, settings]);

  useEffect(() => {
    if (!ready) return;
    saveActiveVehicleId(activeVehicleId);
  }, [ready, activeVehicleId]);

  const totalMedia = useMemo(
    () => (selectedVehicle.images?.length ?? 0) + (selectedVehicle.video ? 1 : 0),
    [selectedVehicle],
  );
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      const matchesVehicle =
        vehicleFilter === "todos" || submission.vehicle === vehicleFilter;
      const matchesDate = !dateFilter || submission.date === dateFilter;
      return matchesVehicle && matchesDate;
    });
  }, [submissions, vehicleFilter, dateFilter]);

  function formatSubmissionDate(value: string) {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }

  function updateVehicle(patch: Partial<Vehicle>) {
    setVehicles((current) =>
      current.map((vehicle) =>
        vehicle.id === selectedVehicleId ? { ...vehicle, ...patch } : vehicle,
      ),
    );
  }

  function addVehicle() {
    const newVehicle = createVehicle(`Vehículo ${vehicles.length + 1}`);
    setVehicles((current) => [...current, newVehicle]);
    setSelectedVehicleId(newVehicle.id);
    setMessage("Nuevo vehículo creado.");
  }

  async function removeVehicle(id: string) {
    if (vehicles.length === 1) {
      setMessage("Debes dejar al menos un vehículo.");
      return;
    }

    const removedVehicle = vehicles.find((vehicle) => vehicle.id === id);
    const filtered = vehicles.filter((vehicle) => vehicle.id !== id);
    const fallback = filtered[0];
    await deleteVehicleVideo(removedVehicle?.videoStorageKey);
    setVehicles(filtered);
    if (activeVehicleId === id) {
      setActiveVehicleId(fallback.id);
    }
    if (selectedVehicleId === id) {
      setSelectedVehicleId(fallback.id);
    }
    setMessage("Vehículo eliminado.");
  }

  async function handleVideoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";

    if (file.type !== "video/mp4") {
      setMessage("Solo se permiten videos en formato MP4.");
      return;
    }

    try {
      const storageKey = await saveVehicleVideo(selectedVehicle.id, file);
      const previewUrl = URL.createObjectURL(file);
      updateVehicle({ video: previewUrl, videoStorageKey: storageKey });
      setMessage("Video MP4 actualizado.");
    } catch {
      setMessage("No se pudo subir el video MP4. Intenta con un archivo más ligero.");
    }
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const images = await Promise.all(files.map(readFileAsDataUrl));
    updateVehicle({ images: [...(selectedVehicle.images ?? []), ...images] });
    setMessage("Fotos agregadas.");
  }

  function removeImage(index: number) {
    updateVehicle({
      images: (selectedVehicle.images ?? []).filter((_, current) => current !== index),
    });
    setMessage("Foto eliminada.");
  }

  async function removeVideo() {
    await deleteVehicleVideo(selectedVehicle.videoStorageKey);
    if (selectedVehicle.video?.startsWith("blob:")) {
      URL.revokeObjectURL(selectedVehicle.video);
    }
    updateVehicle({ video: undefined, videoStorageKey: undefined });
    setMessage("Video eliminado.");
  }

  function removeAllImages() {
    updateVehicle({ images: [] });
    setMessage("Todas las fotos fueron eliminadas.");
  }

  function handleSetup() {
    if (!setupUser.trim() || !setupPass.trim()) {
      setMessage("Define un usuario y una contraseña.");
      return;
    }

    const nextCredentials = {
      username: setupUser.trim(),
      password: setupPass,
    };
    saveAdminCredentials(nextCredentials);
    setCredentials(nextCredentials);
    setCredentialUser(nextCredentials.username);
    setCredentialPass(nextCredentials.password);
    setLoggedIn(true);
    setMessage("Acceso creado correctamente.");
  }

  function handleLogin() {
    if (!credentials) return;
    if (
      loginUser.trim() === credentials.username &&
      loginPass === credentials.password
    ) {
      setLoggedIn(true);
      setMessage("");
      return;
    }

    setMessage("Usuario o contraseña incorrectos.");
  }

  function updateCredentials() {
    if (!credentialUser.trim() || !credentialPass.trim()) {
      setMessage("Completa usuario y contraseña para guardar.");
      return;
    }

    const nextCredentials = {
      username: credentialUser.trim(),
      password: credentialPass,
    };
    saveAdminCredentials(nextCredentials);
    setCredentials(nextCredentials);
    setMessage("Acceso actualizado.");
  }

  function resetCredentials() {
    clearAdminCredentials();
    setCredentials(null);
    setLoggedIn(false);
    setLoginUser("");
    setLoginPass("");
    setSetupUser("");
    setSetupPass("");
    setCredentialUser("");
    setCredentialPass("");
    setMessage("Acceso reiniciado. Ahora crea tu nuevo usuario y contraseña.");
  }

  if (!ready) {
    return <main className="admin-page">Cargando panel…</main>;
  }

  if (!credentials) {
    return (
      <main className="admin-page">
        <section className="admin-auth-card">
          <p className="eyebrow">PANEL DE ADMINISTRACIÓN</p>
          <h1>Define tu usuario y contraseña</h1>
          <p className="admin-copy">
            Esta será la entrada a tu panel para administrar varios vehículos.
          </p>
          <div className="admin-form-grid single">
            <label>
              Usuario
              <input
                value={setupUser}
                onChange={(e) => setSetupUser(e.target.value)}
                placeholder="Tu usuario"
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                value={setupPass}
                onChange={(e) => setSetupPass(e.target.value)}
                placeholder="Tu contraseña"
              />
            </label>
          </div>
          <button className="btn admin-submit" onClick={handleSetup}>
            Crear acceso <span>↗</span>
          </button>
          <button className="outline-btn admin-reset-btn" onClick={resetCredentials}>
            Reiniciar acceso
          </button>
          {message && <div className="admin-message">{message}</div>}
        </section>
      </main>
    );
  }

  if (!loggedIn) {
    return (
      <main className="admin-page">
        <section className="admin-auth-card">
          <p className="eyebrow">PANEL DE ADMINISTRACIÓN</p>
          <h1>Inicia sesión</h1>
          <p className="admin-copy">
            Entra para administrar todas las páginas individuales de tus vehículos.
          </p>
          <div className="admin-form-grid single">
            <label>
              Usuario
              <input
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="Usuario"
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="Contraseña"
              />
            </label>
          </div>
          <button className="btn admin-submit" onClick={handleLogin}>
            Entrar al panel <span>↗</span>
          </button>
          <button className="outline-btn admin-reset-btn" onClick={resetCredentials}>
            Olvidé mi contraseña / Reiniciar acceso
          </button>
          {message && <div className="admin-message">{message}</div>}
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <div className="admin-topbar">
          <div>
            <p className="eyebrow">PANEL DE ADMINISTRACIÓN</p>
            <h1>Administra tus vehículos</h1>
            <p className="admin-copy">
              Desde aquí administras todos tus vehículos y cada uno tendrá su
              propia página publicada.
            </p>
          </div>
          <div className="admin-topbar-actions">
            <button className="outline-btn admin-logout" onClick={() => setLoggedIn(false)}>
              Cerrar sesión
            </button>
            <button className="outline-btn admin-reset-btn" onClick={resetCredentials}>
              Reiniciar acceso
            </button>
          </div>
        </div>

        <div className="admin-layout">
          <aside className="admin-sidebar">
            <div className="admin-card">
              <div className="admin-card-row">
                <h2>Vehículos</h2>
                <button className="btn btn-small" onClick={addVehicle}>
                  Agregar
                </button>
              </div>
              <div className="admin-vehicle-list">
                {vehicles.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    className={`admin-vehicle-item${
                      selectedVehicleId === vehicle.id ? " active" : ""
                    }`}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                  >
                    <div>
                      <strong>{vehicle.name}</strong>
                      <span>
                        {vehicle.year} · {money(vehicle.price)}
                      </span>
                    </div>
                    <small className="admin-live-badge">/{vehicle.id}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-card">
              <h2>Acceso</h2>
              <div className="admin-form-grid single compact">
                <label>
                  Usuario
                  <input
                    value={credentialUser}
                    onChange={(e) => setCredentialUser(e.target.value)}
                  />
                </label>
                <label>
                  Contraseña
                  <input
                    type="password"
                    value={credentialPass}
                    onChange={(e) => setCredentialPass(e.target.value)}
                  />
                </label>
              </div>
              <button className="outline-btn admin-wide-btn" onClick={updateCredentials}>
                Guardar acceso
              </button>
            </div>
          </aside>

          <section className="admin-main">
            <div className="admin-card">
              <div className="admin-card-row">
                <div>
                  <h2>Página de entrada</h2>
                  <p className="admin-mini-copy">
                    Configura la portada principal con el logo y los datos de El Tanque Motors.
                  </p>
                </div>
              </div>
              <div className="admin-form-grid">
                <label>
                  Texto superior
                  <input
                    value={settings.homeEyebrow}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        homeEyebrow: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Título principal
                  <input
                    value={settings.homeTitle}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        homeTitle: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="full">
                  Descripción de portada
                  <textarea
                    value={settings.homeDescription}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        homeDescription: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="full">
                  Descripción de El Tanque Motors
                  <textarea
                    value={settings.businessDescription}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        businessDescription: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Teléfono
                  <input
                    value={settings.contactPhone}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        contactPhone: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Dirección
                  <input
                    value={settings.contactAddress}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        contactAddress: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Horario
                  <input
                    value={settings.contactHours}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        contactHours: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Texto del botón
                  <input
                    value={settings.homeCtaLabel}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        homeCtaLabel: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>
            </div>

            <details className="admin-card admin-advanced-settings">
              <summary className="admin-advanced-summary">
                <div>
                  <h2>Configuración avanzada</h2>
                  <p className="admin-mini-copy">
                    Aquí están los textos y ajustes más detallados de la página.
                  </p>
                </div>
                <span>Mostrar / ocultar</span>
              </summary>

              <div className="admin-card admin-subcard">
                <div className="admin-card-row">
                  <div>
                    <h2>Contenido general</h2>
                    <p className="admin-mini-copy">
                      Todos los vehículos se publican automáticamente con su propio enlace.
                    </p>
                  </div>
                </div>
                <div className="admin-form-grid">
                  <label>
                    Texto de barra superior
                    <input
                      value={settings.announcement}
                      onChange={(e) =>
                        setSettings((current) => ({
                          ...current,
                          announcement: e.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Encabezado principal
                    <input
                      value={settings.heading}
                      onChange={(e) =>
                        setSettings((current) => ({
                          ...current,
                          heading: e.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="full">
                    Texto descriptivo
                    <textarea
                      value={settings.heroText}
                      onChange={(e) =>
                        setSettings((current) => ({
                          ...current,
                          heroText: e.target.value,
                        }))
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="admin-card admin-subcard">
                <div className="admin-card-row">
                  <div>
                    <h2>Textos de la página del vehículo</h2>
                    <p className="admin-mini-copy">
                      Aquí vuelves a controlar los textos visibles en cada página individual.
                    </p>
                  </div>
                </div>
                <div className="admin-form-grid">
                <label>
                  Texto superior del vehículo
                  <input
                    value={settings.vehicleHeroEyebrow}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        vehicleHeroEyebrow: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Texto sobre el video
                  <input
                    value={settings.vehicleAvailabilityText}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        vehicleAvailabilityText: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Encabezado de cotización
                  <input
                    value={settings.quickQuoteEyebrow}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        quickQuoteEyebrow: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Botón de cotización
                  <input
                    value={settings.quickQuoteButtonLabel}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        quickQuoteButtonLabel: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="full">
                  Texto de cotización
                  <textarea
                    value={settings.quickQuoteText}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        quickQuoteText: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Título de la galería
                  <input
                    value={settings.galleryEyebrow}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        galleryEyebrow: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Título de características
                  <input
                    value={settings.featuresLabel}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        featuresLabel: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Texto de precio
                  <input
                    value={settings.priceLabel}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        priceLabel: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              </div>

              <div className="admin-card admin-subcard">
                <div className="admin-card-row">
                  <div>
                    <h2>Beneficios y garantía</h2>
                    <p className="admin-mini-copy">
                      Configura los bloques de confianza, beneficios y financiamiento.
                    </p>
                  </div>
                </div>
                <div className="admin-form-grid">
                <label>
                  Valor 1
                  <input
                    value={settings.trustMonthsValue}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        trustMonthsValue: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Texto 1
                  <textarea
                    value={settings.trustMonthsLabel}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        trustMonthsLabel: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Valor 2
                  <input
                    value={settings.trustDownValue}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        trustDownValue: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Texto 2
                  <textarea
                    value={settings.trustDownLabel}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        trustDownLabel: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Valor 3
                  <input
                    value={settings.trustWarrantyValue}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        trustWarrantyValue: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Texto 3
                  <textarea
                    value={settings.trustWarrantyLabel}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        trustWarrantyLabel: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Encabezado beneficios
                  <input
                    value={settings.benefitsEyebrow}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        benefitsEyebrow: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Título beneficios
                  <input
                    value={settings.benefitsTitle}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        benefitsTitle: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Beneficio 1 título
                  <input
                    value={settings.benefitFinanceTitle}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        benefitFinanceTitle: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="full">
                  Beneficio 1 texto
                  <textarea
                    value={settings.benefitFinanceText}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        benefitFinanceText: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Beneficio 2 título
                  <input
                    value={settings.benefitWarrantyTitle}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        benefitWarrantyTitle: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="full">
                  Beneficio 2 texto
                  <textarea
                    value={settings.benefitWarrantyText}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        benefitWarrantyText: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Beneficio 3 título
                  <input
                    value={settings.benefitTradeInTitle}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        benefitTradeInTitle: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="full">
                  Beneficio 3 texto
                  <textarea
                    value={settings.benefitTradeInText}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        benefitTradeInText: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="full">
                  Texto verde de beneficios
                  <textarea
                    value={settings.benefitsCta}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        benefitsCta: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Encabezado financiamiento
                  <input
                    value={settings.financeEyebrow}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        financeEyebrow: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Título financiamiento línea 1
                  <input
                    value={settings.financeTitleLine1}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        financeTitleLine1: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Título financiamiento línea 2
                  <input
                    value={settings.financeTitleAccent}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        financeTitleAccent: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="full">
                  Texto financiamiento
                  <textarea
                    value={settings.financeCopy}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        financeCopy: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Punto 1
                  <input
                    value={settings.financeBullet1}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        financeBullet1: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Punto 2
                  <input
                    value={settings.financeBullet2}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        financeBullet2: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Punto 3
                  <input
                    value={settings.financeBullet3}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        financeBullet3: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Botón de financiamiento
                  <input
                    value={settings.financeButtonLabel}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        financeButtonLabel: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              </div>

              <div className="admin-card admin-subcard">
                <div className="admin-card-row">
                  <div>
                    <h2>Ventana de simulador</h2>
                    <p className="admin-mini-copy">
                      Edita los textos del modal de cotización y simulador.
                    </p>
                  </div>
                </div>
                <div className="admin-form-grid">
                <label>
                  Texto superior del modal
                  <input
                    value={settings.modalEyebrow}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        modalEyebrow: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Título del modal
                  <input
                    value={settings.modalTitle}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        modalTitle: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="full">
                  Texto del modal
                  <textarea
                    value={settings.modalText}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        modalText: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Texto de vehículo seleccionado
                  <input
                    value={settings.selectedVehicleLabel}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        selectedVehicleLabel: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Encabezado simulador
                  <input
                    value={settings.simulatorEyebrow}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        simulatorEyebrow: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Inicio del título del simulador
                  <input
                    value={settings.simulatorTitlePrefix}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        simulatorTitlePrefix: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Etiqueta de enganche
                  <input
                    value={settings.downPaymentLabel}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        downPaymentLabel: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Etiqueta de monto del enganche
                  <input
                    value={settings.downAmountLabel}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        downAmountLabel: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Etiqueta de plazo
                  <input
                    value={settings.termLabel}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        termLabel: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Etiqueta de cuota
                  <input
                    value={settings.estimateLabel}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        estimateLabel: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Botón del simulador
                  <input
                    value={settings.simulatorButtonLabel}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        simulatorButtonLabel: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="full">
                  Nota importante
                  <textarea
                    value={settings.simulatorImportant}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        simulatorImportant: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="full">
                  Advertencia
                  <textarea
                    value={settings.simulatorWarning}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        simulatorWarning: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="full">
                  Disclaimer
                  <textarea
                    value={settings.simulatorDisclaimer}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        simulatorDisclaimer: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              </div>
            </details>

            <div className="admin-card">
              <div className="admin-card-row">
                <div>
                  <h2>{selectedVehicle.name}</h2>
                  <p className="admin-mini-copy">
                    Archivos cargados: {totalMedia} elemento(s)
                  </p>
                </div>
                <button
                  className="outline-btn danger-btn"
                  onClick={() => removeVehicle(selectedVehicle.id)}
                >
                  Eliminar vehículo
                </button>
              </div>

              <div className="admin-form-grid">
                <label>
                  Nombre del vehículo
                  <input
                    value={selectedVehicle.name}
                    onChange={(e) => updateVehicle({ name: e.target.value })}
                  />
                </label>
                <label>
                  Año
                  <input
                    value={selectedVehicle.year}
                    onChange={(e) => updateVehicle({ year: e.target.value })}
                  />
                </label>
                <label>
                  Kilometraje
                  <input
                    value={selectedVehicle.km}
                    onChange={(e) => updateVehicle({ km: e.target.value })}
                  />
                </label>
                <label>
                  Precio
                  <input
                    type="number"
                    value={selectedVehicle.price}
                    onChange={(e) =>
                      updateVehicle({ price: Number(e.target.value || 0) })
                    }
                  />
                </label>
                <label>
                  Combustible
                  <input
                    value={selectedVehicle.fuel}
                    onChange={(e) => updateVehicle({ fuel: e.target.value })}
                  />
                </label>
                <label>
                  Transmisión
                  <input
                    value={selectedVehicle.transmission}
                    onChange={(e) =>
                      updateVehicle({ transmission: e.target.value })
                    }
                  />
                </label>
                <label className="full">
                  Características del vehículo
                  <textarea
                    value={selectedVehicle.features}
                    onChange={(e) => updateVehicle({ features: e.target.value })}
                  />
                </label>
              </div>

              <div className="admin-media-grid">
                <div className="admin-media-card">
                  <p className="admin-media-title">Video del vehículo</p>
                  {selectedVehicle.video ? (
                    <video src={selectedVehicle.video} controls playsInline />
                  ) : (
                    <div className="admin-media-empty">Aún no has cargado video.</div>
                  )}
                  <div className="admin-media-actions">
                    <label className="btn admin-upload">
                      <input
                        type="file"
                        accept="video/mp4,.mp4"
                        onChange={handleVideoUpload}
                      />
                      Subir video
                    </label>
                    {selectedVehicle.video ? (
                      <button className="btn admin-delete-media" onClick={removeVideo}>
                        Eliminar video
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="admin-media-card">
                  <p className="admin-media-title">Fotos del vehículo</p>
                  {selectedVehicle.images?.length ? (
                    <div className="admin-image-grid">
                      {selectedVehicle.images.map((image, index) => (
                        <div className="admin-image-item" key={`${image}-${index}`}>
                          <img src={image} alt={`${selectedVehicle.name} ${index + 1}`} />
                          <button
                            className="admin-remove-image"
                            onClick={() => removeImage(index)}
                          >
                            Quitar
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="admin-media-empty">Aún no has cargado fotos.</div>
                  )}
                  <div className="admin-media-actions">
                    <label className="btn admin-upload">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                      />
                      Subir fotos
                    </label>
                    {selectedVehicle.images?.length ? (
                      <button className="btn admin-delete-media" onClick={removeAllImages}>
                        Eliminar fotos
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-row">
                <div>
                  <h2>Formularios recibidos</h2>
                  <p className="admin-mini-copy">
                    Revisa todas las citas enviadas desde la página pública.
                  </p>
                </div>
              </div>

              <div className="admin-form-grid leads-filters">
                <label>
                  Filtrar por vehículo
                  <select
                    value={vehicleFilter}
                    onChange={(e) => setVehicleFilter(e.target.value)}
                  >
                    <option value="todos">Todos los vehículos</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.name}>
                        {vehicle.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Filtrar por fecha
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </label>
              </div>

              <div className="leads-table-wrap">
                <table className="leads-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Vehículo</th>
                      <th>Nombre</th>
                      <th>Gmail</th>
                      <th>Teléfono</th>
                      <th>Inicial</th>
                      <th>Periodo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.length ? (
                      filteredSubmissions.map((submission) => (
                        <tr key={submission.id}>
                          <td>{formatSubmissionDate(submission.date)}</td>
                          <td>{submission.time}</td>
                          <td>
                            {submission.vehicle} {submission.year}
                          </td>
                          <td>{submission.name}</td>
                          <td>{submission.gmail}</td>
                          <td>{submission.phone}</td>
                          <td>{submission.initial}</td>
                          <td>{submission.timeline || "Sin dato"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="leads-empty">
                          Todavía no hay formularios que coincidan con ese filtro.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {message && <div className="admin-message floating">{message}</div>}
          </section>
        </div>
      </section>
    </main>
  );
}
