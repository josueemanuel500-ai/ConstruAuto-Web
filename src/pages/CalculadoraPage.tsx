import Calculadora from '../sections/Calculadora';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export default function CalculadoraPage() {
  useDocumentMeta({
    title: 'Calculadora de pago mensual | ConstruAuto de México',
    description:
      'Calcula en minutos tu pago mensual estimado para autofinanciar un auto usado o seminuevo con ConstruAuto de México.',
    canonical: 'https://www.construautodemexico.com.mx/calculadora',
  });

  return <Calculadora />;
}
