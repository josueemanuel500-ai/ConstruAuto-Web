import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import WhatsAppFloat from './WhatsAppFloat';

export default function Layout() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ca-text-muted)' }}>
            Cargando…
          </main>
        }
      >
        <Outlet />
      </Suspense>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
