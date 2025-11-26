# Tienda Virtual de Suplementos Deportivos - React + Tailwind CSS

## 📋 Descripción del Proyecto
Una tienda virtual moderna para la venta de suplementos deportivos, desarrollada con React y Tailwind CSS para un diseño responsive y atractivo.

## 🛠️ Tecnologías Utilizadas
- **Frontend**: React 18
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Package Manager**: npm
- **Iconos**: Lucide React
- **Estado**: React Context API
- **Routing**: React Router DOM
- **Backend**: Node.js + Express
- **Base de Datos**: MongoDB
- **Autenticación**: Email + Código de verificación (sin contraseñas)
- **Validación**: Joi
- **Pagos**: Mercado Pago SDK
- **Base de Datos**: MongoDB Atlas

## 📦 Estructura del Proyecto
```
tienda-suplementos/
├── frontend/
│   ├── public/
│   │   ├── images/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductList.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── CartItem.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── EmailLogin.jsx
│   │   │   ├── VerifyEmail.jsx
│   │   │   └── Profile.jsx
│   │   ├── context/
│   │   │   ├── CartContext.jsx
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── EmailLogin.jsx
│   │   │   ├── VerifyEmail.jsx
│   │   │   └── Profile.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── payments.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── utils/
│   │   ├── emailService.js
│   │   ├── generateCode.js
│   │   └── mercadoPago.js
│   ├── config/
│   │   └── database.js
│   ├── app.js
│   ├── server.js
│   └── package.json
└── README.md
```

## 🚀 Pasos para Crear el Proyecto

### Paso 1: Configuración Inicial del Proyecto
```bash
# Crear directorio principal
mkdir tienda-suplementos
cd tienda-suplementos

# Crear frontend con React + Vite
npm create vite@latest frontend -- --template react
cd frontend
npm install

# Volver al directorio principal
cd ..

# Crear backend con Node.js + Express
mkdir backend
cd backend
npm init -y
npm install express mongoose cors dotenv bcryptjs jsonwebtoken nodemailer joi express-rate-limit helmet morgan mercadopago
npm install -D nodemon

# Volver al directorio principal
cd ..
```

### Paso 2: Configurar Frontend (React + Tailwind)
```bash
# Navegar al frontend
cd frontend

# Instalar Tailwind CSS y sus dependencias
npm install -D tailwindcss postcss autoprefixer

# Inicializar configuración de Tailwind
npx tailwindcss init -p

# Instalar dependencias adicionales para el frontend
npm install react-router-dom lucide-react axios
```

### Paso 3: Configurar Tailwind CSS
Editar `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          500: '#10b981',
          600: '#059669',
        }
      }
    },
  },
  plugins: [],
}
```

### Paso 4: Configurar CSS Base
Reemplazar contenido de `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .btn-secondary {
    @apply bg-secondary-500 hover:bg-secondary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;
  }
}
```

### Paso 5: Configurar Backend (Node.js + Express)
```bash
# Navegar al backend
cd ../backend

# Crear archivo .env
echo "NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tienda-suplementos
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
EMAIL_FROM=tu_email@gmail.com
MERCADOPAGO_ACCESS_TOKEN=tu_access_token_de_mercadopago
MERCADOPAGO_WEBHOOK_SECRET=tu_webhook_secret" > .env

# Crear estructura de carpetas
mkdir models routes middleware utils config
```

### Paso 6: Crear Backend - Modelos y Servicios

#### Modelo de Usuario (`backend/models/User.js`):
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true
  },
  firstName: {
    type: String,
    trim: true,
    default: ''
  },
  lastName: {
    type: String,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationCode: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // Direcciones guardadas
  addresses: [{
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    isDefault: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
```

#### Modelo de Pedido (`backend/models/Order.js`):
```javascript
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    enum: ['mercadopago', 'transferencia', 'efectivo'],
    default: 'mercadopago'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  mercadoPagoPaymentId: {
    type: String,
    default: null
  },
  mercadoPagoPreferenceId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
```

### Paso 7: Crear Servicios de Mercado Pago

#### Servicio de Mercado Pago (`backend/utils/mercadoPago.js`):
```javascript
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

const preference = new Preference(client);
const payment = new Payment(client);

// Crear preferencia de pago
const createPreference = async (orderData) => {
  try {
    const preferenceData = {
      items: orderData.items.map(item => ({
        id: item.product._id.toString(),
        title: item.product.name,
        description: item.product.description,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: 'ARS' // Cambiar según tu país
      })),
      payer: {
        name: orderData.user.firstName,
        surname: orderData.user.lastName,
        email: orderData.user.email
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/payment/success`,
        failure: `${process.env.FRONTEND_URL}/payment/failure`,
        pending: `${process.env.FRONTEND_URL}/payment/pending`
      },
      auto_return: 'approved',
      external_reference: orderData.orderId,
      notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`
    };

    const response = await preference.create({ body: preferenceData });
    return response;
  } catch (error) {
    console.error('Error creando preferencia:', error);
    throw new Error('Error creando preferencia de pago');
  }
};

// Obtener información de un pago
const getPayment = async (paymentId) => {
  try {
    const response = await payment.get({ id: paymentId });
    return response;
  } catch (error) {
    console.error('Error obteniendo pago:', error);
    throw new Error('Error obteniendo información del pago');
  }
};

// Verificar webhook de Mercado Pago
const verifyWebhook = (req) => {
  const signature = req.headers['x-signature'];
  const id = req.headers['x-request-id'];
  
  if (!signature || !id) {
    return false;
  }
  
  // Aquí implementarías la verificación del webhook
  // usando el MERCADOPAGO_WEBHOOK_SECRET
  return true;
};

module.exports = {
  createPreference,
  getPayment,
  verifyWebhook
};
```

### Paso 8: Crear Servicios de Email

#### Servicio de Email (`backend/utils/emailService.js`):
```javascript
const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendVerificationEmail = async (email, verificationCode) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verificación de Email - SportSupps',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">¡Bienvenido a SportSupps!</h2>
        <p>Gracias por registrarte en nuestra tienda de suplementos deportivos.</p>
        <p>Para completar tu registro, por favor ingresa el siguiente código de verificación:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #3b82f6; font-size: 32px; margin: 0; letter-spacing: 5px;">${verificationCode}</h1>
        </div>
        <p>Este código expirará en 10 minutos.</p>
        <p>Si no solicitaste este registro, puedes ignorar este email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email de verificación enviado a:', email);
  } catch (error) {
    console.error('Error enviando email:', error);
    throw new Error('Error enviando email de verificación');
  }
};

module.exports = { sendVerificationEmail };
```

### Paso 8: Crear Datos de Productos
Crear `frontend/src/data/products.js`:
```javascript
export const products = [
  {
    id: 1,
    name: "Whey Protein Premium",
    price: 89.99,
    image: "/images/whey-protein.jpg",
    category: "Proteínas",
    description: "Proteína de suero de leche de alta calidad para recuperación muscular",
    inStock: true,
    rating: 4.8
  },
  {
    id: 2,
    name: "Creatina Monohidrato",
    price: 24.99,
    image: "/images/creatine.jpg",
    category: "Creatina",
    description: "Creatina pura para aumentar fuerza y masa muscular",
    inStock: true,
    rating: 4.6
  },
  {
    id: 3,
    name: "BCAA 2:1:1",
    price: 34.99,
    image: "/images/bcaa.jpg",
    category: "Aminoácidos",
    description: "Aminoácidos de cadena ramificada para recuperación",
    inStock: true,
    rating: 4.7
  },
  {
    id: 4,
    name: "Pre-Workout Energy",
    price: 39.99,
    image: "/images/preworkout.jpg",
    category: "Pre-Workout",
    description: "Energía y concentración para entrenamientos intensos",
    inStock: false,
    rating: 4.5
  },
  {
    id: 5,
    name: "Omega 3 Fish Oil",
    price: 19.99,
    image: "/images/omega3.jpg",
    category: "Vitaminas",
    description: "Aceite de pescado rico en Omega 3 para salud cardiovascular",
    inStock: true,
    rating: 4.4
  },
  {
    id: 6,
    name: "Multivitamínico Completo",
    price: 29.99,
    image: "/images/multivitamin.jpg",
    category: "Vitaminas",
    description: "Complejo vitamínico para deportistas",
    inStock: true,
    rating: 4.3
  }
];
```

### Paso 7: Crear Contexto del Carrito
Crear `src/context/CartContext.jsx`:
```javascript
import { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    
    case 'CLEAR_CART':
      return { ...state, items: [] };
    
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      ...state,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
```

### Paso 8: Crear Componentes

#### Header Component (`frontend/src/components/Header.jsx`):
```javascript
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { getTotalItems } = useCart();

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-600">SportSupps</h1>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              Inicio
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-primary-600 transition-colors">
              Productos
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-primary-600 transition-colors">
              Nosotros
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors">
              <ShoppingCart size={24} />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            
            <button className="md:hidden p-2">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
```

#### ProductCard Component (`src/components/ProductCard.jsx`):
```javascript
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-w-1 aspect-h-1">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
        </div>
      </Link>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">{product.category}</span>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary-600">
            ${product.price}
          </span>
          
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              product.inStock
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart size={16} />
            <span>{product.inStock ? 'Agregar' : 'Agotado'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
```

### Paso 9: Crear Páginas

#### Home Page (`src/pages/Home.jsx`):
```javascript
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

const Home = () => {
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Suplementos Deportivos de Calidad
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Potencia tu rendimiento con los mejores suplementos del mercado
            </p>
            <Link
              to="/products"
              className="inline-flex items-center bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Ver Productos
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="text-primary-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Envío Gratis</h3>
              <p className="text-gray-600">En compras superiores a $50</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-primary-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Garantía</h3>
              <p className="text-gray-600">30 días de garantía</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-primary-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Calidad Premium</h3>
              <p className="text-gray-600">Productos certificados</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="text-primary-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Devoluciones</h3>
              <p className="text-gray-600">Fácil proceso de devolución</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Productos Destacados
            </h2>
            <p className="text-lg text-gray-600">
              Los suplementos más populares de nuestra tienda
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/products"
              className="btn-primary"
            >
              Ver Todos los Productos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
```

### Paso 9: Crear Rutas de Pagos

#### Rutas de Pagos (`backend/routes/payments.js`):
```javascript
const express = require('express');
const { protect } = require('../middleware/auth');
const { createPreference, getPayment, verifyWebhook } = require('../utils/mercadoPago');
const Order = require('../models/Order');
const Product = require('../models/Product');

const router = express.Router();

// Crear preferencia de pago
router.post('/create-preference', protect, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    
    // Validar que hay items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay productos en el carrito'
      });
    }

    // Calcular total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Producto ${item.productId} no encontrado`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para ${product.name}`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Crear pedido
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod: 'mercadopago'
    });

    // Crear preferencia de Mercado Pago
    const preferenceData = {
      orderId: order._id.toString(),
      user: req.user,
      items: orderItems.map(item => ({
        product: await Product.findById(item.product),
        quantity: item.quantity,
        price: item.price
      }))
    };

    const preference = await createPreference(preferenceData);

    // Guardar ID de preferencia
    order.mercadoPagoPreferenceId = preference.id;
    await order.save();

    res.json({
      success: true,
      data: {
        preferenceId: preference.id,
        initPoint: preference.init_point,
        orderId: order._id
      }
    });
  } catch (error) {
    console.error('Error creando preferencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando pago'
    });
  }
});

// Webhook de Mercado Pago
router.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;
      
      // Obtener información del pago
      const payment = await getPayment(paymentId);
      
      // Buscar pedido por external_reference
      const order = await Order.findOne({
        _id: payment.external_reference
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Pedido no encontrado'
        });
      }

      // Actualizar estado del pedido
      order.mercadoPagoPaymentId = paymentId;
      
      if (payment.status === 'approved') {
        order.paymentStatus = 'approved';
        order.status = 'processing';
        
        // Reducir stock de productos
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: -item.quantity } }
          );
        }
      } else if (payment.status === 'rejected') {
        order.paymentStatus = 'rejected';
        order.status = 'cancelled';
      }

      await order.save();

      res.json({ success: true });
    }
  } catch (error) {
    console.error('Error procesando webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando webhook'
    });
  }
});

// Obtener estado de pago
router.get('/payment-status/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        totalAmount: order.totalAmount
      }
    });
  } catch (error) {
    console.error('Error obteniendo estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estado del pago'
    });
  }
});

module.exports = router;
```

### Paso 10: Crear Rutas de Autenticación Simplificadas

#### Rutas de Auth (`backend/routes/auth.js`):
```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/emailService');
const { generateVerificationCode } = require('../utils/generateCode');
const { protect } = require('../middleware/auth');
const { validateEmail, validateVerifyEmail } = require('../middleware/validation');

const router = express.Router();

// Enviar código de verificación (login/registro)
router.post('/send-code', validateEmail, async (req, res) => {
  try {
    const { email } = req.body;

    // Generar código de verificación
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Buscar o crear usuario
    let user = await User.findOne({ email });
    
    if (user) {
      // Usuario existe, actualizar código
      user.emailVerificationCode = verificationCode;
      user.emailVerificationExpires = verificationExpires;
      await user.save();
    } else {
      // Crear nuevo usuario
      user = await User.create({
        email,
        emailVerificationCode: verificationCode,
        emailVerificationExpires: verificationExpires
      });
    }

    // Enviar email de verificación
    await sendVerificationEmail(email, verificationCode);

    res.json({
      success: true,
      message: 'Código de verificación enviado a tu email',
      data: {
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error enviando código:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Verificar código y hacer login
router.post('/verify-code', validateVerifyEmail, async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({
      email,
      emailVerificationCode: code,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido o expirado'
      });
    }

    // Marcar email como verificado y actualizar último login
    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Generar JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Error verificando código:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Reenviar código de verificación
router.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email no encontrado'
      });
    }

    // Generar nuevo código
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Enviar email
    await sendVerificationEmail(email, verificationCode);

    res.json({
      success: true,
      message: 'Código de verificación reenviado'
    });
  } catch (error) {
    console.error('Error reenviando código:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener perfil del usuario
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Actualizar perfil del usuario
router.put('/profile', protect, async (req, res) => {
  try {
    const { firstName, lastName, phone, addresses } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone, addresses },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: user
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
```

### Paso 11: Actualizar Middleware de Validación

#### Middleware de Validación (`backend/middleware/validation.js`):
```javascript
const Joi = require('joi');

const validateEmail = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Debe ser un email válido',
      'any.required': 'El email es requerido'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateVerifyEmail = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Debe ser un email válido',
      'any.required': 'El email es requerido'
    }),
    code: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
      'string.length': 'El código debe tener 6 dígitos',
      'string.pattern.base': 'El código debe contener solo números',
      'any.required': 'El código es requerido'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateEmail,
  validateVerifyEmail
};
```

### Paso 12: Crear Componentes de Autenticación Simplificados

#### Contexto de Autenticación (`frontend/src/context/AuthContext.jsx`):
```javascript
import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SEND_CODE_START':
      return { ...state, loading: true, error: null };
    case 'SEND_CODE_SUCCESS':
      return {
        ...state,
        loading: false,
        email: action.payload.email,
        error: null
      };
    case 'SEND_CODE_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'VERIFY_CODE_START':
      return { ...state, loading: true, error: null };
    case 'VERIFY_CODE_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null
      };
    case 'VERIFY_CODE_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        email: null,
        error: null
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    email: null,
    loading: false,
    error: null
  });

  // Configurar axios con token
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  const sendCode = async (email) => {
    dispatch({ type: 'SEND_CODE_START' });
    try {
      const response = await axios.post('/api/auth/send-code', { email });
      dispatch({
        type: 'SEND_CODE_SUCCESS',
        payload: { email: response.data.data.email }
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error de conexión';
      dispatch({ type: 'SEND_CODE_FAILURE', payload: message });
      return { success: false, error: message };
    }
  };

  const verifyCode = async (email, code) => {
    dispatch({ type: 'VERIFY_CODE_START' });
    try {
      const response = await axios.post('/api/auth/verify-code', { email, code });
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      dispatch({
        type: 'VERIFY_CODE_SUCCESS',
        payload: { token, user }
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error de conexión';
      dispatch({ type: 'VERIFY_CODE_FAILURE', payload: message });
      return { success: false, error: message };
    }
  };

  const resendCode = async (email) => {
    dispatch({ type: 'SEND_CODE_START' });
    try {
      await axios.post('/api/auth/resend-code', { email });
      dispatch({ type: 'CLEAR_ERROR' });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error de conexión';
      dispatch({ type: 'SEND_CODE_FAILURE', payload: message });
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      sendCode,
      verifyCode,
      resendCode,
      logout,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

#### Componente de Login por Email (`frontend/src/components/EmailLogin.jsx`):
```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, RefreshCw } from 'lucide-react';

const EmailLogin = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email'); // 'email' o 'code'
  const [code, setCode] = useState('');
  const { sendCode, verifyCode, resendCode, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    const result = await sendCode(email);
    if (result.success) {
      setStep('code');
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const result = await verifyCode(email, code);
    if (result.success) {
      navigate('/');
    }
  };

  const handleResendCode = async () => {
    const result = await resendCode(email);
    if (result.success) {
      // Mostrar mensaje de éxito
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setCode('');
    clearError();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <Mail className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 'email' ? 'Ingresa tu email' : 'Verifica tu código'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'email' 
              ? 'Te enviaremos un código de verificación'
              : `Código enviado a ${email}`
            }
          </p>
        </div>
        
        {step === 'email' ? (
          <form className="mt-8 space-y-6" onSubmit={handleSendCode}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) clearError();
                  }}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar Código'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyCode}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Código de Verificación
              </label>
              <div className="mt-1">
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (error) clearError();
                  }}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-center text-2xl tracking-widest sm:text-sm"
                  placeholder="000000"
                  maxLength="6"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Ingresa el código de 6 dígitos que recibiste por email
              </p>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verificando...' : 'Verificar Código'}
              </button>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="flex items-center text-sm text-primary-600 hover:text-primary-500 disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reenviar Código
                </button>
                
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="text-sm text-gray-600 hover:text-gray-500"
                >
                  Cambiar Email
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmailLogin;
```

### Paso 13: Configurar App Principal
Actualizar `src/App.jsx`:
```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
```

### Paso 11: Configurar Servidor Backend

#### Archivo Principal del Backend (`backend/server.js`):
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middleware de seguridad
app.use(helmet());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://tu-dominio.com' 
    : 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/payments', require('./routes/payments'));

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Conectado a MongoDB');
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
})
.catch((error) => {
  console.error('Error conectando a MongoDB:', error);
  process.exit(1);
});
```

#### Configurar Scripts en `backend/package.json`:
```json
{
  "name": "tienda-suplementos-backend",
  "version": "1.0.0",
  "description": "Backend para tienda de suplementos deportivos",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "nodemailer": "^6.9.4",
    "joi": "^17.9.2",
    "express-rate-limit": "^6.10.0",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "mercadopago": "^2.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### Paso 12: Configurar Frontend

#### Configurar Axios (`frontend/src/services/api.js`):
```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### Configurar Variables de Entorno (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### Paso 13: Ejecutar el Proyecto

#### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### Paso 14: Configurar MongoDB

#### Opción 1: MongoDB Local
```bash
# Instalar MongoDB
# Windows: Descargar desde https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Iniciar MongoDB
mongod
```

#### Opción 2: MongoDB Atlas (Recomendado)
1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crear un cluster gratuito
3. Obtener la cadena de conexión
4. Actualizar `MONGODB_URI` en `backend/.env`

### Paso 15: Configurar Email (Gmail)

#### Configurar App Password en Gmail:
1. Ir a [Google Account](https://myaccount.google.com/)
2. Seguridad → Verificación en 2 pasos
3. Contraseñas de aplicaciones
4. Generar nueva contraseña para "Mail"
5. Usar esta contraseña en `EMAIL_PASS` en `backend/.env`

### Paso 16: Configurar Mercado Pago

#### Crear Cuenta de Mercado Pago:
1. Ir a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Crear cuenta o iniciar sesión
3. Ir a "Tus integraciones" → "Crear aplicación"
4. Seleccionar "E-commerce" como tipo de integración
5. Copiar el **Access Token** (clave de producción)

#### Configurar Webhook:
1. En tu aplicación de Mercado Pago
2. Ir a "Webhooks" → "Configurar"
3. URL del webhook: `https://tu-dominio.com/api/payments/webhook`
4. Eventos: Seleccionar "payment"
5. Copiar el **Webhook Secret**

#### Variables de Entorno para Mercado Pago:
```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-1234567890abcdef...
MERCADOPAGO_WEBHOOK_SECRET=tu_webhook_secret_aqui
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

#### Monedas Soportadas:
- **Argentina**: ARS (Peso Argentino)
- **México**: MXN (Peso Mexicano)
- **Colombia**: COP (Peso Colombiano)
- **Chile**: CLP (Peso Chileno)
- **Brasil**: BRL (Real Brasileño)
- **Uruguay**: UYU (Peso Uruguayo)

#### Ejemplo de `.env` completo:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/tienda-suplementos
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui_123456789
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password_de_gmail
EMAIL_FROM=tu_email@gmail.com
MERCADOPAGO_ACCESS_TOKEN=tu_access_token_de_mercadopago
MERCADOPAGO_WEBHOOK_SECRET=tu_webhook_secret
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

## 🎨 Características del Diseño

### Paleta de Colores
- **Primary**: Azul (#3b82f6)
- **Secondary**: Verde (#10b981)
- **Background**: Gris claro (#f9fafb)
- **Text**: Gris oscuro (#111827)

### Componentes Principales
1. **Header**: Navegación con carrito
2. **ProductCard**: Tarjeta de producto con botón de agregar
3. **Cart**: Carrito de compras con gestión de cantidades
4. **ProductDetail**: Vista detallada del producto
5. **Footer**: Información de la tienda

### Funcionalidades
- ✅ **Frontend Completo**
  - Catálogo de productos
  - Carrito de compras
  - Navegación entre páginas
  - Diseño responsive
  - Gestión de estado con Context API
  - Filtros por categoría
  - Búsqueda de productos

- ✅ **Sistema de Autenticación**
  - Registro con verificación por email
  - Login seguro con JWT
  - Código de verificación de 6 dígitos
  - Reenvío de código de verificación
  - Restablecimiento de contraseña
  - Protección de rutas
  - Gestión de sesiones

- ✅ **Backend Robusto**
  - API REST con Express.js
  - Base de datos MongoDB
  - Encriptación de contraseñas
  - Validación de datos con Joi
  - Envío de emails con Nodemailer
  - Middleware de seguridad
  - Rate limiting
  - Manejo de errores

- ✅ **Sistema de Pagos**
  - Integración con Mercado Pago
  - Pagos con tarjeta de crédito/débito
  - Transferencias bancarias
  - Pago en efectivo (Pago Fácil, Rapi Pago)
  - Webhooks para confirmación automática
  - Gestión de pedidos
  - Control de stock automático
  - Seguimiento de pagos

## 📱 Responsive Design
- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid System**: Uso de CSS Grid y Flexbox
- **Typography**: Escalas responsivas

## 🚀 Próximos Pasos
1. Agregar autenticación de usuarios
2. Implementar pagos con Stripe
3. Agregar sistema de reviews
4. Implementar filtros avanzados
5. Agregar wishlist/favoritos
6. Integrar con backend/API
7. Agregar tests unitarios
8. Implementar PWA

## 📞 Soporte
Para dudas o problemas, revisa la documentación de:
- [React](https://reactjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com/docs)

¡Tu tienda virtual de suplementos deportivos está lista! 🏋️‍♂️💪
