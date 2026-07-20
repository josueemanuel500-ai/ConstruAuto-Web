export type Page =
  | 'home'
  | 'servicios'
  | 'entregas'
  | 'nosotros'
  | 'catalogo'
  | 'calculadora'
  | 'juego'
  | 'contacto';

export const NAV_ITEMS: { key: Page; label: string; path: string }[] = [
  { key: 'home', label: 'Inicio', path: '/' },
  { key: 'servicios', label: 'Servicios', path: '/servicios' },
  { key: 'entregas', label: 'Entregas', path: '/entregas' },
  { key: 'nosotros', label: 'Nosotros', path: '/nosotros' },
  { key: 'catalogo', label: 'Catálogo', path: '/catalogo' },
  { key: 'calculadora', label: 'Calculadora', path: '/calculadora' },
  { key: 'juego', label: 'Juega y gana', path: '/juego' },
  { key: 'contacto', label: 'Contacto', path: '/contacto' },
];
