import { useNavigate } from 'react-router-dom';
import type { Page } from './pages';

/**
 * Navegación compartida entre Header/Footer y las secciones. 'entregas' es una
 * ruta real; el resto son secciones internas de "/" (se pasan vía location.state
 * para que HomePage sepa cuál mostrar, incluso viniendo de otra ruta).
 */
export function useCrossRouteNavigate() {
  const routerNavigate = useNavigate();

  return function goToSection(target: Page) {
    if (target === 'entregas') {
      routerNavigate('/entregas');
      return;
    }
    routerNavigate('/', { state: { page: target } });
    requestAnimationFrame(() => window.scrollTo(0, 0));
  };
}
