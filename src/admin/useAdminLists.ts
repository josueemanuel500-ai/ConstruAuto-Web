import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

interface EntregaRow {
  id: string;
  name: string;
  note: string;
  img: string;
  path: string;
  when: string;
}

interface CatalogoRow {
  id: string;
  model: string;
  year: string;
  amount: number;
  tipo: string;
  img: string;
  path: string;
}

export interface EntregaListItem {
  id: string;
  name: string;
  img: string;
  path: string;
  label: string;
  past: boolean;
}

export interface CatalogoListItem {
  id: string;
  model: string;
  img: string;
  path: string;
  label: string;
}

interface UseAdminListsResult {
  items: EntregaListItem[];
  catItems: CatalogoListItem[];
  reloadEntregas: () => void;
  reloadCatalogo: () => void;
  deleteEntrega: (id: string, path: string) => void;
  deleteCatalogo: (id: string, path: string) => void;
}

/**
 * Listas administrables (entregas + catalogo) con realtime + poll de respaldo (30s),
 * espejo del patrón de useUpcomingDeliveries/useCatalog pero con soporte de borrado.
 * Solo se activa (`enabled`) una vez que hay sesión iniciada.
 */
export function useAdminLists(enabled: boolean): UseAdminListsResult {
  const [entregas, setEntregas] = useState<EntregaRow[]>([]);
  const [catalogo, setCatalogo] = useState<CatalogoRow[]>([]);
  const loadEntregasRef = useRef<() => void>(() => {});
  const loadCatalogoRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!enabled || !supabase) return;
    const sb = supabase;

    const loadEntregas = () => {
      sb.from('entregas')
        .select('*')
        .order('when', { ascending: true })
        .then(({ data, error }) => {
          if (error) return;
          const rows: EntregaRow[] = (data || []).map((d: Record<string, unknown>) => ({
            id: String(d.id),
            name: (d.name as string) || '',
            note: (d.note as string) || '',
            img: (d.img as string) || '',
            path: (d.path as string) || '',
            when: (d.when as string) || '',
          }));
          setEntregas(rows);
        });
    };

    const loadCatalogo = () => {
      sb.from('catalogo')
        .select('*')
        .order('created_at', { ascending: true })
        .then(({ data, error }) => {
          if (error) return;
          const rows: CatalogoRow[] = (data || []).map((d: Record<string, unknown>) => ({
            id: String(d.id),
            model: (d.model as string) || '',
            year: (d.year as string) || '',
            amount: Number(d.amount) || 0,
            tipo: (d.tipo as string) || 'Sedán',
            img: (d.img as string) || '',
            path: (d.path as string) || '',
          }));
          setCatalogo(rows);
        });
    };

    loadEntregasRef.current = loadEntregas;
    loadCatalogoRef.current = loadCatalogo;

    loadEntregas();
    loadCatalogo();

    const channel = sb
      .channel('entregas-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entregas' }, loadEntregas)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'catalogo' }, loadCatalogo)
      .subscribe();

    const poll = window.setInterval(() => {
      loadEntregas();
      loadCatalogo();
    }, 30000);

    return () => {
      window.clearInterval(poll);
      sb.removeChannel(channel);
    };
  }, [enabled]);

  const now = Date.now();
  const items: EntregaListItem[] = entregas.map((d) => {
    const ts = new Date(d.when).getTime();
    const dt = new Date(ts);
    let label = '';
    try {
      label =
        dt.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) +
        ' · ' +
        dt.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      /* ignore */
    }
    return {
      id: d.id,
      name: d.name,
      img: d.img,
      path: d.path,
      label,
      past: ts < now - 3600000,
    };
  });

  const catItems: CatalogoListItem[] = catalogo.map((c) => ({
    id: c.id,
    model: c.model,
    img: c.img,
    path: c.path,
    label: (c.year ? c.year + ' · ' : '') + c.tipo + ' · $' + c.amount.toLocaleString('es-MX'),
  }));

  const deleteEntrega = (id: string, path: string) => {
    if (!supabase) return;
    const sb = supabase;
    if (!window.confirm('¿Eliminar esta entrega? Esta acción no se puede deshacer.')) return;
    sb.from('entregas')
      .delete()
      .eq('id', id)
      .then(() => {
        if (path) {
          sb.storage
            .from('entregas')
            .remove([path])
            .catch(() => {});
        }
        loadEntregasRef.current();
      });
  };

  const deleteCatalogo = (id: string, path: string) => {
    if (!supabase) return;
    const sb = supabase;
    if (!window.confirm('¿Eliminar este auto del catálogo?')) return;
    sb.from('catalogo')
      .delete()
      .eq('id', id)
      .then(() => {
        if (path) {
          sb.storage
            .from('catalogo')
            .remove([path])
            .catch(() => {});
        }
        loadCatalogoRef.current();
      });
  };

  return {
    items,
    catItems,
    reloadEntregas: () => loadEntregasRef.current(),
    reloadCatalogo: () => loadCatalogoRef.current(),
    deleteEntrega,
    deleteCatalogo,
  };
}
