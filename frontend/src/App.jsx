import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import { longDate, monthOf, todayUY } from './dates';
import { METRICS, toneOf } from './metrics';
import AddPlayer from './components/AddPlayer.jsx';
import Avatar from './components/Avatar.jsx';
import Calendar from './components/Calendar.jsx';
import MonthView from './components/MonthView.jsx';
import MonthSummary from './components/MonthSummary.jsx';
import PlayerSheet from './components/PlayerSheet.jsx';

export default function App() {
  // selected = null significa "hoy" (lo decide el servidor con la hora de Uruguay)
  const [selected, setSelected] = useState(null);
  const [month, setMonth] = useState(monthOf(todayUY()));
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [view, setView] = useState('day'); // 'day' o 'month'
  // Cambia cada vez que se modifica algo, para recalcular los promedios del mes
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = () => setRefreshKey((k) => k + 1);

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
    setView('day');
  }

  function goToday() {
    setSelected(null);
    setMonth(monthOf(todayUY()));
    setView('day');
  }

  // Actualiza un jugador en la lista sin recargar todo
  function patchPlayer(p) {
    setData((d) => {
      const players = d.players.map((x) => (x.id === p.id ? p : x));
      const summary = {};
      for (const m of METRICS) {
        const values = players.map((x) => x[m.key]).filter((v) => v !== null);
        summary[m.key] = {
          registered: values.length,
          average: values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : null,
        };
      }
      return { ...d, players, summary };
    });
    bump();
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
          <div className="tabs" role="tablist" aria-label="Vista">
            <button type="button" role="tab" aria-selected={view === 'day'} className={view === 'day' ? 'is-on' : ''} onClick={() => setView('day')}>Día</button>
            <button type="button" role="tab" aria-selected={view === 'month'} className={view === 'month' ? 'is-on' : ''} onClick={() => setView('month')}>Mes</button>
          </div>

          {view === 'month' ? <MonthView month={month} /> : (
          <>
          <div className="list-head">
            <h2>{isToday ? `Hoy, ${longDate(shownDate)}` : longDate(shownDate)}</h2>
            {data && data.total > 0 && (
              <dl className="stats">
                {METRICS.map((m) => {
                  const st = data.summary[m.key];
                  return (
                    <div key={m.key} className="stat">
                      <dt>{m.short}</dt>
                      <dd>
                        <strong>{st.average ?? '–'}</strong>
                        <span className="muted"> promedio, {st.registered} de {data.total}</span>
                      </dd>
                    </div>
                  );
                })}
              </dl>
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
                  <li className="players__cols" aria-hidden="true">
                    <span />
                    {METRICS.map((m) => <span key={m.key}>{m.short}</span>)}
                  </li>
                  {data.players.map((p) => {
                    const content = (
                      <>
                        <Avatar photo={p.photo} name={p.name} size={40} />
                        <span className="player-row__name">{p.name}</span>
                        {METRICS.map((m) => (p[m.key]
                          ? <span key={m.key} className={`chip effort-bg-${toneOf(m, p[m.key])}`} aria-label={`${m.short} ${p[m.key]}`}>{p[m.key]}</span>
                          : <span key={m.key} className="chip chip--empty" aria-label={`${m.short} sin dato`}>–</span>))}
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
          </>
          )}
        </section>

        <MonthSummary month={month} refreshKey={refreshKey} />
      </main>

      {openPlayer && (
        <PlayerSheet
          player={openPlayer}
          onClose={() => setOpenId(null)}
          onChanged={patchPlayer}
          onRemoved={() => { setOpenId(null); load(); bump(); }}
        />
      )}

      {adding && (
        <AddPlayer
          onClose={() => setAdding(false)}
          onAdded={() => { setAdding(false); load(); bump(); }}
        />
      )}
    </>
  );
}
