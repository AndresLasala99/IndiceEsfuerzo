import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext.jsx';
import { longDate, todayUY } from '../dates';
import PhotoPicker from '../components/PhotoPicker.jsx';
import Topbar from '../components/Topbar.jsx';

const VALUES = [1, 2, 3, 4, 5];

export default function PlayerHome() {
  const { user } = useAuth();
  const [date, setDate] = useState(todayUY());
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const d = await api('/efforts/today');
      setDate(d.date);
      setValue(d.value);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Si la app quedó abierta y pasó la medianoche, al volver se actualiza el día
    const onVisible = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  async function choose(v) {
    if (saving || v === value) return;
    const previous = value;
    setValue(v);
    setSaving(v);
    setError('');
    try {
      const d = await api('/efforts/today', { method: 'PUT', body: { value: v } });
      setDate(d.date);
      setValue(d.value);
    } catch (err) {
      setValue(previous);
      setError(err.message);
    } finally {
      setSaving(null);
    }
  }

  return (
    <>
      <Topbar>
        <span className="topbar__name">{user.name}</span>
      </Topbar>

      <main className="player">
        {!user.photo && (
          <section className="notice">
            <p>Subí tu foto para que el cuerpo técnico te identifique.</p>
          </section>
        )}
        <PhotoPicker size={64} />

        <h1 className="player__title">Índice Subjetivo del Esfuerzo</h1>
        <p className="player__date">{longDate(date)}</p>

        <div className="stairs" role="radiogroup" aria-label="Índice subjetivo del esfuerzo de hoy" aria-busy={loading}>
          {VALUES.map((v) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={value === v}
              className={`stair stair-${v}${value === v ? ' is-on' : ''}`}
              style={{ '--h': `${46 + v * 11}%` }}
              onClick={() => choose(v)}
              disabled={loading}
            >
              <span>{v}</span>
            </button>
          ))}
        </div>

        <p className="player__status" aria-live="polite">
          {loading
            ? 'Cargando…'
            : saving
              ? 'Guardando…'
              : value
                ? <>Registraste un <strong>{value}</strong> hoy. Podés cambiarlo hasta las 00:00.</>
                : 'Tocá un número del 1 al 5.'}
        </p>
        {error && <p className="error" role="alert">{error}</p>}
      </main>
    </>
  );
}
