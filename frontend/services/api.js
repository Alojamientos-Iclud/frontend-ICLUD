// Si VITE_API_URL no está definida se usan rutas relativas (/api/...),
// que en desarrollo resuelve el proxy de vite.config.js.
export const API_URL = import.meta.env.VITE_API_URL ?? "";

async function request(path, { method = "GET", body } = {}) {
  return fetch(`${API_URL}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

/* ---------------- Hoteles (catálogo oficial) ---------------- */
export async function getHoteles() {
  const res = await request("/api/hoteles");
  if (!res.ok) throw new Error(`Error al obtener los hoteles (${res.status}).`);
  return res.json();
}

export async function crearHotel(hotel) {
  const res = await request("/api/hoteles", { method: "POST", body: hotel });
  if (!res.ok) {
    console.error("Error devuelto por /api/hoteles:", await res.text());
    throw new Error("No se pudo guardar el hotel en la base de datos.");
  }
}

export async function eliminarHotel(id) {
  const res = await request(`/api/hoteles/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("No se pudo eliminar el hotel.");
}

/* ---------------- Ofertas pendientes ---------------- */
export async function getOfertas() {
  const res = await request("/api/ofertas");
  if (!res.ok) throw new Error("Error al obtener las ofertas.");
  return res.json();
}

export async function crearOferta(oferta) {
  const res = await request("/api/ofertas", { method: "POST", body: oferta });
  if (!res.ok) throw new Error("Ocurrió un error en el servidor al guardar la oferta.");
}

export async function eliminarOferta(id) {
  const res = await request(`/api/ofertas/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("No se pudo eliminar la oferta.");
  return res.json().catch(() => ({}));
}

/* ---------------- Reservas y login ---------------- */
export async function checkout(datosReserva) {
  const res = await request("/api/checkout", { method: "POST", body: datosReserva });
  if (!res.ok) throw new Error("Error en el servidor.");
  return res.json();
}

// Devuelve { ok, data } para que la pantalla pueda mostrar data.error
export async function loginAdmin(gmail, password) {
  const res = await request("/api/admin/login", { method: "POST", body: { gmail, password } });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}
