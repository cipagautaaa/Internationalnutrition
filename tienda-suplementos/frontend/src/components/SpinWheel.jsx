import { useState, useRef, useEffect } from 'react';
import { X, Copy, Check, Gift, Zap, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

/**
 * Configuración de los segmentos de la ruleta
 * Debe coincidir con el backend para mostrar correctamente
 */
const WHEEL_SEGMENTS = [
  { id: 0, label: '10%', color: '#FF6B00', textColor: '#fff' },
  { id: 1, label: 'Regalo', color: '#8B5CF6', textColor: '#fff' },
  { id: 2, label: '5%', color: '#F97316', textColor: '#fff' },
  { id: 3, label: '15%', color: '#EAB308', textColor: '#000' },
  { id: 4, label: 'Perdiste', color: '#FFFFFF', textColor: '#333' },
  { id: 5, label: '20%', color: '#F97316', textColor: '#fff' },
  { id: 6, label: '10%', color: '#EF4444', textColor: '#fff' },
  { id: 7, label: '15%', color: '#EAB308', textColor: '#000' },
  { id: 8, label: 'Regalo', color: '#8B5CF6', textColor: '#fff' },
  { id: 9, label: '5%', color: '#22C55E', textColor: '#fff' },
  { id: 10, label: 'Suplemento Regalo', color: '#DC2626', textColor: '#fff', isLarge: true },
  { id: 11, label: '10%', color: '#3B82F6', textColor: '#fff' },
  { id: 12, label: '5%', color: '#10B981', textColor: '#fff' },
  { id: 13, label: 'Perdiste', color: '#FFFFFF', textColor: '#333' },
  { id: 14, label: 'Regalo', color: '#8B5CF6', textColor: '#fff' },
  { id: 15, label: '5%', color: '#EAB308', textColor: '#000' },
  { id: 16, label: '15%', color: '#22C55E', textColor: '#fff' },
  { id: 17, label: '5%', color: '#EF4444', textColor: '#fff' }
];

const SEGMENT_ANGLE = 360 / WHEEL_SEGMENTS.length;

/**
 * Componente de la Ruleta Anabólica
 */
const SpinWheel = ({ open, onClose }) => {
  const { isAuthenticated } = useAuth();
  const wheelRef = useRef(null);
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [wheelStatus, setWheelStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Cargar estado de la ruleta al abrir
  useEffect(() => {
    if (open && isAuthenticated) {
      fetchWheelStatus();
    }
  }, [open, isAuthenticated]);

  const fetchWheelStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get('/wheel/status');
      setWheelStatus(data.data);
    } catch (err) {
      console.error('Error cargando estado de ruleta:', err);
      setError('Error al cargar la ruleta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpin = async () => {
    if (isSpinning || !wheelStatus?.canSpin) return;
    
    setIsSpinning(true);
    setError(null);
    setResult(null);
    
    try {
      // Llamar al backend para obtener el resultado
      const { data } = await axios.post('/wheel/spin');
      const segment = data.data.segment;
      
      // Calcular rotación para que quede en el segmento correcto
      // La flecha apunta a la derecha (0°), así que calculamos la rotación
      const segmentIndex = segment.id;
      const baseRotation = 360 * 5; // 5 vueltas completas
      const targetAngle = 360 - (segmentIndex * SEGMENT_ANGLE) - (SEGMENT_ANGLE / 2);
      const finalRotation = baseRotation + targetAngle + (Math.random() * 10 - 5); // Pequeña variación
      
      setRotation(prev => prev + finalRotation);
      
      // Esperar a que termine la animación
      setTimeout(() => {
        setIsSpinning(false);
        setResult(data.data);
        setShowResult(true);
        
        // Si ganó un regalo, añadirlo al carrito
        if (data.data.prizeType === 'gift' || data.data.prizeType === 'supplement') {
          // Simular añadir regalo al carrito
          const giftProduct = {
            _id: `gift-${Date.now()}`,
            name: data.data.prizeType === 'supplement' ? 'Suplemento Regalo Sorpresa' : 'Regalo Sorpresa',
            price: 0,
            image: null,
            isGift: true,
            giftCode: data.data.prizeCode
          };
          // El carrito debería manejar esto especialmente
          console.log('Premio de regalo a añadir:', giftProduct);
        }
        
        // Actualizar estado local
        setWheelStatus(prev => ({
          ...prev,
          canSpin: data.data.canSpinAgain || false,
          spinAttempts: data.data.spinAttempts,
          prizePending: data.data.result === 'win' ? data.data.prizeCode : prev?.prizePending
        }));
        
      }, 5000); // Duración de la animación
      
    } catch (err) {
      console.error('Error girando ruleta:', err);
      setIsSpinning(false);
      setError(err.response?.data?.message || 'Error al girar la ruleta');
      
      if (err.response?.data?.data) {
        setWheelStatus(prev => ({
          ...prev,
          ...err.response.data.data
        }));
      }
    }
  };

  const handleCopyCode = () => {
    if (result?.prizeCode) {
      navigator.clipboard.writeText(result.prizeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    if (result?.result === 'win' || (result?.result === 'lose' && !result?.canSpinAgain)) {
      onClose();
    }
  };

  if (!open) return null;

  // Si no está autenticado, no debería llegar aquí pero por seguridad
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl p-8 max-w-md text-center">
          <p className="text-gray-700 mb-4">Debes iniciar sesión para jugar la Ruleta Anabólica</p>
          <button onClick={onClose} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-red-600/20">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition z-10"
          aria-label="Cerrar"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Título */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-full text-sm font-bold text-red-400 mb-3">
            <Zap className="w-4 h-4" />
            RULETA ANABÓLICA
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            ¡Gira y Gana!
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            {wheelStatus?.spinAttempts === 0 
              ? 'Tienes 2 oportunidades para ganar'
              : wheelStatus?.spinAttempts === 1 
                ? '¡Última oportunidad!'
                : 'Sin intentos disponibles'}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
          </div>
        ) : error && !wheelStatus ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={fetchWheelStatus} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold">
              Reintentar
            </button>
          </div>
        ) : wheelStatus?.isLocked && !wheelStatus?.canSpin ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {wheelStatus.prizePending && wheelStatus.prizePending !== 'NONE' 
                ? '¡Ya tienes un premio!' 
                : 'Ruleta bloqueada'}
            </h3>
            <p className="text-gray-400 mb-4">
              {wheelStatus.prizePending && wheelStatus.prizePending !== 'NONE'
                ? `Tu código: ${wheelStatus.prizePending}`
                : 'Realiza una compra para desbloquear la ruleta.'}
            </p>
            {wheelStatus.prizePending && wheelStatus.prizePending !== 'NONE' && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(wheelStatus.prizePending);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar código'}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Contenedor de la Ruleta */}
            <div className="relative flex items-center justify-center mb-6">
              {/* Flecha indicadora */}
              <div className="absolute right-0 z-20 transform translate-x-2">
                <div className="w-0 h-0 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent border-r-[25px] border-r-gray-300"></div>
              </div>
              
              {/* Ruleta SVG */}
              <div className="relative">
                <svg
                  ref={wheelRef}
                  width="300"
                  height="300"
                  viewBox="0 0 300 300"
                  className="drop-shadow-2xl"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
                  }}
                >
                  {/* Segmentos de la ruleta */}
                  {WHEEL_SEGMENTS.map((segment, i) => {
                    const startAngle = i * SEGMENT_ANGLE;
                    const endAngle = (i + 1) * SEGMENT_ANGLE;
                    const startRad = (startAngle - 90) * Math.PI / 180;
                    const endRad = (endAngle - 90) * Math.PI / 180;
                    
                    const x1 = 150 + 140 * Math.cos(startRad);
                    const y1 = 150 + 140 * Math.sin(startRad);
                    const x2 = 150 + 140 * Math.cos(endRad);
                    const y2 = 150 + 140 * Math.sin(endRad);
                    
                    const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0;
                    
                    // Posición del texto
                    const midAngle = (startAngle + endAngle) / 2 - 90;
                    const textRad = midAngle * Math.PI / 180;
                    const textX = 150 + 95 * Math.cos(textRad);
                    const textY = 150 + 95 * Math.sin(textRad);
                    
                    return (
                      <g key={segment.id}>
                        <path
                          d={`M 150 150 L ${x1} ${y1} A 140 140 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={segment.color}
                          stroke="#1f2937"
                          strokeWidth="2"
                        />
                        <text
                          x={textX}
                          y={textY}
                          fill={segment.textColor}
                          fontSize={segment.isLarge ? "8" : "11"}
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                        >
                          {segment.label}
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Centro de la ruleta */}
                  <circle cx="150" cy="150" r="30" fill="#fff" stroke="#1f2937" strokeWidth="3" />
                  <circle cx="150" cy="150" r="15" fill="#ef4444" />
                </svg>
              </div>
            </div>

            {/* Botón Girar */}
            <button
              onClick={handleSpin}
              disabled={isSpinning || !wheelStatus?.canSpin}
              className={`w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wide transition-all transform ${
                isSpinning || !wheelStatus?.canSpin
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:scale-[1.02] shadow-lg shadow-red-600/30'
              }`}
            >
              {isSpinning ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Girando...
                </span>
              ) : (
                '¡GIRAR LA RULETA!'
              )}
            </button>

            {error && (
              <p className="text-red-400 text-sm text-center mt-3">{error}</p>
            )}
          </>
        )}

        {/* Modal de resultado */}
        {showResult && result && (
          <div className="absolute inset-0 bg-black/95 rounded-3xl flex items-center justify-center p-6">
            <div className="text-center">
              {result.result === 'win' ? (
                <>
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center animate-bounce">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2">¡FELICITACIONES!</h3>
                  <p className="text-gray-300 mb-4">{result.message}</p>
                  
                  {result.prizeType === 'discount' && (
                    <div className="bg-gray-800 rounded-xl p-4 mb-4">
                      <p className="text-sm text-gray-400 mb-2">Tu código de descuento:</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-mono font-bold text-green-400">{result.prizeCode}</span>
                        <button
                          onClick={handleCopyCode}
                          className="p-2 hover:bg-gray-700 rounded-lg transition"
                        >
                          {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {(result.prizeType === 'gift' || result.prizeType === 'supplement') && (
                    <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-center gap-2 text-purple-300">
                        <Gift className="w-5 h-5" />
                        <span className="font-semibold">¡Regalo añadido a tu cuenta!</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-2">Se aplicará automáticamente en tu próxima compra.</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-4xl">😔</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {result.canSpinAgain ? '¡No te rindas!' : 'Mejor suerte la próxima'}
                  </h3>
                  <p className="text-gray-400 mb-4">{result.message}</p>
                </>
              )}
              
              <button
                onClick={handleCloseResult}
                className={`w-full py-3 rounded-xl font-bold transition ${
                  result.canSpinAgain 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {result.canSpinAgain ? '¡Girar de nuevo!' : 'Cerrar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpinWheel;
