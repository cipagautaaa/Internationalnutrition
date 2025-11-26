/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useReducer, useState } from 'react';

const CartContext = createContext();

const STORAGE_KEY = 'cart_v1';

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      // Normalize payload: ensure we always have productId and id fields so backend can resolve
      const raw = action.payload || {};
      const { baseSize, ...rest } = raw;
      const productId = raw.productId || raw._id || raw.id || raw.product?.id || raw.product?._id || raw.sku || null;
      const normalized = {
        // keep original fields but ensure canonical productId/id and basic fields used by cart
        ...rest,
        productId,
        id: raw.id || raw._id || productId,
        name: raw.name || raw.title || (raw.product && raw.product.name) || '',
        price: raw.price || (raw.variant && raw.variant.price) || 0,
        variantId: raw.variantId || raw.variant?._id || raw.variant?.id || null,
        flavor: raw.flavor || null,
        size: raw.size || baseSize || raw.variant?.size || null,
      };

      // Considerar combinación (productId + variantId + flavor) para identificar ítem único
      const key = `${normalized.id || ''}::${normalized.variantId || ''}::${normalized.flavor || ''}`;
      const existingItem = state.items.find((item) => item._key === key);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item._key === key ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...normalized, quantity: 1, _key: key }],
      };
    }

    case 'REMOVE_FROM_CART': {
      return {
        ...state,
        items: state.items.filter((item) => item._key !== action.payload),
      };
    }

    case 'UPDATE_QUANTITY': {
      return {
        ...state,
        items: state.items.map((item) =>
          item._key === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ),
      };
    }

    case 'CLEAR_CART': {
      // limpiar storage también
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        void err; // ignore storage errors
      }
      return { ...state, items: [] };
    }

    default:
      return state;
  }
};

// Inicializador perezoso leyendo de localStorage
const initFromStorage = (initialState) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.items)) {
      // Normalize any legacy items stored previously to ensure productId/id exist
      const items = parsed.items.map((it) => {
        const { baseSize, ...rest } = it || {};
        const productId = it.productId || it._id || it.id || (it.product && (it.product._id || it.product.id)) || null;
        return {
          ...rest,
          productId,
          id: it.id || it._id || productId,
          quantity: it.quantity || 1,
          size: it.size || baseSize || (it.variant && it.variant.size) || null,
        };
      });
      return { items };
    }
  } catch (err) {
    void err; // ignore storage errors
  }
  return initialState;
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] }, initFromStorage);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (key) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: key });
  };

  const updateQuantity = (key, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: key, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Persistir carrito en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items }));
    } catch (err) {
      void err; // ignore storage errors
    }
  }, [state.items]);

  // UI drawer controls
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((v) => !v);

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
  };

  return (
    <CartContext.Provider value={value}>
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