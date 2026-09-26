const VALUES = [1, 2, 3, 4, 5];

// Los 5 botones suben como una escalera: más alto = más esfuerzo
export default function Stairs({ value, onChange, disabled, label = 'Índice subjetivo del esfuerzo' }) {
  return (
    <div className="stairs" role="radiogroup" aria-label={label}>
      {VALUES.map((v) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          className={`stair stair-${v}${value === v ? ' is-on' : ''}`}
          style={{ '--h': `${46 + v * 11}%` }}
          onClick={() => onChange(v)}
          disabled={disabled}
        >
          <span>{v}</span>
        </button>
      ))}
    </div>
  );
}
