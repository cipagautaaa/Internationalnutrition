'use strict';

const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const isAdmin   = require('../middleware/isAdmin');

const {
  sendNewOrderNotificationToAdmin,
  sendOrderConfirmationToCustomer,
  processEmailOutboxOnce,
} = require('../utils/emailService');

// Todos los endpoints de este router requieren auth + admin
router.use(protect, isAdmin);

/**
 * POST /api/admin/orders/:reference/resend-email
 * Fuerza el reenvío del correo de notificación al admin para una orden específica.
 * :reference puede ser la referencia Wompi (ORDER_xxx) o el _id de MongoDB.
 *
 * Body (opcional):
 *   { "to": "otro@correo.com" }   → enviar a un destinatario distinto al ADMIN_EMAIL
 *   { "types": ["admin", "customer"] }  → qué emails reenviar (default: solo "admin")
 */
router.post('/orders/:reference/resend-email', async (req, res) => {
  try {
    const { reference } = req.params;
    const overrideTo = req.body?.to || null;
    const types = Array.isArray(req.body?.types) ? req.body.types : ['admin'];

    const Order = require('../models/Order');

    let order = null;

    // Buscar por referencia Wompi primero
    if (reference.startsWith('ORDER_')) {
      order = await Order.findOne({ wompiReference: reference })
        .populate({ path: 'items.product', strictPopulate: false })
        .populate('user');
    }

    // Si no, intentar como ObjectId de MongoDB
    if (!order && mongoose.Types.ObjectId.isValid(reference)) {
      order = await Order.findById(reference)
        .populate({ path: 'items.product', strictPopulate: false })
        .populate('user');
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Orden no encontrada: ${reference}`,
      });
    }

    const userInfo = order.user || order.customerData || {};
    const results  = {};

    // Reenviar email al admin (forzado: resetea el flag de idempotencia)
    if (types.includes('admin')) {
      // Temporalmente anular el flag para forzar reenvío
      const savedFlag = order.emailNotifications?.adminNewOrderSentAt;
      if (order.emailNotifications) order.emailNotifications.adminNewOrderSentAt = null;

      // Si se pidió un destinatario diferente, sobreescribir ADMIN_EMAIL para este call
      const origAdminEmail = process.env.ADMIN_EMAIL;
      if (overrideTo) process.env.ADMIN_EMAIL = overrideTo;

      try {
        const res_admin = await sendNewOrderNotificationToAdmin(order, userInfo);
        results.admin = res_admin;

        // Actualizar flag
        if (!res_admin?.skipped && !res_admin?.queued) {
          order.emailNotifications = order.emailNotifications || {};
          order.emailNotifications.adminNewOrderSentAt = new Date();
          await order.save();
        } else {
          // Restaurar el flag original si el envío falló/fue encolado
          if (order.emailNotifications) order.emailNotifications.adminNewOrderSentAt = savedFlag;
        }
      } finally {
        if (overrideTo) process.env.ADMIN_EMAIL = origAdminEmail;
      }
    }

    // Reenviar confirmación al cliente
    if (types.includes('customer')) {
      const savedFlag = order.emailNotifications?.customerConfirmationSentAt;
      if (order.emailNotifications) order.emailNotifications.customerConfirmationSentAt = null;

      try {
        const res_cust = await sendOrderConfirmationToCustomer(order, userInfo);
        results.customer = res_cust;

        if (!res_cust?.skipped && !res_cust?.queued) {
          order.emailNotifications = order.emailNotifications || {};
          order.emailNotifications.customerConfirmationSentAt = new Date();
          await order.save();
        } else {
          if (order.emailNotifications) order.emailNotifications.customerConfirmationSentAt = savedFlag;
        }
      } catch (e) {
        results.customer = { error: e?.message };
      }
    }

    return res.json({
      success: true,
      orderId:   order._id,
      reference: order.wompiReference,
      results,
    });

  } catch (err) {
    console.error('❌ [admin/resend-email]', err);
    return res.status(500).json({ success: false, message: err?.message || 'Error interno' });
  }
});

/**
 * POST /api/admin/email-outbox/process
 * Fuerza una pasada del worker de reintentos de emailOutbox.
 */
router.post('/email-outbox/process', async (req, res) => {
  try {
    const result = await processEmailOutboxOnce();
    return res.json({ success: true, result });
  } catch (err) {
    console.error('❌ [admin/email-outbox/process]', err);
    return res.status(500).json({ success: false, message: err?.message || 'Error interno' });
  }
});

/**
 * GET /api/admin/email-outbox/status
 * Estado de los jobs pendientes en la cola de emails.
 */
router.get('/email-outbox/status', async (req, res) => {
  try {
    const EmailOutbox = require('../models/EmailOutbox');
    const [pending, failed, dead, sent] = await Promise.all([
      EmailOutbox.countDocuments({ status: 'pending' }),
      EmailOutbox.countDocuments({ status: 'failed' }),
      EmailOutbox.countDocuments({ status: 'dead' }),
      EmailOutbox.countDocuments({ status: 'sent' }),
    ]);
    const recentFailed = await EmailOutbox.find({ status: { $in: ['failed', 'dead'] } })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('kind orderId attempts lastError nextAttemptAt status');

    return res.json({
      success: true,
      counts: { pending, failed, dead, sent },
      recentFailed,
      emailConfig: {
        provider: process.env.EMAIL_PROVIDER || 'NO_CONFIGURADO',
        adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'internationalnutritioncol@gmail.com (fallback)',
        hasSendGrid: Boolean(process.env.SENDGRID_API_KEY),
        hasGmailOAuth: Boolean(process.env.GMAIL_REFRESH_TOKEN),
        hasGmailSmtp: Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      },
    });
  } catch (err) {
    console.error('❌ [admin/email-outbox/status]', err);
    return res.status(500).json({ success: false, message: err?.message || 'Error interno' });
  }
});

module.exports = router;
