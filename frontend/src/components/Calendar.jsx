import { monthGrid, monthTitle, shiftMonth, todayUY } from '../dates';

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

/**
 * month: 'AAAA-MM'
 * selected: 'AAAA-MM-DD'
 * values: { 'AAAA-MM-DD': 1..5 } — si viene, pinta cada día con su color
 */
export default function Calendar({ month, onMonthChange, selected, onSelect, values }) {
  const today = todayUY();
  const canGoNext = shiftMonth(month, 1) <= today.slice(0, 7);

  return (
    <div className="calendar">
      <div className="calendar__head">
        <button type="button" className="icon-btn" onClick={() => onMonthChange(shiftMonth(month, -1))} aria-label="Mes anterior">‹</button>
        <h3>{monthTitle(month)}</h3>
        <button type="button" className="icon-btn" onClick={() => onMonthChange(shiftMonth(month, 1))} disabled={!canGoNext} aria-label="Mes siguiente">›</button>
      </div>
      <table>
        <thead>
          <tr>{WEEKDAYS.map((d) => <th key={d} scope="col">{d}</th>)}</tr>
        </thead>
        <tbody>
          {monthGrid(month).map((week, i) => (
            <tr key={i}>
              {week.map((key, j) => {
                if (!key) return <td key={j} />;
                const v = values?.[key];
                const future = key > today;
                const cls = ['day', key === selected && 'is-selected', key === today && 'is-today', v && `effort-bg-${v}`]
                  .filter(Boolean).join(' ');
                return (
                  <td key={key}>
                    <button type="button" className={cls} disabled={future} onClick={() => onSelect(key)}
                      aria-pressed={key === selected} aria-label={`${Number(key.slice(8))}${v ? `, esfuerzo ${v}` : ''}`}>
                      {Number(key.slice(8))}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
