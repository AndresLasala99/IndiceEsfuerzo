import { useRef, useState } from 'react';
import { compressPhoto } from '../photo';
import Avatar from './Avatar.jsx';

export default function PhotoInput({ photo, name, onChange }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onChange(await compressPhoto(file));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="photo-input">
      <Avatar photo={photo} name={name} size={72} />
      <div className="photo-input__actions">
        <button type="button" className="btn btn--ghost" onClick={() => input.current.click()} disabled={busy}>
          {busy ? 'Procesando…' : photo ? 'Cambiar foto' : 'Elegir foto'}
        </button>
        {photo && <button type="button" className="link-btn" onClick={() => onChange('')}>Quitar foto</button>}
      </div>
      <input ref={input} type="file" accept="image/*" hidden onChange={pick} />
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}
