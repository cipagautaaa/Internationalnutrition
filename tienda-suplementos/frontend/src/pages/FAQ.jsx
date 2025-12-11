import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { getWhatsappUrl } from '../utils/whatsapp';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const whatsappSupportLink = useMemo(
    () => getWhatsappUrl('Hola, tengo una pregunta sobre los productos y necesito asesoría.'),
    []
  );

  const faqSections = [
    {
      title: 'MAYORISTAS Y DISTRIBUIDORES',
      questions: [
        {
          question: '¿Cómo solicito ser mayorista?',
          answer: 'Escríbenos por WhatsApp con tu nombre, ciudad, NIT o cédula y el tipo de negocio que tienes. Te habilitamos precios de distribuidor, te enviamos el catálogo actualizado y acompañamos la primera compra para que arranques sin dudas.'
        },
        {
          question: '¿Existe pedido mínimo para acceder a precios mayoristas?',
          answer: 'Trabajamos precios de distribuidor en compras por volumen. Cuéntanos las referencias y cantidades que necesitas y te confirmamos el mínimo y la cotización exacta para tu caso.'
        },
        {
          question: '¿Cómo funcionan los envíos y los tiempos para mayoristas?',
          answer: 'Despachamos en 24-48 horas hábiles según disponibilidad. Enviamos a todo el país con transportadoras aliadas o puedes recoger en tienda. Compartimos la guía y el seguimiento en cuanto el pedido sale a ruta.'
        },
        {
          question: '¿Qué métodos de pago aceptan para compras al por mayor?',
          answer: 'Recibimos transferencias bancarias, pagos con link seguro y datáfono en tienda. Para separar inventario podemos pedir un anticipo y el saldo se liquida antes del despacho.'
        }
      ]
    },
    {
      title: 'PRODUCTOS Y SUPLEMENTOS',
      questions: [
        {
          question: '¿Cómo sé qué suplemento es adecuado para mí?',
          answer: 'Recomendamos consultar con un profesional de la salud o nutricionista deportivo. En nuestra tienda, cada producto incluye una descripción detallada de sus beneficios y uso recomendado. También puedes contactarnos por WhatsApp para recibir asesoría personalizada.'
        },
        {
          question: '¿Los productos son originales?',
          answer: 'Sí, todos nuestros productos son 100% originales e importados directamente de las marcas autorizadas. Contamos con certificados de autenticidad y garantizamos la calidad de cada suplemento.'
        },
        {
          question: '¿Cuál es la fecha de vencimiento de los productos?',
          answer: 'Todos nuestros productos tienen al menos 6 meses de vida útil desde el momento de la compra. La fecha de vencimiento específica está indicada en cada envase.'
        },
        {
          question: '¿Puedo tomar varios suplementos al mismo tiempo?',
          answer: 'Depende de los productos. Algunos suplementos pueden combinarse sin problema, mientras que otros requieren supervisión profesional. Te recomendamos consultar con un especialista antes de combinar suplementos.'
        }
      ]
    },
    {
      title: 'ENVÍOS Y ENTREGAS',
      questions: [
        {
          question: '¿Cuánto tarda el envío?',
          answer: 'Los tiempos de entrega varían según tu ubicación. En Tunja, las entregas se realizan el mismo dia. Para otras ciudades principales, el tiempo estimado es de 3-5 días hábiles. Ciudades más alejadas pueden tardar hasta 7 días hábiles.'
        },
        {
          question: '¿Puedo hacer seguimiento a mi pedido?',
          answer: 'Sí, una vez procesado tu pedido, recibirás un código de seguimiento por correo electrónico. Podrás rastrear tu envío en tiempo real a través de la transportadora asignada.'
        },
        {
          question: '¿Cuál es el costo del envío?',
          answer: 'El costo de envío se calcula automáticamente según tu ubicación y el peso de tu pedido. Ofrecemos envío gratis en compras superiores a $80.000 en ciudades principales.'
        },
        {
          question: '¿Entregan en todo Colombia?',
          answer: 'Sí, realizamos entregas a nivel nacional. Llegamos a todas las ciudades y municipios de Colombia a través de nuestras transportadoras aliadas.'
        }
      ]
    },
    {
      title: 'CAMBIOS Y DEVOLUCIONES',
      questions: [
        {
          question: '¿Puedo cambiar un producto si no me quedó bien?',
          answer: 'Los suplementos no admiten cambios por temas de salud e higiene, salvo que el producto llegue en mal estado o con defecto de fábrica. En ese caso, tienes 5 días hábiles desde la recepción para solicitar el cambio.'
        },
        {
          question: '¿Aceptan devoluciones?',
          answer: 'Aceptamos devoluciones únicamente si el producto llega defectuoso, dañado o si recibiste un producto diferente al solicitado. El producto debe estar sin abrir y en su empaque original.'
        },
        {
          question: '¿Qué pasa si recibo un producto con defecto?',
          answer: 'Si recibes un producto defectuoso o dañado, contáctanos inmediatamente a través de WhatsApp o correo electrónico con fotos del producto. Gestionaremos el cambio o reembolso de forma inmediata sin costo adicional.'
        },
        {
          question: '¿Cómo solicito un cambio o devolución?',
          answer: 'Contacta nuestro servicio al cliente por WhatsApp, correo electrónico o teléfono dentro de los 5 días hábiles posteriores a la recepción del producto. Proporciona tu número de orden y describe el motivo del cambio.'
        }
      ]
    },
    {
      title: 'PAGOS Y DESCUENTOS',
      questions: [
        {
          question: '¿Qué medios de pago aceptan?',
          answer: 'Aceptamos múltiples formas de pago: tarjetas de crédito y débito (Visa, Mastercard, American Express), PSE, pagos en efectivo a través de puntos autorizados, y transferencias bancarias. El pago se procesa de forma segura a través de Wompi.'
        },
        {
          question: '¿Cómo uso mi cupón de descuento?',
          answer: 'Durante el proceso de pago, encontrarás un campo para ingresar tu código de cupón. Escribe el código y haz clic en "Aplicar". El descuento se reflejará automáticamente en el total de tu compra antes de finalizar el pago.'
        },
        {
          question: '¿Puedo pagar contra entrega?',
          answer: 'Actualmente no ofrecemos pago contra entrega. Todos los pedidos deben pagarse en línea para confirmar la orden. Esto nos permite procesar y enviar tu pedido de forma más rápida y segura.'
        },
        {
          question: '¿Ofrecen descuentos por volumen?',
          answer: 'Sí, ofrecemos descuentos especiales para compras al por mayor. Si estás interesado en adquirir grandes cantidades para tu gimnasio, tienda o uso personal, contáctanos directamente para recibir una cotización personalizada.'
        }
      ]
    }
  ];

  const toggleQuestion = (sectionIndex, questionIndex) => {
    const key = `${sectionIndex}-${questionIndex}`;
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            PREGUNTAS FRECUENTES
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-[250px,1fr] gap-8">
          {/* Sidebar Navigation */}
          <div className="hidden md:block">
            <nav className="sticky top-24 space-y-2">
              {faqSections.map((section, idx) => (
                <a
                  key={idx}
                  href={`#section-${idx}`}
                  className="block text-sm font-medium text-gray-600 hover:text-gray-900 py-2 transition-colors"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>

          {/* FAQ Content */}
          <div className="space-y-12">
            {faqSections.map((section, sectionIndex) => (
              <div key={sectionIndex} id={`section-${sectionIndex}`}>
                {/* Section Title */}
                <h2 className="text-xs font-bold text-gray-900 mb-6 tracking-wider">
                  {section.title}
                </h2>

                {/* Questions */}
                <div className="space-y-4">
                  {section.questions.map((item, questionIndex) => {
                    const key = `${sectionIndex}-${questionIndex}`;
                    const isOpen = openIndex === key;

                    return (
                      <div
                        key={questionIndex}
                        className="border-b border-gray-200 pb-4"
                      >
                        <button
                          onClick={() => toggleQuestion(sectionIndex, questionIndex)}
                          className="w-full flex items-start justify-between gap-4 text-left group"
                        >
                          <span className="text-base font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                            {item.question}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {/* Answer */}
                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            isOpen ? 'max-h-96 mt-4' : 'max-h-0'
                          }`}
                        >
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {sectionIndex === 0 && (
                  <div className="my-10 border-t border-dashed border-gray-200" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 border-t border-gray-200 pt-12">
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              ¿No encontraste lo que buscabas?
            </h3>
            <p className="text-gray-600 mb-6">
              Nuestro equipo está listo para ayudarte
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={whatsappSupportLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Contactar por WhatsApp
              </a>
              <a
                href="/contacto"
                className="px-6 py-3 border-2 border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
              >
                Enviar un mensaje
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
