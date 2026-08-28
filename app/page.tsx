'use client';
import { ChangeEvent, useMemo, useState } from 'react';

type Vehicle = { name:string; year:string; km:string; price:number; features:string; video?:string };
const initial:Vehicle[] = [
  {name:'Mazda CX-5',year:'2024',km:'28,400 km',price:485000,features:'Motor 2.5 L · Cámara de reversa · Asientos de piel · Pantalla con Apple CarPlay'},
];

const money = (value:number) => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(value);

export default function Home(){
  const [open,setOpen]=useState(false);
  const [heading,setHeading]=useState('Maneja lo que siempre quisiste.');
  const [editing,setEditing]=useState(false);
  const [vehicles,setVehicles]=useState(initial);
  const [selected,setSelected]=useState(initial[0]);
  const [down,setDown]=useState(20);
  const [months,setMonths]=useState(48);
  const [sent,setSent]=useState(false);
  const monthly=useMemo(()=>Math.round((selected.price*(1-down/100))/months),[selected,down,months]);

  function quote(vehicle=vehicles[0]){setSelected(vehicle);setSent(false);setOpen(true)}
  function upload(index:number,e:ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];if(!file)return;const url=URL.createObjectURL(file);setVehicles(list=>list.map((v,i)=>i===index?{...v,video:url}:v));}

  return <main>
    <nav className="nav"><a className="brand" href="#inicio"><span className="brand-mark">ET</span><span>EL TANQUE <b>MOTORS</b></span></a><div className="nav-links"><a href="#vehiculo">El vehículo</a><a href="#financiamiento">Financiamiento</a><a href="#contacto">Contacto</a></div></nav>

    <section className="hero" id="inicio"><div className="hero-copy"><div className="heading-row"><p className="eyebrow">TU PRÓXIMO VEHÍCULO ESTÁ AQUÍ</p><button className="edit-link" onClick={()=>setEditing(!editing)}>{editing?'Listo':'✎ Editar encabezado'}</button></div>{editing?<textarea className="heading-editor" value={heading} onChange={e=>setHeading(e.target.value)} aria-label="Editar encabezado"/>:<h1>{heading.split(' siempre ')[0]}<br/><em>{heading.includes(' siempre ')?'siempre '+heading.split(' siempre ')[1]:''}</em></h1>}<p className="hero-text">Conoce este vehículo, descubre cada característica y encuentra un financiamiento flexible con una garantía que sí responde.</p><div className="hero-actions"><a href="#vehiculo" className="text-link">Conocer el vehículo <span>↓</span></a></div><div className="trust"><div><strong>60</strong><span>meses de<br/>financiamiento</span></div><div><strong>20%</strong><span>de enganche<br/>desde</span></div><div><strong>✓</strong><span>GARANTÍA EL<br/>TANQUE MOTORS</span></div></div></div><div className="hero-visual"><div className="sun"/><div className="speed-lines"/><div className="car-shape"><div className="windshield"/><div className="wheel wheel-a"/><div className="wheel wheel-b"/><div className="headlight"/></div><span className="stock-pill">● DISPONIBLE AHORA</span><p className="model-label">2024 · SUV PREMIUM</p></div></section>

    <section className="inventory single-vehicle" id="vehiculo"><div className="inventory-top"><div><p className="eyebrow">CONOCE EL VEHÍCULO</p><h2>Hecho para ti.</h2></div><div><p>Muestra su video y edita las características para que tu cliente conozca cada detalle.</p></div></div><div className="vehicle-grid">{vehicles.map((v,i)=><article className="vehicle-tile" key={`${v.name}-${i}`}><div className="tile-media">{v.video?<video src={v.video} controls playsInline/>:<div className="mini-car"><div/></div>}<label className="upload-btn"><input type="file" accept="video/*" onChange={e=>upload(i,e)}/>{v.video?'Cambiar video':'＋ Subir video'}</label></div><div className="tile-info"><p>{v.year} · AUTOMÁTICO</p><input className="vehicle-name" value={v.name} onChange={e=>setVehicles(list=>list.map((x,n)=>n===i?{...x,name:e.target.value}:x))} aria-label="Nombre del vehículo"/><div className="specs"><span>{v.km}</span><span>Gasolina</span></div><label className="features-label" htmlFor={`features-${i}`}>Características del vehículo</label><textarea id={`features-${i}`} className="features-editor" value={v.features} onChange={e=>setVehicles(list=>list.map((x,n)=>n===i?{...x,features:e.target.value}:x))} aria-label={`Características de ${v.name}`}/><div className="vehicle-price"><span>Precio</span><strong>{money(v.price)}</strong></div><button className="btn vehicle-quote" onClick={()=>quote(v)}>Cotiza aquí mismo <span>↗</span></button></div></article>)}</div></section>

    <section className="finance" id="financiamiento"><div><p className="eyebrow light">FINANCIAMIENTO A TU MEDIDA</p><h2>No pares.<br/><em>Nosotros te impulsamos.</em></h2></div><div className="finance-copy"><p>Ajusta tu enganche y encuentra un pago mensual pensado para ti.</p><ul><li><b>01</b> Enganche desde el 20%</li><li><b>02</b> Plazos de hasta 60 meses</li><li><b>03</b> GARANTÍA EL TANQUE MOTORS</li></ul><button className="btn light-btn" onClick={()=>quote()}>Cotiza aquí <span>↗</span></button></div></section>

    <footer id="contacto"><a className="brand footer-brand" href="#inicio"><span className="brand-mark">ET</span><span>EL TANQUE <b>MOTORS</b></span></a><p>Tu camino empieza aquí.</p><a href="#inicio">Volver arriba ↑</a></footer>

    {open&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setOpen(false)}><section className="quote-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="close" aria-label="Cerrar" onClick={()=>setOpen(false)}>×</button><div className="modal-intro"><p className="eyebrow">EL TANQUE MOTORS</p><h2 id="modal-title">Agenda hoy mismo tu cita</h2><p>Al presentarte obtén: hasta <strong>60 meses de financiamiento</strong> y <strong>GARANTÍA EL TANQUE MOTORS</strong>.</p><div className="selected-car"><span>Vehículo seleccionado</span><strong>{selected.name}</strong><small>{money(selected.price)}</small></div></div><div className="simulator"><p className="eyebrow">CALCULA TU MENSUALIDAD</p><h2>Simulador de pagos</h2><label>Enganche inicial <b>{down}%</b><input type="range" min="20" max="70" step="5" value={down} onChange={e=>setDown(+e.target.value)}/><span className="range-labels"><small>20%</small><small>70%</small></span></label><label>Plazo del préstamo (meses)</label><div className="stepper"><button onClick={()=>setMonths(Math.max(12,months-6))} aria-label="Reducir plazo">−</button><strong>{months}<small> meses</small></strong><button onClick={()=>setMonths(Math.min(60,months+6))} aria-label="Aumentar plazo">＋</button></div><div className="estimate"><span>Pago mensual estimado*</span><strong>{money(monthly)}</strong><small>Enganche: {money(selected.price*down/100)}</small></div>{sent?<div className="success">✓ Solicitud recibida. Te contactaremos para confirmar tu cita.</div>:<form onSubmit={e=>{e.preventDefault();setSent(true)}}><div className="form-row"><input required placeholder="Tu nombre" aria-label="Tu nombre"/><input required type="tel" placeholder="Teléfono" aria-label="Teléfono"/></div><button className="btn modal-btn">Agendar cita para verlo <span>↗</span></button></form>}<p className="disclaimer">*Cálculo informativo. La mensualidad final depende de aprobación y condiciones de crédito.</p></div></section></div>}
  </main>
}
