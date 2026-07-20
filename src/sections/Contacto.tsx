import { useState } from 'react';
import type { FormEvent } from 'react';
import { waLink } from '../lib/whatsapp';
import { clickableLink } from '../lib/a11y';

const waHrefDirect = waLink('Hola, quiero información sobre un autofinanciamiento para un vehículo.');

const MONTO_OPTIONS = ['$30,000 – $60,000', '$60,000 – $90,000', '$90,000 – $120,000', '$120,000 – $150,000'];
const TIPO_OPTIONS = ['Sedán', 'Hatchback', 'SUV', 'Pickup', 'Otro'];

const inputStyle = { padding: '13px 15px', border: '1.5px solid #D1D5DB', borderRadius: 10, fontSize: 15.5, outlineColor: '#FF690F' };
const selectStyle = { ...inputStyle, padding: '13px 12px', background: '#fff' };
const labelStyle = { fontWeight: 700, fontSize: 14.5 };
const errStyle = { color: '#DC2626', fontSize: 13, fontWeight: 600 };

interface LeadRecord {
  nombre: string;
  telefono: string;
  email: string;
  monto: string;
  tipo: string;
  mensaje: string;
  fecha: string;
}

export default function Contacto() {

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [montoInt, setMontoInt] = useState('');
  const [tipo, setTipo] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [errNombre, setErrNombre] = useState('');
  const [errTelefono, setErrTelefono] = useState('');
  const [errEmail, setErrEmail] = useState('');
  const [errMontoInt, setErrMontoInt] = useState('');
  const [errTipo, setErrTipo] = useState('');

  const [sent, setSent] = useState(false);
  const [submitBtnHover, setSubmitBtnHover] = useState(false);
  const [waBtnHover, setWaBtnHover] = useState(false);
  const [fbHover, setFbHover] = useState(false);
  const [igHover, setIgHover] = useState(false);
  const [waLinkHover, setWaLinkHover] = useState(false);

  const notSent = !sent;

  function resetForm() {
    setNombre('');
    setTelefono('');
    setEmail('');
    setMontoInt('');
    setTipo('');
    setMensaje('');
    setErrNombre('');
    setErrTelefono('');
    setErrEmail('');
    setErrMontoInt('');
    setErrTipo('');
    setSent(false);
  }

  function submit(e: FormEvent) {
    e.preventDefault();

    const digits = telefono.replace(/\D/g, '');
    const nombreTrim = nombre.trim();
    const emailTrim = email.trim();

    let ok = true;
    if (nombreTrim.length < 3) {
      setErrNombre('Escribe tu nombre completo');
      ok = false;
    } else {
      setErrNombre('');
    }
    if (digits.length !== 10) {
      setErrTelefono('Escribe un teléfono a 10 dígitos');
      ok = false;
    } else {
      setErrTelefono('');
    }
    if (!/^\S+@\S+\.\S+$/.test(emailTrim)) {
      setErrEmail('Escribe un correo válido');
      ok = false;
    } else {
      setErrEmail('');
    }
    if (!montoInt) {
      setErrMontoInt('Selecciona un rango de monto');
      ok = false;
    } else {
      setErrMontoInt('');
    }
    if (!tipo) {
      setErrTipo('Selecciona el tipo de vehículo');
      ok = false;
    } else {
      setErrTipo('');
    }

    if (!ok) return;

    try {
      const raw = localStorage.getItem('construauto-leads');
      const leads: LeadRecord[] = raw ? JSON.parse(raw) : [];
      leads.push({
        nombre: nombreTrim,
        telefono: digits,
        email: emailTrim,
        monto: montoInt,
        tipo,
        mensaje,
        fecha: new Date().toISOString(),
      });
      localStorage.setItem('construauto-leads', JSON.stringify(leads));
    } catch {
      /* ignore */
    }

    setSent(true);
  }

  const leadWaHref = waLink(
    'Hola, soy ' +
      nombre +
      '. Me interesa un autofinanciamiento de ' +
      montoInt +
      ' para un vehículo tipo ' +
      tipo +
      '. Mi teléfono: ' +
      telefono +
      '.' +
      (mensaje ? ' ' + mensaje : ''),
  );

  return (
    <main data-screen-label="Contacto" style={{ animation: 'caFadeUp 0.4s ease' }}>
      <section style={{ background: '#F5F6F8', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 56px' }}>
          <div
            style={{
              color: '#FF690F',
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            Contacto
          </div>
          <h1 style={{ margin: '0 0 14px', fontSize: 'clamp(32px,4.4vw,48px)', fontWeight: 800, fontStyle: 'italic', maxWidth: 760 }}>
            Cuéntanos qué auto buscas
          </h1>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, color: '#52606D', maxWidth: 680 }}>
            Déjanos tus datos y un asesor te contacta el mismo día. Si tienes prisa, el WhatsApp siempre está abierto.
          </p>
        </div>
      </section>
      <section style={{ background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px', display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 520px', minWidth: 300 }}>
            {notSent && (
              <form
                onSubmit={submit}
                style={{
                  background: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: 20,
                  padding: 'clamp(24px,3vw,38px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={labelStyle}>Nombre completo *</label>
                    <input
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Tu nombre y apellidos"
                      style={inputStyle}
                    />
                    {errNombre && <div style={errStyle}>{errNombre}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={labelStyle}>Teléfono *</label>
                    <input
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="10 dígitos"
                      inputMode="tel"
                      style={inputStyle}
                    />
                    {errTelefono && <div style={errStyle}>{errTelefono}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={labelStyle}>Correo electrónico *</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    inputMode="email"
                    style={inputStyle}
                  />
                  {errEmail && <div style={errStyle}>{errEmail}</div>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={labelStyle}>Monto que te interesa *</label>
                    <select value={montoInt} onChange={(e) => setMontoInt(e.target.value)} style={selectStyle}>
                      <option value="">Selecciona un rango</option>
                      {MONTO_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    {errMontoInt && <div style={errStyle}>{errMontoInt}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={labelStyle}>Tipo de vehículo *</label>
                    <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={selectStyle}>
                      <option value="">Selecciona el tipo</option>
                      {TIPO_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    {errTipo && <div style={errStyle}>{errTipo}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={labelStyle}>Mensaje</label>
                  <textarea
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    rows={4}
                    placeholder="Cuéntanos qué auto buscas o resuelve tus dudas aquí"
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
                <button
                  type="submit"
                  onMouseEnter={() => setSubmitBtnHover(true)}
                  onMouseLeave={() => setSubmitBtnHover(false)}
                  style={{
                    background: submitBtnHover ? '#E55A05' : 'var(--ca-orange-gradient)',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 17,
                    padding: 16,
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                  }}
                >
                  Enviar mis datos
                </button>
                <p style={{ margin: 0, fontSize: 12.5, color: '#9AA5B1', lineHeight: 1.5 }}>
                  Al enviar aceptas que un asesor de ConstruAuto de México te contacte por teléfono, correo o WhatsApp.
                </p>
              </form>
            )}
            {sent && (
              <div style={{ background: '#fff', border: '1.5px solid #FF690F', borderRadius: 20, padding: 'clamp(28px,4vw,44px)', textAlign: 'center' }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 99,
                    background: '#FFF0E6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                  }}
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FF690F" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                </div>
                <h2 style={{ margin: '0 0 10px', fontSize: 26, fontWeight: 800, fontStyle: 'italic' }}>¡Recibimos tus datos!</h2>
                <p style={{ margin: '0 0 26px', fontSize: 16, lineHeight: 1.6, color: '#52606D', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
                  Un asesor te contactará muy pronto. Si quieres avanzar ahora mismo, mándanos tu solicitud por WhatsApp.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                  <a
                    href={leadWaHref}
                    target="_blank"
                    rel="noreferrer"
                    onMouseEnter={() => setWaBtnHover(true)}
                    onMouseLeave={() => setWaBtnHover(false)}
                    style={{
                      background: waBtnHover ? '#1FB859' : '#25D366',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: 16,
                      padding: '14px 26px',
                      borderRadius: 12,
                      textDecoration: 'none',
                    }}
                  >
                    Enviar por WhatsApp
                  </a>
                  <a
                    {...clickableLink(resetForm)}
                    style={{
                      cursor: 'pointer',
                      background: '#F5F6F8',
                      color: '#1F2933',
                      fontWeight: 700,
                      fontSize: 16,
                      padding: '14px 26px',
                      borderRadius: 12,
                      textDecoration: 'none',
                    }}
                  >
                    Enviar otro registro
                  </a>
                </div>
              </div>
            )}
          </div>

          <div style={{ flex: '1 1 320px', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ background: '#1F2933', borderRadius: 18, padding: 28, color: '#fff' }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9AA5B1', marginBottom: 14 }}>
                Contacto directo
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, fontStyle: 'italic', marginBottom: 4 }}>
                <a href="tel:+529994796369" style={{ color: '#fff', textDecoration: 'none' }}>
                  999 479 6369
                </a>
              </div>
              <div style={{ fontSize: 14.5, color: '#9AA5B1', marginBottom: 14 }}>Teléfono</div>
              <div style={{ fontSize: 19, fontWeight: 800, fontStyle: 'italic', marginBottom: 4 }}>
                <a
                  href={waHrefDirect}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={() => setWaLinkHover(true)}
                  onMouseLeave={() => setWaLinkHover(false)}
                  style={{ color: waLinkHover ? '#FF9A5C' : '#fff', textDecoration: 'none' }}
                >
                  999 356 4692
                </a>
              </div>
              <div style={{ fontSize: 14.5, color: '#9AA5B1', marginBottom: 18 }}>WhatsApp</div>
              <div style={{ fontSize: 15.5, lineHeight: 1.6, color: '#CBD2D9' }}>
                Cto. Colonias 297, San Miguel,
                <br />
                97148 Mérida, Yucatán.
              </div>
            </div>
            <div style={{ background: '#F5F6F8', borderRadius: 18, padding: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9AA5B1', marginBottom: 14 }}>
                Síguenos
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a
                  href="https://www.facebook.com/Construautomx"
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={() => setFbHover(true)}
                  onMouseLeave={() => setFbHover(false)}
                  style={{ color: fbHover ? '#FF690F' : '#1F2933', fontWeight: 700, fontSize: 15.5, textDecoration: 'none' }}
                >
                  Facebook · @Construautomx
                </a>
                <a
                  href="https://www.instagram.com/construauto_mexico"
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={() => setIgHover(true)}
                  onMouseLeave={() => setIgHover(false)}
                  style={{ color: igHover ? '#FF690F' : '#1F2933', fontWeight: 700, fontSize: 15.5, textDecoration: 'none' }}
                >
                  Instagram · @construauto_mexico
                </a>
              </div>
            </div>
            <div style={{ background: '#FFF0E6', borderRadius: 18, padding: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FF690F', marginBottom: 12 }}>
                Ten a la mano
              </div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: '#52606D' }}>
                Identificación oficial, comprobante de domicilio, RFC, una referencia laboral y una personal. Con eso tu trámite vuela.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
