import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, type Entrega } from './supabase';

export interface UpcomingDelivery {
  id: string;
  name: string;
  note: string;
  img: string;
  hasNote: boolean;
  dateLabel: string;
  timeLabel: string;
  countdown: string;
}

/** Próximas entregas desde Supabase (tabla `entregas`), con realtime + poll de respaldo (~45s). */
export function useUpcomingDeliveries(): { upcoming: UpcomingDelivery[]; configured: boolean; loaded: boolean } {
  const [raw, setRaw] = useState<Entrega[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoaded(true);
      return;
    }
    const sb = supabase;

    const load = () => {
      sb.from('entregas')
        .select('*')
        .order('when', { ascending: true })
        .then(({ data, error }) => {
          if (error) {
            setLoaded(true);
            return;
          }
          const arr: Entrega[] = (data || []).map((d: Record<string, unknown>) => ({
            id: String(d.id),
            name: (d.name as string) || '',
            note: (d.note as string) || '',
            img: (d.img as string) || '',
            ts: new Date(d.when as string).getTime(),
          }));
          setRaw(arr);
          setLoaded(true);
        });
    };
    load();

    const channel = sb
      .channel('entregas-web')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entregas' }, load)
      .subscribe();
    const poll = window.setInterval(load, 45000);
    const clock = window.setInterval(() => setNow(Date.now()), 60000);

    return () => {
      window.clearInterval(poll);
      window.clearInterval(clock);
      sb.removeChannel(channel);
    };
  }, []);

  const upcoming = raw
    .filter((d) => d.ts >= now - 3600000)
    .map((d) => {
      const dt = new Date(d.ts);
      let dateLabel = '';
      let timeLabel = '';
      try {
        dateLabel = dt.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
      } catch {
        /* ignore */
      }
      try {
        timeLabel = dt.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true });
      } catch {
        /* ignore */
      }
      const days = Math.ceil((d.ts - now) / 86400000);
      const countdown = days <= 0 ? 'Hoy' : days === 1 ? 'Mañana' : 'En ' + days + ' días';
      return { id: d.id, name: d.name, note: d.note, img: d.img, hasNote: !!d.note, dateLabel, timeLabel, countdown };
    });

  return { upcoming, configured: isSupabaseConfigured, loaded };
}
