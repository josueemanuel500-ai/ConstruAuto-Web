import { useState } from 'react';
import { useCatalog } from '../lib/useCatalog';
import Reveal from '../components/Reveal';
import CarIcon from '../components/icons/CarIcon';

export default function Catalogo() {

  const { cars } = useCatalog();
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [btnHoverId, setBtnHoverId] = useState<string | null>(null);

  return (
    <main data-screen-label="Catálogo" style={{ animation: 'caFadeUp 0.4s ease' }}>
      <section style={{ background: '#F5F6F8', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 56px' }}>
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
            Catálogo
          </div>
          <h1 style={{ margin: '0 0 14px', fontSize: 'clamp(32px,4.4vw,48px)', fontWeight: 800, fontStyle: 'italic', maxWidth: 760 }}>
            Autos de referencia
          </h1>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, color: '#52606D', maxWidth: 680 }}>
            Ejemplos de vehículos que puedes estrenar con nosotros. El inventario cambia constantemente — escríbenos y te decimos qué hay
            disponible hoy.
          </p>
        </div>
      </section>
      <section style={{ background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 26 }}>
            {cars.map((car, i) => (
              <Reveal key={car.id} delayMs={Math.min(i, 8) * 40}>
                <div
                  onMouseEnter={() => setHoverId(car.id)}
                  onMouseLeave={() => setHoverId(null)}
                  style={{
                    background: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: 18,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: hoverId === car.id ? '0 12px 32px rgba(31,41,51,0.10)' : 'none',
                    transform: hoverId === car.id ? 'translateY(-4px)' : 'none',
                    transition: 'box-shadow 0.25s ease, transform 0.25s ease',
                  }}
                >
                  {!car.isSlot && car.img ? (
                    <img
                      src={car.img}
                      alt={car.name}
                      loading="lazy"
                      style={{ width: '100%', height: 210, objectFit: 'cover', display: 'block', background: '#F5F6F8' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: 210,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--ca-bg-light)',
                      }}
                    >
                      <CarIcon size={48} color="#FF9A5C" />
                    </div>
                  )}
                  <div style={{ padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9AA5B1' }}>
                      {car.tipo}
                    </div>
                    <div style={{ fontSize: 21, fontWeight: 800 }}>{car.name}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#FF690F' }}>Monto aprox. {car.price}</div>
                    <a
                      href={car.waHref}
                      target="_blank"
                      rel="noreferrer"
                      onMouseEnter={() => setBtnHoverId(car.id)}
                      onMouseLeave={() => setBtnHoverId(null)}
                      style={{
                        marginTop: 14,
                        background: btnHoverId === car.id ? 'var(--ca-orange-gradient)' : '#1F2933',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: 15.5,
                        padding: 13,
                        borderRadius: 11,
                        textAlign: 'center',
                        textDecoration: 'none',
                      }}
                    >
                      Me interesa este auto
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div
            style={{
              margin: '44px auto 0',
              maxWidth: 720,
              background: '#F5F6F8',
              borderRadius: 16,
              padding: '22px 26px',
              display: 'flex',
              gap: 16,
              alignItems: 'flex-start',
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FF690F"
              strokeWidth="2.2"
              strokeLinecap="round"
              style={{ flex: 'none', marginTop: 2 }}
            >
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M12 8h.01M12 12v4"></path>
            </svg>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#52606D' }}>
              Este catálogo es de referencia y no representa inventario en vivo. Los montos son aproximados y pueden variar según el año,
              kilometraje y condiciones del vehículo.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
