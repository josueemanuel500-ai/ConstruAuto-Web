import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { fileSizeError, getErrorMessage } from './utils';
import type { EntregaListItem } from './useAdminLists';
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
  submitButtonStyle,
  textareaStyle,
  thumbImgStyle,
  thumbStyle,
} from './styles';

interface EntregasPanelProps {
  items: EntregaListItem[];
  onDelete: (id: string, path: string) => void;
  onAdded: () => void;
}

export default function EntregasPanel({ items, onDelete, onAdded }: EntregasPanelProps) {
  const [cName, setCName] = useState('');
  const [cWhen, setCWhen] = useState('');
  const [cNote, setCNote] = useState('');
  const [fileName, setFileName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [saveOk, setSaveOk] = useState(false);
  const fileRef = useRef<File | null>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      const sizeErr = fileSizeError(f);
      if (sizeErr) {
        setSaveErr(sizeErr);
        setSaveOk(false);
        fileRef.current = null;
        setFileName('');
        e.target.value = '';
        return;
      }
    }
    setSaveErr('');
    fileRef.current = f || null;
    setFileName(f ? f.name : '');
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase) return;
    const sb = supabase;
    if (!cName.trim()) {
      setSaveErr('Escribe el nombre del auto.');
      setSaveOk(false);
      return;
    }
    if (!cWhen) {
      setSaveErr('Elige la fecha y hora.');
      setSaveOk(false);
      return;
    }
    const file = fileRef.current;
    if (!file) {
      setSaveErr('Selecciona una foto del auto.');
      setSaveOk(false);
      return;
    }

    setSaving(true);
    setSaveErr('');
    setSaveOk(false);

    const clean = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
    const path = Date.now() + '_' + clean;

    sb.storage
      .from('entregas')
      .upload(path, file, { cacheControl: '3600', upsert: false })
      .then(({ error }) => {
        if (error) throw error;
        const { data } = sb.storage.from('entregas').getPublicUrl(path);
        return sb.from('entregas').insert({
          name: cName.trim(),
          note: cNote.trim(),
          img: data.publicUrl,
          path,
          when: new Date(cWhen).toISOString(),
        });
      })
      .then(({ error }) => {
        if (error) throw error;
        fileRef.current = null;
        setCName('');
        setCWhen('');
        setCNote('');
        setFileName('');
        setSaving(false);
        setSaveOk(true);
        onAdded();
        setTimeout(() => setSaveOk(false), 4000);
      })
      .catch((err: unknown) => {
        setSaving(false);
        setSaveErr('No se pudo publicar. ' + getErrorMessage(err));
      });
  };

  return (
    <>
      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 18px', fontSize: 21, fontWeight: 800, fontStyle: 'italic' }}>Agregar próxima entrega</h2>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldColStyle}>
            <label style={labelStyle}>Auto</label>
            <input
              value={cName}
              onChange={(e) => setCName(e.target.value)}
              placeholder="Ej. Chevrolet Aveo 2015"
              style={inputStyle}
            />
          </div>
          <div style={fieldColStyle}>
            <label style={labelStyle}>Fecha y hora de entrega</label>
            <input value={cWhen} onChange={(e) => setCWhen(e.target.value)} type="datetime-local" style={inputStyle} />
          </div>
          <div style={fieldColStyle}>
            <label style={labelStyle}>Nota (opcional)</label>
            <textarea
              value={cNote}
              onChange={(e) => setCNote(e.target.value)}
              rows={2}
              placeholder="Ej. ¡Felicidades a la familia López!"
              style={textareaStyle}
            />
          </div>
          <div style={fieldColStyle}>
            <label style={labelStyle}>Foto del auto</label>
            <input onChange={handleFile} type="file" accept="image/*" style={fileInputStyle} />
            {fileName && <div style={fileNameStyle}>{fileName}</div>}
          </div>
          {saveErr && <div style={errStyle}>{saveErr}</div>}
          {saveOk && <div style={okStyle}>¡Entrega publicada!</div>}
          <button type="submit" disabled={saving} className="ca-btn-primary" style={submitButtonStyle(saving)}>
            {saving ? 'Publicando…' : 'Publicar entrega'}
          </button>
        </form>
      </div>

      <div style={listWrapStyle}>
        <h2 style={sectionTitleStyle}>Entregas publicadas</h2>
        {items.length === 0 ? (
          <div style={emptyStyle}>Aún no hay entregas publicadas.</div>
        ) : (
          items.map((it) => (
            <div key={it.id} style={{ ...listItemStyle, opacity: it.past ? 0.55 : 1 }}>
              <div style={thumbStyle}>
                <img src={it.img} alt={it.name} style={thumbImgStyle} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15.5, lineHeight: 1.2 }}>{it.name}</div>
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--ca-text-secondary)',
                    fontWeight: 600,
                    marginTop: 3,
                    textTransform: 'capitalize',
                  }}
                >
                  {it.label}
                </div>
                {it.past && (
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: 4,
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--ca-text-muted)',
                    }}
                  >
                    Ya no visible en la web
                  </span>
                )}
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
