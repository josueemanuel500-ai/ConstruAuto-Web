import { lazy, Suspense } from 'react';
import type { ComponentType } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import Home from '../sections/Home';
import Servicios from '../sections/Servicios';
import Nosotros from '../sections/Nosotros';
import Catalogo from '../sections/Catalogo';
import Calculadora from '../sections/Calculadora';
import Contacto from '../sections/Contacto';
import type { Page } from '../lib/pages';
import type { SectionProps } from '../lib/types';
import { useCrossRouteNavigate } from '../lib/useCrossRouteNavigate';

// Juega y gana carga ~40 MB de sprites/fondos del minijuego (game.js los precarga al
// importarse). Se separa en su propio chunk para que el resto del sitio no pague ese
// costo de red en la primera carga.
const Juega = lazy(() => import('../sections/Juega'));

type HomeSectionKey = Exclude<Page, 'entregas'>;

const SECTIONS: Record<HomeSectionKey, ComponentType<SectionProps>> = {
  home: Home,
  servicios: Servicios,
  nosotros: Nosotros,
  catalogo: Catalogo,
  calculadora: Calculadora,
  juego: Juega,
  contacto: Contacto,
};

export default function HomePage() {
  const location = useLocation();
  const goToSection = useCrossRouteNavigate();

  const requestedPage = (location.state as { page?: Page } | null)?.page;
  const page: HomeSectionKey = requestedPage && requestedPage !== 'entregas' ? requestedPage : 'home';

  const Section = SECTIONS[page];

  return (
    <>
      <Header page={page} onNavigate={goToSection} />
      <Suspense
        fallback={
          <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ca-text-muted)' }}>
            Cargando…
          </main>
        }
      >
        <Section onNavigate={goToSection} />
      </Suspense>
      <Footer onNavigate={goToSection} />
      <WhatsAppFloat />
    </>
  );
}
