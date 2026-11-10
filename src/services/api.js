const API_PRODUCCION = "https://backend-iclud.vercel.app";

// Si VITE_API_URL no está definida: localhost en desarrollo, backend de Vercel en producción.
export const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? API_PRODUCCION : "http://localhost:3000")
).replace(/\/+$/, "");

export const IMAGEN_PREDETERMINADA =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200";

const SESION_KEY = "iclud_sesion";

export function leerSesion() {
  try {
    const s = JSON.parse(localStorage.getItem(SESION_KEY));
    return s && s.token && s.usuario ? s : null;
  } catch {
    return null;
  }
}

export function guardarSesion(token, usuario) {
  const sesion = { token, usuario };
  localStorage.setItem(SESION_KEY, JSON.stringify(sesion));
  return sesion;
}

export function borrarSesion() {
  localStorage.removeItem(SESION_KEY);
}

export async function api(ruta, { metodo = "GET", cuerpo, auth = false } = {}) {
  const headers = {};
  if (cuerpo !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const sesion = leerSesion();
    if (sesion) headers.Authorization = `Bearer ${sesion.token}`;
  }

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers,
    body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined
  });

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    datos = null;
  }

  if (!respuesta.ok) {
    const error = new Error(datos?.error || `Error ${respuesta.status}`);
    error.status = respuesta.status;
    throw error;
  }

  return datos;
}
