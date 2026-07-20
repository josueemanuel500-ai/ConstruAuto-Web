import Entregas from '../sections/Entregas';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export default function EntregasPage() {
  useDocumentMeta({
    title: 'Entregas de autos | ConstruAuto de México',
    description:
      'Conoce las entregas reales de vehículos realizadas por ConstruAuto de México y las experiencias de nuestros clientes.',
    canonical: 'https://www.construautodemexico.com.mx/entregas',
  });

  return <Entregas />;
}
