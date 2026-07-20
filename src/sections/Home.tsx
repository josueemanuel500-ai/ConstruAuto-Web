import { useEffect, useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { waLink } from '../lib/whatsapp';
import { useCatalog } from '../lib/useCatalog';
import { useUpcomingDeliveries } from '../lib/useUpcomingDeliveries';
import Reveal from '../components/Reveal';
import CarIcon from '../components/icons/CarIcon';

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

export default function Home() {
  const [activeStep, setActiveStep] = useState(0);
  const { ref: statsRef, vals: stats } = useAnimatedStats();
  const { cars } = useCatalog();
  const homeCars = cars.slice(0, 3);
  const { upcoming, configured } = useUpcomingDeliveries();
  const previewDeliveries = upcoming.slice(0, 3);
  const verTodasCta = useHover();

  const heroCta = useHover();
  const heroWa = useHover();
  const midCta = useHover();
  const midContacto = useHover();
  const midWa = useHover();
  const finalCta = useHover();
  const finalWa = useHover();

  return (
    <main data-screen-label="Inicio" style={{ animation: 'caFadeUp 0.4s ease' }}>
      {/* HERO */}
      <style>{`
        .ca-hero2 { position: relative; margin-top: -72px; min-height: 100vh; overflow: hidden; background: #0D1217; color: #fff;
          display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 152px 24px 56px; }
        .ca-hero2-bgtext { position: absolute; inset: 0; z-index: 1; display: flex; align-items: center; justify-content: center;
          text-align: center; padding: 0 4vw; pointer-events: none; user-select: none; }
        .ca-hero2-stat { position: absolute; top: 152px; left: 24px; max-width: 300px; z-index: 3;
          background: rgba(13,18,23,0.55); backdrop-filter: blur(16px) saturate(1.4); -webkit-backdrop-filter: blur(16px) saturate(1.4);
          border: 1px solid rgba(255,255,255,0.12); border-radius: 18px; padding: 18px 20px; }
        .ca-hero2-canvas { position: relative; z-index: 2; height: min(760px, 80vh); aspect-ratio: 3 / 4; }
        .ca-hero2-copy { position: absolute; left: 24px; bottom: 40px; max-width: 480px; z-index: 3;
          background: rgba(13,18,23,0.55); backdrop-filter: blur(16px) saturate(1.4); -webkit-backdrop-filter: blur(16px) saturate(1.4);
          border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; padding: 22px 24px; }
        .ca-hero2-detail { position: absolute; right: 24px; bottom: 40px; width: 208px; z-index: 3; }
        @media (max-width: 900px) {
          .ca-hero2 { padding: 116px 20px 40px; }
          .ca-hero2-bgtext { position: static; margin-bottom: 24px; }
          .ca-hero2-stat { position: static; max-width: none; margin-bottom: 20px; }
          .ca-hero2-canvas { width: min(90vw, 420px); height: auto; margin-bottom: 20px; }
          .ca-hero2-copy { position: static; max-width: none; margin-bottom: 0; }
          .ca-hero2-detail { display: none; }
        }
      `}</style>
      <section className="ca-hero2">
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(120% 90% at 50% 0%, rgba(255,105,15,0.14), transparent 55%)',
          }}
        />

        <div className="ca-hero2-bgtext">
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(32px,6.4vw,80px)',
              lineHeight: 0.98,
              fontWeight: 800,
              fontStyle: 'italic',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            Estrena sin
            <br />
            enganche<span style={{ color: '#FF690F' }}>,</span> es solo
            <br />
            el comienzo
          </h1>
        </div>

        <div className="ca-hero2-stat">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF690F" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5"></path>
              <path d="M6 11l6-6 6 6"></path>
            </svg>
            <span style={{ fontSize: 'clamp(30px,4vw,44px)', fontWeight: 800, fontStyle: 'italic', lineHeight: 1 }}>{STAT_TARGETS.entregas}+</span>
            <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#CBD2D9', maxWidth: 110, lineHeight: 1.3 }}>
              Vehículos entregados
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: '#9AA5B1' }}>
            Familias que ya estrenaron su auto con nuestro autofinanciamiento en Mérida, Yucatán.
          </p>
        </div>

        <div className="ca-hero2-canvas" style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.45)' }}>
          <img
            src="/assets/hero-canvas-prueba.jpg"
            alt="ConstruAuto de México — la oportunidad está en tus manos"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>

        <div className="ca-hero2-copy">
          <h2
            style={{
              margin: '0 0 18px',
              fontSize: 'clamp(20px,2.6vw,28px)',
              fontWeight: 800,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              lineHeight: 1.2,
            }}
          >
            Autofinanciamiento claro para tu próximo auto
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Link
              to="/calculadora"
              onMouseEnter={heroCta.onMouseEnter}
              onMouseLeave={heroCta.onMouseLeave}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                background: heroCta.hover ? '#E55A05' : '#FF690F',
                color: '#fff',
                fontWeight: 800,
                fontSize: 15.5,
                padding: '14px 26px',
                borderRadius: 999,
                textDecoration: 'none',
                boxShadow: '0 10px 28px rgba(255,105,15,0.35)',
                transform: heroCta.hover ? 'translateY(-2px)' : 'none',
              }}
            >
              Cotiza tu auto
            </Link>
            <Link
              to="/juego"
              onMouseEnter={heroWa.onMouseEnter}
              onMouseLeave={heroWa.onMouseLeave}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                background: heroWa.hover ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)',
                border: '1.5px solid rgba(255,255,255,0.4)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 15.5,
                padding: '14px 24px',
                borderRadius: 999,
                textDecoration: 'none',
              }}
            >
              Ver promociones
            </Link>
          </div>
          <a
            href={WA_HREF}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'block', marginTop: 18, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
          >
            Atención al instante por WhatsApp · 999 356 4692
          </a>
        </div>

        <Link to="/entregas" className="ca-hero2-detail" style={{ textDecoration: 'none', color: '#fff' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
              fontSize: 13.5,
              fontWeight: 700,
            }}
          >
            Entregas reales
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7"></path>
              <path d="M9 7h8v8"></path>
            </svg>
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 16,
              padding: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              aspectRatio: '4/3',
            }}
          >
            <CarIcon size={30} color="#9AA5B1" />
          </div>
        </Link>
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
            <Link to="/servicios" style={{ color: '#FF690F', fontWeight: 800, fontSize: 16, textDecoration: 'none' }}>
              Conoce el proceso completo →
            </Link>
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
            <Link to="/catalogo" style={{ color: '#FF690F', fontWeight: 800, fontSize: 16, textDecoration: 'none' }}>
              Ver catálogo completo →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
            {homeCars.map((car, i) => (
              <Reveal key={car.id} delayMs={Math.min(i, 8) * 40}>
                <div
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
                      }}
                      aria-label="Arrastra la foto del auto"
                    >
                      <CarIcon size={40} color="#FF9A5C" />
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
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* VISTA PREVIA ENTREGAS */}
      <section style={{ background: '#F5F6F8', borderTop: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: 16, marginBottom: 40 }}>
            <div>
              <div style={{ color: '#FF690F', fontWeight: 800, fontSize: 14, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>
                Entregas
              </div>
              <h2 style={{ margin: 0, fontSize: 'clamp(28px,3.6vw,40px)', fontWeight: 800, fontStyle: 'italic' }}>Clientes reales, autos entregados</h2>
            </div>
            <Link to="/entregas" style={{ color: '#FF690F', fontWeight: 800, fontSize: 16, textDecoration: 'none' }}>
              Ver todas las entregas →
            </Link>
          </div>

          {configured && previewDeliveries.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24, marginBottom: 40 }}>
              {previewDeliveries.map((u) => (
                <div
                  key={u.id}
                  style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#1F2933', overflow: 'hidden' }}>
                    <img
                      src={u.img}
                      alt={u.name}
                      loading="lazy"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: 14,
                        left: 14,
                        background: '#FF690F',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: 12.5,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        padding: '7px 14px',
                        borderRadius: 999,
                        boxShadow: '0 6px 18px rgba(255,105,15,0.4)',
                      }}
                    >
                      {u.countdown}
                    </span>
                  </div>
                  <div style={{ padding: '18px 20px 20px' }}>
                    <div style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.2 }}>{u.name}</div>
                    <div style={{ marginTop: 6, fontSize: 14, fontWeight: 600, color: '#52606D', textTransform: 'capitalize' }}>{u.dateLabel}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: '0 0 40px', fontSize: 17, lineHeight: 1.6, color: '#52606D', maxWidth: 680 }}>
              Cada entrega es una historia. Mira en video cómo nuestros clientes reciben las llaves de su auto.
            </p>
          )}

          <div style={{ textAlign: 'center' }}>
            <Link
              to="/entregas"
              onMouseEnter={verTodasCta.onMouseEnter}
              onMouseLeave={verTodasCta.onMouseLeave}
              style={{
                display: 'inline-block',
                cursor: 'pointer',
                background: verTodasCta.hover ? '#E55A05' : '#FF690F',
                color: '#fff',
                fontWeight: 800,
                fontSize: 16,
                padding: '16px 34px',
                borderRadius: 12,
                textDecoration: 'none',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                boxShadow: '0 10px 28px rgba(255,105,15,0.35)',
                transform: verTodasCta.hover ? 'translateY(-2px)' : 'none',
              }}
            >
              Ver todas las entregas
            </Link>
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
            <Link
              to="/calculadora"
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
            </Link>
            <Link
              to="/contacto"
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
            </Link>
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
                <Link to="/entregas" style={{ color: '#FF690F', fontWeight: 800, textDecoration: 'none' }}>
                  Ver entregas →
                </Link>
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
            <Link
              to="/calculadora"
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
            </Link>
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
