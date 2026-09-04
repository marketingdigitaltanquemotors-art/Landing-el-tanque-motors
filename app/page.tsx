import { getSiteData } from "./server/store";
import { defaultSettings } from "./site-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { settings } = await getSiteData();
  const resolvedSettings = { ...defaultSettings, ...settings };
  const contactPhoneDigits = resolvedSettings.contactPhone.replace(/\D/g, "");
  const contactLink = `https://wa.me/1${contactPhoneDigits}`;

  return (
    <main>
      <div className="announcement">{resolvedSettings.announcement}</div>
      <nav className="nav">
        <div className="nav-links">
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
