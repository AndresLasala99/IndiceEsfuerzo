import { useEffect, useState } from 'react';
import { api } from '../api';
import { longDate, monthTitle } from '../dates';
import { METRICS, toneOf } from '../metrics';
import Avatar from './Avatar.jsx';

// Chip con el promedio, pintado según el valor redondeado
function AvgChip({ metric, stat }) {
  if (stat.average === null) {
    return <span className="chip chip--avg chip--empty" aria-label={`${metric.short} sin datos`}>–</span>;
  }
  const tone = toneOf(metric, Math.round(stat.average));
  return (
    <span className={`chip chip--avg effort-bg-${tone}`} aria-label={`${metric.short} promedio ${stat.average}`}>
      {stat.average.toFixed(1)}
    </span>
  );
}

export default function MonthView({ month }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setData(null);
    setError('');
    api(`/players/month?month=${month}`)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [month]);

  if (error) return <p className="error" role="alert">{error}</p>;
  if (!data) return <p className="muted">Cargando…</p>;

  const title = monthTitle(month);

  return (
    <div className="month">
      <div className="list-head">
        <h2>Promedios de {title.toLowerCase()}</h2>
        <p className="muted">
          {!data.lastDate
            ? 'Todavía no hay datos cargados en este mes.'
            : data.isCurrent
              ? `Mes en curso: datos hasta el ${longDate(data.lastDate)}.`
              : 'Mes completo.'}
        </p>
      </div>

      {data.lastDate && (
        <>
          <h3 className="month__sub">Promedio general del plantel</h3>
          <dl className="stats">
            {METRICS.map((m) => {
              const st = data.team[m.key];
              const tone = st.average !== null ? toneOf(m, Math.round(st.average)) : null;
              return (
                <div key={m.key} className="stat">
                  <dt>{m.short}</dt>
                  <dd>
                    <strong className={tone ? `stat__value tone-text-${tone}` : 'stat__value'}>
                      {st.average !== null ? st.average.toFixed(1) : '–'}
                    </strong>
                    <span className="muted">{st.count} {st.count === 1 ? 'registro' : 'registros'}</span>
                  </dd>
                </div>
              );
            })}
          </dl>

          <h3 className="month__sub">Promedio de cada jugador</h3>
          <ul className="players">
            <li className="players__cols players__cols--avg" aria-hidden="true">
              <span />
              {METRICS.map((m) => <span key={m.key}>{m.short}</span>)}
            </li>
            {data.players.map((p) => (
              <li key={p.id}>
                <div className="player-row player-row--static">
                  <Avatar photo={p.photo} name={p.name} size={40} />
                  <span className="player-row__name">
                    {p.name}
                    <small className="player-row__days">
                      {p.days === 0 ? 'Sin datos' : `${p.days} ${p.days === 1 ? 'día cargado' : 'días cargados'}`}
                    </small>
                  </span>
                  {METRICS.map((m) => <AvgChip key={m.key} metric={m} stat={p[m.key]} />)}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
