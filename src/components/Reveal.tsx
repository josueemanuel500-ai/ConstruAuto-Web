import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  delayMs?: number;
  style?: CSSProperties;
  className?: string;
}

/**
 * Fades + slides content up when it scrolls into view. Stagger children by
 * passing an increasing delayMs (30-50ms/item per the design system's
 * stagger-sequence guidance). prefers-reduced-motion is handled globally
 * (tokens.css disables all transitions), so this needs no extra check.
 */
export default function Reveal({ children, delayMs = 0, style, className }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition: `opacity 0.5s ease ${delayMs}ms, transform 0.5s ease ${delayMs}ms`,
      }}
    >
      {children}
    </div>
  );
}
