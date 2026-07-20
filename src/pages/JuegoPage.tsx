import { lazy } from 'react';
import { useDocumentMeta } from '../lib/useDocumentMeta';

// Juega y gana carga ~40 MB de sprites/fondos del minijuego (game.js los precarga al
// importarse). Se separa en su propio chunk para que el resto del sitio no pague ese
// costo de red en la primera carga.
const Juega = lazy(() => import('../sections/Juega'));

export default function JuegoPage() {
  useDocumentMeta({
    title: 'Reto ConstruAuto — Juega y gana | ConstruAuto de México',
    description: 'Juega Reto ConstruAuto, supera los 7 niveles y participa por premios reales de ConstruAuto de México.',
    canonical: 'https://www.construautodemexico.com.mx/juego',
  });

  return <Juega />;
}
