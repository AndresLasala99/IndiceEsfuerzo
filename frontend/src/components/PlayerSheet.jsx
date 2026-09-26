import { useState } from 'react';
import { api } from '../api';
import Avatar from './Avatar.jsx';
import Modal from './Modal.jsx';
import PhotoInput from './PhotoInput.jsx';
import Stairs from './Stairs.jsx';

export default function PlayerSheet({ player, onClose, onChanged, onRemoved }) {
  const [value, setValue] = useState(player.value);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(player.name);
  const [photo, setPhoto] = useState(player.photo);
  const [error, setError] = useState('');

  async function choose(v) {
    if (saving || v === value) return;
    const previous = value;
    setValue(v);
    setSaving(true);
    setError('');
    try {
      await api(`/players/${player.id}/today`, { method: 'PUT', body: { value: v } });
      onChanged({ ...player, value: v });
    } catch (err) {
      setValue(previous);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function clearValue() {
    setSaving(true);
    setError('');
    try {
      await api(`/players/${player.id}/today`, { method: 'DELETE' });
      setValue(null);
      onChanged({ ...player, value: null });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveData(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const d = await api(`/players/${player.id}`, { method: 'PATCH', body: { name, photo } });
      onChanged({ ...player, name: d.name, photo: d.photo, value });
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm(`¿Eliminar a ${player.name} de la lista? Se borra también todo su historial.`)) return;
    setSaving(true);
    try {
      await api(`/players/${player.id}`, { method: 'DELETE' });
      onRemoved(player.id);
    } catch (err) {
      setError(err.message);
      setSaving(false);
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
          <button className="btn" disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
          <button type="button" className="link-btn" onClick={() => setEditing(false)}>Volver</button>
          <hr />
          <button type="button" className="link-btn link-btn--danger" onClick={remove} disabled={saving}>Eliminar jugador</button>
        </form>
      </Modal>
    );
  }

  return (
    <Modal title="Índice de esfuerzo de hoy" onClose={onClose}>
      <div className="sheet">
        <div className="sheet__who">
          <Avatar photo={player.photo} name={player.name} size={56} />
          <strong>{player.name}</strong>
        </div>
        <Stairs value={value} onChange={choose} disabled={saving} label={`Esfuerzo de ${player.name} hoy`} />
        <p className="sheet__status" aria-live="polite">
          {saving ? 'Guardando…' : value
            ? <>Guardado: <strong>{value}</strong>. Se puede cambiar hasta las 00:00.</>
            : 'Tocá un número del 1 al 5.'}
        </p>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="sheet__actions">
          <button type="button" className="btn" onClick={onClose}>Listo</button>
          {value && <button type="button" className="link-btn" onClick={clearValue} disabled={saving}>Borrar el valor de hoy</button>}
          <button type="button" className="link-btn" onClick={() => setEditing(true)}>Editar nombre o foto</button>
        </div>
      </div>
    </Modal>
  );
}
