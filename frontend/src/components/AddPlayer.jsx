import { useState } from 'react';
import { api } from '../api';
import Modal from './Modal.jsx';
import PhotoInput from './PhotoInput.jsx';
import Stairs from './Stairs.jsx';

export default function AddPlayer({ onClose, onAdded }) {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [value, setValue] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/players', { method: 'POST', body: { name, photo, value } });
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
        <fieldset className="fieldset">
          <legend>Índice de esfuerzo de hoy</legend>
          <Stairs value={value} onChange={(v) => setValue(v === value ? null : v)} />
          <small>Si todavía no entrenaste, podés dejarlo para después.</small>
        </fieldset>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Agregando…' : 'Agregar jugador'}</button>
      </form>
    </Modal>
  );
}
