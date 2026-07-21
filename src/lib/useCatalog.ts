import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, type CatalogoItem } from './supabase';
import { fmtMoney, waLink } from './whatsapp';

export interface CatalogCar {
  id: string;
  name: string;
  tipo: string;
  price: string;
  img: string;
  isSlot: boolean;
  waHref: string;
}

const DEFAULT_CARS: { model: string; year: string; amount: number; tipo: string; id: string; img: string }[] = [
  { id: 'car-aveo-2014', model: 'Chevrolet Aveo', year: '2014', amount: 90000, tipo: 'Sedán', img: '/assets/catalog/aveo-2014.jpg' },
  { id: 'car-aveo-2015', model: 'Chevrolet Aveo', year: '2015', amount: 100000, tipo: 'Sedán', img: '/assets/catalog/aveo-2015.jpg' },
  { id: 'car-spark-2013', model: 'Chevrolet Spark', year: '2013', amount: 85000, tipo: 'Hatchback', img: '/assets/catalog/spark-2013.jpg' },
  { id: 'car-monza', model: 'Chevrolet Monza', year: '', amount: 70000, tipo: 'Sedán', img: '/assets/catalog/monza.jpg' },
  { id: 'car-civic-2003', model: 'Honda Civic', year: '2003', amount: 65000, tipo: 'Sedán', img: '/assets/catalog/civic-2003.jpg' },
];

function toCar(model: string, year: string, amount: number, tipo: string, img: string, id: string): CatalogCar {
  const name = model + (year ? ' ' + year : '');
  return {
    id,
    name,
    tipo: tipo || 'Sedán',
    price: fmtMoney(amount),
    img,
    isSlot: !img,
    waHref: waLink('Hola, me interesa el ' + name + ' del catálogo (monto aprox. ' + fmtMoney(amount) + '). ¿Me puedes dar más información?'),
  };
}

/** Catálogo administrable desde Supabase (tabla `catalogo`); si está vacío se usan los autos de referencia por defecto. */
export function useCatalog(): { cars: CatalogCar[]; fromDb: boolean } {
  const [dbItems, setDbItems] = useState<CatalogoItem[] | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const sb = supabase;

    const load = () => {
      sb.from('catalogo')
        .select('*')
        .order('created_at', { ascending: true })
        .then(({ data, error }) => {
          if (error) return;
          setDbItems((data as CatalogoItem[]) || []);
        });
    };
    load();

    const channel = sb
      .channel('catalogo-web')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'catalogo' }, load)
      .subscribe();
    const poll = window.setInterval(load, 45000);

    return () => {
      window.clearInterval(poll);
      sb.removeChannel(channel);
    };
  }, []);

  const useDb = Array.isArray(dbItems) && dbItems.length > 0;
  const cars = useDb
    ? (dbItems as CatalogoItem[]).map((c, i) => toCar(c.model, c.year, c.amount, c.tipo, c.img, c.id || String(i)))
    : DEFAULT_CARS.map((c) => toCar(c.model, c.year, c.amount, c.tipo, c.img, c.id));

  return { cars, fromDb: useDb };
}
