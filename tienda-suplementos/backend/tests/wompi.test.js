const crypto = require('crypto');
const { createWompiTransaction, processWompiWebhook } = require('../utils/wompi');

describe('Wompi utils (unit)', () => {
  test('createWompiTransaction returns transactionData structure', async () => {
    const orderData = {
      items: [{ product: { _id: '507f1f77bcf86cd799439011' }, quantity: 1, price: 10000 }],
      customerData: { email: 'test@example.com', fullName: 'Test User', phoneNumber: '3000000000' },
      shippingAddress: { addressLine1: 'Calle 1', city: 'Bogota', region: 'Cundinamarca', country: 'CO' },
      total: 10000,
      reference: 'TEST_REF_123'
    };

    const result = await createWompiTransaction(orderData);
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('transactionData');
    const t = result.transactionData;
    expect(t).toHaveProperty('publicKey');
    expect(t).toHaveProperty('reference', 'TEST_REF_123');
    expect(t).toHaveProperty('amountInCents');
    expect(t).toHaveProperty('currency', 'COP');
    expect(t).toHaveProperty('signature');
  });

  test('processWompiWebhook validates signature and returns event', () => {
    // build a fake webhook body
    const body = {
      event: 'transaction.updated',
      data: {
        transaction: {
          id: 'tran_123',
          status: 'APPROVED',
          reference: 'TEST_REF_123'
        }
      }
    };

    // timestamp and signature
    const timestamp = Date.now().toString();
    const secret = process.env.WOMPI_INTEGRITY_SECRET || 'test_integrity_BI9hw55TMh9ITtfMH23OiavKbIOJZs2C';
    const payload = timestamp + JSON.stringify(body);
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const req = {
      headers: { 'x-signature': signature, 'x-timestamp': timestamp },
      body
    };

    const result = processWompiWebhook(req);
    expect(result).toHaveProperty('success', true);
    expect(result.event).toBe(body);
  });
});
