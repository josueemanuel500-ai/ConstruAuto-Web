import '../game/game.js';
import type { SectionProps } from '../lib/types';
import { waNumber } from '../lib/whatsapp';
import RouletteWheel3D from '../components/RouletteWheel3D';

const hints = [
  '← → o botones para moverte',
  'Salta con ESPACIO o el botón naranja',
  'Junta TODAS las llaves para abrir la meta',
];

const prizes = [
  {
    ribbon: 'Mayor',
    icon: '🏆',
    title: '1 año de seguro gratis',
    desc: 'El premio más raro del reto.',
    dark: true,
  },
  {
    icon: '🥈',
    title: '3 mensualidades bonificadas',
    desc: 'Se aplican directo a tu plan.',
    dark: false,
  },
  {
    icon: '🥉',
    title: '50% de descuento en el interés de 2 mensualidades',
    desc: 'Paga menos interés dos meses.',
    dark: false,
  },
  {
    icon: '🎟️',
    title: '1 mensualidad bonificada',
    desc: 'El premio más frecuente.',
    dark: false,
  },
];

export default function Juega({ onNavigate }: SectionProps) {
  void onNavigate;

  return (
    <main data-screen-label="Juega y gana" style={{ animation: 'caFadeUp 0.4s ease' }}>
      <section
        style={{
          background: '#1F2933',
          backgroundImage:
            'radial-gradient(900px 500px at 85% -10%, rgba(255,105,15,0.28), transparent 60%),radial-gradient(600px 400px at -10% 110%, rgba(255,105,15,0.12), transparent 60%)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 40px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(255,105,15,0.15)',
              border: '1px solid rgba(255,105,15,0.45)',
              color: '#FF9A5C',
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              padding: '7px 14px',
              borderRadius: 999,
              marginBottom: 20,
            }}
          >
            Juega y gana
          </div>
          <h1
            style={{
              margin: '0 0 16px',
              color: '#fff',
              fontFamily: 'var(--ca-font-pixel)',
              fontWeight: 400,
              fontSize: 'clamp(18px,3.2vw,32px)',
              lineHeight: 1.45,
            }}
          >
            RETO CONSTRUAUTO
          </h1>
          <p style={{ margin: '0 auto', color: '#CBD2D9', fontSize: 17, lineHeight: 1.6, maxWidth: 560 }}>
            Supera 7 niveles, junta todas las llaves, esquiva los obstáculos y llévate tu auto… ¡con premio real incluido!
          </p>
          <img
            src="/assets/sprites/hero-key-big.png"
            alt="Héroe ConstruAuto con llave de auto"
            style={{ display: 'block', margin: '26px auto 0', height: 170, imageRendering: 'pixelated' }}
          />
        </div>
      </section>

      <section style={{ background: '#1F2933', paddingBottom: 64 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px' }}>
          <div
            style={{
              borderRadius: 18,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.16)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
              background: '#141D26',
            }}
          >
            <div style={{ width: '100%', minHeight: 500 }}>
              <ca-game whatsapp={waNumber()}></ca-game>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 18 }}>
            {hints.map((h) => (
              <span
                key={h}
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  color: '#CBD2D9',
                  fontWeight: 700,
                  fontSize: 13,
                  padding: '8px 15px',
                  borderRadius: 999,
                }}
              >
                {h}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 24px' }}>
          <div style={{ textAlign: 'center', maxWidth: 660, margin: '0 auto 44px' }}>
            <div
              style={{
                color: '#FF690F',
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              Premios reales
            </div>
            <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(26px,3.4vw,38px)', fontWeight: 800, fontStyle: 'italic' }}>
              Termina el reto y gana
            </h2>
            <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.6, color: '#52606D' }}>
              Al completar los 7 niveles obtienes un premio al azar y un código único para reclamarlo por WhatsApp.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 22 }}>
            {prizes.map((p) => (
              <div
                key={p.title}
                style={{
                  background: p.dark ? '#1F2933' : '#F5F6F8',
                  borderRadius: 18,
                  padding: '28px 26px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {p.ribbon && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 14,
                      right: -30,
                      background: '#FF690F',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: 11,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '5px 36px',
                      transform: 'rotate(35deg)',
                    }}
                  >
                    {p.ribbon}
                  </div>
                )}
                <div style={{ fontSize: 34, marginBottom: 10 }}>{p.icon}</div>
                <div
                  style={{
                    color: p.dark ? '#fff' : undefined,
                    fontSize: 20,
                    fontWeight: 800,
                    fontStyle: 'italic',
                    lineHeight: 1.25,
                  }}
                >
                  {p.title}
                </div>
                <div style={{ color: p.dark ? '#9AA5B1' : '#52606D', fontSize: 14, marginTop: 8 }}>{p.desc}</div>
              </div>
            ))}
          </div>

          <p style={{ margin: '36px auto 0', maxWidth: 720, textAlign: 'center', fontSize: 13, lineHeight: 1.6, color: '#9AA5B1' }}>
            Dinámica promocional: un premio por persona, sujeto a validación con tu asesor y aplicable al contratar tu plan según contrato.
            Los códigos no son canjeables por dinero en efectivo. ConstruAuto de México puede modificar o concluir la dinámica en
            cualquier momento.
          </p>
          <p style={{ margin: '10px auto 0', maxWidth: 720, textAlign: 'center', fontSize: 11, lineHeight: 1.5, color: '#9AA5B1' }}>
            Aplican restricciones. Promoción válida únicamente para financiamiento de $100,000 MXN en adelante.
          </p>
        </div>
      </section>

      <section style={{ background: '#F5F6F8', borderTop: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 40px' }}>
          <div style={{ textAlign: 'center', maxWidth: 660, margin: '0 auto 8px' }}>
            <div
              style={{
                color: '#FF690F',
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              Ruleta de promociones
            </div>
            <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(26px,3.4vw,38px)', fontWeight: 800, fontStyle: 'italic' }}>
              O gira la ruleta por los mismos premios
            </h2>
            <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.6, color: '#52606D' }}>
              Arrástrala y lánzala. Al detenerse ganas una de las promociones de arriba y recibes tu código por WhatsApp.
            </p>
          </div>
          <RouletteWheel3D whatsappNumber={waNumber()} embed />
        </div>
      </section>
    </main>
  );
}
