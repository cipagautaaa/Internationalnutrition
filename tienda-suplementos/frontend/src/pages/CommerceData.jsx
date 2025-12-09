import React from 'react';

const CommerceData = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Datos del Comercio</h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Identificación</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Nombre comercial: International Nutrition (INT Suplementos).</li>
                <li>Razón social: International Nutrition (actualizar si aplica una denominación distinta).</li>
                <li>NIT: actualice este campo con el número oficial.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Contacto y servicio al cliente</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Correo: internationalnutritioncol@gmail.com</li>
                <li>Teléfono/WhatsApp: +57 300 685 1794</li>
                <li>Horarios: Lun a Sáb 9:00 AM - 1:00 PM y 3:00 PM - 8:00 PM. Domingos y festivos 10:00 AM - 5:00 PM.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Direcciones físicas</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Cra 10 #22-70 Local 101, Tunja, Boyacá.</li>
                <li>Avenida Circunvalar 12-20, Duitama, Boyacá.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Políticas relevantes</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><a href="/politica-privacidad" className="text-red-700 hover:text-red-800">Política de Privacidad</a></li>
                <li><a href="/terminos-condiciones" className="text-red-700 hover:text-red-800">Términos y Condiciones</a></li>
                <li><a href="/politica-envios" className="text-red-700 hover:text-red-800">Política de Envíos</a></li>
                <li><a href="/cambios-devoluciones-garantias" className="text-red-700 hover:text-red-800">Cambios, Devoluciones y Garantías</a></li>
                <li><a href="/politica-cookies" className="text-red-700 hover:text-red-800">Política de Cookies</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Atención de PQRS y garantías</h2>
              <p>Para peticiones, quejas, reclamos o trámites de garantía, contáctenos por correo o WhatsApp indicando número de pedido, fecha y descripción del caso. Respondemos dentro de los plazos legales.</p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">Última actualización: {new Date().toLocaleDateString('es-CO')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommerceData;
