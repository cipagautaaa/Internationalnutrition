import React from 'react';

const ReturnsPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Cambios, Devoluciones y Garantías</h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Plazos</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Devoluciones por retracto o inconformidad: dentro de los 7 días calendario posteriores a la entrega.</li>
                <li>Garantías por defectos de fábrica: según la vigencia del fabricante; notifíquenos tan pronto detecte el problema.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Requisitos</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Producto sin abrir, en empaque original, con sellos intactos y accesorios completos.</li>
                <li>Factura o comprobante de compra.</li>
                <li>Para defectos, evidencias fotográficas o de video del daño y del estado del empaque.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Proceso</h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Escríbenos a internationalnutritioncol@gmail.com o al WhatsApp +57 300 685 1794 indicando número de pedido y motivo.</li>
                <li>Evaluaremos el caso y confirmaremos si procede cambio, devolución o trámite de garantía con el fabricante.</li>
                <li>Envía el producto a la dirección indicada o agenda recogida cuando aplique. Mantén el empaque de envío.</li>
                <li>Procesamos el reemplazo o reembolso una vez recibido y verificado el estado del producto.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Costos de transporte</h2>
              <p>Si el producto es defectuoso o hubo error de despacho, asumimos los costos de envío. En devoluciones por retracto, el cliente asume el flete de regreso.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Excepciones</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>No aplica para productos abiertos, manipulados, vencidos o sin sello de seguridad.</li>
                <li>No se aceptan devoluciones de productos personalizados o vendidos en liquidación final, salvo defecto.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Reembolsos</h2>
              <p>Los reembolsos se realizan al mismo medio de pago una vez aprobado el caso. El tiempo depende del operador financiero (usualmente entre 5 y 10 días hábiles tras la aprobación).</p>
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

export default ReturnsPolicy;
