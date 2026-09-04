"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  LeadSubmission,
  SiteSettings,
  Vehicle,
  defaultSettings,
  money,
  slugify,
} from "../site-data";

type SitePayload = {
  settings: SiteSettings;
  vehicles: Vehicle[];
  submissions: LeadSubmission[];
};

type AdminLoginStatus = {
  configured: boolean;
  username: string;
};

type SettingsField = {
  key: keyof SiteSettings;
  label: string;
  multiline?: boolean;
};

type UploadProgress = {
  kind: "image" | "video";
  current: number;
  total: number;
  percent: number;
};

const primarySettingsFields: SettingsField[] = [
  { key: "announcement", label: "Barra superior" },
  { key: "homeEyebrow", label: "Texto superior portada" },
  { key: "homeTitle", label: "Título portada" },
  { key: "homeDescription", label: "Descripción portada", multiline: true },
  { key: "businessDescription", label: "Descripción de El Tanque Motors", multiline: true },
  { key: "contactPhone", label: "Teléfono" },
  { key: "contactAddress", label: "Dirección" },
  { key: "contactHours", label: "Horario" },
  { key: "homeCtaLabel", label: "Botón de WhatsApp" },
];

const vehicleSettingsFields: SettingsField[] = [
  { key: "heading", label: "Título página vehículo" },
  { key: "vehicleHeroEyebrow", label: "Texto superior vehículo" },
  { key: "vehicleAvailabilityText", label: "Etiqueta sobre video" },
  { key: "quickQuoteEyebrow", label: "Encabezado cotización" },
  { key: "quickQuoteText", label: "Texto cotización", multiline: true },
  { key: "quickQuoteButtonLabel", label: "Botón cotización" },
  { key: "galleryEyebrow", label: "Título galería" },
  { key: "featuresLabel", label: "Etiqueta características" },
  { key: "priceLabel", label: "Etiqueta precio" },
  { key: "benefitsEyebrow", label: "Encabezado beneficios" },
  { key: "benefitsTitle", label: "Título beneficios" },
  { key: "benefitFinanceTitle", label: "Beneficio 1 título" },
  { key: "benefitFinanceText", label: "Beneficio 1 texto", multiline: true },
  { key: "benefitWarrantyTitle", label: "Beneficio 2 título" },
  { key: "benefitWarrantyText", label: "Beneficio 2 texto", multiline: true },
  { key: "benefitTradeInTitle", label: "Beneficio 3 título" },
  { key: "benefitTradeInText", label: "Beneficio 3 texto", multiline: true },
  { key: "benefitsCta", label: "Texto destacado beneficios", multiline: true },
  { key: "financeEyebrow", label: "Encabezado financiamiento" },
  { key: "financeTitleLine1", label: "Financiamiento línea 1" },
  { key: "financeTitleAccent", label: "Financiamiento línea 2" },
  { key: "financeCopy", label: "Texto financiamiento", multiline: true },
  { key: "financeBullet1", label: "Punto 1" },
  { key: "financeBullet2", label: "Punto 2" },
  { key: "financeBullet3", label: "Punto 3" },
  { key: "financeButtonLabel", label: "Botón financiamiento" },
];

const simulatorSettingsFields: SettingsField[] = [
  { key: "modalEyebrow", label: "Texto superior modal" },
  { key: "modalTitle", label: "Título modal" },
  { key: "modalText", label: "Texto modal", multiline: true },
  { key: "selectedVehicleLabel", label: "Etiqueta vehículo seleccionado" },
  { key: "simulatorEyebrow", label: "Encabezado simulador" },
  { key: "simulatorTitlePrefix", label: "Inicio título simulador" },
  { key: "simulatorImportant", label: "Nota importante", multiline: true },
  { key: "simulatorWarning", label: "Advertencia", multiline: true },
  { key: "downPaymentLabel", label: "Etiqueta enganche" },
  { key: "downAmountLabel", label: "Etiqueta monto enganche" },
  { key: "termLabel", label: "Etiqueta plazo" },
  { key: "estimateLabel", label: "Etiqueta cuota" },
  { key: "simulatorButtonLabel", label: "Botón simulador" },
  { key: "simulatorDisclaimer", label: "Disclaimer", multiline: true },
];

function createVehicleDraft(count: number): Vehicle {
  const name = `Vehículo ${count + 1}`;
  return {
    id: `${slugify(name)}-${Date.now()}`,
    name,
    year: "2024",
    km: "0 km",
    fuel: "Gasolina",
    transmission: "Automático",
    price: 0,
    features: "Motor\nPantalla\nCámara\nAsientos",
    images: [],
    imageMedia: [],
  };
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || "La operación no pudo completarse.");
  }
  return payload;
}

function uploadToSignedUrl(
  uploadUrl: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", uploadUrl);
    request.setRequestHeader("content-type", file.type || "application/octet-stream");
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
        return;
      }
      reject(new Error("Supabase no pudo guardar el archivo."));
    };
    request.onerror = () => reject(new Error("No se pudo subir el archivo."));
    request.send(file);
  });
}

export default function AdminPage() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState("admin");
  const [loginPass, setLoginPass] = useState("");
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [submissions, setSubmissions] = useState<LeadSubmission[]>([]);
  const [vehicleFilter, setVehicleFilter] = useState("todos");
  const [dateFilter, setDateFilter] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [authConfigured, setAuthConfigured] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  useEffect(() => {
    async function hydrate() {
      try {
        const response = await fetch("/api/admin/site", { credentials: "include" });
        if (response.status === 401) {
          const status = (await fetch("/api/admin/login").then((item) =>
            item.json(),
          )) as AdminLoginStatus;
          setAuthConfigured(Boolean(status.configured));
          setLoginUser(status.username || "admin");
          setLoggedIn(false);
          return;
        }

        const payload = await readJson<SitePayload>(response);
        setSettings(payload.settings);
        setVehicles(payload.vehicles);
        setSelectedVehicleId(payload.vehicles[0]?.id || "");
        setSubmissions(payload.submissions);
        setLoggedIn(true);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "No se pudo cargar el panel.");
      } finally {
        setReady(true);
      }
    }

    hydrate();
  }, []);

  const selectedVehicle =
    vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? vehicles[0];

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

  function updateVehicleLocal(patch: Partial<Vehicle>) {
    setVehicles((current) =>
      current.map((vehicle) =>
        vehicle.id === selectedVehicleId ? { ...vehicle, ...patch } : vehicle,
      ),
    );
  }

  async function handleLogin() {
    setSaving(true);
    setMessage("");

    try {
      await readJson<{ ok: boolean }>(
        await fetch("/api/admin/login", {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ username: loginUser, password: loginPass }),
        }),
      );

      const payload = await readJson<SitePayload>(
        await fetch("/api/admin/site", { credentials: "include" }),
      );
      setSettings(payload.settings);
      setVehicles(payload.vehicles);
      setSelectedVehicleId(payload.vehicles[0]?.id || "");
      setSubmissions(payload.submissions);
      setLoggedIn(true);
      setLoginPass("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo iniciar sesión.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setLoggedIn(false);
  }

  async function saveSettingsChanges() {
    setSaving(true);
    try {
      const payload = await readJson<{ settings: SiteSettings }>(
        await fetch("/api/admin/settings", {
          method: "PUT",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(settings),
        }),
      );
      setSettings(payload.settings);
      setMessage("Configuración guardada.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function addVehicle() {
    setSaving(true);
    try {
      const payload = await readJson<{ vehicle: Vehicle }>(
        await fetch("/api/admin/vehicles", {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(createVehicleDraft(vehicles.length)),
        }),
      );
      setVehicles((current) => [...current, payload.vehicle]);
      setSelectedVehicleId(payload.vehicle.id);
      setMessage("Vehículo creado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo crear el vehículo.");
    } finally {
      setSaving(false);
    }
  }

  async function saveVehicle() {
    if (!selectedVehicle) return;
    setSaving(true);
    try {
      const payload = await readJson<{ vehicle: Vehicle }>(
        await fetch(`/api/admin/vehicles/${selectedVehicle.id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(selectedVehicle),
        }),
      );
      setVehicles((current) =>
        current.map((vehicle) =>
          vehicle.id === payload.vehicle.id ? payload.vehicle : vehicle,
        ),
      );
      setMessage("Vehículo guardado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar el vehículo.");
    } finally {
      setSaving(false);
    }
  }

  async function removeVehicle() {
    if (!selectedVehicle) return;
    setSaving(true);
    try {
      const payload = await readJson<{ vehicles: Vehicle[] }>(
        await fetch(`/api/admin/vehicles/${selectedVehicle.id}`, {
          method: "DELETE",
          credentials: "include",
        }),
      );
      setVehicles(payload.vehicles);
      setSelectedVehicleId(payload.vehicles[0]?.id || "");
      setMessage("Vehículo eliminado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo eliminar.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadMedia(event: ChangeEvent<HTMLInputElement>, kind: "image" | "video") {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!selectedVehicle || !files.length) return;

    setSaving(true);
    setUploadProgress({ kind, current: 1, total: files.length, percent: 0 });
    try {
      let updatedVehicle = selectedVehicle;
      for (const [index, file] of files.entries()) {
        const fileInfo = {
          vehicleId: selectedVehicle.id,
          kind,
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          size: file.size,
        };
        const signed = await readJson<{ key: string; uploadUrl: string }>(
          await fetch("/api/admin/media", {
            method: "POST",
            credentials: "include",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "sign", ...fileInfo }),
          }),
        );
        await uploadToSignedUrl(signed.uploadUrl, file, (filePercent) => {
          setUploadProgress({
            kind,
            current: index + 1,
            total: files.length,
            percent: Math.round(((index + filePercent / 100) / files.length) * 100),
          });
        });
        const payload = await readJson<{ vehicle: Vehicle }>(
          await fetch("/api/admin/media", {
            method: "POST",
            credentials: "include",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "complete", key: signed.key, ...fileInfo }),
          }),
        );
        updatedVehicle = payload.vehicle;
      }

      setVehicles((current) =>
        current.map((vehicle) =>
          vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle,
        ),
      );
      setMessage(kind === "image" ? "Fotos cargadas." : "Video actualizado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo subir el archivo.");
    } finally {
      setUploadProgress(null);
      setSaving(false);
    }
  }

  async function deleteMedia(key: string) {
    if (!selectedVehicle) return;
    setSaving(true);
    try {
      const params = new URLSearchParams({ key, vehicleId: selectedVehicle.id });
      const payload = await readJson<{ vehicle: Vehicle }>(
        await fetch(`/api/admin/media?${params.toString()}`, {
          method: "DELETE",
          credentials: "include",
        }),
      );
      setVehicles((current) =>
        current.map((vehicle) =>
          vehicle.id === payload.vehicle.id ? payload.vehicle : vehicle,
        ),
      );
      setMessage("Archivo eliminado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo eliminar el archivo.");
    } finally {
      setSaving(false);
    }
  }

  function renderUploadProgress(kind: "image" | "video") {
    if (!uploadProgress || uploadProgress.kind !== kind) return null;
    const isImage = kind === "image";

    return (
      <div
        role="status"
        aria-live="polite"
        style={{ display: "grid", gap: 8, marginTop: 12, width: "100%" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span>
            {isImage
              ? `Subiendo fotos (${uploadProgress.current}/${uploadProgress.total})`
              : "Subiendo video"}
          </span>
          <strong>{uploadProgress.percent}%</strong>
        </div>
        <div
          aria-label={`Progreso de carga: ${uploadProgress.percent}%`}
          style={{
            height: 8,
            overflow: "hidden",
            borderRadius: 999,
            background: "#e1ddd4",
          }}
        >
          <div
            style={{
              width: `${uploadProgress.percent}%`,
              height: "100%",
              borderRadius: "inherit",
              background: "#ff5a1f",
              transition: "width 160ms ease",
            }}
          />
        </div>
      </div>
    );
  }

  function renderSettingsFields(fields: SettingsField[]) {
    return fields.map((field) => (
      <label className={field.multiline ? "full" : ""} key={field.key}>
        {field.label}
        {field.multiline ? (
          <textarea
            value={settings[field.key]}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                [field.key]: event.target.value,
              }))
            }
          />
        ) : (
          <input
            value={settings[field.key]}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                [field.key]: event.target.value,
              }))
            }
          />
        )}
      </label>
    ));
  }

  if (!ready) {
    return <main className="admin-page">Cargando panel...</main>;
  }

  if (!loggedIn) {
    return (
      <main className="admin-page">
        <section className="admin-auth-card">
          <p className="eyebrow">PANEL DE ADMINISTRACIÓN</p>
          <h1>Inicia sesión</h1>
          <p className="admin-copy">
            El acceso ahora se valida en el servidor. Configura ADMIN_PASSWORD
            antes de publicar el sitio.
          </p>
          {!authConfigured && (
            <div className="admin-message danger-message">
              Falta ADMIN_PASSWORD. El panel queda bloqueado hasta configurar esa
              variable de entorno.
            </div>
          )}
          <div className="admin-form-grid single">
            <label>
              Usuario
              <input
                value={loginUser}
                onChange={(event) => setLoginUser(event.target.value)}
                placeholder="admin"
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                value={loginPass}
                onChange={(event) => setLoginPass(event.target.value)}
                placeholder="Contraseña"
              />
            </label>
          </div>
          <button className="btn admin-submit" onClick={handleLogin} disabled={saving}>
            {saving ? "Validando..." : "Entrar al panel"} <span>↗</span>
          </button>
          {message && <div className="admin-message danger-message">{message}</div>}
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
              Los cambios se guardan en la base de datos y quedan disponibles para
              todos los visitantes del sitio.
            </p>
          </div>
          <div className="admin-topbar-actions">
            <button className="outline-btn admin-logout" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="admin-layout">
          <aside className="admin-sidebar">
            <div className="admin-card">
              <div className="admin-card-row">
                <h2>Vehículos</h2>
                <button className="btn btn-small" onClick={addVehicle} disabled={saving}>
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
          </aside>

          <section className="admin-main">
            <div className="admin-card">
              <div className="admin-card-row">
                <div>
                  <h2>Página de entrada</h2>
                  <p className="admin-mini-copy">
                    Datos visibles en la portada, el contacto y el catálogo.
                  </p>
                </div>
                <button
                  className="outline-btn admin-publish-btn"
                  onClick={saveSettingsChanges}
                  disabled={saving}
                >
                  Guardar textos
                </button>
              </div>
              <div className="admin-form-grid">
                {renderSettingsFields(primarySettingsFields)}
              </div>
            </div>

            <details className="admin-card admin-advanced-settings">
              <summary className="admin-advanced-summary">
                <div>
                  <h2>Configuración avanzada</h2>
                  <p className="admin-mini-copy">
                    Textos de beneficios, financiamiento y simulador.
                  </p>
                </div>
                <span>Mostrar / ocultar</span>
              </summary>
              <div className="admin-card admin-subcard">
                <h2>Página del vehículo</h2>
                <div className="admin-form-grid">
                  {renderSettingsFields(vehicleSettingsFields)}
                </div>
              </div>
              <div className="admin-card admin-subcard">
                <h2>Simulador</h2>
                <div className="admin-form-grid">
                  {renderSettingsFields(simulatorSettingsFields)}
                </div>
              </div>
            </details>

            {selectedVehicle && (
              <div className="admin-card">
                <div className="admin-card-row">
                  <div>
                    <h2>{selectedVehicle.name}</h2>
                    <p className="admin-mini-copy">
                      Página pública: {" "}
                      <a
                        href={`/vehiculo/${selectedVehicle.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir página del vehículo ↗
                      </a>
                    </p>
                  </div>
                  <div className="admin-topbar-actions">
                    <button
                      className="outline-btn admin-publish-btn"
                      onClick={saveVehicle}
                      disabled={saving}
                    >
                      Guardar vehículo
                    </button>
                    <button
                      className="outline-btn danger-btn"
                      onClick={removeVehicle}
                      disabled={saving}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                <div className="admin-form-grid">
                  <label>
                    Nombre del vehículo
                    <input
                      value={selectedVehicle.name}
                      onChange={(event) => updateVehicleLocal({ name: event.target.value })}
                    />
                  </label>
                  <label>
                    Año
                    <input
                      value={selectedVehicle.year}
                      onChange={(event) => updateVehicleLocal({ year: event.target.value })}
                    />
                  </label>
                  <label>
                    Kilometraje
                    <input
                      value={selectedVehicle.km}
                      onChange={(event) => updateVehicleLocal({ km: event.target.value })}
                    />
                  </label>
                  <label>
                    Precio
                    <input
                      type="number"
                      value={selectedVehicle.price}
                      onChange={(event) =>
                        updateVehicleLocal({ price: Number(event.target.value || 0) })
                      }
                    />
                  </label>
                  <label>
                    Combustible
                    <input
                      value={selectedVehicle.fuel}
                      onChange={(event) => updateVehicleLocal({ fuel: event.target.value })}
                    />
                  </label>
                  <label>
                    Transmisión
                    <input
                      value={selectedVehicle.transmission}
                      onChange={(event) =>
                        updateVehicleLocal({ transmission: event.target.value })
                      }
                    />
                  </label>
                  <label className="full">
                    Características del vehículo
                    <textarea
                      value={selectedVehicle.features}
                      onChange={(event) =>
                        updateVehicleLocal({ features: event.target.value })
                      }
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
                          onChange={(event) => uploadMedia(event, "video")}
                        />
                        Subir video
                      </label>
                      {selectedVehicle.videoStorageKey && (
                        <button
                          className="btn admin-delete-media"
                          onClick={() => deleteMedia(selectedVehicle.videoStorageKey!)}
                          disabled={saving}
                        >
                          Eliminar video
                        </button>
                      )}
                    </div>
                    {renderUploadProgress("video")}
                  </div>

                  <div className="admin-media-card">
                    <p className="admin-media-title">Fotos del vehículo</p>
                    {selectedVehicle.imageMedia?.length ? (
                      <div className="admin-image-grid">
                        {selectedVehicle.imageMedia.map((image, index) => (
                          <div className="admin-image-item" key={image.key}>
                            <img src={image.url} alt={`${selectedVehicle.name} ${index + 1}`} />
                            <button
                              className="admin-remove-image"
                              onClick={() => deleteMedia(image.key)}
                              disabled={saving}
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
                          onChange={(event) => uploadMedia(event, "image")}
                        />
                        Subir fotos
                      </label>
                    </div>
                    {renderUploadProgress("image")}
                  </div>
                </div>
              </div>
            )}

            <div className="admin-card">
              <div className="admin-card-row">
                <div>
                  <h2>Formularios recibidos</h2>
                  <p className="admin-mini-copy">
                    Citas enviadas desde la página pública.
                  </p>
                </div>
              </div>

              <div className="admin-form-grid leads-filters">
                <label>
                  Filtrar por vehículo
                  <select
                    value={vehicleFilter}
                    onChange={(event) => setVehicleFilter(event.target.value)}
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
                    onChange={(event) => setDateFilter(event.target.value)}
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
