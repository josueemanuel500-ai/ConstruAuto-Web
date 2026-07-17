import { useEffect } from 'react';

/**
 * Elementos donde el usuario debe poder seleccionar/copiar/arrastrar texto
 * con normalidad (inputs, buscadores, textareas, contenido editable).
 */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const el = target.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]');
  return el !== null;
}

/**
 * Protección de contenido para producción: bloquea selección de texto,
 * clic derecho, copiar/cortar y arrastre de imágenes en el resto del sitio,
 * sin afectar inputs/textareas/formularios.
 *
 * No usa timers ni estado — solo listeners nativos en `document`, montados
 * una vez y desmontados en cleanup. No causa re-renders.
 */
export function useContentProtection() {
  useEffect(() => {
    const blockUnlessEditable = (e: Event) => {
      if (isEditableTarget(e.target)) return;
      e.preventDefault();
    };

    document.addEventListener('contextmenu', blockUnlessEditable);
    document.addEventListener('copy', blockUnlessEditable);
    document.addEventListener('cut', blockUnlessEditable);
    document.addEventListener('dragstart', blockUnlessEditable);
    document.addEventListener('selectstart', blockUnlessEditable);

    return () => {
      document.removeEventListener('contextmenu', blockUnlessEditable);
      document.removeEventListener('copy', blockUnlessEditable);
      document.removeEventListener('cut', blockUnlessEditable);
      document.removeEventListener('dragstart', blockUnlessEditable);
      document.removeEventListener('selectstart', blockUnlessEditable);
    };
  }, []);
}
