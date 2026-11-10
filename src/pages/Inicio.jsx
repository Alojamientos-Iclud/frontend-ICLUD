import { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import useEstilos from "../hooks/useEstilos.js";
import inicioCss from "../styles/inicio.css?inline";
import { api, IMAGEN_PREDETERMINADA } from "../services/api.js";

const DESTINOS = [
  { nombre: "Playa", imagen: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200" },
  { nombre: "Montaña", imagen: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200" },
  { nombre: "Ciudad", imagen: "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1200" },
  { nombre: "Naturaleza", imagen: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200" }
];

export default function Inicio() {
  useEstilos(inicioCss);

  const [hoteles, setHoteles] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    api("/api/hoteles")
      .then(setHoteles)
      .catch((e) => {
        console.error("Error al cargar los alojamientos desde la base de datos:", e);
        setError(true);
      });
  }, []);

  return (
    <>
      <Header activo="inicio" mostrarInicio={false} />

      <section className="hero">
        <div className="hero-content">
          <h1>Encontrá tu próximo viaje</h1>
          <p>Compará hoteles, departamentos y alojamientos en un solo lugar.</p>
          <div className="search-box">
            <a href="https://metabuscador-iclud-ufm2.vercel.app">
              <button>Buscar</button>
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Alojamientos Populares</h2>
        <div className="cards" id="cards-container">
          {error && <p>No se pudieron cargar los alojamientos en este momento.</p>}
          {hoteles.map((hotel) => (
            <div className="card" key={hotel.id}>
              <img src={hotel.imagen_h || IMAGEN_PREDETERMINADA} alt={hotel.nombre} />
              <div className="card-content">
                <h3>{hotel.nombre}</h3>
                <p>{hotel.localizacion}</p>
                <p>
                  <strong>Habitaciones:</strong> {hotel.cantidad_habitaciones}
                </p>
                {hotel.precio ? <div className="price">${hotel.precio} ARS</div> : null}
                {hotel.plataforma ? <div className="platform">Disponible en {hotel.plataforma}</div> : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Explorá Destinos</h2>
        <div className="explore">
          {DESTINOS.map((d) => (
            <div className="explore-card" key={d.nombre}>
              <img src={d.imagen} alt={d.nombre} />
              <h2>{d.nombre}</h2>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
