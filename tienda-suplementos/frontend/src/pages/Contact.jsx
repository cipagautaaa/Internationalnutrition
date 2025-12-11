import { useState } from 'react';
import panelNosotrosImg from '../assets/images/panelnosotros.jpg';
import { Mail, MessageCircle, Clock, Instagram, Loader2 } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', mensaje: '' });
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      let data = null;
      try {
        data = await res.json();
      } catch (parseErr) {
        // Respuesta no JSON; tratamos como error genérico
      }
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'No pudimos enviar tu mensaje');
      }
      setStatus({ loading: false, success: true, error: '' });
      setForm({ nombre: '', apellido: '', email: '', mensaje: '' });
      setTimeout(() => setStatus(s => ({ ...s, success: false })), 4000);
    } catch (err) {
      setStatus({ loading: false, success: false, error: err.message || 'Error inesperado' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero mostrando la imagen tal cual, sin recortes ni aspect ratio */}
      <section className="relative w-full bg-white">
        <div className="relative">
          <img
            src={panelNosotrosImg}
            alt="Panel Contacto"
            className="w-full h-auto block mx-auto select-none"
            style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
          />
          <h1
            className="absolute left-12 bottom-16 text-4xl sm:text-5xl font-bold text-white tracking-tight drop-shadow-lg"
            style={{ textShadow: '0 2px 8px #000' }}
          >
            Contacto
          </h1>
        </div>
      </section>

      {/* Info */}
      <section className="max-w-6xl mx-auto px-6 py-16 space-y-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-10">
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-[0.2em] text-gray-500">ATENCIÓN AL CLIENTE</p>
              <h2 className="text-3xl font-bold text-gray-900">Estamos para ayudarte</h2>
              <p className="text-gray-600 text-sm leading-relaxed max-w-md">Escríbenos y recibe asesoría sobre suplementos, envíos y métodos de pago. Contestamos rápido por WhatsApp y correo.</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-red-700/10 text-red-700">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-500">Servicio al cliente</p>
                  <p className="font-medium text-gray-900">internationalnutritioncol@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-red-700/10 text-red-700">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-500">WhatsApp</p>
                  <p className="font-medium text-gray-900">+57 300 685 1794</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-red-700/10 text-red-700">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-500">Horarios de servicio</p>
                  <p className="font-medium text-gray-900 text-sm leading-relaxed">Lun-Sáb 8:30am - 1:00pm / 3:00pm - 8:00pm<br />Domingos 10:00am - 5:00pm</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-sm">
            <form onSubmit={submit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="nombre" className="text-sm font-semibold text-gray-700">Nombre*</label>
                  <input id="nombre" name="nombre" required value={form.nombre} onChange={update} className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-700 focus:border-red-700 bg-white text-sm" placeholder="Tu nombre" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="apellido" className="text-sm font-semibold text-gray-700">Apellido*</label>
                  <input id="apellido" name="apellido" required value={form.apellido} onChange={update} className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-700 focus:border-red-700 bg-white text-sm" placeholder="Tu apellido" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700">Correo electrónico*</label>
                <input id="email" type="email" name="email" required value={form.email} onChange={update} className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-700 focus:border-red-700 bg-white text-sm" placeholder="tu@email.com" />
              </div>
              <div className="space-y-2">
                <label htmlFor="mensaje" className="text-sm font-semibold text-gray-700">Mensaje*</label>
                <textarea id="mensaje" name="mensaje" required rows={5} value={form.mensaje} onChange={update} className="w-full resize-none px-3 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-700 focus:border-red-700 bg-white text-sm" placeholder="Cuéntanos tu consulta" />
              </div>
              <button type="submit" disabled={status.loading} className="inline-flex items-center gap-2 px-6 h-11 rounded-lg bg-red-700 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-sm transition-all">
                {status.loading && <Loader2 className="w-4 h-4 animate-spin" />} Enviar
              </button>
              {status.success && <p className="text-sm text-green-600">Mensaje enviado. Te contactaremos pronto.</p>}
              {status.error && <p className="text-sm text-red-600">{status.error}</p>}
            </form>
          </div>
        </div>

        {/* Redes Sociales */}
        <div className="border-t border-gray-200 pt-12 space-y-6">
          <p className="text-xs font-semibold tracking-[0.25em] text-gray-500">REDES SOCIALES</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-3">
              <div className="space-y-2">
                <p className="text-gray-900 font-semibold">Instagram</p>
                <a href="https://instagram.com/internationalnutrition" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-lg font-bold text-red-700 hover:text-red-700">
                  <Instagram className="w-5 h-5" /> @InternationalNutrition
                </a>
              </div>
              <div className="space-y-2">
                <p className="text-gray-900 font-semibold">WhatsApp</p>
                <a href="https://wa.me/573006851794" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-lg font-bold text-green-600 hover:text-green-700">
                  <MessageCircle className="w-5 h-5" /> +57 300 685 1794
                </a>
              </div>
              <div className="space-y-2">
                <p className="text-gray-900 font-semibold">TikTok</p>
                <a href="https://www.tiktok.com/@internationalnutrition" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-lg font-bold text-gray-900 hover:text-gray-700">
                  <span className="text-xl">&#119070;</span> @InternationalNutrition
                </a>
              </div>
            </div>
            <p className="text-xs text-gray-500 max-w-md">Síguenos para ver lanzamientos, promociones y consejos diarios de nutrición deportiva.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
