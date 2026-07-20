import { lazy, Suspense, useState } from 'react';
import type { ComponentType } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import Home from './sections/Home';
import Servicios from './sections/Servicios';
import Entregas from './sections/Entregas';
import Nosotros from './sections/Nosotros';
import Catalogo from './sections/Catalogo';
import Calculadora from './sections/Calculadora';
import Contacto from './sections/Contacto';
import type { Page } from './lib/pages';
import type { SectionProps } from './lib/types';
import { useContentProtection } from './hooks/useContentProtection';

// Juega y gana carga ~40 MB de sprites/fondos del minijuego (game.js los precarga al
// importarse). Se separa en su propio chunk para que el resto del sitio no pague ese
// costo de red en la primera carga.
const Juega = lazy(() => import('./sections/Juega'));

const SECTIONS: Record<Page, ComponentType<SectionProps>> = {
  home: Home,
  servicios: Servicios,
  entregas: Entregas,
  nosotros: Nosotros,
  catalogo: Catalogo,
  calculadora: Calculadora,
  juego: Juega,
  contacto: Contacto,
};

function App() {
  useContentProtection();
  const [page, setPage] = useState<Page>('home');

  function navigate(target: Page) {
    setPage(target);
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }

  const Section = SECTIONS[page];

  return (
    <>
      <Header page={page} onNavigate={navigate} />
      <Suspense
        fallback={
          <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ca-text-muted)' }}>
            Cargando…
          </main>
        }
      >
        <Section onNavigate={navigate} />
      </Suspense>
      <Footer onNavigate={navigate} />
      <WhatsAppFloat />
    </>
  );
}

export default App;
