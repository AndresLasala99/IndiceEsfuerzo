import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext.jsx';
import { longDate, monthOf, monthTitle, todayUY } from '../dates';
import Avatar from '../components/Avatar.jsx';
import Calendar from '../components/Calendar.jsx';
import Scale from '../components/Scale.jsx';
import Topbar from '../components/Topbar.jsx';

export default function AdminHome() {
  const { user } = useAuth();
  const [selected, setSelected] = useState(todayUY());
  const [month, setMonth] = useState(monthOf(todayUY()));
  const [day, setDay] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [playerMonth, setPlayerMonth] = useState(null);
  const [error, setError] = useState('');

  // Lista de todos los jugadores con su valor en el día elegido
  useEffect(() => {
    let alive = true;
    setDay(null);
    api(`/efforts/day?date=${selected}`)
      .then((d) => alive && setDay(d))
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [selected]);

  // Mes de un jugador (pinta el calendario)
  useEffect(() => {
    if (!playerId) { setPlayerMonth(null); return; }
    let alive = true;
    // Si cambió de jugador, se limpia lo anterior para no mostrar datos de otro
    setPlayerMonth((prev) => (prev && String(prev.player.id) === playerId ? prev : null));
    api(`/efforts/player/${playerId}?month=${month}`)
      .then((d) => alive && setPlayerMonth(d))
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [playerId, month]);

  function selectDay(key) {
    setSelected(key);
    setError('');
  }

  function openPlayer(id) {
    setPlayerId(id === playerId ? null : id);
    setError('');
  }

  const player = playerMonth?.player;

  return (
    <>
      <Topbar>
        <span className="topbar__name">{user.name}</span>
      </Topbar>

      <main className="admin">
        <section className="panel panel--calendar">
          {playerId ? (
            <div className="panel__player">
              <Avatar photo={player?.photo} name={player?.name || ''} size={52} />
              <div>
                <h2>{player?.name || 'Cargando…'}</h2>
                {playerMonth && (
                  <p className="muted">
                    {playerMonth.registered
                      ? `${playerMonth.registered} ${playerMonth.registered === 1 ? 'día registrado' : 'días registrados'} en ${monthTitle(month).toLowerCase()}. Promedio ${playerMonth.average}.`
                      : `Sin registros en ${monthTitle(month).toLowerCase()}.`}
                  </p>
                )}
              </div>
              <button type="button" className="link-btn" onClick={() => setPlayerId(null)}>Ver todo el plantel</button>
            </div>
          ) : (
            <div className="panel__intro">
              <h2>Elegí un día</h2>
              <p className="muted">Tocá un jugador para ver su mes completo.</p>
            </div>
          )}

          <Calendar
            month={month}
            onMonthChange={setMonth}
            selected={selected}
            onSelect={selectDay}
            values={playerId ? playerMonth?.days : undefined}
          />
          {playerId && <Scale />}
        </section>

        <section className="panel panel--list">
          <div className="list-head">
            <h2>{longDate(selected)}</h2>
            {day && (
              <p className="muted">
                {day.registered} de {day.total} registraron
                {day.average !== null && <>. Promedio <strong>{day.average}</strong></>}
              </p>
            )}
          </div>

          {error && <p className="error" role="alert">{error}</p>}

          {!day ? (
            <p className="muted">Cargando…</p>
          ) : day.players.length === 0 ? (
            <p className="empty">Todavía no hay jugadores registrados. Pasales el link de la app para que creen su cuenta.</p>
          ) : (
            <ul className="players">
              {day.players.map((p) => (
                <li key={p.id}>
                  <button type="button" className={`player-row${playerId === p.id ? ' is-active' : ''}`}
                    onClick={() => openPlayer(p.id)} aria-pressed={playerId === p.id}>
                    <Avatar photo={p.photo} name={p.name} size={44} />
                    <span className="player-row__name">{p.name}</span>
                    {p.value
                      ? <span className={`chip effort-bg-${p.value}`} aria-label={`Esfuerzo ${p.value}`}>{p.value}</span>
                      : <span className="chip chip--empty">Sin registro</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
