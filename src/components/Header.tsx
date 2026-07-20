import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { NAV_ITEMS, type Page } from '../lib/pages';

interface HeaderProps {
  page: Page;
  onNavigate: (page: Page) => void;
}

export default function Header({ page, onNavigate }: HeaderProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const logoTaps = useRef(0);
  const logoTapTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1120px)');
    const onChange = () => {
      setIsMobile(mq.matches);
      if (!mq.matches) setMenuOpen(false);
    };
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function go(target: Page) {
    onNavigate(target);
    setMenuOpen(false);
  }

  function logoTap() {
    go('home');
    logoTaps.current += 1;
    window.clearTimeout(logoTapTimer.current);
    logoTapTimer.current = window.setTimeout(() => {
      logoTaps.current = 0;
    }, 3000);
    if (logoTaps.current >= 7) {
      logoTaps.current = 0;
      window.location.href = 'admin.html';
    }
  }

  // En el hero de Inicio (arriba de todo) el menú está oculto; aparece al hacer scroll.
  // En el resto de páginas siempre está visible.
  const hiddenAtTop = page === 'home' && !scrolled && !menuOpen;

  const navColorActive = '#FF690F';
  const navColorIdle = '#1F2933';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 60,
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(22px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(22px) saturate(1.8)',
        borderBottom: '1px solid rgba(229,231,235,0.7)',
        boxShadow: '0 10px 34px rgba(31,41,51,0.10)',
        transform: hiddenAtTop ? 'translateY(-100%)' : 'translateY(0)',
        opacity: hiddenAtTop ? 0 : 1,
        pointerEvents: hiddenAtTop ? 'none' : 'auto',
        transition: 'transform 0.4s ease, opacity 0.4s ease',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
        }}
      >
        <a onClick={logoTap} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', flex: 'none' }}>
          <img src="/assets/logo-color.png" alt="ConstruAuto de México" style={{ height: 34, display: 'block' }} />
        </a>

        {!isMobile && (
          <>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 22, minWidth: 0 }}>
              {NAV_ITEMS.map((ni) => {
                const navLinkStyle = {
                  fontSize: 15,
                  letterSpacing: '0.01em',
                  fontWeight: page === ni.key ? 800 : 600,
                  color: page === ni.key ? navColorActive : navColorIdle,
                  transition: 'color 0.35s ease',
                  textDecoration: 'none',
                } as const;

                return ni.key === 'entregas' ? (
                  <Link key={ni.key} to="/entregas" className="ca-nav-link" style={navLinkStyle}>
                    {ni.label}
                  </Link>
                ) : (
                  <a key={ni.key} onClick={() => go(ni.key)} className="ca-nav-link" style={navLinkStyle}>
                    {ni.label}
                  </a>
                );
              })}
            </nav>
            <a
              onClick={() => go('calculadora')}
              className="ca-btn-primary"
              style={{
                flex: 'none',
                fontWeight: 800,
                fontSize: 15,
                padding: '11px 22px',
                borderRadius: 10,
                textDecoration: 'none',
                letterSpacing: '0.01em',
              }}
            >
              Cotiza tu auto
            </a>
          </>
        )}

        {isMobile && (
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menú"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center' }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1F2933" strokeWidth="2.4" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      {menuOpen && (
        <div
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(18px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(18px) saturate(1.6)',
            borderBottom: '1px solid #E5E7EB',
            padding: '8px 24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {NAV_ITEMS.map((ni) => {
            const mobileLinkStyle = {
              cursor: 'pointer',
              fontSize: 17,
              padding: '12px 4px',
              borderBottom: '1px solid #F3F4F6',
              textDecoration: 'none',
              fontWeight: page === ni.key ? 800 : 600,
              color: page === ni.key ? '#FF690F' : '#1F2933',
              display: 'block',
            } as const;

            return ni.key === 'entregas' ? (
              <Link key={ni.key} to="/entregas" style={mobileLinkStyle} onClick={() => setMenuOpen(false)}>
                {ni.label}
              </Link>
            ) : (
              <a key={ni.key} onClick={() => go(ni.key)} style={mobileLinkStyle}>
                {ni.label}
              </a>
            );
          })}
          <a
            onClick={() => go('calculadora')}
            style={{
              cursor: 'pointer',
              marginTop: 14,
              background: '#FF690F',
              color: '#fff',
              fontWeight: 800,
              fontSize: 16,
              padding: 14,
              borderRadius: 10,
              textAlign: 'center',
              textDecoration: 'none',
            }}
          >
            Cotiza tu auto
          </a>
        </div>
      )}
    </header>
  );
}
