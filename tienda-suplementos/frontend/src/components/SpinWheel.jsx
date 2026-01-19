import { useState, useRef, useEffect } from 'react';
import { X, Copy, Check, Gift, Zap, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

/**
 * Configuración de los 15 segmentos de la ruleta
 * Colores variados y llamativos para marketing (según imagen de referencia)
 * Orden: empezando desde arriba, en sentido horario
 */
const WHEEL_SEGMENTS = [
  { id: 0, label: 'Regalo', color: '#22C55E', textColor: '#fff' },
  { id: 1, label: '10%', color: '#F97316', textColor: '#fff' },
  { id: 2, label: '5%', color: '#EF4444', textColor: '#fff' },
  { id: 3, label: 'Suplemento Regalo', color: '#DC2626', textColor: '#fff' },
  { id: 4, label: '10%', color: '#3B82F6', textColor: '#fff' },
  { id: 5, label: '5%', color: '#FFFFFF', textColor: '#1a1a1a' },
  { id: 6, label: 'Regalo', color: '#EF4444', textColor: '#fff' },
  { id: 7, label: '15%', color: '#EAB308', textColor: '#1a1a1a' },
  { id: 8, label: '20%', color: '#F97316', textColor: '#fff' },
  { id: 9, label: 'Perdiste', color: '#8B5CF6', textColor: '#fff' },
  { id: 10, label: '10%', color: '#EF4444', textColor: '#fff' },
  { id: 11, label: '5%', color: '#FFFFFF', textColor: '#1a1a1a' },
  { id: 12, label: 'Regalo', color: '#22C55E', textColor: '#fff' },
  { id: 13, label: '15%', color: '#EAB308', textColor: '#1a1a1a' },
  { id: 14, label: '5%', color: '#F97316', textColor: '#fff' }
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
      // La flecha apunta a la derecha (0°)
      const segmentIndex = WHEEL_SEGMENTS.findIndex(s => s.id === segment.id);
      const safeIndex = segmentIndex === -1 ? 0 : segmentIndex;
      const baseRotation = 360 * 5; // 5 vueltas completas
      const targetAngle = 90 - (safeIndex * SEGMENT_ANGLE) - (SEGMENT_ANGLE / 2);
      const maxJitter = Math.max(0, (SEGMENT_ANGLE / 2) - 2);
      const jitter = (Math.random() * 2 - 1) * maxJitter;
      const finalRotation = baseRotation + targetAngle + jitter;
      
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
      
      <div className="relative bg-slate-900/95 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-700/60">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition z-10"
          aria-label="Cerrar"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Título */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-full text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wide">
            <Zap className="w-3.5 h-3.5" />
            Ruleta Anabólica
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Gira y gana
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
          </div>
        ) : error && !wheelStatus ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={fetchWheelStatus} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">
              Reintentar
            </button>
          </div>
        ) : wheelStatus?.isLocked && !wheelStatus?.canSpin ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full border border-slate-700/70 bg-slate-800/60 flex items-center justify-center">
              <Trophy className="w-7 h-7 text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {wheelStatus.prizePending && wheelStatus.prizePending !== 'NONE' 
                ? '¡Ya tienes un premio!' 
                : 'Ruleta bloqueada'}
            </h3>
            <p className="text-slate-400 mb-4">
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar código'}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Contenedor de la Ruleta - media ruleta a la izquierda en móvil */}
            <div className="relative flex items-center justify-start mb-6 overflow-hidden -mx-6 sm:-mx-8 md:mx-0 md:justify-center">
              {/* Flecha indicadora - a la derecha en móvil */}
              <div className="absolute right-6 sm:right-8 md:right-auto md:left-1/2 md:translate-x-[180px] z-20">
                <div className="w-0 h-0 border-t-[16px] border-t-transparent border-b-[16px] border-b-transparent border-r-[28px] border-r-white drop-shadow-lg"></div>
              </div>
              
              {/* Ruleta SVG - a la izquierda en móvil */}
              <div className="relative -ml-40 sm:-ml-32 md:ml-0">
                <svg
                  ref={wheelRef}
                  width="400"
                  height="400"
                  viewBox="0 0 400 400"
                  className="drop-shadow-2xl w-[320px] h-[320px] sm:w-[360px] sm:h-[360px] md:w-[380px] md:h-[380px]"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
                  }}
                >
                  {/* Definiciones de paths para textos curvados */}
                  <defs>
                    {WHEEL_SEGMENTS.map((segment, i) => {
                      const startAngle = i * SEGMENT_ANGLE;
                      const endAngle = (i + 1) * SEGMENT_ANGLE;
                      
                      // Path para texto curvo siguiendo el arco
                      const arcRadius = 140;
                      const startRad = (startAngle - 90 + 4) * Math.PI / 180;
                      const endRad = (endAngle - 90 - 4) * Math.PI / 180;
                      const x1 = 200 + arcRadius * Math.cos(startRad);
                      const y1 = 200 + arcRadius * Math.sin(startRad);
                      const x2 = 200 + arcRadius * Math.cos(endRad);
                      const y2 = 200 + arcRadius * Math.sin(endRad);
                      
                      return (
                        <path
                          key={`path-${segment.id}`}
                          id={`textArc-${segment.id}`}
                          d={`M ${x1} ${y1} A ${arcRadius} ${arcRadius} 0 0 1 ${x2} ${y2}`}
                          fill="none"
                        />
                      );
                    })}
                  </defs>
                  
                  {/* Segmentos de la ruleta */}
                  {WHEEL_SEGMENTS.map((segment, i) => {
                    const startAngle = i * SEGMENT_ANGLE;
                    const endAngle = (i + 1) * SEGMENT_ANGLE;
                    const midAngle = startAngle + SEGMENT_ANGLE / 2;
                    const startRad = (startAngle - 90) * Math.PI / 180;
                    const endRad = (endAngle - 90) * Math.PI / 180;
                    const midRad = (midAngle - 90) * Math.PI / 180;
                    
                    const outerRadius = 195;
                    const textRadius = 120;
                    
                    const x1 = 200 + outerRadius * Math.cos(startRad);
                    const y1 = 200 + outerRadius * Math.sin(startRad);
                    const x2 = 200 + outerRadius * Math.cos(endRad);
                    const y2 = 200 + outerRadius * Math.sin(endRad);
                    
                    const textX = 200 + textRadius * Math.cos(midRad);
                    const textY = 200 + textRadius * Math.sin(midRad);
                    
                    const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0;
                    const fontSize = segment.label.length > 12 ? "9" : segment.label.length > 8 ? "10" : "12";
                    
                    return (
                      <g key={segment.id}>
                        <path
                          d={`M 200 200 L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={segment.color}
                          stroke="#0a0a0a"
                          strokeWidth="1.5"
                        />
                        {/* Texto rotado 90° para leerse derecho al caer */}
                        <text
                          x={textX}
                          y={textY}
                          fill={segment.textColor}
                          fontSize={fontSize}
                          fontWeight="bold"
                          fontFamily="system-ui, -apple-system, sans-serif"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${midAngle + 90} 200 200)`}
                        >
                          {segment.label}
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Centro de la ruleta */}
                  <circle cx="200" cy="200" r="38" fill="#ffffff" stroke="#1a1a1a" strokeWidth="3" />
                  <circle cx="200" cy="200" r="18" fill="#DC2626" />
                </svg>
              </div>
            </div>

            {/* Botón Girar */}
            <button
              onClick={handleSpin}
              disabled={isSpinning || !wheelStatus?.canSpin}
              className={`w-full py-3.5 rounded-xl font-semibold text-base sm:text-lg transition ${
                isSpinning || !wheelStatus?.canSpin
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isSpinning ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Girando...
                </span>
              ) : (
                'Girar la ruleta'
              )}
            </button>

            {error && (
              <p className="text-red-400 text-sm text-center mt-3">{error}</p>
            )}
          </>
        )}

        {/* Modal de resultado */}
        {showResult && result && (
          <div className="absolute inset-0 bg-slate-950/95 rounded-2xl flex items-center justify-center p-6">
            <div className="text-center w-full">
              {result.result === 'win' ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full border border-slate-700/70 bg-slate-800/60 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-2">¡Felicidades!</h3>
                  <p className="text-slate-300 mb-4">{result.message}</p>
                  
                  {result.prizeType === 'discount' && (
                    <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 mb-4">
                      <p className="text-sm text-slate-400 mb-2">Tu código de descuento</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-mono font-bold text-green-400 tracking-wider">{result.prizeCode}</span>
                        <button
                          onClick={handleCopyCode}
                          className="p-2 hover:bg-slate-800 rounded-lg transition"
                        >
                          {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-slate-400" />}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {(result.prizeType === 'gift' || result.prizeType === 'supplement') && (
                    <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-center gap-2 text-slate-200">
                        <Gift className="w-5 h-5" />
                        <span className="font-semibold">Regalo añadido a tu cuenta</span>
                      </div>
                      <p className="text-sm text-slate-400 mt-2">Se aplicará automáticamente en tu próxima compra.</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full border border-slate-700/70 bg-slate-800/60 flex items-center justify-center">
                    <X className="w-7 h-7 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {result.canSpinAgain ? '¡No te rindas!' : 'Mejor suerte la próxima'}
                  </h3>
                  <p className="text-slate-400 mb-4">{result.message}</p>
                </>
              )}
              
              <button
                onClick={handleCloseResult}
                className={`w-full py-3 rounded-xl font-semibold transition ${
                  result.canSpinAgain 
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
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
