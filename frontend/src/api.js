const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

export async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('No hay conexión con el servidor. Si es la primera vez que entrás hoy, esperá unos segundos y probá de nuevo.');
  }

  if (res.status === 204) return null;
  let data = null;
  try { data = await res.json(); } catch { /* respuesta sin cuerpo */ }
  if (!res.ok) throw new Error(data?.message || 'Algo salió mal. Probá de nuevo.');
  return data;
}
