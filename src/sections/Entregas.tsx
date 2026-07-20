import { useEffect, useRef, useState } from 'react';
import { useUpcomingDeliveries } from '../lib/useUpcomingDeliveries';
import { useYoutubePlaylist } from '../lib/useYoutubePlaylist';
import { waLink } from '../lib/whatsapp';
import { loadYouTubeApi, type YTPlayerInstance } from '../lib/youtubeApi';

const waHref = waLink('Hola, quiero información sobre un autofinanciamiento para un vehículo.');

export default function Entregas() {

  const { upcoming, configured } = useUpcomingDeliveries();
  const { videos, hasMore, loading, error, current, setCurrent, playing, setPlaying, loadMore } = useYoutubePlaylist();

  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const upShow = configured && upcoming.length > 0;
  const curVideo = videos.find((v) => v.id === current) || null;
  const playerPlaying = playing && !!current;
  const playerIdle = !playerPlaying;
  const playerTitle = curVideo?.title ?? '';
  const playerThumb = curVideo?.thumb ?? '';
  const playerDate = curVideo?.date ?? '';
  const ytHasVideos = videos.length > 0;
  const ytEmpty = !loading && !error && videos.length === 0;
  const loadMoreLabel = loading ? 'Cargando…' : 'Cargar más videos';

  // Reproducción en cola: al terminar un video, empieza el siguiente de la lista.
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);
  const videosRef = useRef(videos);
  const currentRef = useRef(current);
  videosRef.current = videos;
  currentRef.current = current;

  const playNextRef = useRef(() => {
    const list = videosRef.current;
    const idx = list.findIndex((v) => v.id === currentRef.current);
    const next = idx !== -1 ? list[idx + 1] : undefined;
    if (next) {
      setCurrent(next.id);
      setPlaying(true);
    } else {
      setPlaying(false);
    }
  });

  useEffect(() => {
    if (!playerPlaying) return;
    let cancelled = false;
    loadYouTubeApi().then((YT) => {
      if (cancelled || !playerContainerRef.current) return;
      ytPlayerRef.current = new YT.Player(playerContainerRef.current, {
        videoId: currentRef.current ?? undefined,
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
        events: {
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.ENDED) playNextRef.current();
          },
        },
      });
    });
    return () => {
      cancelled = true;
      ytPlayerRef.current?.destroy();
      ytPlayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerPlaying]);

  useEffect(() => {
    if (playerPlaying && current) ytPlayerRef.current?.loadVideoById(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  return (
    <main data-screen-label="Entregas" style={{ animation: 'caFadeUp 0.4s ease' }}>
      <style>{'.ca-yt-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block}'}</style>
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
            Entregas
          </div>
          <h1 style={{ margin: '0 0 14px', fontSize: 'clamp(32px,4.4vw,48px)', fontWeight: 800, fontStyle: 'italic', maxWidth: 760 }}>
            Clientes reales, autos entregados
          </h1>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, color: '#52606D', maxWidth: 680 }}>
            Cada entrega es una historia. Mira en video cómo nuestros clientes reciben las llaves de su auto.
          </p>
        </div>
      </section>

      {upShow && (
        <section style={{ background: '#fff', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>
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
                  Próximas entregas
                </div>
                <h2 style={{ margin: 0, fontSize: 'clamp(26px,3.4vw,38px)', fontWeight: 800, fontStyle: 'italic' }}>
                  Autos programados para entrega
                </h2>
              </div>
              <a href={waHref} target="_blank" rel="noreferrer" className="ca-link-orange" style={{ fontWeight: 800, fontSize: 16 }}>
                Quiero el mío →
              </a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24 }}>
              {upcoming.map((u) => {
                const hovered = hoverKey === 'up-' + u.id;
                return (
                  <div
                    key={u.id}
                    onMouseEnter={() => setHoverKey('up-' + u.id)}
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
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#1F2933', overflow: 'hidden' }}>
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
                          top: 14,
                          left: 14,
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
                    <div style={{ padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                      <div style={{ fontSize: 21, fontWeight: 800, lineHeight: 1.2 }}>{u.name}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 700, color: '#3E4C59' }}>
                          <svg
                            width="18"
                            height="18"
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 700, color: '#3E4C59' }}>
                          <svg
                            width="18"
                            height="18"
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
                      {u.hasNote && <p style={{ margin: '2px 0 0', fontSize: 14.5, lineHeight: 1.6, color: '#52606D' }}>{u.note}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section
        style={{
          background: '#F5F6F8',
          backgroundImage:
            'radial-gradient(900px 480px at 82% -8%, rgba(255,105,15,0.12), transparent 60%),radial-gradient(600px 400px at -5% 100%, rgba(255,105,15,0.06), transparent 60%)',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '56px 24px 72px' }}>
          {ytHasVideos && (
            <>
              <div
                style={{
                  background: 'rgba(255,255,255,0.62)',
                  backdropFilter: 'blur(22px) saturate(1.3)',
                  WebkitBackdropFilter: 'blur(22px) saturate(1.3)',
                  border: '1px solid rgba(255,255,255,0.95)',
                  borderRadius: 28,
                  boxShadow: '0 28px 72px rgba(31,41,51,0.13)',
                  padding: 'clamp(14px,2.2vw,24px)',
                  marginBottom: 40,
                }}
              >
                {playerPlaying && (
                  <div
                    className="ca-yt-frame"
                    style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 18, overflow: 'hidden', background: '#1F2933' }}
                  >
                    <div ref={playerContainerRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                  </div>
                )}
                {playerIdle && (
                  <div
                    onClick={() => setPlaying(true)}
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '16/9',
                      borderRadius: 18,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: '#1F2933',
                    }}
                  >
                    <img
                      src={playerThumb}
                      alt={playerTitle}
                      loading="lazy"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(31,41,51,0) 40%, rgba(31,41,51,0.55) 100%)',
                      }}
                    />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ position: 'relative', width: 88, height: 88, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span
                          aria-hidden="true"
                          style={{
                            position: 'absolute',
                            inset: -16,
                            borderRadius: 99,
                            background: 'radial-gradient(circle, rgba(255,105,15,0.6), transparent 70%)',
                            filter: 'blur(16px)',
                            animation: 'caGlow 2.6s ease-in-out infinite',
                            pointerEvents: 'none',
                          }}
                        />
                        <span
                          onMouseEnter={() => setHoverKey('play-btn')}
                          onMouseLeave={() => setHoverKey(null)}
                          style={{
                            position: 'relative',
                            width: 88,
                            height: 88,
                            borderRadius: 99,
                            background: 'rgba(255,105,15,0.4)',
                            backdropFilter: 'blur(10px) saturate(1.6)',
                            WebkitBackdropFilter: 'blur(10px) saturate(1.6)',
                            border: '1.5px solid rgba(255,255,255,0.5)',
                            boxShadow: '0 16px 48px rgba(255,105,15,0.45)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.25s ease',
                            transform: hoverKey === 'play-btn' ? 'scale(1.08)' : 'none',
                          }}
                        >
                          <svg width="34" height="34" viewBox="0 0 24 24" fill="#fff" style={{ marginLeft: 4 }}>
                            <path d="M8 5v14l11-7z"></path>
                          </svg>
                        </span>
                      </span>
                    </div>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px 20px',
                    padding: '18px 8px 6px',
                  }}
                >
                  <div style={{ minWidth: 240, flex: 1 }}>
                    <div style={{ fontSize: 'clamp(18px,2.2vw,23px)', fontWeight: 800, lineHeight: 1.25, color: '#1F2933' }}>{playerTitle}</div>
                    <div style={{ fontSize: 14, color: '#9AA5B1', fontWeight: 600, marginTop: 3 }}>{playerDate}</div>
                  </div>
                  {playerPlaying && (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: '#FFF0E6',
                        color: '#FF690F',
                        fontWeight: 800,
                        fontSize: 13.5,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        padding: '8px 16px',
                        borderRadius: 999,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 99,
                          background: 'var(--ca-orange-gradient)',
                          animation: 'caPulse 2s ease-out infinite',
                        }}
                      />
                      Reproduciendo
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 28 }}>
                {videos.map((v) => {
                  const active = v.id === current;
                  const hovered = hoverKey === 'v-' + v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => {
                        setCurrent(v.id);
                        setPlaying(true);
                      }}
                      onMouseEnter={() => setHoverKey('v-' + v.id)}
                      onMouseLeave={() => setHoverKey(null)}
                      style={{
                        background: 'rgba(255,255,255,0.82)',
                        backdropFilter: 'blur(14px)',
                        WebkitBackdropFilter: 'blur(14px)',
                        borderRadius: 20,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                        border: `1.5px solid ${active ? '#FF690F' : 'transparent'}`,
                        transform: hovered ? 'translateY(-5px)' : 'none',
                        boxShadow: hovered ? '0 20px 44px rgba(31,41,51,0.15)' : 'none',
                      }}
                    >
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#E5E7EB', overflow: 'hidden' }}>
                        <img
                          src={v.thumb}
                          alt={v.title}
                          loading="lazy"
                          style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            transition: 'transform 0.35s ease',
                            transform: hovered ? 'scale(1.05)' : 'none',
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(31,41,51,0.10)',
                          }}
                        >
                          <span style={{ position: 'relative', width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span
                              aria-hidden="true"
                              style={{
                                position: 'absolute',
                                inset: -10,
                                borderRadius: 99,
                                background: 'radial-gradient(circle, rgba(255,105,15,0.6), transparent 70%)',
                                filter: 'blur(10px)',
                                animation: 'caGlow 2.6s ease-in-out infinite',
                                pointerEvents: 'none',
                              }}
                            />
                            <span
                              style={{
                                position: 'relative',
                                width: 50,
                                height: 50,
                                borderRadius: 99,
                                background: 'rgba(255,105,15,0.42)',
                                backdropFilter: 'blur(8px) saturate(1.6)',
                                WebkitBackdropFilter: 'blur(8px) saturate(1.6)',
                                border: '1.5px solid rgba(255,255,255,0.5)',
                                boxShadow: '0 8px 24px rgba(255,105,15,0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <svg width="19" height="19" viewBox="0 0 24 24" fill="#fff" style={{ marginLeft: 2 }}>
                                <path d="M8 5v14l11-7z"></path>
                              </svg>
                            </span>
                          </span>
                        </div>
                        {active && (
                          <span
                            style={{
                              position: 'absolute',
                              top: 12,
                              left: 12,
                              background: 'var(--ca-orange-gradient)',
                              color: '#fff',
                              fontWeight: 800,
                              fontSize: 11.5,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              padding: '6px 12px',
                              borderRadius: 999,
                            }}
                          >
                            Reproduciendo
                          </span>
                        )}
                      </div>
                      <div style={{ padding: '16px 18px 18px' }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 15.5,
                            lineHeight: 1.4,
                            color: '#1F2933',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {v.title}
                        </div>
                        <div style={{ color: '#9AA5B1', fontSize: 13.5, fontWeight: 600, marginTop: 6 }}>{v.date}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: 40 }}>
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    onMouseEnter={() => setHoverKey('load-more')}
                    onMouseLeave={() => setHoverKey(null)}
                    style={{
                      background: hoverKey === 'load-more' ? 'var(--ca-orange-gradient)' : 'rgba(255,255,255,0.8)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1.5px solid #FF690F',
                      color: hoverKey === 'load-more' ? '#fff' : '#FF690F',
                      fontWeight: 800,
                      fontSize: 16,
                      padding: '15px 36px',
                      borderRadius: 999,
                      cursor: loading ? 'default' : 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {loadMoreLabel}
                  </button>
                </div>
              )}
            </>
          )}

          {!!error && (
            <div
              style={{
                margin: '24px auto 0',
                maxWidth: 640,
                background: '#fff',
                border: '1.5px solid #FECACA',
                borderRadius: 16,
                padding: '18px 24px',
                textAlign: 'center',
                fontSize: 15,
                color: '#DC2626',
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          {ytEmpty && (
            <div
              style={{
                background: 'rgba(255,255,255,0.62)',
                backdropFilter: 'blur(22px)',
                WebkitBackdropFilter: 'blur(22px)',
                border: '1px solid rgba(255,255,255,0.95)',
                borderRadius: 28,
                boxShadow: '0 28px 72px rgba(31,41,51,0.13)',
                padding: 'clamp(36px,5vw,64px)',
                textAlign: 'center',
                maxWidth: 720,
                margin: '0 auto',
              }}
            >
              <div
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 99,
                  background: 'rgba(255,105,15,0.95)',
                  boxShadow: '0 16px 48px rgba(255,105,15,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff" style={{ marginLeft: 4 }}>
                  <path d="M8 5v14l11-7z"></path>
                </svg>
              </div>
              <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, fontStyle: 'italic', color: '#1F2933' }}>
                Conecta el canal de YouTube
              </h2>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.65, color: '#52606D', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
                Agrega tu clave de API de YouTube y el ID de la playlist de entregas en los ajustes del sitio, y los videos aparecerán aquí
                automáticamente.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
