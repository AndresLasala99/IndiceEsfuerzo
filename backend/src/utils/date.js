const { timezone } = require('../config/env');

// Devuelve la fecha de hoy en Uruguay con formato AAAA-MM-DD
function todayInUruguay() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

const isDateKey = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
const isMonthKey = (s) => typeof s === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(s);

module.exports = { todayInUruguay, isDateKey, isMonthKey };
