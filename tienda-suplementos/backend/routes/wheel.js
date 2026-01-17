const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

/**
 * RULETA ANABÓLICA - Sistema de Gamificación
 * 
 * Premios disponibles en la ruleta (18 segmentos):
 * - 5%: 3 segmentos (naranja)
 * - 10%: 3 segmentos (rojo)
 * - 15%: 2 segmentos (amarillo)
 * - 20%: 1 segmento (naranja)
 * - Regalo: 3 segmentos (morado)
 * - Suplemento Regalo: 1 segmento (rojo grande)
 * - Perdiste: 2 segmentos (blanco)
 * - 5% adicional: 3 segmentos (varios colores)
 */

// Configuración de premios con probabilidades y ángulos
const WHEEL_SEGMENTS = [
  { id: 0, label: '10%', code: 'INTSUPPS10', type: 'discount', probability: 6, angle: 0 },
  { id: 1, label: 'Regalo', code: 'REGALO', type: 'gift', probability: 5, angle: 20 },
  { id: 2, label: '5%', code: 'INTSUPPS5', type: 'discount', probability: 8, angle: 40 },
  { id: 3, label: '15%', code: 'INTSUPPS15', type: 'discount', probability: 4, angle: 60 },
  { id: 4, label: 'Perdiste', code: 'NONE', type: 'lose', probability: 12, angle: 80 },
  { id: 5, label: '20%', code: 'INTSUPPS20', type: 'discount', probability: 2, angle: 100 },
  { id: 6, label: '10%', code: 'INTSUPPS10', type: 'discount', probability: 6, angle: 120 },
  { id: 7, label: '15%', code: 'INTSUPPS15', type: 'discount', probability: 4, angle: 140 },
  { id: 8, label: 'Regalo', code: 'REGALO', type: 'gift', probability: 5, angle: 160 },
  { id: 9, label: '5%', code: 'INTSUPPS5', type: 'discount', probability: 8, angle: 180 },
  { id: 10, label: 'Suplemento Regalo', code: 'SUPLEMENTO_REGALO', type: 'supplement', probability: 1, angle: 200 },
  { id: 11, label: '10%', code: 'INTSUPPS10', type: 'discount', probability: 6, angle: 220 },
  { id: 12, label: '5%', code: 'INTSUPPS5', type: 'discount', probability: 8, angle: 240 },
  { id: 13, label: 'Perdiste', code: 'NONE', type: 'lose', probability: 12, angle: 260 },
  { id: 14, label: 'Regalo', code: 'REGALO', type: 'gift', probability: 5, angle: 280 },
  { id: 15, label: '5%', code: 'INTSUPPS5', type: 'discount', probability: 8, angle: 300 },
  { id: 16, label: '15%', code: 'INTSUPPS15', type: 'discount', probability: 4, angle: 320 },
  { id: 17, label: '5%', code: 'INTSUPPS5', type: 'discount', probability: 8, angle: 340 }
];

// Calcular probabilidad total para selección ponderada
const TOTAL_PROBABILITY = WHEEL_SEGMENTS.reduce((sum, s) => sum + s.probability, 0);

/**
 * Seleccionar un segmento aleatorio basado en probabilidades
 */
function selectRandomSegment() {
  const rand = Math.random() * TOTAL_PROBABILITY;
  let cumulative = 0;
  
  for (const segment of WHEEL_SEGMENTS) {
    cumulative += segment.probability;
    if (rand <= cumulative) {
      return segment;
    }
  }
  
  // Fallback al último segmento
  return WHEEL_SEGMENTS[WHEEL_SEGMENTS.length - 1];
}

/**
 * GET /api/wheel/status
 * Obtener el estado de la ruleta para el usuario autenticado
 */
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    res.json({
      success: true,
      data: {
        canSpin: !user.wheelLockedUntilPurchase && !user.wheelPrizePending,
        prizePending: user.wheelPrizePending,
        isLocked: user.wheelLockedUntilPurchase,
        spinAttempts: user.wheelSpinAttempts || 0,
        lastSpinDate: user.wheelLastSpinDate
      }
    });
  } catch (error) {
    console.error('Error obteniendo estado de ruleta:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

/**
 * POST /api/wheel/spin
 * Girar la ruleta - El resultado se determina en el servidor
 */
router.post('/spin', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    // Verificar si puede girar
    if (user.wheelLockedUntilPurchase) {
      return res.status(403).json({
        success: false,
        message: 'Debes completar una compra para desbloquear la ruleta nuevamente.',
        data: { isLocked: true, prizePending: user.wheelPrizePending }
      });
    }
    
    if (user.wheelPrizePending && user.wheelPrizePending !== 'NONE') {
      return res.status(403).json({
        success: false,
        message: 'Ya tienes un premio activo. Completa tu compra para usarlo.',
        data: { prizePending: user.wheelPrizePending }
      });
    }
    
    // Verificar intentos (máximo 2 por sesión de juego)
    const currentAttempts = user.wheelSpinAttempts || 0;
    if (currentAttempts >= 2) {
      return res.status(403).json({
        success: false,
        message: 'Has agotado tus intentos. Realiza una compra para volver a jugar.',
        data: { spinAttempts: currentAttempts, isLocked: true }
      });
    }
    
    // Seleccionar premio
    const selectedSegment = selectRandomSegment();
    const newAttempts = currentAttempts + 1;
    
    // Si perdió
    if (selectedSegment.type === 'lose') {
      user.wheelSpinAttempts = newAttempts;
      user.wheelLastSpinDate = new Date();
      
      // Si es el segundo intento fallido, bloquear
      if (newAttempts >= 2) {
        user.wheelPrizePending = 'NONE';
        user.wheelLockedUntilPurchase = true;
      }
      
      await user.save();
      
      return res.json({
        success: true,
        data: {
          result: 'lose',
          segment: selectedSegment,
          spinAttempts: newAttempts,
          canSpinAgain: newAttempts < 2,
          message: newAttempts < 2 
            ? '¡Qué mala suerte! Pero hoy estamos generosos. TE DAMOS UNA SEGUNDA Y ÚLTIMA OPORTUNIDAD. ¡Gira de nuevo!'
            : 'La suerte no está de tu lado hoy. Realiza tu compra para volver a intentarlo la próxima vez.'
        }
      });
    }
    
    // Si ganó algo
    user.wheelPrizePending = selectedSegment.code;
    user.wheelLockedUntilPurchase = true;
    user.wheelSpinAttempts = newAttempts;
    user.wheelLastSpinDate = new Date();
    await user.save();
    
    let prizeMessage = '';
    switch (selectedSegment.type) {
      case 'discount':
        prizeMessage = `¡FELICITACIONES! Has ganado un ${selectedSegment.label} de descuento. Tu código es: ${selectedSegment.code}`;
        break;
      case 'gift':
        prizeMessage = '¡FELICITACIONES! Has ganado un REGALO SORPRESA que se añadirá a tu próxima compra.';
        break;
      case 'supplement':
        prizeMessage = '¡INCREÍBLE! Has ganado un SUPLEMENTO DE REGALO. Se añadirá automáticamente a tu carrito.';
        break;
    }
    
    res.json({
      success: true,
      data: {
        result: 'win',
        segment: selectedSegment,
        prizeCode: selectedSegment.code,
        prizeType: selectedSegment.type,
        message: prizeMessage,
        spinAttempts: newAttempts
      }
    });
    
  } catch (error) {
    console.error('Error girando ruleta:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

/**
 * POST /api/wheel/reset
 * Resetear la ruleta después de una compra exitosa (llamado internamente o por webhook)
 */
router.post('/reset', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    // Resetear campos de la ruleta
    user.wheelPrizePending = null;
    user.wheelLockedUntilPurchase = false;
    user.wheelSpinAttempts = 0;
    await user.save();
    
    res.json({
      success: true,
      message: 'Ruleta desbloqueada. ¡Puedes volver a jugar!',
      data: {
        canSpin: true,
        prizePending: null,
        isLocked: false
      }
    });
    
  } catch (error) {
    console.error('Error reseteando ruleta:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

/**
 * Función para resetear ruleta de un usuario por ID (para uso interno desde orders)
 */
async function resetWheelForUser(userId) {
  try {
    await User.findByIdAndUpdate(userId, {
      wheelPrizePending: null,
      wheelLockedUntilPurchase: false,
      wheelSpinAttempts: 0
    });
    console.log(`[Wheel] Ruleta reseteada para usuario ${userId}`);
    return true;
  } catch (error) {
    console.error(`[Wheel] Error reseteando ruleta para ${userId}:`, error);
    return false;
  }
}

module.exports = router;
module.exports.resetWheelForUser = resetWheelForUser;
