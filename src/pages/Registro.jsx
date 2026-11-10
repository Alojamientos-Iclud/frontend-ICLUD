import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useEstilos from "../hooks/useEstilos.js";
import hoteleroCss from "../styles/hotelero.css?inline";
import authCss from "../styles/auth.css?inline";
import { api } from "../services/api.js";

export default function Registro() {
  useEstilos(hoteleroCss, authCss);

  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [gmail, setGmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const siguiente = params.get("next");
  const sufijo = siguiente ? `?next=${encodeURIComponent(siguiente)}` : "";

  async function enviar(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    try {
      await api("/api/auth/register", {
        metodo: "POST",
        cuerpo: { gmail: gmail.trim(), password }
      });

      alert("¡Cuenta creada! Ahora podés iniciar sesión.");
      navigate(`/login${sufijo}`);
    } catch (err) {
      console.error(err);
      setError(err.status ? err.message : "No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login-wrapper">
      <h1>Crear cuenta</h1>
      <p>Registrate con tu correo y una contraseña.</p>

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
            placeholder="Mínimo 6 caracteres"
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ marginTop: ".8rem" }}>
          <label htmlFor="password2">Confirmar contraseña</label>
          <input
            type="password"
            id="password2"
            placeholder="Repetí tu contraseña"
            required
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />
        </div>
        <div className="form-actions" style={{ marginTop: "1.2rem" }}>
          <Link to="/" className="btn btn-ghost">
            Volver
          </Link>
          <button type="submit" className="btn btn-primary" disabled={cargando}>
            {cargando ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </div>
      </form>
      <p style={{ marginTop: "1.2rem", marginBottom: 0, textAlign: "center" }}>
        ¿Ya tenés cuenta? <Link to={`/login${sufijo}`}>Iniciá sesión</Link>
      </p>
    </div>
  );
}
