import Catalogo from '../sections/Catalogo';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export default function CatalogoPage() {
  useDocumentMeta({
    title: 'Catálogo de autos | ConstruAuto de México',
    description:
      'Explora autos usados y seminuevos de referencia que puedes estrenar con el autofinanciamiento de ConstruAuto de México en Mérida, Yucatán.',
    canonical: 'https://www.construautodemexico.com.mx/catalogo',
  });

  return <Catalogo />;
}
