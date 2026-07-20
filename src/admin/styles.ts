import type { CSSProperties } from 'react';

export const cardStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(18px) saturate(1.5)',
  WebkitBackdropFilter: 'blur(18px) saturate(1.5)',
  border: '1px solid rgba(255,255,255,0.85)',
  borderRadius: 20,
  padding: '28px 26px',
  boxShadow: '0 14px 40px rgba(31,41,51,0.12)',
};

export const formStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

export const fieldColStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

export const labelStyle: CSSProperties = {
  fontWeight: 700,
  fontSize: 14,
};

export const inputStyle: CSSProperties = {
  padding: '12px 14px',
  border: '1.5px solid var(--ca-border-strong)',
  borderRadius: 10,
  fontSize: 15,
  outlineColor: 'var(--ca-orange)',
};

export const textareaStyle: CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
};

export const selectStyle: CSSProperties = {
  ...inputStyle,
  background: '#fff',
};

export const fileInputStyle: CSSProperties = { fontSize: 14 };

export const fileNameStyle: CSSProperties = {
  fontSize: 13,
  color: 'var(--ca-text-secondary)',
  fontWeight: 600,
};

export const errStyle: CSSProperties = {
  color: 'var(--ca-error)',
  fontSize: 13.5,
  fontWeight: 600,
  lineHeight: 1.4,
};

export const okStyle: CSSProperties = {
  color: 'var(--ca-success)',
  fontSize: 13.5,
  fontWeight: 700,
};

/** Botón primario: usar junto con className="ca-btn-primary" (esa clase ya define background/color/hover). */
export function submitButtonStyle(saving: boolean): CSSProperties {
  return {
    fontWeight: 800,
    fontSize: 16,
    padding: 14,
    border: 'none',
    borderRadius: 11,
    cursor: 'pointer',
    opacity: saving ? 0.6 : 1,
  };
}

export const listWrapStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

export const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 21,
  fontWeight: 800,
  fontStyle: 'italic',
};

export const emptyStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.5)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px dashed var(--ca-border-strong)',
  borderRadius: 16,
  padding: 28,
  textAlign: 'center',
  color: 'var(--ca-text-muted)',
  fontWeight: 600,
  fontSize: 14.5,
};

export const listItemStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(16px) saturate(1.4)',
  WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
  border: '1px solid rgba(255,255,255,0.85)',
  borderRadius: 16,
  padding: 14,
  display: 'flex',
  gap: 14,
  alignItems: 'center',
  boxShadow: '0 8px 24px rgba(31,41,51,0.08)',
};

export const thumbStyle: CSSProperties = {
  width: 78,
  height: 60,
  flex: 'none',
  borderRadius: 10,
  overflow: 'hidden',
  background: 'var(--ca-carbon)',
};

export const thumbImgStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

/** Botón eliminar: usar junto con className="ca-admin-btn-delete" (definida inline en AdminApp para el hover, no existe en tokens.css). */
export const deleteButtonStyle: CSSProperties = {
  fontWeight: 800,
  fontSize: 13,
  padding: '9px 14px',
  borderRadius: 10,
  cursor: 'pointer',
  flex: 'none',
};
