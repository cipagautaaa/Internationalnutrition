/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);
  const toggleSearch = () => setIsSearchOpen((v) => !v);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);
  const toggleLogin = () => setIsLoginOpen((v) => !v);

  const openMobileMenu = () => setIsMobileMenuOpen(true);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  return (
    <UIContext.Provider
      value={{
        isSearchOpen,
        openSearch,
        closeSearch,
        toggleSearch,
        isLoginOpen,
        openLogin,
        closeLogin,
        toggleLogin,
        isMobileMenuOpen,
        openMobileMenu,
        closeMobileMenu,
        toggleMobileMenu,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
};
