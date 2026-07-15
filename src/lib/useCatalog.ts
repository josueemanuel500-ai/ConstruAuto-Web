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

const DEFAULT_CARS: { model: string; year: string; amount: number; tipo: string; id: string }[] = [
  { id: 'car-aveo', model: 'Chevrolet Aveo', year: '2015', amount: 110000, tipo: 'Sedán' },
  { id: 'car-spark', model: 'Chevrolet Spark', year: '2013', amount: 95000, tipo: 'Hatchback' },
  { id: 'car-jetta', model: 'Volkswagen Jetta Clásico', year: '', amount: 110000, tipo: 'Sedán' },
  { id: 'car-mazda3', model: 'Mazda 3', year: '2010', amount: 150000, tipo: 'Sedán' },
  { id: 'car-ranger', model: 'Ford Ranger', year: '1998', amount: 90000, tipo: 'Pickup' },
  { id: 'car-monza', model: 'Chevrolet Monza', year: '', amount: 75000, tipo: 'Sedán' },
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
    : DEFAULT_CARS.map((c) => toCar(c.model, c.year, c.amount, c.tipo, '', c.id));

  return { cars, fromDb: useDb };
}
