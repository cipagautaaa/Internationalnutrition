import React from 'react';

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Envíos</h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Cobertura</h2>
              <p>Realizamos envíos a nivel nacional en Colombia a través de transportadoras aliadas. Algunas zonas rurales o de difícil acceso pueden requerir tiempos adicionales.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Tiempos de entrega</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Ciudades principales: 1 a 3 días hábiles después de la confirmación de pago.</li>
                <li>Otras ciudades o zonas especiales: 3 a 7 días hábiles.</li>
                <li>Procesamiento del pedido: usualmente dentro de 1 día hábil si el pago es aprobado.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Costos de envío</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Envío gratis desde $80.000 en compras dentro de nuestra cobertura estándar.</li>
                <li>Para pedidos menores o zonas especiales, el costo se calcula en el checkout antes de pagar.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Seguimiento</h2>
              <p>Compartimos la guía de rastreo por correo o WhatsApp. Puede consultar el estado en el portal de la transportadora. Mantenga sus datos de contacto actualizados para avisos de entrega.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Recepción y novedades</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Verifique el estado del empaque al recibir. Si nota daños o faltantes, repórtelo en máximo 24 horas con fotos del empaque y del producto.</li>
                <li>En caso de ausencia en la dirección, la transportadora puede realizar nuevos intentos o solicitar reprogramación; esto puede generar costos adicionales.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Direcciones y correcciones</h2>
              <p>Revise que la dirección esté completa antes de pagar. Si necesita corregirla, contáctenos de inmediato; si el paquete ya fue despachado, se aplicarán las políticas de la transportadora.</p>
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

export default ShippingPolicy;
