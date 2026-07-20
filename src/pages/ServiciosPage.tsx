import Servicios from '../sections/Servicios';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export default function ServiciosPage() {
  useDocumentMeta({
    title: 'Servicios de autofinanciamiento | ConstruAuto de México',
    description:
      'Conoce cómo funciona el autofinanciamiento de ConstruAuto de México: montos de $30,000 a $150,000 MXN, plazos de 12 a 60 meses y los requisitos para tramitar tu auto usado o seminuevo.',
    canonical: 'https://www.construautodemexico.com.mx/servicios',
  });

  return <Servicios />;
}
