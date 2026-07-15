import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import LoginForm from './LoginForm';
import EntregasPanel from './EntregasPanel';
import CatalogoPanel from './CatalogoPanel';
import { useAdminLists } from './useAdminLists';

/**
 * Estilos con :hover que no existen como utilidad en tokens.css (no se edita ese archivo,
 * ver reglas del proyecto), scoped a este árbol.
 */
const localHoverStyles = `
  .ca-admin-btn-delete {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    color: var(--ca-error);
  }
  .ca-admin-btn-delete:hover {
    background: #FEE2E2;
  }
`;

export default function AdminApp() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session ? data.session.user : null);
      setAuthReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? session.user : null);
      setAuthReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const isAuthed = isSupabaseConfigured && !!user;
  const { items, catItems, reloadEntregas, reloadCatalogo, deleteEntrega, deleteCatalogo } = useAdminLists(isAuthed);

  const logout = () => {
    if (supabase) supabase.auth.signOut();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{localHoverStyles}</style>

      <header style={{ background: 'var(--ca-carbon)', color: '#fff' }}>
        <div
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            padding: '0 24px',
            height: 66,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/assets/logo-blanco.png" alt="ConstruAuto de México" style={{ height: 28, display: 'block' }} />
            <span
              style={{
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--ca-orange-light)',
              }}
            >
              Panel de entregas
            </span>
          </div>
          {isAuthed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 13.5, color: 'var(--ca-text-muted)', fontWeight: 600 }}>{user?.email}</span>
              <button
                onClick={logout}
                className="ca-btn-ghost-dark"
                style={{ fontWeight: 700, fontSize: 13.5, padding: '8px 16px', borderRadius: 9, cursor: 'pointer' }}
              >
                Salir
              </button>
            </div>
          )}
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 1000, width: '100%', margin: '0 auto', padding: '32px 24px 64px' }}>
        {!isSupabaseConfigured && (
          <div
            style={{
              maxWidth: 640,
              margin: '40px auto',
              background: '#fff',
              border: '1.5px solid #FECACA',
              borderRadius: 18,
              padding: '32px 30px',
            }}
          >
            <h2 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 800, fontStyle: 'italic', color: 'var(--ca-error)' }}>
              Falta conectar Supabase
            </h2>
            <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.65, color: 'var(--ca-text-secondary)' }}>
              Abre el archivo <strong>.env</strong> y define <strong>VITE_SUPABASE_URL</strong> y{' '}
              <strong>VITE_SUPABASE_ANON_KEY</strong>.
            </p>
          </div>
        )}

        {isSupabaseConfigured && !authReady && (
          <div style={{ textAlign: 'center', padding: '90px 0', color: 'var(--ca-text-muted)', fontWeight: 600, fontSize: 15 }}>
            Cargando…
          </div>
        )}

        {isSupabaseConfigured && authReady && !user && <LoginForm />}

        {isAuthed && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
                gap: 28,
                alignItems: 'start',
              }}
            >
              <EntregasPanel items={items} onDelete={deleteEntrega} onAdded={reloadEntregas} />
            </div>

            <div
              style={{
                marginTop: 34,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
                gap: 28,
                alignItems: 'start',
              }}
            >
              <CatalogoPanel items={catItems} onDelete={deleteCatalogo} onAdded={reloadCatalogo} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
