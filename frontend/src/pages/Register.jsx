import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Register({ admin = false }) {
  const { register, registerAdmin } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', adminCode: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (admin) await registerAdmin(form);
      else await register({ name: form.name, email: form.email, password: form.password });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <main className="auth">
      <h1>{admin ? 'Registro de cuerpo técnico' : 'Registro de jugador'}</h1>
      <form onSubmit={submit} className="card form">
        <label>Nombre y apellido
          <input autoComplete="name" value={form.name} onChange={set('name')} required minLength={2} maxLength={60} />
        </label>
        <label>Email
          <input type="email" autoComplete="email" value={form.email} onChange={set('email')} required />
        </label>
        <label>Contraseña
          <input type="password" autoComplete="new-password" value={form.password} onChange={set('password')} required minLength={6} />
          <small>Mínimo 6 caracteres.</small>
        </label>
        {admin && (
          <label>Código de administrador
            <input value={form.adminCode} onChange={set('adminCode')} required autoComplete="off" />
            <small>Te lo pasa quien administra la app.</small>
          </label>
        )}
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Creando cuenta…' : 'Crear cuenta'}</button>
      </form>
      <p className="auth__alt">¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link></p>
    </main>
  );
}
