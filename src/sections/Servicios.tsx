import type { SectionProps } from '../lib/types';
import { waLink } from '../lib/whatsapp';

const WA_REQUISITOS_HREF = waLink('Hola, ya tengo mis requisitos listos para el autofinanciamiento. ¿Cuál es el siguiente paso?');

interface Paso {
  n: string;
  t: string;
  d: string;
}

const PASOS: Paso[] = [
  { n: '1', t: 'Cotiza tu plan', d: 'Usa la calculadora o escríbenos por WhatsApp. Define monto ($30,000 a $150,000 MXN) y plazo.' },
  { n: '2', t: 'Reúne tus requisitos', d: 'Identificación, comprobante de domicilio, RFC y dos referencias. Nosotros revisamos todo contigo.' },
  { n: '3', t: 'Firma tu contrato', d: 'Cubres la cuota de apertura de $6,950 MXN y tu plan queda activo. Todo por escrito y con claridad.' },
  { n: '4', t: 'Recibe tu auto', d: 'Elegimos contigo el vehículo seminuevo ideal y te acompañamos hasta la entrega de llaves.' },
];

interface Requisito {
  t: string;
  d: string;
}

const REQUISITOS: Requisito[] = [
  { t: 'Identificación oficial', d: 'INE o pasaporte vigente' },
  { t: 'Comprobante de domicilio', d: 'Reciente, no mayor a 3 meses' },
  { t: 'RFC', d: 'Constancia de situación fiscal' },
  { t: '1 referencia laboral', d: 'Nombre y teléfono de contacto' },
  { t: '1 referencia personal', d: 'Nombre y teléfono de contacto' },
  { t: 'Cuota de apertura', d: '$6,950 MXN — pago único al firmar tu contrato' },
];

export default function Servicios({ onNavigate }: SectionProps) {
  void onNavigate;

  return (
    <main data-screen-label="Servicios" style={{ animation: 'caFadeUp 0.4s ease' }}>
      <section style={{ background: '#F5F6F8', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 56px' }}>
          <div style={{ color: '#FF690F', fontWeight: 800, fontSize: 14, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>
            Servicios
          </div>
          <h1 style={{ margin: '0 0 14px', fontSize: 'clamp(32px,4.4vw,48px)', fontWeight: 800, fontStyle: 'italic', maxWidth: 760 }}>
            Autofinanciamiento claro, sin letras chiquitas
          </h1>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, color: '#52606D', maxWidth: 680 }}>
            En ConstruAuto de México te ayudamos a hacerte de un vehículo seminuevo mediante un esquema de autofinanciamiento con condiciones transparentes y
            pagos que se adaptan a ti.
          </p>
        </div>
      </section>

      <section style={{ background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 22, marginBottom: 64 }}>
            <div style={{ background: '#1F2933', color: '#fff', borderRadius: 18, padding: '28px 26px' }}>
              <div style={{ fontSize: 30, fontWeight: 800, fontStyle: 'italic', color: '#FF9A5C', marginBottom: 6 }}>$30,000 – $150,000</div>
              <div style={{ fontSize: 15.5, lineHeight: 1.5, color: '#CBD2D9' }}>
                Rango de financiamiento en pesos mexicanos, sobre vehículos usados y seminuevos.
              </div>
            </div>
            <div style={{ background: '#fff', border: '1.5px solid #FF690F', borderRadius: 18, padding: '28px 26px' }}>
              <div style={{ fontSize: 30, fontWeight: 800, fontStyle: 'italic', color: '#FF690F', marginBottom: 6 }}>$6,950 MXN</div>
              <div style={{ fontSize: 15.5, lineHeight: 1.5, color: '#52606D' }}>
                Cuota de apertura única para activar tu contrato. Es el único pago que necesitas para arrancar.
              </div>
            </div>
            <div style={{ background: '#F5F6F8', borderRadius: 18, padding: '28px 26px' }}>
              <div style={{ fontSize: 30, fontWeight: 800, fontStyle: 'italic', color: '#1F2933', marginBottom: 6 }}>12 a 60 meses</div>
              <div style={{ fontSize: 15.5, lineHeight: 1.5, color: '#52606D' }}>
                Plazos flexibles para que el pago mensual se ajuste a tu presupuesto real.
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 44px' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(26px,3.4vw,38px)', fontWeight: 800, fontStyle: 'italic' }}>El proceso, paso a paso</h2>
            <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.6, color: '#52606D' }}>Del primer mensaje a las llaves en tu mano.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 22, marginBottom: 64 }}>
            {PASOS.map((p) => (
              <div key={p.n} style={{ background: '#F5F6F8', borderRadius: 18, padding: '28px 26px', position: 'relative' }}>
                <div style={{ fontSize: 44, fontWeight: 800, fontStyle: 'italic', color: '#FF690F', opacity: 0.25, position: 'absolute', top: 14, right: 20 }}>
                  {p.n}
                </div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: '#FF690F',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 19,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  {p.n}
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 19, fontWeight: 800 }}>{p.t}</h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#52606D' }}>{p.d}</p>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 36,
              alignItems: 'flex-start',
              background: '#1F2933',
              borderRadius: 24,
              padding: 'clamp(28px,4vw,52px)',
            }}
          >
            <div style={{ flex: '1 1 340px', minWidth: 280 }}>
              <div style={{ color: '#FF9A5C', fontWeight: 800, fontSize: 14, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>
                Requisitos
              </div>
              <h2 style={{ margin: '0 0 12px', color: '#fff', fontSize: 'clamp(24px,3vw,34px)', fontWeight: 800, fontStyle: 'italic' }}>
                Lo único que necesitas para empezar
              </h2>
              <p style={{ margin: '0 0 24px', color: '#CBD2D9', fontSize: 16, lineHeight: 1.6 }}>
                Sin historiales complicados ni trámites eternos. Reúne estos documentos y estás del otro lado.
              </p>
              <a
                href={WA_REQUISITOS_HREF}
                target="_blank"
                rel="noreferrer"
                className="ca-btn-primary"
                style={{ display: 'inline-block', fontWeight: 800, fontSize: 16, padding: '14px 26px', borderRadius: 12, textDecoration: 'none' }}
              >
                Enviar mis requisitos por WhatsApp
              </a>
            </div>
            <ul style={{ flex: '1 1 340px', minWidth: 280, listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {REQUISITOS.map((r) => (
                <li
                  key={r.t}
                  style={{
                    display: 'flex',
                    gap: 14,
                    alignItems: 'flex-start',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 14,
                    padding: '16px 18px',
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FF690F"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flex: 'none', marginTop: 1 }}
                  >
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{r.t}</div>
                    <div style={{ color: '#9AA5B1', fontSize: 14, lineHeight: 1.5 }}>{r.d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
