import React from 'react';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Cookies</h1>
          
          <div className="space-y-6 text-gray-600">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">¿Qué son las cookies?</h2>
              <p>
                Las cookies son pequeños archivos de texto que se almacenan en su navegador cuando visita nuestro sitio web. 
                Estas cookies nos ayudan a hacer que nuestro sitio funcione correctamente, lo haga más seguro, proporcione una mejor experiencia de usuario 
                y nos permita analizar cómo se utiliza el sitio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Tipos de cookies que utilizamos</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Cookies Esenciales</h3>
                  <p>Necesarias para el funcionamiento básico del sitio. El sitio web no puede funcionar correctamente sin estas cookies.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Cookies de Rendimiento</h3>
                  <p>Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web, proporcionando información sobre las áreas visitadas, el tiempo de visita y cualquier problema encontrado.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Cookies de Funcionalidad</h3>
                  <p>Permiten que el sitio web recuerde las elecciones que realiza (como su nombre de usuario, idioma o la región en la que se encuentra) y proporcione características mejoradas.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Cookies de Marketing</h3>
                  <p>Se utilizan para realizar un seguimiento de los visitantes en los sitios web. La intención es mostrar anuncios relevantes y atractivos para el usuario individual.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">¿Cómo utilizamos las cookies?</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Para recordar sus preferencias y elecciones en el sitio</li>
                <li>Para entender cómo interactúa con nuestro sitio web</li>
                <li>Para mejorar la velocidad/seguridad del sitio</li>
                <li>Para permitirle compartir páginas en redes sociales</li>
                <li>Para asegurarnos de que recibe información relevante</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Control de cookies</h2>
              <p>
                Puede modificar la configuración de su navegador para bloquear o eliminar cookies. Sin embargo, tenga en cuenta 
                que bloquear las cookies puede afectar al funcionamiento correcto de nuestro sitio web y limitar su capacidad 
                para utilizar ciertas características.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Más información</h2>
              <p>
                Si tiene alguna pregunta sobre nuestro uso de cookies, no dude en contactarnos a través de:{' '}
                <a href="mailto:info@intsuplementos.com" className="text-primary-600 hover:text-primary-700">
                  info@intsuplementos.com
                </a>
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Última actualización: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;