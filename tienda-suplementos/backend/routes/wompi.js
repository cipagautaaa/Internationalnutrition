const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const {
  createWompiTransactionHandler,
  verifyWompiHandler,
  wompiWebhookHandler,
  getPaymentMethodsHandler
} = require('../controllers/wompiController');

// Rutas de checkout - permiten usuarios autenticados o invitados
router.post('/create-wompi-transaction', optionalAuth, createWompiTransactionHandler);
router.get('/verify-wompi/:transactionId', optionalAuth, verifyWompiHandler);
router.post('/wompi-webhook', wompiWebhookHandler);
router.get('/wompi-methods', getPaymentMethodsHandler);

module.exports = router;