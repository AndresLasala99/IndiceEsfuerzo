const VALUES = [1, 2, 3, 4, 5];

// Los 5 botones suben como una escalera: más alto = número más alto
export default function Stairs({ value, onChange, disabled, label, reverse = false }) {
  return (
    <div className="stairs" role="radiogroup" aria-label={label}>
      {VALUES.map((v) => {
        const tone = reverse ? 6 - v : v;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            className={`stair tone-${tone}${value === v ? ' is-on' : ''}`}
            style={{ '--h': `${50 + v * 10}%` }}
            onClick={() => onChange(v)}
            disabled={disabled}
          >
            <span>{v}</span>
          </button>
        );
      })}
    </div>
  );
}
