import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useEstilos from "../hooks/useEstilos.js";
import hoteleroCss from "../styles/hotelero.css?inline";
import authCss from "../styles/auth.css?inline";
import { useSesion } from "../context/SesionContext.jsx";
import { api } from "../services/api.js";

export default function Login() {
  useEstilos(hoteleroCss, authCss);

  const { iniciar } = useSesion();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [gmail, setGmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const datos = await api("/api/admin/login", {
        metodo: "POST",
        cuerpo: { gmail: gmail.trim(), password }
      });

      iniciar(datos.token, datos.usuario);

      if (datos.estatus === "hotelero") {
        navigate("/hotelero");
      } else if (datos.estatus === "admin") {
        navigate("/administrador");
      } else {
        const siguiente = params.get("next") || "";
        navigate(/^\/[a-z]*$/i.test(siguiente) ? siguiente : "/");
      }
    } catch (err) {
      console.error(err);
      setError(err.status ? err.message : "No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }

  const siguiente = params.get("next");
  const sufijo = siguiente ? `?next=${encodeURIComponent(siguiente)}` : "";

  return (
    <div className="login-wrapper">
      <h1>Iniciar sesión</h1>
      <p>Ingresá tu correo y contraseña para continuar.</p>

      <div className={`login-error${error ? " visible" : ""}`}>{error}</div>

      <form onSubmit={enviar}>
        <div className="form-group">
          <label htmlFor="gmail">Correo</label>
          <input
            type="email"
            id="gmail"
            placeholder="tu@email.com"
            required
            value={gmail}
            onChange={(e) => setGmail(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ marginTop: ".8rem" }}>
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="form-actions" style={{ marginTop: "1.2rem" }}>
          <Link to="/" className="btn btn-ghost">
            Volver
          </Link>
          <button type="submit" className="btn btn-primary" disabled={cargando}>
            {cargando ? "Verificando..." : "Ingresar"}
          </button>
        </div>
      </form>
      <p style={{ marginTop: "1.2rem", marginBottom: 0, textAlign: "center" }}>
        ¿No tenés cuenta? <Link to={`/registro${sufijo}`}>Registrate</Link>
      </p>
    </div>
  );
}
