import { useCallback, useEffect, useRef, useState } from 'react';
import './RouletteWheel3D.css';

interface RouletteWheel3DProps {
  whatsappNumber: string;
  embed?: boolean;
}

interface Prize {
  l1: string;
  l2: string;
  full: string;
  w: number;
  key: 'orange' | 'dark' | 'gold';
}

interface SliceData {
  path: string;
  tx: number;
  ty: number;
  ty1: number;
  ty2: number;
  rot: number;
  l1: string;
  l2: string;
  fill: string;
  tc: string;
}

interface BulbData {
  x: number;
  y: number;
}

interface ConfettiPiece {
  left: string;
  color: string;
  delay: string;
  dur: string;
  rot: string;
}

interface DragState {
  last: number;
  lastT: number;
  vel: number;
  lastSlice: number;
}

const PRIZES: Prize[] = [
  { l1: '1 MES', l2: 'BONIFICADO', full: '1 mensualidad bonificada', w: 60, key: 'orange' },
  { l1: '50% OFF', l2: 'INTERÉS', full: '50% de descuento en el interés de 2 mensualidades', w: 27, key: 'dark' },
  { l1: '3 MESES', l2: 'BONIFICADAS', full: '3 mensualidades bonificadas', w: 10, key: 'orange' },
  { l1: '1 AÑO', l2: 'SEGURO', full: '1 año de seguro gratis', w: 3, key: 'gold' },
];

const LAYOUT = [0, 1, 2, 0, 3, 1, 0, 2];

const LEGEND = [
  { full: '1 mensualidad bonificada', dot: '#FF690F' },
  { full: '50% desc. en interés', dot: '#1F2933' },
  { full: '3 mensualidades bonificadas', dot: '#FF690F' },
  { full: '1 año de seguro gratis', dot: '#FFD34D' },
];

const CONFETTI_COLORS = ['#FF690F', '#FFD34D', '#1F2933', '#FF9A5C', '#25D366'];
const EXTRA_SPINS = 4;

function buildSlices(): SliceData[] {
  const cx = 200;
  const cy = 200;
  const R = 170;
  const N = 8;
  const seg = 45;
  const pt = (r: number, cl: number): [number, number] => {
    const a = ((cl - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const arr: SliceData[] = [];
  for (let i = 0; i < N; i++) {
    const c = i * seg;
    const a0 = c - seg / 2;
    const a1 = c + seg / 2;
    const p0 = pt(R, a0);
    const p1 = pt(R, a1);
    const path = `M${cx} ${cy} L${p0[0].toFixed(2)} ${p0[1].toFixed(2)} A${R} ${R} 0 0 1 ${p1[0].toFixed(2)} ${p1[1].toFixed(2)} Z`;
    const tp = pt(R * 0.64, c);
    let rot = c;
    if (c > 90 && c < 270) rot = c + 180;
    const pr = PRIZES[LAYOUT[i]];
    let fill: string;
    let tc: string;
    if (pr.key === 'gold') {
      fill = 'url(#caSliceGold)';
      tc = '#1F2933';
    } else if (pr.key === 'orange') {
      fill = 'url(#caSliceOrange)';
      tc = '#fff';
    } else {
      fill = 'url(#caSliceDark)';
      tc = '#fff';
    }
    // alternate orange/dark visual rhythm while keeping prize identity + white text
    if (pr.key === 'orange' && i % 2 === 1) fill = 'url(#caSliceDark)';
    arr.push({
      path,
      tx: +tp[0].toFixed(2),
      ty: +tp[1].toFixed(2),
      ty1: +(tp[1] - 4).toFixed(2),
      ty2: +(tp[1] + 11).toFixed(2),
      rot,
      l1: pr.l1,
      l2: pr.l2,
      fill,
      tc,
    });
  }
  return arr;
}

function buildBulbs(): BulbData[] {
  const cx = 200;
  const cy = 200;
  const r = 186;
  const out: BulbData[] = [];
  for (let k = 0; k < 24; k++) {
    const a = ((k * 15 - 90) * Math.PI) / 180;
    out.push({ x: +(cx + r * Math.cos(a)).toFixed(2), y: +(cy + r * Math.sin(a)).toFixed(2) });
  }
  return out;
}

const SLICES = buildSlices();
const BULBS = buildBulbs();

function weightedPick(): number {
  let tot = 0;
  for (const p of PRIZES) tot += p.w;
  let r = Math.random() * tot;
  for (let i = 0; i < PRIZES.length; i++) {
    r -= PRIZES[i].w;
    if (r < 0) return i;
  }
  return 0;
}

function makeCode(): string {
  const s = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let r = '';
  for (let i = 0; i < 5; i++) r += s[Math.floor(Math.random() * s.length)];
  return 'CA-' + r;
}

export default function RouletteWheel3D({ whatsappNumber, embed }: RouletteWheel3DProps) {
  const showHeader = !embed;

  const [open, setOpen] = useState(false);
  const [prize, setPrize] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [registered, setRegistered] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  const svgRef = useRef<SVGSVGElement>(null);
  const spinRef = useRef<SVGGElement>(null);
  const rotRef = useRef(0);
  const dragRef = useRef<DragState | null>(null);
  const spinningRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  const applyRot = useCallback(() => {
    if (spinRef.current) spinRef.current.style.transform = `rotate(${rotRef.current}deg)`;
  }, []);

  const angle = useCallback((e: { clientX: number; clientY: number }) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const r = svg.getBoundingClientRect();
    return (
      (Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180) / Math.PI
    );
  }, []);

  const tick = useCallback(() => {
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      const ctx = audioCtxRef.current ?? (audioCtxRef.current = new AC());
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'square';
      o.frequency.value = 900;
      o.connect(g);
      g.connect(ctx.destination);
      const t = ctx.currentTime;
      g.gain.setValueAtTime(0.05, t);
      g.gain.exponentialRampToValueAtTime(0.0008, t + 0.03);
      o.start(t);
      o.stop(t + 0.035);
    } catch {
      // ignore audio failures (autoplay restrictions, unsupported browsers, etc.)
    }
  }, []);

  const spinTo = useCallback(
    (vel: number) => {
      if (spinningRef.current) return;
      spinningRef.current = true;
      const prizeIdx = weightedPick();
      const cands: number[] = [];
      LAYOUT.forEach((p, i) => {
        if (p === prizeIdx) cands.push(i);
      });
      const target = cands[Math.floor(Math.random() * cands.length)];
      const spins = Math.max(3, Math.round(EXTRA_SPINS + Math.min(Math.abs(vel), 3) * 1.4));
      const start = rotRef.current;
      let end = start + spins * 360;
      const rem = (((-target * 45 - end) % 360) + 360) % 360;
      end += rem + (Math.random() * 2 - 1) * 9;
      const dur = 3200 + spins * 170;
      const t0 = performance.now();
      let lastSlice = Math.floor(start / 45);

      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / dur);
        const ease = 1 - Math.pow(1 - k, 3);
        rotRef.current = start + (end - start) * ease;
        applyRot();
        const sl = Math.floor(rotRef.current / 45);
        if (sl !== lastSlice) {
          tick();
          lastSlice = sl;
        }
        if (k < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          spinningRef.current = false;
          const pr = PRIZES[prizeIdx];
          const pieces: ConfettiPiece[] = [];
          for (let i = 0; i < 46; i++) {
            pieces.push({
              left: (Math.random() * 100).toFixed(1) + '%',
              color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              delay: (Math.random() * 0.5).toFixed(2) + 's',
              dur: (1.5 + Math.random() * 1.4).toFixed(2) + 's',
              rot: Math.floor(Math.random() * 360) + 'deg',
            });
          }
          setConfetti(pieces);
          setPrize(pr.full);
          setCode(makeCode());
          setName('');
          setPhone('');
          setRegistered(false);
          setOpen(true);
        }
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [applyRot, tick]
  );

  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (spinningRef.current) return;
    e.preventDefault();
    try {
      svgRef.current?.setPointerCapture(e.pointerId);
    } catch {
      // pointer capture can fail silently on unsupported targets
    }
    if (svgRef.current) svgRef.current.style.cursor = 'grabbing';
    dragRef.current = { last: angle(e), lastT: performance.now(), vel: 0, lastSlice: Math.floor(rotRef.current / 45) };
  };

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    e.preventDefault();
    const a = angle(e);
    let delta = a - drag.last;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    rotRef.current += delta;
    applyRot();
    const now = performance.now();
    drag.vel = delta / Math.max(1, now - drag.lastT);
    drag.last = a;
    drag.lastT = now;
    const sl = Math.floor(rotRef.current / 45);
    if (sl !== drag.lastSlice) {
      tick();
      drag.lastSlice = sl;
    }
  };

  const onUp = () => {
    const drag = dragRef.current;
    if (!drag) return;
    if (svgRef.current) svgRef.current.style.cursor = 'grab';
    const v = drag.vel;
    dragRef.current = null;
    spinTo(v);
  };

  const onSpinBtn = () => {
    if (!spinningRef.current) spinTo((Math.random() * 1.4 + 1.2) * (Math.random() < 0.5 ? -1 : 1));
  };

  const register = () => {
    if (!name || !phone) return;
    try {
      const k = 'construauto-ruleta-registros';
      const raw = localStorage.getItem(k);
      const arr = raw ? JSON.parse(raw) : [];
      arr.push({ prize, code, name, phone, date: new Date().toISOString() });
      localStorage.setItem(k, JSON.stringify(arr));
    } catch {
      // localStorage may be unavailable (private mode, quota, etc.)
    }
    setRegistered(true);
  };

  const closeModal = () => setOpen(false);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const num = whatsappNumber.replace(/\D/g, '');
  const canData = !!(name && phone);
  const msg =
    'Hola, giré la Ruleta ConstruAuto y gané: ' +
    prize +
    '. Mi código es ' +
    code +
    '. Nombre: ' +
    (name || '(por confirmar)') +
    ', teléfono: ' +
    (phone || '(por confirmar)') +
    '. ¿Cómo lo reclamo?';
  const waHref = 'https://wa.me/' + num + '?text=' + encodeURIComponent(msg);

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 22,
        padding: '32px 24px 48px',
        maxWidth: 760,
        margin: '0 auto',
        width: '100%',
      }}
    >
      {showHeader && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', maxWidth: 640 }}>
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(255,105,15,0.12)',
              border: '1px solid rgba(255,105,15,0.4)',
              color: '#E8731A',
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              padding: '6px 12px',
              borderRadius: 999,
            }}
          >
            Promociones ConstruAuto
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 42, fontWeight: 800, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.02 }}>
            Gira y gana
          </h1>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55, color: '#52606D' }}>
            Arrastra la ruleta con el dedo y suéltala para lanzarla. Cuando se detenga, ganarás una de nuestras
            promociones y recibirás tu código por WhatsApp.
          </p>
        </div>
      )}

      <div
        style={{
          position: 'relative',
          width: 560,
          maxWidth: '88vw',
          aspectRatio: '1',
          filter: 'drop-shadow(0 40px 44px rgba(31,41,51,0.30))',
        }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 400 400"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            touchAction: 'none',
            cursor: 'grab',
            WebkitUserSelect: 'none',
            userSelect: 'none',
          }}
        >
          <defs>
            <radialGradient id="caPlate" cx="42%" cy="34%" r="72%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#F2F4F7" />
              <stop offset="100%" stopColor="#D3DAE2" />
            </radialGradient>
            <linearGradient id="caBezel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3A4A57" />
              <stop offset="34%" stopColor="#1F2933" />
              <stop offset="66%" stopColor="#141C24" />
              <stop offset="100%" stopColor="#33424E" />
            </linearGradient>
            <radialGradient id="caSliceOrange" cx="50%" cy="8%" r="96%">
              <stop offset="0%" stopColor="#FF8A3D" />
              <stop offset="52%" stopColor="#FF690F" />
              <stop offset="100%" stopColor="#D2510A" />
            </radialGradient>
            <radialGradient id="caSliceDark" cx="50%" cy="8%" r="96%">
              <stop offset="0%" stopColor="#33434F" />
              <stop offset="55%" stopColor="#1F2933" />
              <stop offset="100%" stopColor="#121A21" />
            </radialGradient>
            <radialGradient id="caSliceGold" cx="50%" cy="8%" r="96%">
              <stop offset="0%" stopColor="#FFE79A" />
              <stop offset="55%" stopColor="#FFD34D" />
              <stop offset="100%" stopColor="#E5A81F" />
            </radialGradient>
            <radialGradient id="caGloss" cx="50%" cy="30%" r="62%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.42" />
              <stop offset="42%" stopColor="#ffffff" stopOpacity="0.10" />
              <stop offset="70%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.14" />
            </radialGradient>
            <radialGradient id="caHub" cx="40%" cy="32%" r="75%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#F4F6F8" />
              <stop offset="100%" stopColor="#D9DFE6" />
            </radialGradient>
            <linearGradient id="caHubRing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF9A5C" />
              <stop offset="100%" stopColor="#D2510A" />
            </linearGradient>
          </defs>

          <circle cx="200" cy="200" r="196" fill="url(#caBezel)" />
          <circle cx="200" cy="200" r="196" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="181" fill="url(#caPlate)" />

          {BULBS.map((b, i) => (
            <g key={i}>
              <circle cx={b.x} cy={b.y} r="4.4" fill="#FFE9A8" />
              <circle cx={b.x} cy={b.y} r="2.1" fill="#fff" />
            </g>
          ))}

          <g ref={spinRef} style={{ transformOrigin: '200px 200px', transform: `rotate(${rotRef.current}deg)` }}>
            <circle cx="200" cy="200" r="170" fill="#ffffff" />
            {SLICES.map((s, i) => {
              const tf = `rotate(${s.rot} ${s.tx} ${s.ty})`;
              return (
                <g key={i}>
                  <path d={s.path} fill={s.fill} />
                  <path d={s.path} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" />
                  <text
                    x={s.tx}
                    y={s.ty1}
                    fill={s.tc}
                    textAnchor="middle"
                    transform={tf}
                    style={{ fontFamily: 'Barlow', fontWeight: 800, fontSize: 15, letterSpacing: '0.01em' }}
                  >
                    {s.l1}
                  </text>
                  <text
                    x={s.tx}
                    y={s.ty2}
                    fill={s.tc}
                    textAnchor="middle"
                    transform={tf}
                    style={{ fontFamily: 'Barlow', fontWeight: 700, fontSize: 12, letterSpacing: '0.02em' }}
                  >
                    {s.l2}
                  </text>
                </g>
              );
            })}
            <circle cx="200" cy="200" r="170" fill="url(#caGloss)" style={{ pointerEvents: 'none' }} />
            <circle cx="200" cy="200" r="170" fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="2" />
          </g>

          <polygon points="200,2 216,10 200,46 184,10" fill="url(#caHubRing)" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>

        <button
          onClick={onSpinBtn}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 112,
            height: 112,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 32%,#ffffff,#EDEFF2 60%,#D9DFE6)',
            border: '6px solid transparent',
            backgroundClip: 'padding-box',
            boxShadow:
              '0 12px 26px rgba(0,0,0,0.30), 0 0 0 6px rgba(255,105,15,0.16), inset 0 2px 6px rgba(255,255,255,0.9), inset 0 -6px 10px rgba(0,0,0,0.10)',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            padding: 0,
          }}
        >
          <img src="/assets/logo-color.png" alt="ConstruAuto" style={{ width: 74, height: 'auto', display: 'block', pointerEvents: 'none' }} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: '#8A94A6', fontWeight: 700, fontSize: 14 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v3" />
          <path d="M18.4 5.6l-2.1 2.1" />
          <path d="M21 12h-3" />
          <path d="M12 21a9 9 0 1 0-6.4-2.6" />
        </svg>
        Arrastra la ruleta o toca el centro para girar
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 2 }}>
        {LEGEND.map((p, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: 999,
              padding: '7px 14px 7px 8px',
              boxShadow: '0 3px 10px rgba(31,41,51,0.06)',
            }}
          >
            <span style={{ width: 16, height: 16, borderRadius: '50%', background: p.dot }} />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#3E4C59' }}>{p.full}</span>
          </div>
        ))}
      </div>

      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(20,29,38,0.72)',
            padding: 24,
            overflow: 'auto',
          }}
        >
          {confetti.map((c, i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                top: 0,
                left: c.left,
                width: 9,
                height: 14,
                background: c.color,
                borderRadius: 2,
                animation: `caConfFall ${c.dur} ease-in ${c.delay} forwards`,
                transform: `rotate(${c.rot})`,
              }}
            />
          ))}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 430,
              background: '#fff',
              borderRadius: 20,
              padding: '30px 28px 26px',
              boxShadow: '0 40px 90px rgba(0,0,0,0.45)',
              animation: 'caPop 0.28s ease',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,105,15,0.12)',
                color: '#E8731A',
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding: '7px 14px',
                borderRadius: 999,
                marginBottom: 14,
              }}
            >
              🎉 ¡Ganaste!
            </div>
            <div style={{ fontSize: 14, color: '#52606D', marginBottom: 6 }}>Tu promoción ConstruAuto:</div>
            <div style={{ fontSize: 23, fontWeight: 800, fontStyle: 'italic', lineHeight: 1.2, color: '#1F2933', marginBottom: 16 }}>
              {prize}
            </div>
            <div style={{ background: '#F5F7F9', border: '1px dashed #C3CCD6', borderRadius: 12, padding: 12, marginBottom: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A94A6', fontWeight: 700 }}>
                Código de premio
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '0.08em', color: '#FF690F', marginTop: 2 }}>{code}</div>
            </div>
            <div style={{ textAlign: 'left', marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#52606D', marginBottom: 12, textAlign: 'center' }}>
                Registra tus datos para reclamarlo
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre completo"
                style={{ width: '100%', padding: '12px 14px', fontSize: 15, border: '1.5px solid #D8DEE5', borderRadius: 10, marginBottom: 10 }}
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Teléfono / WhatsApp"
                inputMode="tel"
                style={{ width: '100%', padding: '12px 14px', fontSize: 15, border: '1.5px solid #D8DEE5', borderRadius: 10 }}
              />
            </div>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={register}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                background: canData ? '#25D366' : '#9AD9B0',
                color: '#fff',
                fontWeight: 800,
                fontSize: 15.5,
                padding: 14,
                borderRadius: 12,
                marginBottom: 10,
                pointerEvents: canData ? 'auto' : 'none',
                opacity: canData ? 1 : 0.75,
                textDecoration: 'none',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
              </svg>
              Reclamar por WhatsApp
            </a>
            {registered && (
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1F8A4C', marginBottom: 8 }}>
                ✓ ¡Registrado! Te contactaremos.
              </div>
            )}
            {!canData && (
              <div style={{ fontSize: 12.5, color: '#8A94A6', marginBottom: 8 }}>
                Escribe tu nombre y teléfono para activar el botón.
              </div>
            )}
            <button
              onClick={closeModal}
              style={{ width: '100%', background: 'transparent', border: 'none', color: '#8A94A6', fontWeight: 700, fontSize: 14, padding: 8, cursor: 'pointer' }}
            >
              Cerrar
            </button>
            <p style={{ margin: '6px 0 0', fontSize: 11, lineHeight: 1.5, color: '#9AA5B1' }}>
              Un premio por persona. Sujeto a validación con tu asesor y aplicable según contrato. No canjeable por efectivo.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
