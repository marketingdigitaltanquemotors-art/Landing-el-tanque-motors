"use client";

import { useEffect, useState } from "react";
import { defaultSettings, loadSettings } from "./site-data";

export default function Home() {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    async function hydrateHome() {
      setSettings(loadSettings());
    }

    hydrateHome();
  }, []);

  const contactPhoneDigits = settings.contactPhone.replace(/\D/g, "");
  const contactLink = `https://wa.me/1${contactPhoneDigits}`;

  return (
    <main>
      <div className="announcement">{settings.announcement}</div>
      <nav className="nav">
        <div className="nav-links">
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
                <p className="eyebrow">{settings.homeEyebrow}</p>
                <h2>EL TANQUE MOTORS</h2>
              </div>
            </div>
            <p className="home-brand-description">{settings.businessDescription}</p>
            <div className="home-brand-data">
              <div>
                <span>Teléfono</span>
                <strong>{settings.contactPhone}</strong>
              </div>
              <div>
                <span>Ubicación</span>
                <strong>{settings.contactAddress}</strong>
              </div>
              <div>
                <span>Horario</span>
                <strong>{settings.contactHours}</strong>
              </div>
            </div>
          </div>

          <div className="home-intro-panel">
            <div className="heading-row">
              <p className="eyebrow">TU PRÓXIMO VEHÍCULO ESTÁ AQUÍ</p>
            </div>
            <h1>{settings.homeTitle}</h1>
            <p className="hero-text">{settings.homeDescription}</p>
            <a
              className="btn home-cta"
              href={contactLink}
              target="_blank"
              rel="noreferrer"
            >
              {settings.homeCtaLabel} <span>↗</span>
            </a>
          </div>
        </div>
      </section>

      <section className="benefits-strip catalog-benefits" id="beneficios">
        <p className="eyebrow">BENEFICIOS DE COMPRAR CON EL TANQUE MOTORS</p>
        <h3>Beneficios de comprar seminuevos</h3>
        <div className="benefits-grid">
          <article>
            <div className="benefit-icon">💵</div>
            <h4>Financiamiento accesible</h4>
            <p>
              Opciones financieras y de arrendamiento que se ajustan a las
              necesidades de nuestros clientes.
            </p>
          </article>
          <article>
            <div className="benefit-icon">🏅</div>
            <h4>Calidad y garantía</h4>
            <p>
              Vehículos seleccionados con respaldo para darte mayor confianza en
              tu compra.
            </p>
          </article>
          <article>
            <div className="benefit-icon">🚗</div>
            <h4>Toma de auto</h4>
            <p>
              Posibilidad de tomar tu auto usado como parte del proceso para
              facilitar el cambio a tu nuevo vehículo.
            </p>
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
