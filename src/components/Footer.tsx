import { NAV_ITEMS, type Page } from '../lib/pages';
import { waLink } from '../lib/whatsapp';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const waHref = waLink('Hola, quiero información sobre un autofinanciamiento para un vehículo.');

  return (
    <footer style={{ background: '#1F2933', color: '#9AA5B1' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 28px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 40,
            justifyContent: 'space-between',
            paddingBottom: 36,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div style={{ maxWidth: 320 }}>
            <img src="/assets/logo-blanco.png" alt="ConstruAuto de México" style={{ height: 32, display: 'block', marginBottom: 16 }} />
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6 }}>
              Autofinanciamiento de autos usados y seminuevos en Mérida, Yucatán. Financiamiento de $30,000 a $150,000 MXN.
              Trámite claro, entrega real.
            </p>
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, marginBottom: 14 }}>Sitio</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {NAV_ITEMS.map((ni) => (
                <a
                  key={ni.key}
                  onClick={() => onNavigate(ni.key)}
                  className="ca-nav-link"
                  style={{ color: '#9AA5B1', fontSize: 14.5, textDecoration: 'none' }}
                >
                  {ni.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, marginBottom: 14 }}>Contacto</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 14.5 }}>
              <a href={waHref} target="_blank" rel="noreferrer" className="ca-nav-link" style={{ color: '#9AA5B1', textDecoration: 'none' }}>
                WhatsApp · 999 356 4692
              </a>
              <a href="tel:+529994796369" className="ca-nav-link" style={{ color: '#9AA5B1', textDecoration: 'none' }}>
                Teléfono · 999 479 6369
              </a>
              <a href="https://www.facebook.com/Construautomx" target="_blank" rel="noreferrer" className="ca-nav-link" style={{ color: '#9AA5B1', textDecoration: 'none' }}>
                Facebook
              </a>
              <a href="https://www.instagram.com/construauto_mexico" target="_blank" rel="noreferrer" className="ca-nav-link" style={{ color: '#9AA5B1', textDecoration: 'none' }}>
                Instagram
              </a>
              <span>
                Cto. Colonias 297, San Miguel,
                <br />
                97148 Mérida, Yucatán.
              </span>
            </div>
          </div>
        </div>
        <div style={{ paddingTop: 22, display: 'flex', flexWrap: 'wrap', gap: '10px 24px', justifyContent: 'space-between', fontSize: 13 }}>
          <span>© 2026 ConstruAuto de México. Todos los derechos reservados.</span>
          <span>Los cálculos mostrados son informativos y no constituyen una oferta ni aprobación de financiamiento.</span>
        </div>
      </div>
    </footer>
  );
}
