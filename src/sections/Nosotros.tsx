import { useState } from 'react';
import { waLink } from '../lib/whatsapp';
import Reveal from '../components/Reveal';

const WA_HREF = waLink('Hola, quiero información sobre un autofinanciamiento para un vehículo.');

function useHover() {
  const [hover, setHover] = useState(false);
  return { hover, onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false) };
}

const VALUES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF690F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M12 8v4l2.5 2.5"></path>
      </svg>
    ),
    title: 'Transparencia',
    desc: 'Condiciones claras desde el primer mensaje: montos, plazos y la cuota de apertura de $6,950, sin sorpresas.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF690F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
        <path d="M16 3.13a4 4 0 010 7.75"></path>
      </svg>
    ),
    title: 'Acompañamiento',
    desc: 'Te guiamos por WhatsApp en cada paso: desde la cotización hasta el día que recibes tu auto.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF690F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5"></path>
      </svg>
    ),
    title: 'Compromiso',
    desc: 'Nuestras entregas en video son la mejor carta de presentación: clientes reales recibiendo autos reales.',
  },
];

const STATS = [
  { value: '$30–150 mil', label: 'Rango de financiamiento' },
  { value: '6', label: 'Requisitos sencillos' },
  { value: '60 meses', label: 'Plazo máximo' },
  { value: '1 a 1', label: 'Atención personalizada' },
];

export default function Nosotros() {

  const waHover = useHover();
  const fbHover = useHover();
  const igHover = useHover();

  return (
    <main data-screen-label="Nosotros" style={{ animation: 'caFadeUp 0.4s ease' }}>
      <section style={{ background: '#F5F6F8', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 56px' }}>
          <div style={{ color: '#FF690F', fontWeight: 800, fontSize: 14, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>
            Nosotros
          </div>
          <h1 style={{ margin: '0 0 14px', fontSize: 'clamp(32px,4.4vw,48px)', fontWeight: 800, fontStyle: 'italic', maxWidth: 760 }}>
            Una empresa que entrega lo que promete
          </h1>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, color: '#52606D', maxWidth: 680 }}>
            ConstruAuto de México nació con una idea simple: que más familias puedan estrenar auto con un esquema honesto, accesible y acompañado de personas
            reales.
          </p>
        </div>
      </section>

      <section style={{ background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 24, marginBottom: 64 }}>
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delayMs={i * 60}>
                <div style={{ background: '#F5F6F8', borderRadius: 18, padding: '32px 28px' }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      background: '#FFF0E6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 18,
                    }}
                  >
                    {v.icon}
                  </div>
                  <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>{v.title}</h3>
                  <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: '#52606D' }}>{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 32,
              alignItems: 'center',
              background: '#1F2933',
              borderRadius: 24,
              padding: 'clamp(28px,4vw,52px)',
            }}
          >
            <div style={{ flex: '1 1 380px', minWidth: 280 }}>
              <h2 style={{ margin: '0 0 12px', color: '#fff', fontSize: 'clamp(24px,3vw,34px)', fontWeight: 800, fontStyle: 'italic' }}>
                Visítanos o escríbenos
              </h2>
              <p style={{ margin: '0 0 20px', color: '#CBD2D9', fontSize: 16, lineHeight: 1.6 }}>
                Cto. Colonias 297, San Miguel,
                <br />
                97148 Mérida, Yucatán.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <a
                  href={WA_HREF}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={waHover.onMouseEnter}
                  onMouseLeave={waHover.onMouseLeave}
                  style={{
                    background: waHover.hover ? '#1FB859' : '#25D366',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 15.5,
                    padding: '13px 24px',
                    borderRadius: 12,
                    textDecoration: 'none',
                  }}
                >
                  WhatsApp
                </a>
                <a
                  href="https://www.facebook.com/Construautomx"
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={fbHover.onMouseEnter}
                  onMouseLeave={fbHover.onMouseLeave}
                  style={{
                    background: fbHover.hover ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 15.5,
                    padding: '13px 24px',
                    borderRadius: 12,
                    textDecoration: 'none',
                  }}
                >
                  Facebook
                </a>
                <a
                  href="https://www.instagram.com/construauto_mexico"
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={igHover.onMouseEnter}
                  onMouseLeave={igHover.onMouseLeave}
                  style={{
                    background: igHover.hover ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 15.5,
                    padding: '13px 24px',
                    borderRadius: 12,
                    textDecoration: 'none',
                  }}
                >
                  Instagram
                </a>
              </div>
            </div>
            <div style={{ flex: '1 1 320px', minWidth: 280, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {STATS.map((s) => (
                <div
                  key={s.label}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 22 }}
                >
                  <div style={{ fontSize: 26, fontWeight: 800, fontStyle: 'italic', color: '#FF9A5C' }}>{s.value}</div>
                  <div style={{ fontSize: 13.5, color: '#9AA5B1' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
