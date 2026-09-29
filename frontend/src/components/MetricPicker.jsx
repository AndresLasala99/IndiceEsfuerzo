import Stairs from './Stairs.jsx';

// Una medición: título, cuándo se carga, la escalera y qué significan el 1 y el 5
export default function MetricPicker({ metric, value, onChange, onClear, disabled }) {
  return (
    <fieldset className="metric">
      <legend className="metric__head">
        <span className="metric__label">{metric.label}</span>
        <span className="metric__moment">{metric.moment}</span>
      </legend>
      <Stairs value={value} onChange={onChange} disabled={disabled} reverse={metric.reverse} label={metric.label} />
      <div className="metric__anchors" aria-hidden="true">
        <span>1 = {metric.low}</span>
        <span>5 = {metric.high}</span>
      </div>
      {value && onClear && (
        <button type="button" className="link-btn metric__clear" onClick={onClear} disabled={disabled}>
          Borrar {metric.short.toLowerCase()}
        </button>
      )}
    </fieldset>
  );
}
