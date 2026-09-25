// Leyenda de colores del 1 al 5
export default function Scale() {
  return (
    <ul className="scale" aria-label="Referencia de colores">
      {[1, 2, 3, 4, 5].map((v) => (
        <li key={v} className={`effort-bg-${v}`}>{v}</li>
      ))}
    </ul>
  );
}
