const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');

jest.setTimeout(60000);

describe('Wompi integration tests', () => {
  let mongoServer;
  let token;
  let testUser;

  beforeAll(async () => {
    process.env.WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY || 'pub_test_wompi';
    process.env.WOMPI_INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET || 'test_integrity_secret';

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    // create a test user and JWT
    testUser = await User.create({ email: 'int-test@example.com', firstName: 'Int', lastName: 'Test' });
    const secret = process.env.JWT_SECRET || 'mi_jwt_secret_super_seguro_123456789';
    token = jwt.sign({ id: testUser._id, email: testUser.email }, secret, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test('POST /api/payments/create-wompi-transaction should create order and return wompiData', async () => {
    const payload = {
      items: [{ productId: '507f1f77bcf86cd799439011', quantity: 1, price: 10000, name: 'Mock Product' }],
      shippingAddress: { addressLine1: 'Calle Test', city: 'Bogota', region: 'Cundinamarca', postalCode: '111111' },
      customerData: { email: 'int-test@example.com', fullName: 'Int Test', phoneNumber: '3001234567' }
    };
    // create a product that matches the productId used in payload
    const Product = require('../models/Product');
  await Product.create({ _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), name: 'Mock Product', description: 'Mock desc', price: 10000, size: '1 ud', image: 'test.png', category: 'Proteínas', stock: 10, inStock: true });

    const res = await request(app)
      .post('/api/payments/create-wompi-transaction')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(200);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('orderId');
    expect(res.body).toHaveProperty('wompiData');
  });

  test('POST /api/payments/create-wompi-transaction should charge variant price when variantId is provided', async () => {
    const Product = require('../models/Product');
    const baseId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439021');
    const variantId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439022');

    await Product.create({
      _id: baseId,
      name: 'Iso Variant Base',
      description: 'Base',
      price: 160000,
      size: '2 lb',
      image: 'base.png',
      category: 'Proteínas',
      familyId: 'fam-iso-1',
      isPrimary: true,
      inStock: true
    });

    await Product.create({
      _id: variantId,
      name: 'Iso Variant 5 lb',
      description: 'Variant',
      price: 210000,
      size: '5 lb',
      image: 'variant.png',
      category: 'Proteínas',
      familyId: 'fam-iso-1',
      isPrimary: false,
      variantOf: baseId,
      inStock: true
    });

    const payload = {
      items: [{ productId: String(baseId), variantId: String(variantId), quantity: 1, name: 'Iso Variant Base' }],
      shippingAddress: { addressLine1: 'Calle Test', city: 'Bogota', region: 'Cundinamarca', postalCode: '111111' },
      customerData: { email: 'int-test@example.com', fullName: 'Int Test', phoneNumber: '3001234567' }
    };

    const res = await request(app)
      .post('/api/payments/create-wompi-transaction')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(200);

    // 210.000 con envío gratis (subtotal >= 80.000)
    expect(res.body.wompiData.amountInCents).toBe(21000000);
  });

  test('POST /api/payments/create-wompi-transaction should reject variantId not related to product', async () => {
    const Product = require('../models/Product');
    const baseId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439031');
    const otherVariantId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439032');

    await Product.create({
      _id: baseId,
      name: 'Creatina A',
      description: 'Base A',
      price: 90000,
      size: '300g',
      image: 'a.png',
      category: 'Creatinas',
      familyId: 'fam-a',
      isPrimary: true,
      inStock: true
    });

    await Product.create({
      _id: otherVariantId,
      name: 'Whey B Variant',
      description: 'Variant B',
      price: 180000,
      size: '5 lb',
      image: 'b.png',
      category: 'Proteínas',
      familyId: 'fam-b',
      isPrimary: false,
      inStock: true
    });

    const payload = {
      items: [{ productId: String(baseId), variantId: String(otherVariantId), quantity: 1, name: 'Creatina A' }],
      shippingAddress: { addressLine1: 'Calle Test', city: 'Bogota', region: 'Cundinamarca', postalCode: '111111' },
      customerData: { email: 'int-test@example.com', fullName: 'Int Test', phoneNumber: '3001234567' }
    };

    const res = await request(app)
      .post('/api/payments/create-wompi-transaction')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/variante/i);
  });

  test('POST /api/payments/wompi-webhook should process webhook and update order', async () => {
    // create a fake order to update
    const Order = require('../models/Order');
  const order = await Order.create({ user: testUser._id, items: [], totalAmount: 10000, paymentMethod: 'wompi', paymentStatus: 'pending', wompiReference: 'REF_TEST_123', shippingAddress: { street: 'x', city: 'x', state: 'x', zipCode: 'x', country: 'CO' } });

    const body = { event: 'transaction.updated', data: { transaction: { id: 'tran_int_1', status: 'APPROVED', reference: 'REF_TEST_123' } } };
    const timestamp = Date.now().toString();
    const secret = process.env.WOMPI_INTEGRITY_SECRET || 'test_integrity_BI9hw55TMh9ITtfMH23OiavKbIOJZs2C';
    const payload = timestamp + JSON.stringify(body);
    const signature = require('crypto').createHmac('sha256', secret).update(payload).digest('hex');

    const res = await request(app)
      .post('/api/payments/wompi-webhook')
      .set('x-signature', signature)
      .set('x-timestamp', timestamp)
      .send(body)
      .expect(200);

    expect(res.body).toHaveProperty('success', true);

    const updated = await Order.findById(order._id);
    expect(updated).toHaveProperty('wompiTransactionId', 'tran_int_1');
    expect(updated).toHaveProperty('paymentStatus', 'APPROVED');
  });
});
