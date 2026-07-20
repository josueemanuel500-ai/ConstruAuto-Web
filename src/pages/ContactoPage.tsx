import Contacto from '../sections/Contacto';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export default function ContactoPage() {
  useDocumentMeta({
    title: 'Contacto | ConstruAuto de México',
    description:
      'Contáctanos por WhatsApp, teléfono o visítanos en Mérida, Yucatán y cuéntanos qué auto buscas para tu autofinanciamiento.',
    canonical: 'https://www.construautodemexico.com.mx/contacto',
  });

  return <Contacto />;
}
