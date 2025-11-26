import { useEffect } from 'react';
import { useUI } from '../context/UIContext';
import Home from '../pages/Home';

export default function LoginRouteWrapper() {
  const { openLogin } = useUI();

  useEffect(() => {
    openLogin();
  }, [openLogin]);

  return <Home />;
}
