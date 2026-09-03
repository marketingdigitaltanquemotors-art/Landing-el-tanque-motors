import Link from "next/link";
import { getSiteData } from "./server/store";
import { defaultSettings, money } from "./site-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { settings, vehicles } = await getSiteData();
  const resolvedSettings = { ...defaultSettings, ...settings };
  const contactPhoneDigits = resolvedSettings.contactPhone.replace(/\D/g, "");
  const contactLink = `https://wa.me/1${contactPhoneDigits}`;

  return (
    <main>
      <div className="announcement">{resolvedSettings.announcement}</div>
      <nav className="nav">
        <div className="nav-links">
          <a href="#inventario">Inventario</a>
          <a href="#beneficios">Beneficios</a>
          <a href="#contacto">Contacto</a>
        </div>
        <a className="brand" href="#inicio">
          <img src="/el-tanque-motors-logo.png" alt="El Tanque Motors" className="brand-logo" />
        </a>
      </nav>

      <section className="hero no-visual" id="inicio">
        <div className="hero-copy home-hero-copy">
          <div className="home-brand-panel">
            <div className="home-brand-head">
              <img
                src="/el-tanque-motors-logo.png"
                alt="Logo El Tanque Motors"
                className="home-brand-logo"
              />
              <div>
                <p className="eyebrow">{resolvedSettings.homeEyebrow}</p>
                <h2>EL TANQUE MOTORS</h2>
              </div>
            </div>
            <p className="home-brand-description">{resolvedSettings.businessDescription}</p>
            <div className="home-brand-data">
              <div>
                <span>Teléfono</span>
                <strong>{resolvedSettings.contactPhone}</strong>
              </div>
              <div>
                <span>Ubicación</span>
                <strong>{resolvedSettings.contactAddress}</strong>
              </div>
              <div>
                <span>Horario</span>
                <strong>{resolvedSettings.contactHours}</strong>
              </div>
            </div>
          </div>

          <div className="home-intro-panel">
            <div className="heading-row">
              <p className="eyebrow">TU PRÓXIMO VEHÍCULO ESTÁ AQUÍ</p>
            </div>
            <h1>{resolvedSettings.homeTitle}</h1>
            <p className="hero-text">{resolvedSettings.homeDescription}</p>
            <a
              className="btn home-cta"
              href={contactLink}
              target="_blank"
              rel="noreferrer"
            >
              {resolvedSettings.homeCtaLabel} <span>↗</span>
            </a>
          </div>
        </div>
      </section>

      <section className="inventory catalog-page" id="inventario">
        <div className="catalog-heading">
          <div>
            <p className="eyebrow">INVENTARIO DISPONIBLE</p>
            <h2>Vehículos publicados</h2>
          </div>
          <p>
            Cada unidad tiene su propia página con fotos, video, características y
            simulador de pago.
          </p>
        </div>
        <div className="catalog-grid">
          {vehicles.map((vehicle) => (
            <article className="catalog-card" key={vehicle.id}>
              <div className="catalog-media">
                {vehicle.images?.[0] ? (
                  <img src={vehicle.images[0]} alt={`${vehicle.name} ${vehicle.year}`} />
                ) : vehicle.video ? (
                  <video src={vehicle.video} muted playsInline preload="metadata" />
                ) : (
                  <div className="mini-car">
                    <div />
                  </div>
                )}
              </div>
              <div className="catalog-body">
                <p>
                  {vehicle.year} · {vehicle.transmission}
                </p>
                <h3>{vehicle.name}</h3>
                <div className="specs">
                  <span>{vehicle.km}</span>
                  <span>{vehicle.fuel}</span>
                </div>
                <div className="vehicle-price">
                  <span>{resolvedSettings.priceLabel}</span>
                  <strong>{money(vehicle.price)}</strong>
                </div>
                <Link className="btn catalog-btn" href={`/vehiculo/${vehicle.id}`}>
                  Ver vehículo <span>↗</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="benefits-strip catalog-benefits" id="beneficios">
        <p className="eyebrow">{resolvedSettings.benefitsEyebrow}</p>
        <h3>{resolvedSettings.benefitsTitle}</h3>
        <div className="benefits-grid">
          <article>
            <div className="benefit-icon">💵</div>
            <h4>{resolvedSettings.benefitFinanceTitle}</h4>
            <p>{resolvedSettings.benefitFinanceText}</p>
          </article>
          <article>
            <div className="benefit-icon">🏅</div>
            <h4>{resolvedSettings.benefitWarrantyTitle}</h4>
            <p>{resolvedSettings.benefitWarrantyText}</p>
          </article>
          <article>
            <div className="benefit-icon">🚗</div>
            <h4>{resolvedSettings.benefitTradeInTitle}</h4>
            <p>{resolvedSettings.benefitTradeInText}</p>
          </article>
        </div>
      </section>

      <footer id="contacto">
        <a className="brand footer-brand" href="#inicio">
          <img src="/el-tanque-motors-logo.png" alt="El Tanque Motors" className="footer-logo" />
        </a>
        <p>Tu camino empieza aquí.</p>
        <a href="#inicio">Volver arriba ↑</a>
      </footer>
    </main>
  );
}
