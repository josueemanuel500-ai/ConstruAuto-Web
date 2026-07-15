import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { getErrorMessage } from './utils';
import type { CatalogoListItem } from './useAdminLists';
import {
  cardStyle,
  deleteButtonStyle,
  emptyStyle,
  errStyle,
  fieldColStyle,
  fileInputStyle,
  fileNameStyle,
  formStyle,
  inputStyle,
  labelStyle,
  listItemStyle,
  listWrapStyle,
  okStyle,
  sectionTitleStyle,
  selectStyle,
  submitButtonStyle,
  thumbImgStyle,
  thumbStyle,
} from './styles';

const TIPOS = ['Sedán', 'Hatchback', 'Pickup', 'SUV', 'Camioneta'] as const;
const DEFAULT_TIPO = 'Sedán';

interface CatalogoPanelProps {
  items: CatalogoListItem[];
  onDelete: (id: string, path: string) => void;
  onAdded: () => void;
}

export default function CatalogoPanel({ items, onDelete, onAdded }: CatalogoPanelProps) {
  const [kModel, setKModel] = useState('');
  const [kYear, setKYear] = useState('');
  const [kAmount, setKAmount] = useState('');
  const [kTipo, setKTipo] = useState<string>(DEFAULT_TIPO);
  const [kFileName, setKFileName] = useState('');
  const [kSaving, setKSaving] = useState(false);
  const [kErr, setKErr] = useState('');
  const [kOk, setKOk] = useState(false);
  const fileRef = useRef<File | null>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    fileRef.current = f || null;
    setKFileName(f ? f.name : '');
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase) return;
    const sb = supabase;
    if (!kModel.trim()) {
      setKErr('Escribe el modelo del auto.');
      setKOk(false);
      return;
    }
    const amount = parseInt(String(kAmount).replace(/\D/g, ''), 10);
    if (!amount) {
      setKErr('Escribe el monto aproximado.');
      setKOk(false);
      return;
    }
    const file = fileRef.current;
    if (!file) {
      setKErr('Selecciona una foto del auto.');
      setKOk(false);
      return;
    }

    setKSaving(true);
    setKErr('');
    setKOk(false);

    const clean = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
    const path = 'cat_' + Date.now() + '_' + clean;

    sb.storage
      .from('catalogo')
      .upload(path, file, { cacheControl: '3600', upsert: false })
      .then(({ error }) => {
        if (error) throw error;
        const { data } = sb.storage.from('catalogo').getPublicUrl(path);
        return sb.from('catalogo').insert({
          model: kModel.trim(),
          year: kYear.trim(),
          amount,
          tipo: kTipo,
          img: data.publicUrl,
          path,
        });
      })
      .then(({ error }) => {
        if (error) throw error;
        fileRef.current = null;
        setKModel('');
        setKYear('');
        setKAmount('');
        setKTipo(DEFAULT_TIPO);
        setKFileName('');
        setKSaving(false);
        setKOk(true);
        onAdded();
        setTimeout(() => setKOk(false), 4000);
      })
      .catch((err: unknown) => {
        setKSaving(false);
        setKErr('No se pudo guardar. ' + getErrorMessage(err));
      });
  };

  return (
    <>
      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 6px', fontSize: 21, fontWeight: 800, fontStyle: 'italic' }}>Agregar auto al catálogo</h2>
        <p style={{ margin: '0 0 18px', fontSize: 13.5, color: 'var(--ca-text-secondary)', lineHeight: 1.5 }}>
          Los autos que agregues aquí reemplazan el catálogo de la página. Si no hay ninguno, se muestran los autos de
          referencia por defecto.
        </p>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldColStyle}>
            <label style={labelStyle}>Modelo</label>
            <input
              value={kModel}
              onChange={(e) => setKModel(e.target.value)}
              placeholder="Ej. Chevrolet Aveo"
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ ...fieldColStyle, flex: 1 }}>
              <label style={labelStyle}>Año (opcional)</label>
              <input value={kYear} onChange={(e) => setKYear(e.target.value)} placeholder="2015" style={inputStyle} />
            </div>
            <div style={{ ...fieldColStyle, flex: 1 }}>
              <label style={labelStyle}>Tipo</label>
              <select value={kTipo} onChange={(e) => setKTipo(e.target.value)} style={selectStyle}>
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={fieldColStyle}>
            <label style={labelStyle}>Monto aproximado (MXN)</label>
            <input
              value={kAmount}
              onChange={(e) => setKAmount(e.target.value)}
              inputMode="numeric"
              placeholder="110000"
              style={inputStyle}
            />
          </div>
          <div style={fieldColStyle}>
            <label style={labelStyle}>Foto del auto</label>
            <input onChange={handleFile} type="file" accept="image/*" style={fileInputStyle} />
            {kFileName && <div style={fileNameStyle}>{kFileName}</div>}
          </div>
          {kErr && <div style={errStyle}>{kErr}</div>}
          {kOk && <div style={okStyle}>¡Auto agregado al catálogo!</div>}
          <button type="submit" disabled={kSaving} className="ca-btn-primary" style={submitButtonStyle(kSaving)}>
            {kSaving ? 'Guardando…' : 'Agregar al catálogo'}
          </button>
        </form>
      </div>

      <div style={listWrapStyle}>
        <h2 style={sectionTitleStyle}>Catálogo publicado</h2>
        {items.length === 0 ? (
          <div style={emptyStyle}>Sin autos en el catálogo. La página muestra los autos de referencia por defecto.</div>
        ) : (
          items.map((it) => (
            <div key={it.id} style={listItemStyle}>
              <div style={thumbStyle}>
                <img src={it.img} alt={it.model} style={thumbImgStyle} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15.5, lineHeight: 1.2 }}>{it.model}</div>
                <div style={{ fontSize: 13, color: 'var(--ca-text-secondary)', fontWeight: 600, marginTop: 3 }}>
                  {it.label}
                </div>
              </div>
              <button
                onClick={() => onDelete(it.id, it.path)}
                aria-label="Eliminar"
                className="ca-admin-btn-delete"
                style={deleteButtonStyle}
              >
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
