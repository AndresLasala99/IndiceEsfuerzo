// Las tres mediciones diarias, en el orden en que se muestran.
// reverse = true cuando un número alto es algo bueno (se pinta en verde)
export const METRICS = [
  {
    key: 'fatigue',
    label: 'Fatiga',
    short: 'Fatiga',
    moment: 'Antes de entrenar',
    low: 'Nada fatigado',
    high: 'Muy fatigado',
    reverse: false,
  },
  {
    key: 'sleep',
    label: 'Calidad del sueño',
    short: 'Sueño',
    moment: 'Antes de entrenar',
    low: 'Dormí muy mal',
    high: 'Dormí muy bien',
    reverse: true,
  },
  {
    key: 'effort',
    label: 'Índice de esfuerzo',
    short: 'Esfuerzo',
    moment: 'Después de entrenar',
    low: 'Muy suave',
    high: 'Máximo',
    reverse: false,
  },
];

// Color del 1 al 5: 1 = calmo (turquesa), 5 = alerta (rojo)
export const toneOf = (metric, v) => (metric.reverse ? 6 - v : v);
