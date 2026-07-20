import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Al cambiar de ruta, siempre inicia desde arriba (React Router no restaura el scroll por sí solo). */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
