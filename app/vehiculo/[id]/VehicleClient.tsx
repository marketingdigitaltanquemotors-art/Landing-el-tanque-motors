"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SiteSettings, Vehicle, money } from "../../site-data";

const termOptions = [24, 36, 48, 60];
const annualInterestRate = 0.1595;
const legalExpensesRate = 0.07;

function calculateEstimatedMonthlyPayment(
  price: number,
  downPercent: number,
  months: number,
) {
  const downAmount = (price * downPercent) / 100;
  const financedBase = Math.max(price - downAmount, 0);
  const financedWithLegal = financedBase * (1 + legalExpensesRate);
  const monthlyRate = annualInterestRate / 12;

  if (!months || financedWithLegal <= 0) return 0;
  if (monthlyRate <= 0) return Math.round(financedWithLegal / months);

  const factor = Math.pow(1 + monthlyRate, months);
  return Math.round((financedWithLegal * monthlyRate * factor) / (factor - 1));
}

type VehicleClientProps = {
  vehicle: Vehicle;
  settings: SiteSettings;
};

function renderHighlightedText(text: string) {
  return text.split(/(\*[^*]+\*)/g).map((part, index) =>
    part.startsWith("*") && part.endsWith("*") ? (
      <span className="text-highlight" key={`highlight-${index}`}>
        {part.slice(1, -1)}
      </span>
    ) : (
      part
    ),
  );
}

export default function VehicleClient({ vehicle, settings }: VehicleClientProps) {
  const [open, setOpen] = useState(false);
  const [down, setDown] = useState(20);
  const [months, setMonths] = useState(48);
  const [activeImage, setActiveImage] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const monthly = calculateEstimatedMonthlyPayment(vehicle.price, down, months);
  const headingLength = Math.max(settings.heading.trim().length, 1);
  const headingScale = Math.max(0.48, Math.min(1, 55 / headingLength));
  const headingStyle = {
    fontSize: `clamp(30px, ${(6.4 * headingScale).toFixed(2)}vw, ${Math.round(102 * headingScale)}px)`,
    lineHeight: headingLength > 65 ? 0.98 : 0.86,
    textAlign: "justify" as const,
    textAlignLast: "left" as const,
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;

        if (entry.isIntersecting) {
          try {
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => undefined);
          } catch {
            return;
          }
        } else {
          videoRef.current.pause();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, [vehicle.video]);

  const featureItems = vehicle.features
    .split(/·|\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  function goToSchedule() {
    const params = new URLSearchParams({
      vehicle: vehicle.name,
      year: vehicle.year,
      price: String(vehicle.price),
      down: String(down),
      months: String(months),
      monthly: String(monthly),
    });
    window.location.href = `/agendar?${params.toString()}`;
  }

  return (
    <main>
      <div className="announcement">{settings.announcement}</div>
      <nav className="nav">
        <div className="nav-links">
          <Link href="/">Inicio</Link>
          <a href="#vehiculo">El vehículo</a>
          <a href="#contacto">Contacto</a>
        </div>
        <Link className="brand" href="/">
          <img src="/el-tanque-motors-logo.png" alt="El Tanque Motors" className="brand-logo" />
        </Link>
      </nav>

      <section className="hero no-visual" id="inicio">
        <div className="hero-copy">
          <div className="heading-row">
            <p className="eyebrow">{settings.vehicleHeroEyebrow}</p>
          </div>
          <h1 style={headingStyle}>
            {settings.heading.split(" siempre ")[0]}
            <br />
            <em>
              {settings.heading.includes(" siempre ")
                ? "siempre " + settings.heading.split(" siempre ")[1]
                : ""}
            </em>
          </h1>
        </div>
      </section>

      <section className="inventory single-vehicle standalone-vehicle" id="vehiculo">
        <div className="vehicle-grid">
          <article className="vehicle-tile">
            <div className="video-manager">
              <p className="video-status">{settings.vehicleAvailabilityText}</p>
              <div className="tile-media">
                {vehicle.video ? (
                  <video
                    ref={videoRef}
                    src={vehicle.video}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <div className="mini-car">
                    <div />
                  </div>
                )}
              </div>
            </div>

            <section className="quick-quote">
              <div>
                <p className="eyebrow">{settings.quickQuoteEyebrow}</p>
                <p>{settings.quickQuoteText}</p>
              </div>
              <button className="btn quick-quote-btn" onClick={() => setOpen(true)}>
                {settings.quickQuoteButtonLabel} <span>↗</span>
              </button>
            </section>

            <div className="vehicle-details-panel">
              <section className="image-manager">
                <div className="image-manager-heading">
                  <div>
                    <p className="eyebrow">{settings.galleryEyebrow}</p>
                  </div>
                </div>
                {vehicle.images?.length ? (
                  <div className="angle-gallery">
                    <figure>
                      <img
                        src={vehicle.images[activeImage % vehicle.images.length]}
                        alt={`${vehicle.name}, ángulo ${(activeImage % vehicle.images.length) + 1}`}
                      />
                      {vehicle.images.length > 1 && (
                        <>
                          <button
                            className="gallery-arrow gallery-prev"
                            onClick={() =>
                              setActiveImage(
                                (activeImage - 1 + vehicle.images!.length) %
                                  vehicle.images!.length,
                              )
                            }
                            aria-label="Ver imagen anterior"
                          >
                            ←
                          </button>
                          <button
                            className="gallery-arrow gallery-next"
                            onClick={() =>
                              setActiveImage((activeImage + 1) % vehicle.images!.length)
                            }
                            aria-label="Ver imagen siguiente"
                          >
                            →
                          </button>
                        </>
                      )}
                      <figcaption>
                        Imagen {(activeImage % vehicle.images.length) + 1} de{" "}
                        {vehicle.images.length}
                      </figcaption>
                    </figure>
                  </div>
                ) : (
                  <div className="image-empty">
                    Próximamente verás aquí fotos del vehículo desde varios ángulos.
                  </div>
                )}
              </section>

              <div className="tile-info detached-info">
                <p>
                  {vehicle.year} · {vehicle.transmission.toUpperCase()}
                </p>
                <h3 className="vehicle-title">{renderHighlightedText(vehicle.name)}</h3>
                <div className="specs">
                  <span>{vehicle.km}</span>
                  <span>{vehicle.fuel}</span>
                </div>
                <p className="features-label">{settings.featuresLabel}</p>
                <ul className="features-checklist">
                  {featureItems.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
                <div className="vehicle-price">
                  <span>{renderHighlightedText(settings.priceLabel)}</span>
                  <strong>{money(vehicle.price)}</strong>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div className="trust vehicle-trust">
          <div>
            <strong>{settings.trustMonthsValue}</strong>
            <span>{settings.trustMonthsLabel}</span>
          </div>
          <div>
            <strong>{settings.trustDownValue}</strong>
            <span>{settings.trustDownLabel}</span>
          </div>
          <div>
            <strong>{settings.trustWarrantyValue}</strong>
            <span>{settings.trustWarrantyLabel}</span>
          </div>
        </div>

        <section className="benefits-strip">
          <p className="eyebrow">{settings.benefitsEyebrow}</p>
          <h3>{settings.benefitsTitle}</h3>
          <div className="benefits-grid">
            <article>
              <div className="benefit-icon">💵</div>
              <h4>{settings.benefitFinanceTitle}</h4>
              <p>{settings.benefitFinanceText}</p>
            </article>
            <article>
              <div className="benefit-icon">🏅</div>
              <h4>{settings.benefitWarrantyTitle}</h4>
              <p>{settings.benefitWarrantyText}</p>
            </article>
            <article>
              <div className="benefit-icon">🚗</div>
              <h4>{settings.benefitTradeInTitle}</h4>
              <p>{settings.benefitTradeInText}</p>
            </article>
          </div>
          <div className="benefits-cta">{settings.benefitsCta}</div>
        </section>

        <section className="finance" id="financiamiento">
          <div>
            <p className="eyebrow light">{settings.financeEyebrow}</p>
            <h2>
              {settings.financeTitleLine1}
              <br />
              <em>{settings.financeTitleAccent}</em>
            </h2>
          </div>
          <div className="finance-copy">
            <p>{settings.financeCopy}</p>
            <ul>
              <li>
                <b>01</b> {settings.financeBullet1}
              </li>
              <li>
                <b>02</b> {settings.financeBullet2}
              </li>
              <li>
                <b>03</b> {settings.financeBullet3}
              </li>
            </ul>
            <button className="btn light-btn" onClick={() => setOpen(true)}>
              {settings.financeButtonLabel} <span>↗</span>
            </button>
          </div>
        </section>
      </section>

      <footer id="contacto">
        <Link className="brand footer-brand" href="/">
          <img src="/el-tanque-motors-logo.png" alt="El Tanque Motors" className="footer-logo" />
        </Link>
        <p>Tu camino empieza aquí.</p>
        <Link href="/">Volver al inicio ↑</Link>
      </footer>

      {open && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <section
            className="quote-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button className="close" aria-label="Cerrar" onClick={() => setOpen(false)}>
              ×
            </button>
            <div className="modal-intro">
              <p className="eyebrow">{settings.modalEyebrow}</p>
              <h2 id="modal-title">{settings.modalTitle}</h2>
              <p>{settings.modalText}</p>
              <div className="selected-car">
                <span>{settings.selectedVehicleLabel}</span>
                <strong>{vehicle.name}</strong>
                <small>{money(vehicle.price)}</small>
              </div>
            </div>
            <div className="simulator">
              <p className="eyebrow">{settings.simulatorEyebrow}</p>
              <h2>
                {settings.simulatorTitlePrefix} {vehicle.name} {vehicle.year}
              </h2>
              <p className="simulator-note">{settings.simulatorImportant}</p>
              <p className="simulator-warning">{settings.simulatorWarning}</p>
              <label>
                {settings.downPaymentLabel} <b>{down}%</b>
                <input
                  type="range"
                  min="20"
                  max="70"
                  step="5"
                  value={down}
                  onChange={(e) => setDown(+e.target.value)}
                />
                <span className="range-labels">
                  <small>20%</small>
                  <small>70%</small>
                </span>
              </label>
              <div className="down-payment-box">
                <span>
                  {settings.downAmountLabel} {down}%
                </span>
                <strong>{money((vehicle.price * down) / 100)}</strong>
              </div>
              <label>{settings.termLabel}</label>
              <div className="stepper">
                <button
                  onClick={() =>
                    setMonths(
                      termOptions[Math.max(0, termOptions.indexOf(months) - 1)],
                    )
                  }
                  aria-label="Reducir plazo"
                >
                  −
                </button>
                <strong>
                  {months}
                  <small> meses</small>
                </strong>
                <button
                  onClick={() =>
                    setMonths(
                      termOptions[
                        Math.min(
                          termOptions.length - 1,
                          termOptions.indexOf(months) + 1,
                        )
                      ],
                    )
                  }
                  aria-label="Aumentar plazo"
                >
                  ＋
                </button>
              </div>
              <div className="estimate">
                <span>{settings.estimateLabel}</span>
                <strong>{money(monthly)}</strong>
                <small>Enganche: {money((vehicle.price * down) / 100)}</small>
              </div>
              <button className="btn modal-btn" onClick={goToSchedule}>
                {settings.simulatorButtonLabel} <span>↗</span>
              </button>
              <p className="disclaimer">{settings.simulatorDisclaimer}</p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
