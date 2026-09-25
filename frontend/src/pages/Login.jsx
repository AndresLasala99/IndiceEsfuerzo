import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <main className="auth">
      <div className="auth__brand" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((v) => <span key={v} className={`effort-bg-${v}`} style={{ height: 14 + v * 10 }} />)}
      </div>
      <h1>Índice Subjetivo del Esfuerzo</h1>
      <form onSubmit={submit} className="card form">
        <label>Email
          <input type="email" autoComplete="email" value={form.email} onChange={set('email')} required />
        </label>
        <label>Contraseña
          <input type="password" autoComplete="current-password" value={form.password} onChange={set('password')} required />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Ingresando…' : 'Iniciar sesión'}</button>
      </form>
      <p className="auth__alt">¿No tenés cuenta? <Link to="/registro">Registrate como jugador</Link></p>
      <p className="auth__alt small"><Link to="/registro-admin">Registro de cuerpo técnico</Link></p>
    </main>
  );
}
