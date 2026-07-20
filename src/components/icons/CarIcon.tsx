interface CarIconProps {
  size?: number;
  color?: string;
}

export default function CarIcon({ size = 40, color = '#FF690F' }: CarIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16.5V12l2-5a2 2 0 0 1 1.9-1.3h8.2A2 2 0 0 1 18 6.7l2 5.3v4.5" />
      <path d="M4 16.5h16" />
      <path d="M4 16.5V19a1 1 0 0 0 1 1h1.2a1 1 0 0 0 1-1v-1.5" />
      <path d="M16.8 16.5V19a1 1 0 0 0 1 1H19a1 1 0 0 0 1-1v-2.5" />
      <path d="M6.5 11h11" />
      <circle cx="7.5" cy="16.5" r="1.4" />
      <circle cx="16.5" cy="16.5" r="1.4" />
    </svg>
  );
}
