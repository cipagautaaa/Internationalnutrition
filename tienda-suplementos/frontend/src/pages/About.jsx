import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import tiendaTunjaImg from '../assets/images/tiendatunja.jpg';
import tiendaDuitamaImg from '../assets/images/tiendaduitama.jpg';

const images = {
  hero: 'https://pub-6737b83783eb40a5b8ef162f94b4e30c.r2.dev/suplementos/videos/_MG_9355-Enhanced-NR.jpg',
  purposeTop: 'https://pub-6737b83783eb40a5b8ef162f94b4e30c.r2.dev/suplementos/videos/_MG_0437-Mejorado-NR-2.jpg',
  purposeBottom: 'https://pub-6737b83783eb40a5b8ef162f94b4e30c.r2.dev/suplementos/videos/_MG_9918-Mejorado-RD-NR.jpg',
};

const locations = [
  { city: 'Tunja', image: tiendaTunjaImg },
  { city: 'Duitama', image: tiendaDuitamaImg },
];

export default function About() {
  return (
    <div className="bg-neutral-950 text-white min-h-screen">
      <section className="relative overflow-hidden">
        <img src={images.hero} alt="International Nutrition COL" className="w-full h-[420px] object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-neutral-950" />
        <div className="absolute inset-0 flex flex-col justify-end max-w-6xl mx-auto px-6 pb-12">
          <p className="text-xs tracking-[0.35em] uppercase text-white/70">International Nutrition COL</p>
          <h1 className="text-4xl sm:text-5xl font-bold mt-3">Sobre Nosotros</h1>
          <p className="max-w-2xl text-white/80 mt-4 text-base">
            Nacimos en San Gil en 2020. Somos una empresa creada por dos amigos y enfocada en el asesoramiento y la venta de suplementación e implementación deportiva.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-14 space-y-14">
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div className="space-y-6">
            <p className="text-xs tracking-[0.3em] uppercase text-red-300">Propósito</p>
            <h2 className="text-3xl font-semibold">Impulsamos rendimiento y servicio digital</h2>
            <p className="text-white/80 leading-relaxed">
              International Nutrition COL se ha logrado posicionar como empresa líder en Boyacá en la venta de suplementos al por mayor y al detal, además de expandirse a todo el país gracias al trabajo de marketing y publicidad invertido.
              <br />
              <br />
              Nuestra ética de trabajo destaca la importancia del factor humano: asesoría real, enfoque deportivo y acompañamiento en cada compra. También organizamos eventos con la participación de centenas de personas, incluyendo invitados especiales como Farid Nafah.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-red-600/20 blur-3xl" aria-hidden="true" />
            <div className="relative grid gap-4">
              <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900 aspect-[3/4]">
                <img src={images.purposeTop} alt="Comunidad y eventos" className="w-full h-full object-contain" />
              </div>
              <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <img src={images.purposeBottom} alt="Invitado especial en evento" className="w-full h-56 object-cover" />
              </div>
            </div>
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
