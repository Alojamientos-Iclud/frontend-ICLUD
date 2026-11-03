import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import css from "../styles/styles.css?inline";
import usePageStyles from "../hooks/usePageStyles.js";
import useToast from "../hooks/useToast.js";
import Modal from "../components/Modal.jsx";
import Toast from "../components/Toast.jsx";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import { getHoteles } from "../services/api.js";

const IMG_DEFAULT = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200";

const DESTINOS = [
  { nombre: "Playa", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200" },
  { nombre: "Montaña", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200" },
  { nombre: "Ciudad", img: "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1200" },
  { nombre: "Naturaleza", img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200" },
];

const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const LOGIN_INICIAL = { email: "", pass: "" };
const REGISTRO_INICIAL = { nombre: "", apellido: "", email: "", pass: "", pass2: "" };

export default function Home() {
  usePageStyles(css);

  const [hoteles, setHoteles] = useState([]);
  const [estado, setEstado] = useState("cargando"); // cargando | ok | error
  const [modal, setModal] = useState(null); // null | "login" | "register"
  const [login, setLogin] = useState(LOGIN_INICIAL);
  const [loginErr, setLoginErr] = useState({});
  const [reg, setReg] = useState(REGISTRO_INICIAL);
  const [regErr, setRegErr] = useState({});
  const users = useRef([]); // usuarios de demostración, solo en memoria (igual que antes)
  const { toast, showToast } = useToast();

  useEffect(() => {
    getHoteles()
      .then((data) => {
        setHoteles(data);
        setEstado("ok");
      })
      .catch((err) => {
        console.error("Error al cargar los alojamientos desde la base de datos:", err);
        setEstado("error");
      });
  }, []);

  const cerrarModal = () => setModal(null);
  const cambiarModal = (a) => {
    setModal(null);
    setTimeout(() => setModal(a), 200);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const email = login.email.trim();
    const err = { email: !validEmail(email), pass: login.pass.length < 6 };
    setLoginErr(err);
    if (err.email || err.pass) return;

    const user = users.current.find((u) => u.email === email && u.pass === login.pass);
    if (!user) return showToast("Email o contraseña incorrectos.", "error");

    cerrarModal();
    showToast(`¡Bienvenido, ${user.nombre}! 🎉`);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const nombre = reg.nombre.trim();
    const apellido = reg.apellido.trim();
    const email = reg.email.trim();
    const err = {
      nombre: !nombre,
      apellido: !apellido,
      email: !validEmail(email),
      pass: reg.pass.length < 6,
      pass2: reg.pass !== reg.pass2,
    };
    setRegErr(err);
    if (Object.values(err).some(Boolean)) return;

    if (users.current.find((u) => u.email === email)) {
      return showToast("Ese email ya está registrado.", "error");
    }
    users.current.push({ nombre, apellido, email, pass: reg.pass });
    cerrarModal();
    setReg(REGISTRO_INICIAL);
    showToast(`¡Cuenta creada, ${nombre}! Ya podés iniciar sesión.`);
  };

  const campoError = (visible, texto) => (
    <span className={`form-error${visible ? " visible" : ""}`}>{texto}</span>
  );

  return (
    <>
      <SiteHeader
        links={[
          { to: "/catalogo", label: "Alojamientos" },
          { label: "Explorar" },
          { label: "Ofertas" },
          { to: "/clave", label: "Ingresar" },
        ]}
      />

      <section className="hero">
        <div className="hero-content">
          <h1>Encontrá tu próximo viaje</h1>
          <p>Compará hoteles, departamentos y alojamientos en un solo lugar.</p>
          <div className="search-box">
            <input type="text" placeholder="Destino" />
            <input type="date" />
            <input type="date" />
            <input type="number" placeholder="Personas" />
            <button>Buscar</button>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Alojamientos Populares</h2>
        <div className="cards" id="cards-container">
          {estado === "error" && <p>No se pudieron cargar los alojamientos en este momento.</p>}
          {hoteles.map((hotel) => (
            <div className="card" key={hotel.id}>
              <img src={hotel.imagen_h || IMG_DEFAULT} alt={hotel.nombre} />
              <div className="card-content">
                <h3>{hotel.nombre}</h3>
                <p>{hotel.localizacion}</p>
                <p><strong>Habitaciones:</strong> {hotel.cantidad_habitaciones}</p>
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
              <img src={d.img} alt={d.nombre} />
              <h2>{d.nombre}</h2>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />

      {/* Modal Login */}
      <Modal open={modal === "login"} onClose={cerrarModal}>
        <h2>Bienvenido de nuevo</h2>
        <p className="modal-sub">Ingresá a tu cuenta para continuar</p>
        <form onSubmit={handleLogin} noValidate>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={login.email}
              onChange={(e) => setLogin({ ...login, email: e.target.value })}
            />
            {campoError(loginErr.email, "Ingresá un email válido.")}
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={login.pass}
              onChange={(e) => setLogin({ ...login, pass: e.target.value })}
            />
            {campoError(loginErr.pass, "La contraseña debe tener al menos 6 caracteres.")}
          </div>
          <button type="submit" className="btn-submit">Ingresar</button>
        </form>
        <div className="modal-divider">o</div>
        <div className="modal-switch">
          ¿No tenés cuenta? <a onClick={() => cambiarModal("register")}>Registrate</a>
        </div>
      </Modal>

      {/* Modal Registro */}
      <Modal open={modal === "register"} onClose={cerrarModal}>
        <h2>Creá tu cuenta</h2>
        <p className="modal-sub">Es gratis y solo toma un minuto</p>
        <form onSubmit={handleRegister} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                placeholder="Juan"
                value={reg.nombre}
                onChange={(e) => setReg({ ...reg, nombre: e.target.value })}
              />
              {campoError(regErr.nombre, "Campo requerido.")}
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input
                type="text"
                placeholder="Pérez"
                value={reg.apellido}
                onChange={(e) => setReg({ ...reg, apellido: e.target.value })}
              />
              {campoError(regErr.apellido, "Campo requerido.")}
            </div>
          </div>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={reg.email}
              onChange={(e) => setReg({ ...reg, email: e.target.value })}
            />
            {campoError(regErr.email, "Ingresá un email válido.")}
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={reg.pass}
              onChange={(e) => setReg({ ...reg, pass: e.target.value })}
            />
            {campoError(regErr.pass, "La contraseña debe tener al menos 6 caracteres.")}
          </div>
          <div className="form-group">
            <label>Confirmar contraseña</label>
            <input
              type="password"
              placeholder="Repetí tu contraseña"
              value={reg.pass2}
              onChange={(e) => setReg({ ...reg, pass2: e.target.value })}
            />
            {campoError(regErr.pass2, "Las contraseñas no coinciden.")}
          </div>
          <button type="submit" className="btn-submit">Crear cuenta</button>
        </form>
        <div className="modal-divider">o</div>
        <div className="modal-switch">
          ¿Ya tenés cuenta? <a onClick={() => cambiarModal("login")}>Iniciá sesión</a>
        </div>
      </Modal>

      <Toast toast={toast} />
    </>
  );
}
