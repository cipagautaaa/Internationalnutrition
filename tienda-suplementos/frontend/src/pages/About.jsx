import React from 'react';
import { ShieldCheck, Rocket, Target, CheckCircle2, Clock3, Users as UsersIcon, Phone, Mail, MapPin, Layers } from 'lucide-react';
import heroImg from '../assets/images/fotonosotros.jpg';
import panelImg from '../assets/images/panelnosotros.jpg';
import sedesImg from '../assets/images/sedes.png';
import tiendaTunjaImg from '../assets/images/tiendatunja.jpg';
import tiendaDuitamaImg from '../assets/images/tiendaduitama.jpg';

const frontendHighlights = [
  'Interfaz React 18 + Vite con TailwindCSS, mobile-first y optimizada para rendimiento.',
  'Panel administrativo con triple capa de seguridad: JWT, roles y PIN TOTP como segundo factor.',
  'CRUD completo de productos, combos e implementos con gestión de variantes, stock y precios.',
  'Búsqueda en tiempo real, filtros por categoría/tipo/precio, productos destacados y Quick Add.',
  'Carrito persistente, integración de pagos Wompi, badges automáticos y experiencia coherente de marca.'
];

const backendHighlights = [
  'Backend en Node.js + Express con API REST para usuarios, catálogo, pedidos y pagos.',
  'MongoDB con modelos escalables; soporte para variantes y alto volumen de lecturas.',
  'Seguridad multicapa: JWT, roles, rate limiting, Helmet y CORS controlado.',
  'Autenticación con códigos por correo, endpoints seguros y administración de órdenes.',
  'Integración Wompi, webhooks de confirmación y logging centralizado con Morgan.'
];

const timeline = [
  {
    title: 'Inicio y arquitectura',
    detail: 'Semanas 1-3: levantamiento de requisitos, selección de stack (React, Node, Express, TailwindCSS, MongoDB) y creación de repositorios.'
  },
  {
    title: 'Diseño y experiencia',
    detail: 'Semanas 4-7: prototipos, componentes base, menú, catálogo responsivo y panel admin seguro.'
  },
  {
    title: 'Catálogo y pagos',
    detail: 'Semanas 8-11: CRUD de productos/combos/implementos, carrito, filtros, pasarela Wompi y pruebas de flujo.'
  },
  {
    title: 'Documentación y entrega',
    detail: 'Semanas 12-15: hardening de seguridad, validaciones, manuales técnicos y de usuario, y preparación de despliegue.'
  }
];

const values = [
  'Seguridad multicapa en todo el ciclo: autenticación, roles, 2FA y control de acceso.',
  'Experiencia mobile-first para que la compra sea fluida en cualquier dispositivo.',
  'Escalabilidad: arquitectura modular, APIs claras y base de datos preparada para crecer.',
  'Trabajo en equipo y comunicación continua entre frontend y backend.',
  'Aprendizaje permanente: validaciones, pruebas y mejoras iterativas.'
];

const team = [
  { name: 'Luis Miguel Cipagauta Pardo', role: 'Frontend – Interfaz, UX, panel admin y experiencia de compra.' },
  { name: 'Juan Pablo Bayona Garavito', role: 'Backend – API REST, seguridad, base de datos y pagos.' },
  { name: 'Edgar Camilo Becerra Moreno', role: 'Representante de International Nutrition COL.' }
];

const locations = [
  { city: 'Tunja', image: tiendaTunjaImg },
  { city: 'Duitama', image: tiendaDuitamaImg },
];

export default function About() {
  return (
    <div className="bg-neutral-950 text-white min-h-screen">
      <section className="relative overflow-hidden">
        <img src={heroImg} alt="Equipo International Nutrition" className="w-full h-[420px] object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-neutral-950" />
        <div className="absolute inset-0 flex flex-col justify-end max-w-6xl mx-auto px-6 pb-12">
          <p className="text-xs tracking-[0.35em] uppercase text-white/70">International Nutrition COL</p>
          <h1 className="text-4xl sm:text-5xl font-bold mt-3">Sobre Nosotros</h1>
          <p className="max-w-2xl text-white/80 mt-4 text-base">
            Somos la casa de la suplementación deportiva en Boyacá. Pasamos de procesos manuales a una experiencia de e-commerce completa, segura y lista para crecer.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-14 space-y-14">
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div className="space-y-6">
            <p className="text-xs tracking-[0.3em] uppercase text-red-300">Propósito</p>
            <h2 className="text-3xl font-semibold">Impulsamos rendimiento y servicio digital</h2>
            <p className="text-white/80 leading-relaxed">
              Nacimos para acercar la mejor suplementación deportiva a nuestros clientes con asesoría real, inventario confiable y entregas oportunas. Modernizamos la operación para dejar atrás el manejo manual y ofrecer compras en línea, control de inventarios y atención omnicanal.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/5">
                <Target className="w-10 h-10 text-red-400" />
                <p className="mt-3 text-lg font-semibold">Objetivo general</p>
                <p className="text-sm text-white/70">Crear y operar una tienda online de suplementos que potencie las ventas y haga más ágil la gestión del negocio.</p>
              </div>
              <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/5">
                <Rocket className="w-10 h-10 text-red-400" />
                <p className="mt-3 text-lg font-semibold">Objetivos específicos</p>
                <ul className="mt-3 space-y-2 text-sm text-white/70 list-disc list-inside">
                  <li>Diseñar una interfaz intuitiva y visualmente atractiva.</li>
                  <li>Garantizar interactividad, filtros y navegación fluida.</li>
                  <li>Probar usabilidad para asegurar una compra sin fricción.</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-red-600/20 blur-3xl" aria-hidden="true" />
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img src={panelImg} alt="Operación y tiendas" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6 rounded-3xl bg-neutral-900 border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <Layers className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-semibold">Frontend</h3>
            </div>
            <ul className="space-y-3 text-sm text-white/80 list-disc list-inside">
              {frontendHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-3xl bg-neutral-900 border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-semibold">Backend</h3>
            </div>
            <ul className="space-y-3 text-sm text-white/80 list-disc list-inside">
              {backendHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-10 items-start">
          <div className="space-y-6">
            <p className="text-xs tracking-[0.3em] uppercase text-red-300">Cronograma 2025-2</p>
            <h3 className="text-2xl font-semibold">De idea a entrega</h3>
            <div className="space-y-4">
              {timeline.map((item) => (
                <div key={item.title} className="p-5 rounded-2xl bg-neutral-900/80 border border-white/5 flex gap-4">
                  <Clock3 className="w-6 h-6 text-red-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-white/70 mt-1 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 rounded-3xl bg-neutral-900 border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-semibold">Logros clave</h3>
            </div>
            <ul className="space-y-3 text-sm text-white/80 list-disc list-inside">
              <li>Catálogo completo con productos, implementos y combos listos para compra en línea.</li>
              <li>Carrito y checkout con pasarela Wompi y opción de asesoría por WhatsApp.</li>
              <li>Panel admin con control de inventario, productos destacados y ordenamiento del catálogo.</li>
              <li>Autenticación con roles, PIN 2FA y endpoints protegidos.</li>
              <li>Documentación técnica y manuales para mantener y escalar la plataforma.</li>
            </ul>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900/80 to-neutral-800 border border-white/5 space-y-5">
          <div className="flex items-center gap-3">
            <UsersIcon className="w-6 h-6 text-red-300" />
            <h3 className="text-xl font-semibold">Equipo y compromiso</h3>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            Proyecto de práctica empresarial 2025-2 – Universidad Santo Tomás, Seccional Tunja. Unimos la visión de negocio de International Nutrition COL con ingeniería de software moderna para entregar una experiencia de compra y administración sólida.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {team.map((member) => (
              <div key={member.name} className="p-4 rounded-2xl bg-neutral-800 border border-white/5">
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-white/70 mt-2">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <p className="text-xs tracking-[0.3em] uppercase text-red-300">Valores</p>
            <h3 className="text-2xl font-semibold">Cómo trabajamos</h3>
            <ul className="space-y-3 text-sm text-white/80 list-disc list-inside">
              {values.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
            <img src={sedesImg} alt="Equipo y comunidad" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-xs tracking-[0.3em] uppercase text-red-300">Sedes</p>
          <h3 className="text-2xl font-semibold">Te esperamos en tienda</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {locations.map((loc) => (
              <div key={loc.city} className="rounded-3xl overflow-hidden bg-neutral-900 border border-white/5 shadow-lg">
                <img src={loc.image} alt={`Tienda de ${loc.city}`} className="w-full h-52 object-cover" />
                <div className="p-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-400" />
                  <p className="font-semibold">{loc.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-3">
            <p className="text-xs tracking-[0.3em] uppercase text-red-300">Contacto</p>
            <h3 className="text-2xl font-semibold">Asesoría personalizada</h3>
            <p className="text-sm text-white/70">Atendemos por los canales que prefieras. Escríbenos para recomendaciones, envíos y cualquier duda.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-neutral-900 border border-white/5 flex items-start gap-3">
              <Phone className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <p className="font-semibold">WhatsApp</p>
                <p className="text-sm text-white/70">+57 300 685 1794</p>
                <p className="text-xs text-white/60 mt-1">Lun-Sáb 8:30am - 1:00pm / 3:00pm - 8:00pm · Dom 10:00am - 5:00pm</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900 border border-white/5 flex items-start gap-3">
              <Mail className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <p className="font-semibold">Correo</p>
                <p className="text-sm text-white/70">internationalnutritioncol@gmail.com</p>
                <p className="text-xs text-white/60 mt-1">Respondemos rápido para compras y soporte.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
