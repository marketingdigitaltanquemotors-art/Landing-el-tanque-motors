import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gracias por agendar | El Tanque Motors",
  description: "Tu solicitud de cita fue recibida correctamente.",
};

export default function ThanksPage() {
  return (
    <main className="thank-you-page">
      <div className="announcement">SOLO PARA PERSONAS INTERESADAS EN COMPRAR VEHÍCULOS USADOS</div>
      <nav className="nav">
        <div className="nav-links">
          <Link href="/">Inicio</Link>
          <Link href="/">Vehículos</Link>
          <Link href="/#contacto">Contacto</Link>
        </div>
        <Link className="brand" href="/">
          <img src="/el-tanque-motors-logo.png" alt="El Tanque Motors" className="brand-logo" />
        </Link>
      </nav>

      <section className="thank-you-card" aria-labelledby="thank-you-title">
        <div className="thank-you-check" aria-hidden="true">✓</div>
        <p className="eyebrow">CITA RECIBIDA</p>
        <h1 id="thank-you-title">¡Gracias por agendar tu cita!</h1>
        <p>
          Tu solicitud ha sido recibida correctamente.
          <br />
          Nuestro equipo de El Tanque Motors se pondrá en contacto contigo para
          confirmar los detalles de tu cita.
        </p>
        <Link className="btn" href="/">
          Ver más vehículos <span>↗</span>
        </Link>
      </section>
    </main>
  );
}
