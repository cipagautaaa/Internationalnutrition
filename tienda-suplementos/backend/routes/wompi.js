const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createWompiTransactionHandler,
  verifyWompiHandler,
  wompiWebhookHandler,
  getPaymentMethodsHandler
} = require('../controllers/wompiController');

router.post('/create-wompi-transaction', protect, createWompiTransactionHandler);
router.get('/verify-wompi/:transactionId', protect, verifyWompiHandler);
router.post('/wompi-webhook', wompiWebhookHandler);
router.get('/wompi-methods', getPaymentMethodsHandler);

module.exports = router;