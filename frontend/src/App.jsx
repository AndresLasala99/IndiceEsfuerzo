import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import { longDate, monthOf, todayUY } from './dates';
import AddPlayer from './components/AddPlayer.jsx';
import Avatar from './components/Avatar.jsx';
import Calendar from './components/Calendar.jsx';
import PlayerSheet from './components/PlayerSheet.jsx';

export default function App() {
  // selected = null significa "hoy" (lo decide el servidor con la hora de Uruguay)
  const [selected, setSelected] = useState(null);
  const [month, setMonth] = useState(monthOf(todayUY()));
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await api(`/players${selected ? `?date=${selected}` : ''}`);
      setData(d);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, [selected]);

  useEffect(() => { setData(null); load(); }, [load]);

  // Si la página quedó abierta y pasó la medianoche, al volver se actualiza sola
  useEffect(() => {
    const onVisible = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  const isToday = !selected || (data && selected === data.today);
  const shownDate = data?.date || selected || todayUY();

  function pickDay(key) {
    setSelected(key === todayUY() ? null : key);
  }

  function goToday() {
    setSelected(null);
    setMonth(monthOf(todayUY()));
  }

  // Actualiza un jugador en la lista sin recargar todo
  function patchPlayer(p) {
    setData((d) => {
      const players = d.players.map((x) => (x.id === p.id ? p : x));
      const values = players.map((x) => x.value).filter((v) => v !== null);
      const average = values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : null;
      return { ...d, players, registered: values.length, average };
    });
  }

  const openPlayer = data?.players.find((p) => p.id === openId);

  return (
    <>
      <header className="masthead">
        <div className="masthead__bars" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((v) => <span key={v} className={`effort-bg-${v}`} style={{ height: 6 + v * 5 }} />)}
        </div>
        <h1>Índice Subjetivo del Esfuerzo</h1>
      </header>

      <main className="layout">
        <section className="panel panel--calendar" aria-label="Calendario">
          <Calendar month={month} onMonthChange={setMonth} selected={shownDate} onSelect={pickDay} />
          {!isToday && <button type="button" className="btn btn--ghost" onClick={goToday}>Volver a hoy</button>}
        </section>

        <section className="panel panel--list">
          <div className="list-head">
            <h2>{isToday ? `Hoy, ${longDate(shownDate)}` : longDate(shownDate)}</h2>
            {data && data.total > 0 && (
              <p className="muted">
                {data.registered} de {data.total} cargaron
                {data.average !== null && <>. Promedio <strong>{data.average}</strong></>}
              </p>
            )}
            {data && !data.editable && (
              <p className="closed">Día cerrado. Los valores ya no se pueden modificar.</p>
            )}
          </div>

          {error && (
            <div className="error-box" role="alert">
              <p>{error}</p>
              <button type="button" className="btn btn--ghost" onClick={load}>Reintentar</button>
            </div>
          )}

          {!data && !error && <p className="muted">Cargando…</p>}

          {data && (
            <>
              {data.players.length === 0 ? (
                <p className="empty">La lista está vacía. Tocá "Agregar jugador" para sumar al primero.</p>
              ) : (
                <ul className="players">
                  {data.players.map((p) => {
                    const content = (
                      <>
                        <Avatar photo={p.photo} name={p.name} size={44} />
                        <span className="player-row__name">{p.name}</span>
                        {p.value
                          ? <span className={`chip effort-bg-${p.value}`} aria-label={`Esfuerzo ${p.value}`}>{p.value}</span>
                          : <span className="chip chip--empty">{data.editable ? 'Cargar' : 'Sin dato'}</span>}
                      </>
                    );
                    return (
                      <li key={p.id}>
                        {data.editable
                          ? <button type="button" className="player-row" onClick={() => setOpenId(p.id)}>{content}</button>
                          : <div className="player-row player-row--static">{content}</div>}
                      </li>
                    );
                  })}
                </ul>
              )}

              {data.editable && (
                <button type="button" className="add-btn" onClick={() => setAdding(true)}>
                  <span aria-hidden="true">+</span> Agregar jugador
                </button>
              )}
            </>
          )}
        </section>
      </main>

      {openPlayer && (
        <PlayerSheet
          player={openPlayer}
          onClose={() => setOpenId(null)}
          onChanged={patchPlayer}
          onRemoved={() => { setOpenId(null); load(); }}
        />
      )}

      {adding && (
        <AddPlayer
          onClose={() => setAdding(false)}
          onAdded={() => { setAdding(false); load(); }}
        />
      )}
    </>
  );
}
