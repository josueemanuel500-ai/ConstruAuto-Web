import { useState } from 'react';
import { fmtMoney, fmtMoneyCents, financeFactor, waLink } from '../lib/whatsapp';

const PLAZOS = [12, 24, 36, 48, 60];

export default function Calculadora() {

  const [monto, setMonto] = useState(90000);
  const [plazo, setPlazo] = useState(36);

  const factor = financeFactor();
  const total = monto * factor;
  const pago = total / plazo;

  const montoF = fmtMoney(monto);
  const totalF = fmtMoney(total);
  const pagoF = fmtMoneyCents(pago);
  const factorF = String(factor);
  const plazoLabel = plazo + ' meses';

  const calcWaHref = waLink(
    'Hola, cotizé en su sitio web: solicité ' + montoF + ' (monto total ' + totalF + ') a ' + plazo + ' meses, pago mensual aprox. ' + pagoF + ' MXN. Quiero más información.',
  );

  return (
    <main data-screen-label="Calculadora" style={{ animation: 'caFadeUp 0.4s ease' }}>
      <section style={{ background: '#F5F6F8', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 56px' }}>
          <div style={{ color: '#FF690F', fontWeight: 800, fontSize: 14, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>
            Cotizador
          </div>
          <h1 style={{ margin: '0 0 14px', fontSize: 'clamp(32px,4.4vw,48px)', fontWeight: 800, fontStyle: 'italic', maxWidth: 760 }}>
            Calcula tu pago mensual
          </h1>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, color: '#52606D', maxWidth: 680 }}>
            Mueve el monto y el plazo para estimar tu mensualidad. Es un cálculo informativo — la cotización formal te la damos por WhatsApp.
          </p>
        </div>
      </section>

      <section style={{ background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px', display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 440px', minWidth: 300, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 20, padding: 'clamp(24px,3vw,38px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <label style={{ fontWeight: 800, fontSize: 17 }}>Monto que necesitas</label>
              <div style={{ fontWeight: 800, fontSize: 24, fontStyle: 'italic', color: '#FF690F' }}>{montoF}</div>
            </div>
            <input
              type="range"
              min={30000}
              max={150000}
              step={5000}
              value={monto}
              onChange={(e) => setMonto(Number(e.target.value))}
              style={{ width: '100%', height: 32, cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: '#9AA5B1', fontWeight: 600, marginBottom: 30 }}>
              <span>$30,000</span>
              <span>$150,000</span>
            </div>
            <label style={{ fontWeight: 800, fontSize: 17, display: 'block', marginBottom: 12 }}>Plazo</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {PLAZOS.map((m) => {
                const selected = plazo === m;
                return (
                  <button
                    key={m}
                    onClick={() => setPlazo(m)}
                    style={{
                      padding: '11px 18px',
                      borderRadius: 999,
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 15,
                      border: `1.5px solid ${selected ? '#FF690F' : '#D1D5DB'}`,
                      background: selected ? '#FF690F' : '#fff',
                      color: selected ? '#fff' : '#1F2933',
                    }}
                  >
                    {m} meses
                  </button>
                );
              })}
            </div>
          </div>
          <div
            style={{
              flex: '1 1 340px',
              minWidth: 300,
              background: '#1F2933',
              backgroundImage: 'radial-gradient(500px 300px at 100% 0%, rgba(255,105,15,0.25), transparent 60%)',
              borderRadius: 20,
              padding: 'clamp(24px,3vw,38px)',
              color: '#fff',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9AA5B1', marginBottom: 6 }}>
              Pago mensual aproximado
            </div>
            <div style={{ fontSize: 'clamp(40px,5vw,54px)', fontWeight: 800, fontStyle: 'italic', lineHeight: 1, marginBottom: 22 }}>
              {pagoF}
              <span style={{ fontSize: '0.35em', fontStyle: 'normal', color: '#9AA5B1', fontWeight: 700 }}> / mes</span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                borderTop: '1px solid rgba(255,255,255,0.14)',
                paddingTop: 20,
                marginBottom: 26,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15.5 }}>
                <span style={{ color: '#9AA5B1' }}>Monto solicitado</span>
                <strong>{montoF}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15.5 }}>
                <span style={{ color: '#9AA5B1' }}>Monto total (factor {factorF})</span>
                <strong>{totalF}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15.5 }}>
                <span style={{ color: '#9AA5B1' }}>Plazo</span>
                <strong>{plazoLabel}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15.5 }}>
                <span style={{ color: '#9AA5B1' }}>Cuota de apertura (única)</span>
                <strong style={{ color: '#FF9A5C' }}>$6,950 MXN</strong>
              </div>
            </div>
            <a
              href={calcWaHref}
              target="_blank"
              rel="noreferrer"
              className="ca-btn-primary"
              style={{ display: 'block', fontWeight: 800, fontSize: 17, padding: 16, borderRadius: 12, textAlign: 'center', textDecoration: 'none', marginBottom: 14 }}
            >
              Solicitar esta cotización
            </a>
            <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: '#9AA5B1' }}>
              Cotización informativa. La aprobación y condiciones finales dependen de validación.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
