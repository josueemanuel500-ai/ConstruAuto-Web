import { useEffect, useRef } from 'react';

interface ScrollFrameCanvasProps {
  frameCount: number;
  framePath: (index: number) => string;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Dibuja una secuencia de fotogramas en un <canvas> y avanza el fotograma
 * mostrado según cuánto ha entrado/salido el contenedor del viewport al
 * hacer scroll (0 = apenas entra por abajo, 1 = a punto de salir por arriba).
 */
export default function ScrollFrameCanvas({ frameCount, framePath, style, className }: ScrollFrameCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const loadedRef = useRef<boolean[]>([]);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    imagesRef.current = new Array(frameCount).fill(null);
    loadedRef.current = new Array(frameCount).fill(false);

    const draw = (index: number) => {
      const canvas = canvasRef.current;
      const img = imagesRef.current[index];
      if (!canvas || !img) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // object-fit: cover
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    const nearestLoaded = (target: number) => {
      if (loadedRef.current[target]) return target;
      for (let d = 1; d < frameCount; d++) {
        const lo = target - d;
        const hi = target + d;
        if (lo >= 0 && loadedRef.current[lo]) return lo;
        if (hi < frameCount && loadedRef.current[hi]) return hi;
      }
      return -1;
    };

    const updateFrame = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // progreso 0..1 mientras el contenedor recorre el viewport de abajo hacia arriba
      const total = rect.height + vh;
      const traveled = vh - rect.top;
      const progress = Math.min(1, Math.max(0, traveled / total));
      const target = Math.min(frameCount - 1, Math.floor(progress * (frameCount - 1)));
      const toDraw = nearestLoaded(target);
      if (toDraw !== -1 && toDraw !== currentFrameRef.current) {
        currentFrameRef.current = toDraw;
        draw(toDraw);
      } else if (toDraw !== -1 && rafRef.current === null) {
        draw(toDraw);
      }
    };

    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateFrame();
      });
    };

    // precarga: primer fotograma con prioridad, el resto en segundo plano
    const firstImg = new Image();
    firstImg.src = framePath(0);
    firstImg.onload = () => {
      imagesRef.current[0] = firstImg;
      loadedRef.current[0] = true;
      draw(0);
    };

    for (let i = 1; i < frameCount; i++) {
      const img = new Image();
      img.src = framePath(i);
      img.onload = () => {
        imagesRef.current[i] = img;
        loadedRef.current[i] = true;
      };
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    updateFrame();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [frameCount, framePath]);

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
