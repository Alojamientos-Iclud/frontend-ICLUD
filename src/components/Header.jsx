import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSesion } from "../context/SesionContext.jsx";

export default function Header({ activo, mostrarInicio = true }) {
  const { sesion, cerrar } = useSesion();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const clase = (nombre) => (activo === nombre ? "active" : undefined);

  function salir(e) {
    e.preventDefault();
    cerrar();
    if (pathname === "/favoritos") navigate("/");
  }

  return (
    <header>
      <div className="logo">ICLUD</div>
      <nav>
        {mostrarInicio && (
          <Link to="/" className={clase("inicio")}>
            Inicio
          </Link>
        )}
        <Link to="/catalogo" className={clase("catalogo")}>
          Alojamientos
        </Link>
        <Link to="/favoritos" className={clase("favoritos")}>
          Favoritos
        </Link>
        <span id="nav-auth">
          {sesion ? (
            <>
              <span className="nav-bienvenida" title={sesion.usuario.gmail}>
                Bienvenido, <strong>{sesion.usuario.gmail}</strong>
              </span>
              <a href="#" className="btn-register" onClick={salir}>
                Cerrar sesión
              </a>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login">
                Ingresar
              </Link>
              <Link to="/registro" className="btn-register">
                Registrarse
              </Link>
            </>
          )}
        </span>
      </nav>
    </header>
  );
}
