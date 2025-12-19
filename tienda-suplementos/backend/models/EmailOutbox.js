const mongoose = require('mongoose');

const emailOutboxSchema = new mongoose.Schema({
  kind: {
    type: String,
    required: true,
    enum: ['admin_new_order', 'customer_order_confirmation']
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  payload: {
    // nodemailer-like options: { from, to, subject, html, replyTo }
    type: Object,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'failed', 'sent', 'dead'],
    default: 'pending',
    index: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  nextAttemptAt: {
    type: Date,
    default: () => new Date(),
    index: true
  },
  sentAt: {
    type: Date,
    default: null
  },
  messageId: {
    type: String,
    default: null
  },
  lastError: {
    type: String,
    default: null
  },
  lockedAt: {
    type: Date,
    default: null
  },
  lockedBy: {
    type: String,
    default: null
  }
}, { timestamps: true });

// Idempotencia: 1 job por orden+tipo (evita duplicados por reintentos/webhooks)
emailOutboxSchema.index({ orderId: 1, kind: 1 }, { unique: true });

module.exports = mongoose.model('EmailOutbox', emailOutboxSchema);
