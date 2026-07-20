import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import Entregas from '../sections/Entregas';
import { useCrossRouteNavigate } from '../lib/useCrossRouteNavigate';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export default function EntregasPage() {
  useDocumentMeta({
    title: 'Entregas de autos | ConstruAuto de México',
    description:
      'Conoce las entregas reales de vehículos realizadas por ConstruAuto de México y las experiencias de nuestros clientes.',
    canonical: 'https://www.construautodemexico.com.mx/entregas',
  });

  const goToSection = useCrossRouteNavigate();

  return (
    <>
      <Header page="entregas" onNavigate={goToSection} />
      <Entregas onNavigate={goToSection} />
      <Footer onNavigate={goToSection} />
      <WhatsAppFloat />
    </>
  );
}
