import { useState } from 'react';
import { api } from '../api';
import { METRICS } from '../metrics';
import Avatar from './Avatar.jsx';
import MetricPicker from './MetricPicker.jsx';
import Modal from './Modal.jsx';
import PhotoInput from './PhotoInput.jsx';

export default function PlayerSheet({ player, onClose, onChanged, onRemoved }) {
  const [saving, setSaving] = useState(null); // clave de la medición que se está guardando
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(player.name);
  const [photo, setPhoto] = useState(player.photo);
  const [error, setError] = useState('');

  async function choose(key, v) {
    if (saving || player[key] === v) return;
    const previous = player;
    onChanged({ ...player, [key]: v }); // se ve al instante
    setSaving(key);
    setError('');
    try {
      await api(`/players/${player.id}/today`, { method: 'PUT', body: { metric: key, value: v } });
    } catch (err) {
      onChanged(previous);
      setError(err.message);
    } finally {
      setSaving(null);
    }
  }

  async function clear(key) {
    const previous = player;
    onChanged({ ...player, [key]: null });
    setSaving(key);
    setError('');
    try {
      await api(`/players/${player.id}/today/${key}`, { method: 'DELETE' });
    } catch (err) {
      onChanged(previous);
      setError(err.message);
    } finally {
      setSaving(null);
    }
  }

  async function saveData(e) {
    e.preventDefault();
    setSaving('data');
    setError('');
    try {
      const d = await api(`/players/${player.id}`, { method: 'PATCH', body: { name, photo } });
      onChanged({ ...player, name: d.name, photo: d.photo });
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  }

  async function remove() {
    if (!window.confirm(`¿Eliminar a ${player.name} de la lista? Se borra también todo su historial.`)) return;
    setSaving('data');
    try {
      await api(`/players/${player.id}`, { method: 'DELETE' });
      onRemoved(player.id);
    } catch (err) {
      setError(err.message);
      setSaving(null);
    }
  }

  if (editing) {
    return (
      <Modal title="Editar jugador" onClose={onClose}>
        <form className="form" onSubmit={saveData}>
          <PhotoInput photo={photo} name={name} onChange={setPhoto} />
          <label>Nombre y apellido
            <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={60} autoComplete="off" />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="btn" disabled={Boolean(saving)}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
          <button type="button" className="link-btn" onClick={() => setEditing(false)}>Volver</button>
          <hr />
          <button type="button" className="link-btn link-btn--danger" onClick={remove} disabled={Boolean(saving)}>Eliminar jugador</button>
        </form>
      </Modal>
    );
  }

  return (
    <Modal title={player.name} onClose={onClose}>
      <div className="sheet">
        <div className="sheet__who">
          <Avatar photo={player.photo} name={player.name} size={52} />
          <span className="muted">Se guarda al tocar. Se puede cambiar hasta las 00:00.</span>
        </div>

        {METRICS.map((m) => (
          <MetricPicker
            key={m.key}
            metric={m}
            value={player[m.key]}
            onChange={(v) => choose(m.key, v)}
            onClear={() => clear(m.key)}
            disabled={Boolean(saving)}
          />
        ))}

        <p className="sheet__status" aria-live="polite">{saving ? 'Guardando…' : ''}</p>
        {error && <p className="error" role="alert">{error}</p>}

        <div className="sheet__actions">
          <button type="button" className="btn" onClick={onClose}>Listo</button>
          <button type="button" className="link-btn" onClick={() => setEditing(true)}>Editar nombre o foto</button>
        </div>
      </div>
    </Modal>
  );
}
