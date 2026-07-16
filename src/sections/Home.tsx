import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import type { SectionProps } from '../lib/types';
import { waLink } from '../lib/whatsapp';
import { useCatalog } from '../lib/useCatalog';

const WA_HREF = waLink('Hola, quiero información sobre un autofinanciamiento para un vehículo.');

const STAT_TARGETS = { entregas: 180, years: 5, montoK: 150 };

function useAnimatedStats() {
  const ref = useRef<HTMLDivElement | null>(null);
  const doneRef = useRef(false);
  const [vals, setVals] = useState({ entregas: 0, years: 0, montoK: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      doneRef.current = true;
      setVals(STAT_TARGETS);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (doneRef.current) return;
        if (!entries.some((e) => e.isIntersecting)) return;
        doneRef.current = true;
        io.disconnect();
        const t0 = performance.now();
        const dur = 1400;
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          setVals({
            entregas: Math.round(STAT_TARGETS.entregas * eased),
            years: Math.round(STAT_TARGETS.years * eased),
            montoK: Math.round(STAT_TARGETS.montoK * eased),
          });
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, vals };
}

function useHover() {
  const [hover, setHover] = useState(false);
  return { hover, onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false) };
}

function CheckIcon({ color = '#FF9A5C', size = 15 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
      <path d="M20 6L9 17l-5-5"></path>
    </svg>
  );
}

const BADGES = [
  'Más de 180 vehículos entregados',
  'Empresa formalmente establecida',
  'Atención personalizada',
  'Proceso transparente',
  'Entrega garantizada o devolución de dinero',
];

interface TimelinePaso {
  title: string;
  desc: string;
  detail: string;
}

const TIMELINE_PASOS: TimelinePaso[] = [
  {
    title: 'Solicita información',
    desc: 'Cotiza en línea o escríbenos por WhatsApp. Define el monto —de $30,000 a $150,000 MXN— y el plazo.',
    detail: 'Tip: usa la calculadora para conocer tu pago mensual estimado en menos de un minuto.',
  },
  {
    title: 'Validamos tu expediente',
    desc: 'Revisamos contigo tus requisitos y firmas tu contrato con la cuota de apertura de $6,950 MXN.',
    detail: 'Requisitos: identificación oficial, comprobante de domicilio, RFC y dos referencias.',
  },
  {
    title: 'Elige tu vehículo',
    desc: 'Seleccionamos contigo el auto usado o seminuevo ideal dentro de tu monto aprobado.',
    detail: 'Todos los vehículos se revisan y documentan antes de la entrega.',
  },
  {
    title: 'Recibe tu entrega',
    desc: 'Te entregamos las llaves y documentamos el momento. Conoce nuestras entregas en video.',
    detail: 'Cada entrega queda publicada en video en nuestra sección de entregas.',
  },
];

interface Testimonio {
  name: string;
  vehicle: string;
  quote: string;
}

const TESTIMONIOS: Testimonio[] = [
  {
    name: 'María G.',
    vehicle: 'Chevrolet Aveo',
    quote:
      'Todo fue claro desde el primer mensaje. Me explicaron el plan completo, firmé mi contrato y hoy ya tengo mi auto. El acompañamiento por WhatsApp hizo todo más fácil.',
  },
  {
    name: 'Jorge P.',
    vehicle: 'Volkswagen Jetta',
    quote:
      'Pensé que sin historial de crédito no calificaría. Los requisitos fueron sencillos y en la entrega grabaron todo en video. Muy recomendable.',
  },
  {
    name: 'Ana L.',
    vehicle: 'Mazda 3',
    quote:
      'Lo que más me dio confianza fue visitar su oficina y ver las entregas publicadas. El pago mensual quedó dentro de mi presupuesto, tal como lo cotizamos.',
  },
];

const trustCards: { icon: ReactElement; title: string; desc: ReactNode }[] = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF690F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18"></path>
        <path d="M5 21V7l7-4 7 4v14"></path>
        <path d="M9 21v-4h6v4"></path>
      </svg>
    ),
    title: 'Empresa formal',
    desc: 'Empresa constituida en Mérida, Yucatán, con domicilio físico que puedes visitar: Cto. Colonias 297, San Miguel.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF690F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    ),
    title: 'Proceso seguro',
    desc: 'Cada etapa queda por escrito: cotización, requisitos y contrato. No se realizan pagos fuera de lo pactado.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF690F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8"></path>
        <path d="M21 3v5h-5"></path>
        <path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16"></path>
        <path d="M3 21v-5h5"></path>
      </svg>
    ),
    title: 'Entrega garantizada o devolución',
    desc: 'Si tu vehículo no se entrega conforme a lo establecido en tu contrato, se devuelve tu dinero según lo pactado.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF690F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
        <path d="M14 2v6h6"></path>
        <path d="M9 15l2 2 4-4"></path>
      </svg>
    ),
    title: 'Contrato verificado',
    desc: 'Revisas y firmas tu contrato con tu asesor antes de cualquier pago, y conservas tu copia desde el primer día.',
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
    title: 'Atención personalizada',
    desc: 'Un asesor te acompaña de principio a fin, por WhatsApp, teléfono o directamente en nuestra oficina.',
  },
];

export default function Home({ onNavigate }: SectionProps) {
  const [activeStep, setActiveStep] = useState(0);
  const { ref: statsRef, vals: stats } = useAnimatedStats();
  const { cars } = useCatalog();
  const homeCars = cars.slice(0, 3);

  const heroCta = useHover();
  const heroWa = useHover();
  const midCta = useHover();
  const midContacto = useHover();
  const midWa = useHover();
  const finalCta = useHover();
  const finalWa = useHover();

  const badgePill: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13.5,
    fontWeight: 700,
    color: '#E4E7EB',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.16)',
    borderRadius: 999,
    padding: '8px 15px',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  };

  return (
    <main data-screen-label="Inicio" style={{ animation: 'caFadeUp 0.4s ease' }}>
      {/* HERO */}
      <section
        style={{
          position: 'relative',
          marginTop: -72,
          minHeight: 'clamp(600px, 92vh, 860px)',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          background: '#12171C',
          color: '#fff',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/assets/hero-frames/ezgif-frame-001.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(100deg, rgba(15,20,25,0.96) 0%, rgba(15,20,25,0.82) 40%, rgba(15,20,25,0.42) 70%, rgba(15,20,25,0.14) 100%), linear-gradient(to top, rgba(15,20,25,0.9) 0%, rgba(15,20,25,0) 48%)',
          }}
        />
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 1200,
            margin: '0 auto',
            padding: '128px 24px 64px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 56,
            alignItems: 'center',
          }}
        >
          <div style={{ flex: '1 1 480px', minWidth: 300 }}>
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
                marginBottom: 22,
              }}
            >
              Autofinanciamiento · Mérida, Yucatán
            </div>
            <h1 style={{ margin: '0 0 20px', fontSize: 'clamp(46px,7.5vw,92px)', lineHeight: 0.98, fontWeight: 800, fontStyle: 'italic', letterSpacing: '-0.02em' }}>
              Estrena <span style={{ color: '#FF690F' }}>sin enganche</span>
            </h1>
            <p style={{ margin: '0 0 34px', fontSize: 'clamp(17px,2.2vw,20px)', lineHeight: 1.55, color: '#E4E7EB', maxWidth: 500 }}>
              Autos usados y seminuevos en Mérida desde <strong style={{ color: '#fff' }}>$30,000</strong> hasta <strong style={{ color: '#fff' }}>$150,000 MXN</strong>, con plazos de 12 a
              60 meses.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              <a
                onClick={() => onNavigate('calculadora')}
                onMouseEnter={heroCta.onMouseEnter}
                onMouseLeave={heroCta.onMouseLeave}
                style={{
                  cursor: 'pointer',
                  background: heroCta.hover ? '#E55A05' : '#FF690F',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 17,
                  padding: '16px 30px',
                  borderRadius: 12,
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  boxShadow: '0 10px 28px rgba(255,105,15,0.35)',
                  transform: heroCta.hover ? 'translateY(-2px)' : 'none',
                }}
              >
                Cotiza tu auto
              </a>
              <a
                href={WA_HREF}
                target="_blank"
                rel="noreferrer"
                onMouseEnter={heroWa.onMouseEnter}
                onMouseLeave={heroWa.onMouseLeave}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: heroWa.hover ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)',
                  border: '1.5px solid rgba(255,255,255,0.35)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 17,
                  padding: '16px 26px',
                  borderRadius: 12,
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Hablar por WhatsApp
              </a>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 30, maxWidth: 560 }}>
              {BADGES.map((b) => (
                <div key={b} style={badgePill}>
                  <CheckIcon />
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#fff', borderBottom: '1px solid #F3F4F6' }}>
        <div
          ref={statsRef}
          style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 28 }}
        >
          <div style={{ textAlign: 'center', padding: '8px 12px', borderRight: '1px solid #F3F4F6' }}>
            <div style={{ fontSize: 'clamp(38px,4.4vw,52px)', fontWeight: 800, fontStyle: 'italic', color: '#FF690F', lineHeight: 1 }}>{stats.entregas}+</div>
            <div style={{ marginTop: 8, fontSize: 15, fontWeight: 600, color: '#52606D' }}>Vehículos entregados</div>
          </div>
          <div style={{ textAlign: 'center', padding: '8px 12px', borderRight: '1px solid #F3F4F6' }}>
            <div style={{ fontSize: 'clamp(38px,4.4vw,52px)', fontWeight: 800, fontStyle: 'italic', color: '#1F2933', lineHeight: 1 }}>{stats.years}+</div>
            <div style={{ marginTop: 8, fontSize: 15, fontWeight: 600, color: '#52606D' }}>Años de experiencia</div>
          </div>
          <div style={{ textAlign: 'center', padding: '8px 12px', borderRight: '1px solid #F3F4F6' }}>
            <div style={{ fontSize: 'clamp(38px,4.4vw,52px)', fontWeight: 800, fontStyle: 'italic', color: '#FF690F', lineHeight: 1 }}>
              $30K–${stats.montoK}K
            </div>
            <div style={{ marginTop: 8, fontSize: 15, fontWeight: 600, color: '#52606D' }}>Monto financiable (MXN)</div>
          </div>
          <div style={{ textAlign: 'center', padding: '8px 12px' }}>
            <div style={{ fontSize: 'clamp(38px,4.4vw,52px)', fontWeight: 800, fontStyle: 'italic', color: '#1F2933', lineHeight: 1 }}>Miles</div>
            <div style={{ marginTop: 8, fontSize: 15, fontWeight: 600, color: '#52606D' }}>Clientes atendidos</div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section style={{ background: '#F5F6F8' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px' }}>
            <div style={{ color: '#FF690F', fontWeight: 800, fontSize: 14, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>
              Cómo funciona
            </div>
            <h2 style={{ margin: '0 0 14px', fontSize: 'clamp(28px,3.6vw,40px)', fontWeight: 800, fontStyle: 'italic' }}>
              Estrenar auto es más simple de lo que crees
            </h2>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: '#52606D' }}>Cuatro pasos y te acompañamos en cada uno.</p>
          </div>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                top: 54,
                left: '6%',
                right: '6%',
                height: 2,
                background: 'linear-gradient(90deg,#FFD8BC,#FF690F,#FFD8BC)',
              }}
            ></div>
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 22 }}>
              {TIMELINE_PASOS.map((paso, i) => {
                const isActive = activeStep === i;
                return (
                  <div
                    key={paso.title}
                    onClick={() => setActiveStep(i)}
                    className="ca-card-hover"
                    style={{
                      cursor: 'pointer',
                      background: '#fff',
                      border: `2px solid ${isActive ? '#FF690F' : 'transparent'}`,
                      borderRadius: 18,
                      padding: '30px 24px',
                      boxShadow: '0 1px 3px rgba(31,41,51,0.06)',
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 99,
                        background: isActive ? '#FF690F' : '#FFF0E6',
                        color: isActive ? '#fff' : '#FF690F',
                        fontWeight: 800,
                        fontSize: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 18,
                        boxShadow: '0 0 0 6px #FFF0E6',
                        transition: 'background-color 0.25s ease,color 0.25s ease',
                      }}
                    >
                      {i + 1}
                    </div>
                    <h3 style={{ margin: '0 0 8px', fontSize: 19, fontWeight: 800 }}>{paso.title}</h3>
                    <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#52606D' }}>{paso.desc}</p>
                    {isActive && (
                      <p
                        style={{
                          margin: '14px 0 0',
                          fontSize: 13.5,
                          lineHeight: 1.55,
                          color: '#E55A05',
                          fontWeight: 600,
                          borderTop: '1px dashed #FFD8BC',
                          paddingTop: 12,
                        }}
                      >
                        {paso.detail}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <a onClick={() => onNavigate('servicios')} style={{ cursor: 'pointer', color: '#FF690F', fontWeight: 800, fontSize: 16, textDecoration: 'none' }}>
              Conoce el proceso completo →
            </a>
          </div>
        </div>
      </section>

      {/* MINI CATALOGO */}
      <section style={{ background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: 16, marginBottom: 40 }}>
            <div>
              <div style={{ color: '#FF690F', fontWeight: 800, fontSize: 14, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>
                Catálogo de referencia
              </div>
              <h2 style={{ margin: 0, fontSize: 'clamp(28px,3.6vw,40px)', fontWeight: 800, fontStyle: 'italic' }}>Autos como estos puedes estrenar</h2>
            </div>
            <a onClick={() => onNavigate('catalogo')} style={{ cursor: 'pointer', color: '#FF690F', fontWeight: 800, fontSize: 16, textDecoration: 'none' }}>
              Ver catálogo completo →
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
            {homeCars.map((car) => (
              <div
                key={car.id}
                className="ca-card-elevate"
                style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              >
                {car.isSlot ? (
                  <div
                    style={{
                      width: '100%',
                      height: 190,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--ca-bg-light)',
                      fontSize: 40,
                    }}
                    aria-label="Arrastra la foto del auto"
                  >
                    🚗
                  </div>
                ) : (
                  <img src={car.img} alt={car.name} style={{ width: '100%', height: 190, objectFit: 'cover', display: 'block', background: '#F5F6F8' }} />
                )}
                <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9AA5B1' }}>{car.tipo}</div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{car.name}</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#FF690F', marginTop: 2 }}>Monto aprox. {car.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MID CTA */}
      <section style={{ background: '#1F2933', backgroundImage: 'radial-gradient(600px 300px at 15% 120%, rgba(255,105,15,0.22), transparent 60%)' }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '44px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          <div style={{ color: '#fff', fontSize: 20, fontWeight: 800, fontStyle: 'italic' }}>¿Listo para dar el primer paso?</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <a
              onClick={() => onNavigate('calculadora')}
              onMouseEnter={midCta.onMouseEnter}
              onMouseLeave={midCta.onMouseLeave}
              style={{
                cursor: 'pointer',
                background: midCta.hover ? '#E55A05' : '#FF690F',
                color: '#fff',
                fontWeight: 800,
                fontSize: 15,
                padding: '13px 24px',
                borderRadius: 11,
                textDecoration: 'none',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                transform: midCta.hover ? 'translateY(-2px)' : 'none',
              }}
            >
              Cotiza tu auto
            </a>
            <a
              onClick={() => onNavigate('contacto')}
              onMouseEnter={midContacto.onMouseEnter}
              onMouseLeave={midContacto.onMouseLeave}
              style={{
                cursor: 'pointer',
                background: midContacto.hover ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.1)',
                border: '1.5px solid rgba(255,255,255,0.3)',
                color: '#fff',
                fontWeight: 800,
                fontSize: 15,
                padding: '13px 24px',
                borderRadius: 11,
                textDecoration: 'none',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
              }}
            >
              Solicita información
            </a>
            <a
              href={WA_HREF}
              target="_blank"
              rel="noreferrer"
              onMouseEnter={midWa.onMouseEnter}
              onMouseLeave={midWa.onMouseLeave}
              style={{
                background: midWa.hover ? '#1FB859' : '#25D366',
                color: '#fff',
                fontWeight: 800,
                fontSize: 15,
                padding: '13px 24px',
                borderRadius: 11,
                textDecoration: 'none',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                transform: midWa.hover ? 'translateY(-2px)' : 'none',
              }}
            >
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* POR QUE CONFIAR */}
      <section style={{ background: '#F5F6F8', borderTop: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 48px' }}>
            <div style={{ color: '#FF690F', fontWeight: 800, fontSize: 14, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>
              Por qué confiar en nosotros
            </div>
            <h2 style={{ margin: '0 0 14px', fontSize: 'clamp(28px,3.6vw,40px)', fontWeight: 800, fontStyle: 'italic' }}>Confianza que se comprueba</h2>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: '#52606D' }}>
              Somos una empresa formal en Mérida, Yucatán. Así protegemos tu dinero y tu trámite.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 22 }}>
            {trustCards.map((card) => (
              <div
                key={card.title}
                className="ca-card-hover"
                style={{ background: '#fff', borderRadius: 18, padding: '28px 26px', boxShadow: '0 1px 3px rgba(31,41,51,0.06)' }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: '#FFF0E6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  {card.icon}
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 19, fontWeight: 800 }}>{card.title}</h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#52606D' }}>{card.desc}</p>
              </div>
            ))}
            <div className="ca-card-hover" style={{ background: '#fff', borderRadius: 18, padding: '28px 26px', boxShadow: '0 1px 3px rgba(31,41,51,0.06)' }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  background: '#FFF0E6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF690F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 7l-7 5 7 5V7z"></path>
                  <rect x="1" y="5" width="15" height="14" rx="2"></rect>
                </svg>
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: 19, fontWeight: 800 }}>Entregas documentadas</h3>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#52606D' }}>
                Publicamos nuestras entregas en video: clientes reales recibiendo las llaves de su auto.{' '}
                <a onClick={() => onNavigate('entregas')} style={{ cursor: 'pointer', color: '#FF690F', fontWeight: 800, textDecoration: 'none' }}>
                  Ver entregas →
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section style={{ background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px' }}>
            <div style={{ color: '#FF690F', fontWeight: 800, fontSize: 14, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>
              Testimonios
            </div>
            <h2 style={{ margin: '0 0 14px', fontSize: 'clamp(28px,3.6vw,40px)', fontWeight: 800, fontStyle: 'italic' }}>Lo que dicen nuestros clientes</h2>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: '#52606D' }}>Historias de quienes ya estrenaron con nosotros.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24 }}>
            {TESTIMONIOS.map((t) => (
              <figure
                key={t.name}
                className="ca-card-hover"
                style={{
                  margin: 0,
                  background: '#F5F6F8',
                  border: '1px solid #EDEFF2',
                  borderRadius: 20,
                  padding: '30px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                }}
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="#FF690F" opacity="0.35">
                  <path d="M10 7L8 11h3v6H5v-6l2-4h3zm9 0l-2 4h3v6h-6v-6l2-4h3z"></path>
                </svg>
                <blockquote style={{ margin: 0, fontSize: 16, lineHeight: 1.65, color: '#3E4C59', flex: 1 }}>{t.quote}</blockquote>
                <figcaption style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      flex: 'none',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: 'var(--ca-bg-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      color: '#FF690F',
                      fontSize: 18,
                    }}
                    aria-label="Foto de cliente"
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15.5, color: '#1F2933' }}>{t.name}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#FF690F' }}>{t.vehicle}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: '#1F2933', backgroundImage: 'radial-gradient(900px 500px at 50% 130%, rgba(255,105,15,0.35), transparent 65%)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 16px', color: '#fff', fontSize: 'clamp(28px,4.2vw,46px)', fontWeight: 800, fontStyle: 'italic', lineHeight: 1.15 }}>
            Tu próximo auto puede estar más cerca de lo que imaginas.
          </h2>
          <p style={{ margin: '0 0 36px', color: '#CBD2D9', fontSize: 18, lineHeight: 1.55 }}>
            Calcula tu pago mensual en menos de un minuto o escríbenos directo por WhatsApp.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
            <a
              onClick={() => onNavigate('calculadora')}
              onMouseEnter={finalCta.onMouseEnter}
              onMouseLeave={finalCta.onMouseLeave}
              style={{
                cursor: 'pointer',
                background: finalCta.hover ? '#E55A05' : '#FF690F',
                color: '#fff',
                fontWeight: 800,
                fontSize: 18,
                padding: '18px 40px',
                borderRadius: 12,
                textDecoration: 'none',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                boxShadow: '0 12px 32px rgba(255,105,15,0.4)',
                transform: finalCta.hover ? 'translateY(-2px)' : 'none',
              }}
            >
              Cotiza ahora
            </a>
            <a
              href={WA_HREF}
              target="_blank"
              rel="noreferrer"
              onMouseEnter={finalWa.onMouseEnter}
              onMouseLeave={finalWa.onMouseLeave}
              style={{
                background: finalWa.hover ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)',
                border: '1.5px solid rgba(255,255,255,0.35)',
                color: '#fff',
                fontWeight: 800,
                fontSize: 18,
                padding: '18px 34px',
                borderRadius: 12,
                textDecoration: 'none',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
              }}
            >
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
