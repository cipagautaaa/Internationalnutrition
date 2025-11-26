import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { CartProvider } from './context/CartContext'
import { UIProvider } from './context/UIContext'
import { AuthProvider } from './context/AuthContext'
import ClearStorage from './components/ClearStorage'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <UIProvider>
          <BrowserRouter>
            <ClearStorage />
            <App />
          </BrowserRouter>
        </UIProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
)
