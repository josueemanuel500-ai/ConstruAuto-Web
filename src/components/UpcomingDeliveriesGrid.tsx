import { useState, type ReactNode } from 'react';
import type { UpcomingDelivery } from '../lib/useUpcomingDeliveries';

interface UpcomingDeliveriesGridProps {
  upcoming: UpcomingDelivery[];
  limit?: number;
  headerAction?: ReactNode;
  bottomAction?: ReactNode;
  fallback?: ReactNode;
}

/** Cuadrícula de "Próximas entregas" reutilizada en /entregas y en la vista previa de Inicio. */
export default function UpcomingDeliveriesGrid({ upcoming, limit, headerAction, bottomAction, fallback }: UpcomingDeliveriesGridProps) {
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const items = limit ? upcoming.slice(0, limit) : upcoming;

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 36,
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 8px', fontSize: 'clamp(28px,3.6vw,40px)', fontWeight: 800, fontStyle: 'italic' }}>Próximas entregas</h2>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: '#52606D' }}>Autos programados para entrega</div>
        </div>
        {headerAction}
      </div>

      {items.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,360px))', gap: 24 }}>
          {items.map((u) => {
            const hovered = hoverKey === u.id;
            return (
              <div
                key={u.id}
                onMouseEnter={() => setHoverKey(u.id)}
                onMouseLeave={() => setHoverKey(null)}
                style={{
                  background: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: 20,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: hovered ? '0 16px 40px rgba(31,41,51,0.12)' : '0 1px 3px rgba(31,41,51,0.06)',
                  transform: hovered ? 'translateY(-4px)' : 'none',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                }}
              >
                <div style={{ padding: '16px 16px 0' }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 14, background: '#1F2933', overflow: 'hidden' }}>
                    <img
                      src={u.img}
                      alt={u.name}
                      loading="lazy"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg,rgba(31,41,51,0) 55%,rgba(31,41,51,0.55) 100%)',
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        background: 'var(--ca-orange-gradient)',
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
                </div>
                <div style={{ padding: '18px 20px 22px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
                  <div style={{ fontSize: 21, fontWeight: 800, lineHeight: 1.2 }}>{u.name}</div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      background: 'rgba(255,255,255,0.6)',
                      backdropFilter: 'blur(12px) saturate(1.4)',
                      WebkitBackdropFilter: 'blur(12px) saturate(1.4)',
                      border: '1px solid rgba(31,41,51,0.08)',
                      borderRadius: 14,
                      padding: '12px 14px',
                      boxShadow: '0 4px 14px rgba(31,41,51,0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14.5, fontWeight: 700, color: '#3E4C59' }}>
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#FF690F"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ flex: 'none' }}
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                        <path d="M16 2v4M8 2v4M3 10h18"></path>
                      </svg>
                      <span style={{ textTransform: 'capitalize' }}>{u.dateLabel}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14.5, fontWeight: 700, color: '#3E4C59' }}>
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#FF690F"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ flex: 'none' }}
                      >
                        <circle cx="12" cy="12" r="9"></circle>
                        <path d="M12 7v5l3 2"></path>
                      </svg>
                      <span>{u.timeLabel}</span>
                    </div>
                  </div>
                  {u.hasNote && <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: '#52606D' }}>{u.note}</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        fallback
      )}

      {bottomAction}
    </>
  );
}
