import { useRef, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext.jsx';
import Avatar from './Avatar.jsx';

const SIZE = 400; // la foto se guarda cuadrada de 400 x 400

// Recorta al centro, achica y convierte a JPEG antes de subir
function compress(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      canvas.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen. Probá con otra foto.')); };
    img.src = url;
  });
}

export default function PhotoPicker({ size = 56 }) {
  const { user, setUser } = useAuth();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const photo = await compress(file);
      const data = await api('/users/me/photo', { method: 'PUT', body: { photo } });
      setUser(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="photo-picker">
      <button type="button" className="photo-btn" onClick={() => input.current.click()} disabled={busy}
        aria-label={user.photo ? 'Cambiar foto' : 'Subir foto'}>
        <Avatar photo={user.photo} name={user.name} size={size} />
        <span className="photo-btn__label">{busy ? 'Subiendo…' : user.photo ? 'Cambiar foto' : 'Subir foto'}</span>
      </button>
      <input ref={input} type="file" accept="image/*" hidden onChange={onChange} />
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}
