import { useEffect, useState } from 'react';
import { api } from '../api';
import { dayMonth, monthTitle } from '../dates';
import { METRICS, toneOf } from '../metrics';
import Avatar from './Avatar.jsx';

function AvgChip({ metric, stat }) {
  if (stat.average === null) return <span className="chip chip--empty" aria-label={`${metric.short} sin datos`}>–</span>;
  return (
    <span className={`chip chip--avg effort-bg-${toneOf(metric, Math.round(stat.average))}`}
      aria-label={`${metric.short} promedio ${stat.average}`}>
      {stat.average.toFixed(1)}
    </span>
  );
}

// Promedios del mes que se está viendo en el calendario
export default function MonthSummary({ month, refreshKey }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setError('');
    api(`/players/summary?month=${month}`)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [month, refreshKey]);

  const shown = data?.month === month ? data : null;

  return (
    <section className="panel panel--month" aria-labelledby="month-title">
      <div className="list-head">
        <h2 id="month-title">Promedios de {monthTitle(month).toLowerCase()}</h2>
        {shown && (
          <p className="muted">
            {!shown.lastDate
              ? 'Todavía no hay datos cargados en este mes.'
              : shown.isCurrent
                ? `Mes en curso: promedio con los datos hasta el ${dayMonth(shown.lastDate)}.`
                : 'Mes completo.'}
          </p>
        )}
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {!shown && !error && <p className="muted">Cargando…</p>}

      {shown && shown.lastDate && (
        <>
          <h3 className="sub">Plantel</h3>
          <dl className="stats">
            {METRICS.map((m) => {
              const st = shown.team[m.key];
              return (
                <div key={m.key} className="stat">
                  <dt>{m.short}</dt>
                  <dd>
                    <strong>{st.average === null ? '–' : st.average.toFixed(1)}</strong>
                    <span className="muted">{st.count} {st.count === 1 ? 'registro' : 'registros'}</span>
                  </dd>
                </div>
              );
            })}
          </dl>

          <h3 className="sub">Por jugador</h3>
          <div className="table-wrap">
            <table className="month-table">
              <thead>
                <tr>
                  <th scope="col">Jugador</th>
                  {METRICS.map((m) => <th key={m.key} scope="col">{m.short}</th>)}
                  <th scope="col">Días</th>
                </tr>
              </thead>
              <tbody>
                {shown.players.map((p) => (
                  <tr key={p.id}>
                    <th scope="row">
                      <span className="month-table__who">
                        <Avatar photo={p.photo} name={p.name} size={32} />
                        <span>{p.name}</span>
                      </span>
                    </th>
                    {METRICS.map((m) => <td key={m.key}><AvgChip metric={m} stat={p[m.key]} /></td>)}
                    <td className="month-table__days">{p.days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
