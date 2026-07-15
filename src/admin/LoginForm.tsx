import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { getErrorMessage } from './utils';
import { errStyle, fieldColStyle, formStyle, inputStyle, labelStyle, submitButtonStyle } from './styles';

function friendlyAuthError(message: string): string {
  const msg = message.toLowerCase();
  if (msg.indexOf('invalid login') !== -1) return 'Correo o contraseña incorrectos.';
  if (msg.indexOf('email not confirmed') !== -1) return 'Confirma tu correo antes de entrar.';
  if (msg.indexOf('rate limit') !== -1 || msg.indexOf('too many') !== -1) return 'Demasiados intentos. Espera un momento.';
  return 'No se pudo iniciar sesión.';
}

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authErr, setAuthErr] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase) return;
    if (!email || !password) {
      setAuthErr('Escribe tu correo y contraseña.');
      return;
    }
    setLoggingIn(true);
    setAuthErr('');
    supabase.auth.signInWithPassword({ email: email.trim(), password }).then(({ error }) => {
      if (!error) {
        setLoggingIn(false);
        setPassword('');
        return;
      }
      setAuthErr(friendlyAuthError(getErrorMessage(error)));
      setLoggingIn(false);
    });
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: '48px auto',
        background: '#fff',
        border: '1px solid var(--ca-border)',
        borderRadius: 20,
        padding: '36px 32px',
        boxShadow: '0 8px 30px rgba(31,41,51,0.08)',
      }}
    >
      <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 800, fontStyle: 'italic' }}>Iniciar sesión</h1>
      <p style={{ margin: '0 0 24px', fontSize: 14.5, color: 'var(--ca-text-secondary)', lineHeight: 1.5 }}>
        Entra para administrar las próximas entregas.
      </p>
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={fieldColStyle}>
          <label style={labelStyle}>Correo</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="tucorreo@ejemplo.com"
            style={inputStyle}
          />
        </div>
        <div style={fieldColStyle}>
          <label style={labelStyle}>Contraseña</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
            style={inputStyle}
          />
        </div>
        {authErr && <div style={errStyle}>{authErr}</div>}
        <button type="submit" className="ca-btn-primary" style={submitButtonStyle(loggingIn)}>
          {loggingIn ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
