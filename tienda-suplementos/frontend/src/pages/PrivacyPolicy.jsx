import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Privacidad</h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Responsable y contacto</h2>
              <p>
                International Nutrition (INT Suplementos) es responsable del tratamiento de los datos personales que
                se recolectan a través de este sitio. Puede contactarnos en internationalnutritioncol@gmail.com o al
                +57 300 685 1794. Direcciones de atención: Cra 10 #22-70 Local 101, Tunja, Boyacá y Avenida Circunvalar 12-20, Duitama, Boyacá.
                NIT: actualice este campo con el número oficial.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Datos que recolectamos</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Datos de contacto y cuenta: nombre, correo, teléfono, dirección de entrega.</li>
                <li>Datos de compra: productos, montos, dirección de envío, preferencia de pago.</li>
                <li>Datos de pago: se procesan por pasarelas seguras (ej. Wompi). No almacenamos datos de tarjetas.</li>
                <li>Datos técnicos: cookies, identificadores de dispositivo y registros de actividad para seguridad y mejora.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Finalidades</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Procesar y entregar pedidos, gestionar pagos y facturación.</li>
                <li>Brindar soporte, seguimiento y gestión de garantías o devoluciones.</li>
                <li>Mejorar la experiencia del sitio, seguridad y prevención de fraude.</li>
                <li>Enviar comunicaciones relevantes sobre pedidos o, con su consentimiento, sobre promociones.</li>
                <li>Cumplir obligaciones legales y requerimientos de autoridades.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Bases legales</h2>
              <p>Tratamos datos con base en su consentimiento, la ejecución del contrato de compra, nuestro interés legítimo en mejorar el servicio y el cumplimiento de obligaciones legales.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Compartición de datos</h2>
              <p>Compartimos datos solo con proveedores que habilitan la operación (pasarela de pagos como Wompi, logística, analítica, hosting). No vendemos datos personales y exigimos a terceros garantías de seguridad y confidencialidad.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Derechos de los titulares</h2>
              <p>Puede acceder, actualizar, rectificar, suprimir sus datos, oponerse y revocar consentimientos escribiendo a internationalnutritioncol@gmail.com. Responderemos dentro de los plazos legales.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Conservación</h2>
              <p>Conservamos datos mientras exista una relación comercial activa y por los plazos necesarios para obligaciones legales, contables o de garantía. Luego se anonimizan o eliminan de forma segura.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Seguridad</h2>
              <p>Implementamos medidas técnicas y administrativas para proteger la información. Las transacciones se realizan mediante canales cifrados a través de proveedores certificados.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Cookies</h2>
              <p>Utilizamos cookies para mejorar la experiencia y la seguridad. Puede revisar el detalle y configuración en nuestra <a href="/politica-cookies" className="text-red-700 hover:text-red-800">Política de Cookies</a>.</p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500"> Última actualización: {new Date().toLocaleDateString('es-CO')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
