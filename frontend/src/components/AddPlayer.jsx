import { useState } from 'react';
import { api } from '../api';
import { METRICS } from '../metrics';
import MetricPicker from './MetricPicker.jsx';
import Modal from './Modal.jsx';
import PhotoInput from './PhotoInput.jsx';

export default function AddPlayer({ onClose, onAdded }) {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [values, setValues] = useState({ fatigue: null, sleep: null, effort: null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Tocar el mismo número de nuevo lo desmarca
  const toggle = (key) => (v) => setValues((s) => ({ ...s, [key]: s[key] === v ? null : v }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/players', { method: 'POST', body: { name, photo, ...values } });
      onAdded();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <Modal title="Agregar jugador" onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <PhotoInput photo={photo} name={name} onChange={setPhoto} />
        <label>Nombre y apellido
          <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={60} autoComplete="off" />
        </label>
        <p className="muted small">Los valores de hoy son opcionales. Se pueden cargar después tocando el nombre en la lista.</p>
        {METRICS.map((m) => (
          <MetricPicker key={m.key} metric={m} value={values[m.key]} onChange={toggle(m.key)} />
        ))}
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Agregando…' : 'Agregar jugador'}</button>
      </form>
    </Modal>
  );
}
