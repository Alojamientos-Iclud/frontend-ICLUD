import { IMAGEN_PREDETERMINADA } from "../services/api.js";

export default function TarjetaHotel({
  hotel,
  esFavorito,
  expandida,
  procesando,
  onAlternarExpandida,
  onFavorito,
  onReservar
}) {
  return (
    <div className={`card${expandida ? " expanded" : ""}`} onClick={onAlternarExpandida}>
      <img
        src={hotel.imagen_h || IMAGEN_PREDETERMINADA}
        alt={hotel.nombre}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = IMAGEN_PREDETERMINADA;
        }}
      />
      <div className="card-content">
        <h3>{hotel.nombre}</h3>
        <p>📍 {hotel.localizacion}</p>
        <p>🛏️ {hotel.cantidad_habitaciones} Hab.</p>
        <p className="hotel-desc">{hotel.descripcion || "Sin descripción disponible."}</p>
        <div className="price">${hotel.precio?.toLocaleString("es-AR") || "---"} ARS / noche</div>
        <button
          type="button"
          className={`btn-favorito${esFavorito ? " activo" : ""}`}
          disabled={procesando}
          onClick={(e) => {
            e.stopPropagation();
            onFavorito();
          }}
        >
          {esFavorito ? "♥ Quitar de favoritos" : "♡ Agregar a favoritos"}
        </button>
        <button
          type="button"
          className="btn-reservar"
          style={{ marginTop: 10, width: "100%" }}
          onClick={(e) => {
            e.stopPropagation();
            onReservar();
          }}
        >
          Reservar ahora
        </button>
      </div>
    </div>
  );
}
