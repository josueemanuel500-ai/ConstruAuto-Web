import { useEffect, useRef, useState } from 'react';
import { NAV_ITEMS, type Page } from '../lib/pages';

interface HeaderProps {
  page: Page;
  onNavigate: (page: Page) => void;
}

export default function Header({ page, onNavigate }: HeaderProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 60,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E5E7EB',
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
              {NAV_ITEMS.map((ni) => (
                <a
                  key={ni.key}
                  onClick={() => go(ni.key)}
                  className="ca-nav-link"
                  style={{
                    fontSize: 15,
                    letterSpacing: '0.01em',
                    fontWeight: page === ni.key ? 800 : 600,
                    color: page === ni.key ? '#FF690F' : '#1F2933',
                  }}
                >
                  {ni.label}
                </a>
              ))}
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
        <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '8px 24px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map((ni) => (
            <a
              key={ni.key}
              onClick={() => go(ni.key)}
              style={{
                cursor: 'pointer',
                fontSize: 17,
                padding: '12px 4px',
                borderBottom: '1px solid #F3F4F6',
                textDecoration: 'none',
                fontWeight: page === ni.key ? 800 : 600,
                color: page === ni.key ? '#FF690F' : '#1F2933',
              }}
            >
              {ni.label}
            </a>
          ))}
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
