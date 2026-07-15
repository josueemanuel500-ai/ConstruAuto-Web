export type Page =
  | 'home'
  | 'servicios'
  | 'entregas'
  | 'nosotros'
  | 'catalogo'
  | 'calculadora'
  | 'juego'
  | 'contacto';

export const NAV_ITEMS: { key: Page; label: string }[] = [
  { key: 'home', label: 'Inicio' },
  { key: 'servicios', label: 'Servicios' },
  { key: 'entregas', label: 'Entregas' },
  { key: 'nosotros', label: 'Nosotros' },
  { key: 'catalogo', label: 'Catálogo' },
  { key: 'calculadora', label: 'Calculadora' },
  { key: 'juego', label: 'Juega y gana' },
  { key: 'contacto', label: 'Contacto' },
];
