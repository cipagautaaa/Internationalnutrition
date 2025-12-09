import React from 'react';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Términos y Condiciones</h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Objeto</h2>
              <p>Estas condiciones regulan el acceso y uso del sitio de International Nutrition (INT Suplementos) y la compra de productos ofrecidos en Colombia.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Registro y cuentas</h2>
              <p>El usuario debe proporcionar información veraz y mantenerla actualizada. Es responsable de la confidencialidad de sus credenciales y de cualquier actividad realizada en su cuenta.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Productos y precios</h2>
              <p>Los precios incluyen impuestos aplicables y se muestran en pesos colombianos. Las imágenes son referenciales; las descripciones detallan los componentes y presentaciones disponibles. Las ofertas son válidas mientras aparezcan publicadas o hasta agotar existencias.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Pedidos y pagos</h2>
              <p>El pedido se considera confirmado al recibir la aceptación del pago. Procesamos pagos mediante pasarelas seguras como Wompi; no almacenamos datos de tarjetas. En caso de error de inventario o validaciones antifraude, podremos cancelar y realizar la devolución correspondiente.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Envíos</h2>
              <p>Los envíos se rigen por la <a href="/politica-envios" className="text-red-700 hover:text-red-800">Política de Envíos</a>. Los tiempos y costos se informan antes de finalizar la compra.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Cambios, devoluciones y garantías</h2>
              <p>Se aplican las condiciones descritas en la <a href="/cambios-devoluciones-garantias" className="text-red-700 hover:text-red-800">Política de Cambios, Devoluciones y Garantías</a>. Los plazos y requisitos deben cumplirse para proceder con reembolsos o reposiciones.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Propiedad intelectual</h2>
              <p>Todo el contenido del sitio (textos, gráficos, logotipos) es propiedad de International Nutrition o cuenta con autorización de uso. Se prohíbe su reproducción sin permiso previo.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Limitación de responsabilidad</h2>
              <p>No nos hacemos responsables por usos indebidos de los productos ni por daños indirectos derivados del uso del sitio. La responsabilidad máxima se limitará al valor de la compra realizada.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Modificaciones</h2>
              <p>Podemos actualizar estos términos para reflejar cambios legales o de operación. La fecha de actualización se indica al final. El uso continuado del sitio implica aceptación de los cambios.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Contacto</h2>
              <p>Para dudas sobre estos términos, escríbanos a internationalnutritioncol@gmail.com o al +57 300 685 1794.</p>
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

export default TermsConditions;
