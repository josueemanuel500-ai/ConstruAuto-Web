import Nosotros from '../sections/Nosotros';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export default function NosotrosPage() {
  useDocumentMeta({
    title: 'Nosotros | ConstruAuto de México',
    description:
      'ConstruAuto de México es una empresa formal en Mérida, Yucatán, dedicada al autofinanciamiento de autos usados y seminuevos con transparencia y acompañamiento personalizado.',
    canonical: 'https://www.construautodemexico.com.mx/nosotros',
  });

  return <Nosotros />;
}
