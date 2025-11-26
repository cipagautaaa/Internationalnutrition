const ProcessSection = () => {
  const steps = [
    {
      number: '01',
      title: 'Elige tu objetivo fitness',
      description: 'Elige tu objetivo fitness y recibe asesoría en suplementación deportiva.'
    },
    {
      number: '02',
      title: 'Selecciona tus suplementos favoritos',
      description: 'Escoge tus productos: proteína, creatina, pre entreno y más.'
    },
    {
      number: '03',
      title: 'Realiza tu compra con métodos 100% seguros',
      description: 'Compra fácil y segura desde cualquier parte de Colombia.'
    },
    {
      number: '04',
      title: 'Recibe tus suplementos en casa',
      description: 'Recibe tus suplementos originales en casa, listos para usar.'
    }
  ];

  return (
    <section className="bg-white py-20 relative" id="process">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Layout de 2 columnas: Sticky left + Scrollable right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Lado izquierdo - Steps scrolleables */}
          <div className="space-y-16 py-12 lg:order-1">
            {steps.map((step, index) => (
              <div
                key={index}
                className="group relative"
              >
                {/* Línea conectora vertical */}
                {index < steps.length - 1 && (
                  <div className="absolute left-7 top-16 bottom-0 w-px bg-gradient-to-b from-red-100 via-gray-200 to-transparent" />
                )}

                <div className="flex items-start gap-6 relative">
                  {/* Número con círculo */}
                  <div className="flex-shrink-0 relative z-10">
                    <div className="w-16 h-16 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center group-hover:border-red-600 group-hover:bg-red-50 transition-all duration-300 shadow-sm">
                      <span className="text-gray-900 font-semibold text-base group-hover:text-red-600">{step.number}</span>
                    </div>
                  </div>

                  {/* Contenido del step */}
                  <div className="flex-1 pt-1 pb-12">
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300">
                      {step.title}
                    </h3>
                    
                    <p className="text-gray-600 text-base leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lado derecho - Sticky */}
          <div
            className="lg:sticky lg:self-start max-w-xl lg:order-2 lg:mt-4"
            style={{ top: 'calc(50vh - 140px)' }}
          >
            <div className="mb-3">
              <span className="inline-block bg-gradient-to-r from-red-600 to-red-700 text-white text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-[0.18em]">
                El Proceso
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-3 leading-tight">
              Así aseguramos que tu suplementación llegue fácil y segura
            </h2>
            
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Seguimos un proceso claro: te guiamos con asesoría real, seleccionamos productos confiables,
              cobramos con métodos protegidos y entregamos rápido en cualquier ciudad de Colombia.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
